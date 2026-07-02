"use client";


import { useState } from "react";
import Link from "next/link";
import { Spinner, Alert, Button, Row, Col } from "react-bootstrap";
import { Plus } from "react-bootstrap-icons";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { dronesApi } from "@/lib/api";
import type { Drone } from "@/lib/types";
import DroneCard from "@/components/DroneCard";
import ConfirmModal from "@/components/ConfirmModal";

export default function AdminDronesPage() {
  const { data: session } = useSession();
  const jwt = session?.user?.jwt || "";

  const { data: drones, error, isLoading, mutate } = useSWR<Drone[]>(
    ["admin-drones", jwt],
    ([_, t]: [string, string]) => dronesApi.list(t),
  );

  const [aApagar, setAApagar] = useState<string | null>(null);

  const apagar = async () => {
    if (!aApagar || !jwt) return;
    try {
      await dronesApi.remove(aApagar, jwt);
      mutate();
    } finally {
      setAApagar(null);
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h1 className="dz-section-title mb-0">Catálogo de Drones</h1>
        <Link href="/admin/drones/novo" className="btn btn-dz-primary">
          <Plus /> Novo drone
        </Link>
      </div>

      {isLoading && <Spinner animation="border" variant="info" />}
      {error && <Alert variant="danger">❌ {String((error as any).message || error)}</Alert>}

      {!isLoading && drones && drones.length === 0 && (
        <Alert variant="info">Ainda não existem drones. Clica em "Novo drone" para começar.</Alert>
      )}

      <Row className="g-3">
        {(drones || []).map((d) => (
          <Col key={d.documentId} md={6} lg={4}>
            <DroneCard
              drone={d}
              admin
              onDelete={() => setAApagar(d.documentId)}
            />
          </Col>
        ))}
      </Row>

      <ConfirmModal
        show={aApagar !== null}
        title="Apagar drone"
        message="Tens a certeza que queres apagar este drone? Esta acção é irreversível."
        confirmLabel="Apagar"
        onConfirm={apagar}
        onCancel={() => setAApagar(null)}
      />
    </>
  );
}
