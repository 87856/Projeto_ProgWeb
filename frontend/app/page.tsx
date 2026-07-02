

import Link from "next/link";
import { Camera, BarChart3, Search } from "lucide-react";

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="d-flex flex-wrap align-items-center gap-4 py-5">
        <div className="flex-grow-1" style={{ minWidth: 280 }}>
          <h1 className="dz-titulo">
            O mundo dos <span>drones</span> num só sítio.
          </h1>
          <p className="dz-subtitulo">
            Explora os melhores drones para fotografia, corrida, agricultura e uso profissional.
            Compara modelos e encontra o teu favorito — tudo ligado a uma <b>API Strapi 5</b> com
            permissões por papel.
          </p>
          <div className="d-flex flex-wrap gap-2 mt-3">
            <Link href="/catalogo" className="btn btn-dz-primary">
              Ver catálogo
            </Link>
            <Link href="/comparacao" className="btn btn-dz-outline">
              Comparar drones
            </Link>
          </div>
        </div>
        <div className="flex-grow-1" style={{ minWidth: 320 }}>
          <div
            className="dz-card p-5 text-center"
            style={{
              background:
                "linear-gradient(135deg, var(--dz-superficie-2) 0%, var(--dz-azul) 100%)",
              minHeight: 240,
              fontSize: "5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            🛸
          </div>
        </div>
      </section>

      {/* 3 destaques */}
      <section className="py-4">
        <h2 className="dz-section-title">Porquê a DroneZone?</h2>
        <p className="dz-subtitulo">Tudo o que precisas de saber antes de voar.</p>

        <div className="row g-3 mt-2">
          <div className="col-md-4">
            <div className="dz-card p-4">
              <Camera size={36} color="#3b82f6" />
              <h3 className="mt-3">Para todos</h3>
              <p className="text-secondary mb-0">
                Drones para iniciantes, profissionais, corrida e até agricultura.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="dz-card p-4">
              <BarChart3 size={36} color="#22d3ee" />
              <h3 className="mt-3">Comparação fácil</h3>
              <p className="text-secondary mb-0">
                Vê lado a lado autonomia, velocidade, peso e preço.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="dz-card p-4">
              <Search size={36} color="#22d3ee" />
              <h3 className="mt-3">Pesquisa rápida</h3>
              <p className="text-secondary mb-0">
                Encontra o drone certo escrevendo o nome ou a categoria.
              </p>
            </div>
          </div>
        </div>

        <div className="dz-card p-4 mt-4 d-flex flex-wrap gap-3 align-items-center justify-content-between">
          <div>
            <h4 className="mb-1">🔐 Gere os teus drones</h4>
            <p className="text-secondary mb-0">
              Faz <Link href="/login">login</Link> ou <Link href="/register">regista-te</Link> para
              aceder ao painel de administração e gerir drones e zonas de voo com permissões
              diferenciadas por papel.
            </p>
          </div>
          <Link href="/mapa" className="btn btn-dz-outline">
            🗺️ Ver mapa →
          </Link>
        </div>
      </section>
    </>
  );
}
