"use client";



import { Card } from "react-bootstrap";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const u = session?.user;

  return (
    <>
      <h1 className="dz-section-title">Painel de administração</h1>
      <p className="dz-subtitulo">
        Bem-vindo, <b>{u?.username || "—"}</b>! Estás com o papel{" "}
        <code>{u?.role || "authenticated"}</code>.
      </p>

      <div className="row g-3">
        <div className="col-md-6">
          <Card className="dz-card">
            <Card.Body>
              <Card.Title>🛸 Drones</Card.Title>
              <Card.Text className="text-secondary">
                Lista, cria, edita e apaga drones do catálogo.
              </Card.Text>
              <Link href="/admin/drones" className="btn btn-dz-primary">
                Abrir catálogo de drones →
              </Link>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-6">
          <Card className="dz-card">
            <Card.Body>
              <Card.Title>🗺️ Zonas de Voo</Card.Title>
              <Card.Text className="text-secondary">
                Lista, cria, edita e apaga zonas (com relações a utilizadores e drones).
              </Card.Text>
              <Link href="/admin/zonas" className="btn btn-dz-primary">
                Abrir tabela de zonas →
              </Link>
            </Card.Body>
          </Card>
        </div>
      </div>

      
    </>
  );
}
