"use client";

// =====================================================================
//  app/admin/zonas/[documentId]/page.tsx — Editar zona (Client)
// =====================================================================

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Form, Button, Alert, Row, Col, Spinner } from "react-bootstrap";
import { useSession } from "next-auth/react";
import { dronesApi, zonasApi, connectedDocs, connectedUsers } from "@/lib/api";
import type { Drone, User, ZonaVoo, TipoZona } from "@/lib/types";

type FormData = {
  nome: string;
  tipo: TipoZona;
  latitude: number;
  longitude: number;
  raio?: number;
  altitudeMax?: number;
  descricao?: string;
};

export default function EditarZonaPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const jwt = session?.user?.jwt || "";

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>();
  const [carregando, setCarregando] = useState(true);
  const [zona, setZona] = useState<ZonaVoo | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const [drones, setDrones] = useState<Drone[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [dronesSel, setDronesSel] = useState<string[]>([]);
  const [usersSel, setUsersSel] = useState<number[]>([]);

  useEffect(() => {
    Promise.all([
      zonasApi.get(documentId, jwt),
      dronesApi.list(jwt),
      fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users?pagination[pageSize]=100`, {
        headers: { Authorization: `Bearer ${jwt}` },
      })
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []),
    ])
      .then(([z, ds, us]: any[]) => {
        setZona(z);
        setDrones(ds);
        setUsers(Array.isArray(us) ? us : []);
        setDronesSel(((z as any).drones ?? []).map((d: any) => d.documentId));
        setUsersSel(((z as any).users_permissions_users ?? []).map((u: any) => u.id));
        reset({
          nome: (z as any).nome,
          tipo: (z as any).tipo,
          latitude: Number((z as any).latitude),
          longitude: Number((z as any).longitude),
          raio: (z as any).raio,
          altitudeMax: (z as any).altitudeMax,
          descricao: (z as any).descricao,
        });
      })
      .catch((e) => setErro(e?.message || String(e)))
      .finally(() => setCarregando(false));
  }, [documentId, jwt, reset]);

  const toggleDrone = (id: string) =>
    setDronesSel((arr) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]));
  const toggleUser = (id: number) =>
    setUsersSel((arr) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]));

  const onSubmit = async (d: FormData) => {
    setErro(null);
    try {
      await zonasApi.update(documentId, {
        ...d,
        drones: connectedDocs(dronesSel) as any,
        users_permissions_users: connectedUsers(usersSel) as any,
      }, jwt);
      router.push("/admin/zonas");
      router.refresh();
    } catch (e: any) {
      setErro(e?.message || "Erro ao actualizar zona");
    }
  };

  if (carregando)
    return <div className="text-center py-5"><Spinner animation="border" variant="info" /></div>;
  if (erro && !zona) return <Alert variant="danger">❌ {erro}</Alert>;

  return (
    <>
      <h1 className="dz-section-title">Editar: {zona?.nome}</h1>

      <Form onSubmit={handleSubmit(onSubmit)} className="dz-card p-4">
        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Nome *</Form.Label>
              <Form.Control
                {...register("nome", { required: true })}
                isInvalid={!!errors.nome}
              />
              <Form.Control.Feedback type="invalid">{errors.nome?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Tipo</Form.Label>
              <Form.Select {...register("tipo")}>
                <option value="Permitida">Permitida</option>
                <option value="Restrita">Restrita</option>
                <option value="Proibida">Proibida</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={6}><Form.Group><Form.Label>Latitude</Form.Label><Form.Control type="number" step="0.0001" {...register("latitude", { valueAsNumber: true })} /></Form.Group></Col>
          <Col md={6}><Form.Group><Form.Label>Longitude</Form.Label><Form.Control type="number" step="0.0001" {...register("longitude", { valueAsNumber: true })} /></Form.Group></Col>

          <Col md={6}><Form.Group><Form.Label>Raio (m)</Form.Label><Form.Control type="number" {...register("raio", { valueAsNumber: true })} /></Form.Group></Col>
          <Col md={6}><Form.Group><Form.Label>Altitude máxima (m)</Form.Label><Form.Control type="number" {...register("altitudeMax", { valueAsNumber: true })} /></Form.Group></Col>

          <Col xs={12}><Form.Group><Form.Label>Descrição</Form.Label><Form.Control as="textarea" rows={3} {...register("descricao")} /></Form.Group></Col>

          <Col md={6}>
            <h5 className="mt-3">🛸 Drones <small className="text-secondary">(N-N)</small></h5>
            <div className="dz-card p-3" style={{ maxHeight: 220, overflowY: "auto" }}>
              {drones.map((d) => (
                <Form.Check
                  key={d.documentId}
                  type="checkbox"
                  id={`ed-${d.documentId}`}
                  label={`${d.nome} (${d.categoria ?? "—"})`}
                  checked={dronesSel.includes(d.documentId)}
                  onChange={() => toggleDrone(d.documentId)}
                />
              ))}
            </div>
          </Col>
          <Col md={6}>
            <h5 className="mt-3">👤 Pilotos <small className="text-secondary">(N-N)</small></h5>
            <div className="dz-card p-3" style={{ maxHeight: 220, overflowY: "auto" }}>
              {users.length === 0 && <p className="text-secondary mb-0">Sem utilizadores carregados.</p>}
              {users.map((u) => (
                <Form.Check
                  key={u.id}
                  type="checkbox"
                  id={`ed-u-${u.id}`}
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
            {isSubmitting ? "A guardar…" : "Guardar alterações"}
          </Button>
          <Button variant="secondary" type="button" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </Form>
    </>
  );
}
