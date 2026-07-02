"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, Badge, Spinner, Alert, Row, Col } from "react-bootstrap";
import { getStrapiUrl, formatEuro } from "@/lib/api";
import type { Drone } from "@/lib/types";

function nomePapel(role?: string): string {
  switch ((role || "").toLowerCase()) {
    case "editor": return "Editor (acesso total)";
    case "admin": return "Administrador";
    case "authenticated": return "Utilizador (apenas leitura)";
    default: return role || "Visitante";
  }
}

interface MeComDrones {
  id: number;
  username: string;
  email: string;
  role?: { name: string; type: string };
  drones?: Drone[];
}

export default function PerfilPage() {
  const { data: session } = useSession();
  const jwt = (session?.user as any)?.jwt || "";
  const role = (session?.user as any)?.role || "authenticated";

  const [perfil, setPerfil] = useState<MeComDrones | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!jwt) { setLoading(false); return; }

    fetch(`${getStrapiUrl()}/api/users/me?populate=drones,role`, {
      headers: { Authorization: `Bearer ${jwt}` },
      cache: "no-store",
    })
      .then((r) => {
        if (!r.ok) throw new Error(`Erro ${r.status}`);
        return r.json();
      })
      .then((data) => setPerfil(data))
      .catch((e) => setErro(String(e.message || e)))
      .finally(() => setLoading(false));
  }, [jwt]);

  const drones: Drone[] = perfil?.drones || [];

  return (
    <>
      <h1 className="dz-section-title">O meu perfil</h1>

      {/* Cartão de perfil */}
      <Card className="dz-card mb-4">
        <Card.Body className="p-4">
          <div className="d-flex align-items-center gap-4 flex-wrap">
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--dz-azul), #22d3ee)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
                flexShrink: 0,
              }}
            >
              👤
            </div>
            <div>
              <h3 className="fw-bold mb-1">{session?.user?.name || session?.user?.email || "—"}</h3>
              <p className="text-secondary mb-1 small">{session?.user?.email || "—"}</p>
              <Badge
                bg=""
                style={{
                  background: role === "editor" || role === "admin" ? "#22d3ee" : "#3b82f6",
                  color: "#0a0e1a",
                  fontWeight: 700,
                }}
              >
                {nomePapel(role)}
              </Badge>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Drones associados */}
      <h4 className="dz-section-title mb-3">Os meus drones</h4>

      {loading && <Spinner animation="border" variant="info" />}
      {erro && <Alert variant="danger">❌ Não foi possível carregar o perfil: {erro}</Alert>}

      {!loading && !erro && drones.length === 0 && (
        <div className="dz-card p-4 text-secondary text-center">
          <p className="mb-1">Ainda não tens drones associados à tua conta.</p>
          <p className="small mb-0">
            Um administrador pode associar drones à tua conta em{" "}
            <strong>Strapi Admin → Drones → editar → campo utilizador</strong>.
          </p>
        </div>
      )}

      {!loading && drones.length > 0 && (
        <Row className="g-3">
          {drones.map((d) => (
            <Col key={(d as any).documentId ?? d.id} sm={6} lg={4}>
              <Card className="dz-card h-100">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title className="fw-bold mb-0">{d.nome}</Card.Title>
                    {d.categoria && <Badge bg="secondary">{d.categoria}</Badge>}
                  </div>
                  {d.descricao && (
                    <Card.Text className="text-secondary small mb-3">{d.descricao}</Card.Text>
                  )}
                  <ul className="list-unstyled small mt-2 mb-0">
                    {d.preco !== undefined && (
                      <li className="d-flex justify-content-between border-bottom border-secondary py-1">
                        <span className="text-secondary">Preço</span>
                        <b>{formatEuro(d.preco)}</b>
                      </li>
                    )}
                    {d.autonomia !== undefined && (
                      <li className="d-flex justify-content-between border-bottom border-secondary py-1">
                        <span className="text-secondary">Autonomia</span>
                        <b>{d.autonomia} min</b>
                      </li>
                    )}
                    {d.velocidade !== undefined && (
                      <li className="d-flex justify-content-between border-bottom border-secondary py-1">
                        <span className="text-secondary">Velocidade</span>
                        <b>{d.velocidade} km/h</b>
                      </li>
                    )}
                    {d.camara && (
                      <li className="d-flex justify-content-between py-1">
                        <span className="text-secondary">Câmara</span>
                        <b>{d.camara}</b>
                      </li>
                    )}
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </>
  );
}
