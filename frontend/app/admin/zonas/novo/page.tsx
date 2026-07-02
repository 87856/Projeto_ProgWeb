"use client";

// =====================================================================
//  app/admin/zonas/novo/page.tsx — Criar nova zona (Client)
// =====================================================================

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { Form, Button, Alert, Row, Col, Spinner } from "react-bootstrap";
import { dronesApi, zonasApi, connectedDocs, connectedUsers } from "@/lib/api";
import type { Drone, User, TipoZona } from "@/lib/types";

type FormData = {
  nome: string;
  tipo: TipoZona;
  latitude: number;
  longitude: number;
  raio?: number;
  altitudeMax?: number;
  descricao?: string;
};

export default function NovaZonaPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const jwt = session?.user?.jwt || "";
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();
  const [erro, setErro] = useState<string | null>(null);

  const [drones, setDrones] = useState<Drone[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [dronesSel, setDronesSel] = useState<string[]>([]);
  const [usersSel, setUsersSel] = useState<number[]>([]);

  useEffect(() => {
    dronesApi.list(jwt).then(setDrones).catch(() => {});
    if (jwt) {
      fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users?pagination[pageSize]=100`, {
        headers: { Authorization: `Bearer ${jwt}` },
      })
        .then((r) => (r.ok ? r.json() : []))
        .then((arr) => setUsers(Array.isArray(arr) ? arr : []))
        .catch(() => setUsers([]));
    }
  }, [jwt]);

  const toggleDrone = (id: string) =>
    setDronesSel((arr) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]));
  const toggleUser = (id: number) =>
    setUsersSel((arr) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]));

  const onSubmit = async (d: FormData) => {
    setErro(null);
    try {
      // Strapi 5 espera o formato `[ { documentId } ]` para documentos
      // próprios (drones) e `[ { id } ]` para o plugin users.
      await zonasApi.create(
        {
          ...d,
          drones: connectedDocs(dronesSel) as any,
          users_permissions_users: connectedUsers(usersSel) as any,
        } as any,
        jwt,
      );
      router.push("/admin/zonas");
      router.refresh();
    } catch (e: any) {
      setErro(e?.message || "Erro ao criar zona");
    }
  };

  return (
    <>
      <h1 className="dz-section-title">Nova zona de voo</h1>

      <Form onSubmit={handleSubmit(onSubmit)} className="dz-card p-4">
        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Nome *</Form.Label>
              <Form.Control
                {...register("nome", { required: "Obrigatório", minLength: 3 })}
                isInvalid={!!errors.nome}
              />
              <Form.Control.Feedback type="invalid">{errors.nome?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Tipo *</Form.Label>
              <Form.Select {...register("tipo", { required: true })}>
                <option value="Permitida">Permitida</option>
                <option value="Restrita">Restrita</option>
                <option value="Proibida">Proibida</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Latitude *</Form.Label>
              <Form.Control
                type="number"
                step="0.0001"
                {...register("latitude", { required: "Obrigatório", valueAsNumber: true })}
                isInvalid={!!errors.latitude}
              />
              <Form.Control.Feedback type="invalid">{errors.latitude?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Longitude *</Form.Label>
              <Form.Control
                type="number"
                step="0.0001"
                {...register("longitude", { required: "Obrigatório", valueAsNumber: true })}
                isInvalid={!!errors.longitude}
              />
              <Form.Control.Feedback type="invalid">{errors.longitude?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Raio (m)</Form.Label>
              <Form.Control type="number" defaultValue={1000} {...register("raio", { valueAsNumber: true })} />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Altitude máxima (m)</Form.Label>
              <Form.Control type="number" {...register("altitudeMax", { valueAsNumber: true })} />
            </Form.Group>
          </Col>

          <Col xs={12}>
            <Form.Group>
              <Form.Label>Descrição</Form.Label>
              <Form.Control as="textarea" rows={3} {...register("descricao")} />
            </Form.Group>
          </Col>

          <Col md={6}>
            <h5 className="mt-3">🛸 Drones nesta zona <small className="text-secondary">(N-N)</small></h5>
            <div className="dz-card p-3" style={{ maxHeight: 220, overflowY: "auto" }}>
              {drones.length === 0 && <p className="text-secondary mb-0">A carregar…</p>}
              {drones.map((d) => (
                <Form.Check
                  key={d.documentId}
                  type="checkbox"
                  id={`drone-${d.documentId}`}
                  label={`${d.nome} (${d.categoria ?? "—"})`}
                  checked={dronesSel.includes(d.documentId)}
                  onChange={() => toggleDrone(d.documentId)}
                />
              ))}
            </div>
          </Col>
          <Col md={6}>
            <h5 className="mt-3">👤 Pilotos com acesso <small className="text-secondary">(N-N)</small></h5>
            <div className="dz-card p-3" style={{ maxHeight: 220, overflowY: "auto" }}>
              {users.length === 0 && <p className="text-secondary mb-0">Sem utilizadores ainda.</p>}
              {users.map((u) => (
                <Form.Check
                  key={u.id}
                  type="checkbox"
                  id={`user-${u.id}`}
                  label={`@${u.username} — ${u.email}`}
                  checked={usersSel.includes(u.id)}
                  onChange={() => toggleUser(u.id)}
                />
              ))}
            </div>
          </Col>
        </Row>

        {erro && <Alert variant="danger" className="mt-3 mb-0">{erro}</Alert>}

        <div className="d-flex gap-2 mt-4">
          <Button type="submit" className="btn-dz-primary" disabled={isSubmitting}>
            {isSubmitting ? "A criar…" : "Criar zona"}
          </Button>
          <Button variant="secondary" type="button" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </Form>
    </>
  );
}
