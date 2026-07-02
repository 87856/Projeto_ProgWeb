"use client";

// =====================================================================
//  app/admin/zonas/page.tsx — CRUD: lista de zonas (Client)
// =====================================================================

import { useState } from "react";
import Link from "next/link";
import { Spinner, Alert, Table, Button, Badge } from "react-bootstrap";
import { Plus, PencilSquare, Trash } from "react-bootstrap-icons";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { zonasApi, formatEuro } from "@/lib/api";
import type { ZonaVoo, TipoZona } from "@/lib/types";
import ConfirmModal from "@/components/ConfirmModal";

export default function AdminZonasPage() {
  const { data: session } = useSession();
  const jwt = session?.user?.jwt || "";

  const { data: zonas, error, isLoading, mutate } = useSWR<ZonaVoo[]>(
    ["admin-zonas", jwt],
    ([_, t]: [string, string]) => zonasApi.list(t),
  );

  const [aApagar, setAApagar] = useState<string | null>(null);

  const apagar = async () => {
    if (!aApagar || !jwt) return;
    try {
      await zonasApi.remove(aApagar, jwt);
      mutate();
    } finally {
      setAApagar(null);
    }
  };

  const tipoClasse = (t: TipoZona) =>
    t === "Permitida" ? "dz-tipo-permitida"
      : t === "Restrita" ? "dz-tipo-restrita"
        : "dz-tipo-proibida";

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h1 className="dz-section-title mb-0">CRUD de Zonas de Voo</h1>
        <Link href="/admin/zonas/novo" className="btn btn-dz-primary">
          <Plus /> Nova zona
        </Link>
      </div>

      {isLoading && <Spinner animation="border" variant="info" />}
      {error && <Alert variant="danger">❌ {String((error as any).message || error)}</Alert>}

      {!isLoading && zonas && zonas.length === 0 && (
        <Alert variant="info">Ainda não existem zonas. Clica em "Nova zona" para começar.</Alert>
      )}

      {zonas && zonas.length > 0 && (
        <div className="table-responsive">
          <Table striped hover className="dz-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Coords</th>
                <th>Raio</th>
                <th>Alt. Máx</th>
                <th>Drones</th>
                <th>Pilotos</th>
                <th className="text-end">Acções</th>
              </tr>
            </thead>
            <tbody>
              {zonas.map((z) => (
                <tr key={z.documentId}>
                  <td><b>{z.nome}</b></td>
                  <td>
                    <Badge className={tipoClasse(z.tipo as TipoZona)}>{z.tipo}</Badge>
                  </td>
                  <td className="small text-secondary">
                    {Number(z.latitude).toFixed(3)}, {Number(z.longitude).toFixed(3)}
                  </td>
                  <td>{z.raio ?? 1000} m</td>
                  <td>{z.altitudeMax ?? "—"} m</td>
                  <td>
                    <span className="badge bg-info text-dark">
                      {z.drones?.length ?? 0}
                    </span>
                  </td>
                  <td>
                    <span className="badge bg-secondary">
                      {z.users_permissions_users?.length ?? 0}
                    </span>
                  </td>
                  <td className="text-end">
                    <Link
                      href={`/admin/zonas/${z.documentId}`}
                      className="btn btn-sm btn-outline-info me-2"
                    >
                      <PencilSquare /> Editar
                    </Link>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => setAApagar(z.documentId)}
                    >
                      <Trash /> Apagar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      <ConfirmModal
        show={aApagar !== null}
        title="Apagar zona de voo"
        message="Tens a certeza que queres apagar esta zona? Esta acção é irreversível."
        onConfirm={apagar}
        onCancel={() => setAApagar(null)}
      />
    </>
  );
}
