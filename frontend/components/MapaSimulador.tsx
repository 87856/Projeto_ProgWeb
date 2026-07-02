"use client";

// =====================================================================
//  MapaSimulador.tsx — Simulador de drone em tempo real
//  ---------------------------------------------------------------------
//  - Carrega zonas do Strapi (GET /api/zona-voos)
//  - Mostra o mapa com Google Maps @vis.gl/react-google-maps
//  - Move o drone ao longo de um percurso simulado
//  - Detecta zona actual e lança alertas visuais
// =====================================================================

import { useEffect, useRef, useState, useMemo } from "react";
import { APIProvider, Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { Button, Badge } from "react-bootstrap";
import { PlayFill, PauseFill, ArrowClockwise } from "react-bootstrap-icons";
import { zonasApi, tipoZonaCor } from "@/lib/api";
import type { ZonaVoo, TipoZona } from "@/lib/types";

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
const ALCANCE_MAXIMO = 5000; // metros

const INICIO = { lat: 38.6797, lng: -9.3365 };

const PERCURSO_DELTAS: Array<[number, number]> = [
  ...Array(12).fill([0.004, 0.001] as [number, number]),
  ...Array(10).fill([0.002, 0.006] as [number, number]),
  ...Array(8).fill([0.005, 0.001] as [number, number]),
  ...Array(15).fill([-0.004, -0.002] as [number, number]),
];

function distanciaMetros(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000;
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);
  const x =
    s1 * s1 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * s2 * s2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

/**
 * Projecção de um ponto sobre a CIRCUNFERÊNCIA centrada em `center`
 * com raio `r` (em metros). Se já está dentro, devolve o ponto intacto.
 * Usa projecção equirectangular local (precisão sub-métrica para
 * distâncias até ~10 km). Se o ponto coincide com o centro (d=0),
 * devolve o ponto tal-qual — não há direcção preferida.
 */
function clampToBoundary(
  point: { lat: number; lng: number },
  center: { lat: number; lng: number },
  r: number,
): { lat: number; lng: number } {
  const rad = Math.PI / 180;
  const cosRef = Math.cos(center.lat * rad);
  const mPerDegLat = 111320;
  const mPerDegLng = 111320 * cosRef;
  const x = (point.lng - center.lng) * mPerDegLng;
  const y = (point.lat - center.lat) * mPerDegLat;
  const d = Math.hypot(x, y);
  if (d <= r) return point;
  const k = r / d;
  return {
    lat: center.lat + (y * k) / mPerDegLat,
    lng: center.lng + (x * k) / mPerDegLng,
  };
}

function MapaSimuladorInner({ zonas }: { zonas: ZonaVoo[] }) {
  // Defesa em profundidade: se o backend devolver algo estranho (auth
  // bloqueada, error 500 embrulhado, etc.) e `zonas` vier como objeto em
  // vez de array, tratamos como lista vazia em vez de rebentar com
  // "zonas is not iterable" no useMemo.
  const zonasArr = useMemo(
    () => (Array.isArray(zonas) ? zonas : []),
    [zonas],
  );
  const map = useMap();
  const [posDrone, setPosDrone] = useState(INICIO);
  const [indice, setIndice] = useState(0);
  const [emVoo, setEmVoo] = useState(false);
  const [percursoTerminado, setPercursoTerminado] = useState(false);
  const [alerta, setAlerta] = useState<{ tipo: string; msg: string } | null>(null);
  const intervaloRef = useRef<number | null>(null);
  // espelho sincronizado da posição do drone para o tick setInterval
  // poder ler a posição actual sem stale closures.
  const posDroneRef = useRef(posDrone);
  useEffect(() => {
    posDroneRef.current = posDrone;
  }, [posDrone]);

  // Desenhar zonas como google.maps.Circle sempre que o mapa inicializa
  useEffect(() => {
    if (!map) return;
    const g = (window as any).google as typeof google | undefined;
    if (!g?.maps) return;
    const circulos: any[] = [];
    zonasArr.forEach((z) => {
      const cor = tipoZonaCor[z.tipo] || "#3b82f6";
      const c = new g.maps.Circle({
        map,
        center: { lat: Number(z.latitude), lng: Number(z.longitude) },
        radius: Number(z.raio) || 1000,
        strokeColor: cor,
        strokeOpacity: 0.85,
        strokeWeight: 2,
        fillColor: cor,
        fillOpacity: 0.15,
      });
      circulos.push(c);
    });
    return () => {
      circulos.forEach((c) => c.setMap(null));
    };
  }, [map, zonasArr]);

  // Círculo de alcance máximo
  useEffect(() => {
    if (!map) return;
    const g = (window as any).google as typeof google | undefined;
    if (!g?.maps) return;
    const c = new g.maps.Circle({
      map,
      center: INICIO,
      radius: ALCANCE_MAXIMO,
      strokeColor: "#22d3ee",
      strokeOpacity: 0.6,
      strokeWeight: 2,
      fillColor: "#22d3ee",
      fillOpacity: 0.04,
      // dash via options object cast seguro
      ...({ strokeDashArray: "8 4" } as any),
    });
    return () => c.setMap(null);
  }, [map]);

  // Detecção de zona + alertas
  const zonaEm = useMemo(() => {
    for (const z of zonasArr) {
      const d = distanciaMetros(posDrone, { lat: Number(z.latitude), lng: Number(z.longitude) });
      if (d <= (Number(z.raio) || 1000)) return z;
    }
    return null;
  }, [posDrone, zonasArr]);

  const distPartida = distanciaMetros(INICIO, posDrone);

  // Tick do movimento do drone. Em cada tick:
  //   1. Calcula a próxima posição tentativa.
  //   2. Se ficar DENTRO do alcance → aceita e continua.
  //   3. Se ficar FORA → projecta-a sobre a CIRCUNFERÊNCIA
  //      (alcance máximo), pára a simulação e mostra alerta.
  // O drone nunca chega a sair do círculo de alcance.
  useEffect(() => {
    if (!emVoo) return;
    intervaloRef.current = window.setInterval(() => {
      if (indice >= PERCURSO_DELTAS.length) {
        setEmVoo(false);
        setPercursoTerminado(true);
        return;
      }
      const [dLat, dLng] = PERCURSO_DELTAS[indice];
      setIndice((i) => i + 1);

      const p = posDroneRef.current;
      const tentativa = { lat: p.lat + dLat, lng: p.lng + dLng };

      if (distanciaMetros(INICIO, tentativa) > ALCANCE_MAXIMO) {
        // Limite atingido: paramos o drone na orla do alcance máximo,
        // na direcção em que estava a voar.
        const clamped = clampToBoundary(tentativa, INICIO, ALCANCE_MAXIMO);
        setPosDrone(clamped);
        setEmVoo(false);
        setAlerta({
          tipo: "alcance",
          msg: `Limite de alcance atingido. Drone parou na orla do raio máximo (${(ALCANCE_MAXIMO / 1000).toFixed(1)} km).`,
        });
      } else {
        setPosDrone(tentativa);
      }
    }, 800);
    return () => {
      if (intervaloRef.current) window.clearInterval(intervaloRef.current);
    };
  }, [emVoo, indice]);

  // Alerta baseado no estado actual. O alerta de alcance é disparado
  // directamente pelo tick quando o drone é clamped na orla do raio
  // máximo; aqui só tratamos dos alertas de zona ao longo do voo.
  useEffect(() => {
    if (percursoTerminado) {
      setAlerta({ tipo: "ok", msg: "Percurso concluído. Drone regressou à base." });
      setPercursoTerminado(false);
      return;
    }
    if (zonaEm?.tipo === "Proibida") {
      setAlerta({ tipo: "critico", msg: `🚫 ZONA PROIBIDA: ${zonaEm.nome}. Retorne!` });
    } else if (zonaEm?.tipo === "Restrita") {
      setAlerta({
        tipo: "aviso",
        msg: `⚠️ Zona RESTRITA: ${zonaEm.nome}. Altitude máx: ${zonaEm.altitudeMax ?? "—"} m.`,
      });
    } else if (zonaEm) {
      setAlerta({ tipo: "ok", msg: `✔ Zona permitida: ${zonaEm.nome}.` });
    } else if (!emVoo) {
      // não limpamos alerta quando parado
    } else {
      setAlerta(null);
    }
  }, [zonaEm, emVoo, percursoTerminado]);

  const coresAlerta: Record<string, { bg: string; border: string; fg: string }> = {
    ok: { bg: "#14532d", border: "#22c55e", fg: "#86efac" },
    aviso: { bg: "#78350f", border: "#f59e0b", fg: "#fde68a" },
    critico: { bg: "#7f1d1d", border: "#ef4444", fg: "#fca5a5" },
    alcance: { bg: "#1e1b4b", border: "#818cf8", fg: "#c7d2fe" },
  };

  return (
    <div className="position-relative">
      {/* Controlos */}
      <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
        <Button
          variant="success"
          disabled={emVoo}
          onClick={() => {
            setEmVoo(true);
            setAlerta({ tipo: "ok", msg: "Drone em voo. A monitorizar…" });
          }}
        >
          <PlayFill /> Iniciar voo
        </Button>
        <Button variant="danger" disabled={!emVoo} onClick={() => setEmVoo(false)}>
          <PauseFill /> Pausar
        </Button>
        <Button
          variant="info"
          onClick={() => {
            setEmVoo(false);
            setIndice(0);
            setPosDrone(INICIO);
            setAlerta(null);
          }}
        >
          <ArrowClockwise /> Reiniciar
        </Button>
        <span className="text-secondary ms-auto small">
          📡 Alcance máximo: <span className="text-info fw-bold">{ALCANCE_MAXIMO / 1000} km</span>
        </span>
      </div>

      {/* Mapa */}
      <div style={{ height: 560, borderRadius: 10, overflow: "hidden", border: "1px solid var(--dz-borda)" }}>
        <Map
          defaultCenter={INICIO}
          defaultZoom={10}
          mapId="drone-zone-map"
          gestureHandling="greedy"
        >
          <AdvancedMarker position={INICIO}>
            <span style={{ fontSize: "1.6rem" }}>📍</span>
          </AdvancedMarker>
          <AdvancedMarker position={posDrone}>
            <span style={{ fontSize: "1.6rem" }}>🛸</span>
          </AdvancedMarker>
        </Map>
      </div>

      {/* Painel de alerta */}
      {alerta && (
        <div
          className="dz-alerta show"
          style={{
            background: coresAlerta[alerta.tipo]?.bg,
            border: `1px solid ${coresAlerta[alerta.tipo]?.border}`,
            color: coresAlerta[alerta.tipo]?.fg,
            top: 22,
          }}
        >
          {alerta.msg}
        </div>
      )}

      {/* HUD (telemetria) */}
      <div className="dz-hud">
        <div className="dz-hud-linha">
          <span className="dz-hud-label">LAT</span>
          <span>{posDrone.lat.toFixed(5)}</span>
        </div>
        <div className="dz-hud-linha">
          <span className="dz-hud-label">LNG</span>
          <span>{posDrone.lng.toFixed(5)}</span>
        </div>
        <div className="dz-hud-linha">
          <span className="dz-hud-label">ZONA</span>
          {zonaEm ? (
            <Badge bg="" style={{ backgroundColor: tipoZonaCor[zonaEm.tipo as TipoZona] }}>
              {zonaEm.tipo}
            </Badge>
          ) : (
            <span>—</span>
          )}
        </div>
        <div className="dz-hud-linha">
          <span className="dz-hud-label">DIST</span>
          <span>{Math.round(distPartida)} m / {ALCANCE_MAXIMO} m</span>
        </div>
      </div>
    </div>
  );
}

export default function MapaSimulador() {
  const [zonas, setZonas] = useState<ZonaVoo[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    zonasApi
      .list()
      .then((zs) => setZonas(zs))
      .catch((e) => setErro(String(e.message || e)));
  }, []);

  // A chave do Google Maps começa sempre por "AIza". Se não começar — ou
  // estiver vazia, ou ainda for o placeholder "COLOQUE_AQUI..." —
  // mostramos o aviso em vez de tentar carregar a API e rebentar com
  // um erro genérico do Google Maps JS.
  //   • chave vazia           → ainda não foi escrita em .env.local
  //   • chave não-IA vazia    → placeholder colado verbatim ou typo
  if (!GOOGLE_MAPS_KEY || !GOOGLE_MAPS_KEY.startsWith("AIza")) {
    if (GOOGLE_MAPS_KEY) {
      // eslint-disable-next-line no-console
      console.info(
        `[DroneZone] A chave do Google Maps em NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ` +
        `parece um placeholder ou está mal escrita. Esperado: começar por "AIza".`,
      );
    }
    return (
      <div className="dz-card p-4">
        <h4 className="mb-3 text-warning">
          ⚠️ Falta a chave do Google Maps (<code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>)
        </h4>
        <p className="text-secondary mb-3">
          O mapa não pode carregar sem esta chave. Passos para a pôr:
        </p>
        <ol className="text-secondary mb-3" style={{ paddingLeft: "1.4rem" }}>
          <li>
            Confirma que o ficheiro <code>frontend/.env.local</code> existe.
            (Se precisares de o criar:&nbsp;
            <code>cp frontend/.env.example frontend/.env.local</code>)
          </li>
          <li>
            Abre <code>frontend/.env.local</code> e cola a tua chave do Google
            Cloud Console em <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza…</code>.
          </li>
          <li>
            <strong>Reinicia</strong> o servidor de desenvolvimento
            (<code>npm run dev</code>) — variáveis <code>NEXT_PUBLIC_*</code> só são
            lidas no arranque do Next.js.
          </li>
          <li>Recarga esta página.</li>
        </ol>
        <p className="text-secondary small mb-0">
          Ver mais em{" "}
          <a href="https://console.cloud.google.com/google/maps-apis/credentials" target="_blank" rel="noreferrer">
            Google Cloud Console
          </a>{" "}
          e no ficheiro <code>frontend/CHAVES_API.md</code>.
        </p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={GOOGLE_MAPS_KEY}>
      {erro && (
        <div className="dz-card p-3 mb-3 border border-danger text-danger">
          ❌ Erro a carregar zonas do Strapi: {erro}
          <br />
          <small className="text-secondary">
            Certifica-te de que o Strapi está a correr em{" "}
            {process.env.NEXT_PUBLIC_STRAPI_URL}.
          </small>
        </div>
      )}
      <MapaSimuladorInner zonas={zonas} />
    </APIProvider>
  );
}
