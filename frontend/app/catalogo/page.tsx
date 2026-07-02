"use client";



import { useState, useMemo } from "react";
import Link from "next/link";
import { Form, Spinner, Alert, Row, Col } from "react-bootstrap";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { dronesApi } from "@/lib/api";
import type { Drone } from "@/lib/types";
import DroneCard from "@/components/DroneCard";

export default function CatalogoPage() {
  const { data: session } = useSession();
  const isLogged = !!session?.user;


  const swrKey = ["drones", session?.user?.jwt ?? "anon"];
  const fetcher = async ([_, jwt]: [string, string]) =>
    jwt === "anon" ? dronesApi.list() : dronesApi.list(jwt);
  const { data: drones, error, isLoading } = useSWR<Drone[]>(swrKey, fetcher);

  const [query, setQuery] = useState("");

  const filtrados = useMemo(() => {
    if (!drones) return [];
    const q = query.toLowerCase().trim();
    if (!q) return drones;
    return drones.filter(
      (d) =>
        d.nome.toLowerCase().includes(q) ||
        (d.categoria ?? "").toLowerCase().includes(q),
    );
  }, [drones, query]);

  return (
    <>
      <h1 className="dz-section-title">Catálogo de Drones</h1>
     

      <Form.Group className="mb-4" controlId="pesquisa">
        <Form.Control
          type="text"
          placeholder="🔍 Pesquisar drone (ex: fotografia, corrida)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </Form.Group>

      {isLoading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="info" />
          <p className="text-secondary mt-3">A carregar drones…</p>
        </div>
      )}

      {error && (
        <Alert variant="danger">
          ❌ Não foi possível carregar os drones: {String(error.message || error)}
        </Alert>
      )}

      {!isLoading && filtrados.length === 0 && (
        <p className="text-secondary fs-5 py-4">Nenhum drone encontrado. 🔍</p>
      )}

      <Row className="g-3">
        {filtrados.map((d) => (
          <Col key={d.documentId} md={6} lg={4}>
            <DroneCard drone={d} admin={isLogged} />
          </Col>
        ))}
      </Row>

      {isLogged && (
        <div className="text-center mt-4">
          <Link href="/admin/drones/novo" className="btn btn-dz-primary">
            + Adicionar novo drone
          </Link>
        </div>
      )}
    </>
  );
}
