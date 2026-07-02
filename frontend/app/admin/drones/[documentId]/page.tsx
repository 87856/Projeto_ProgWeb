"use client";



import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Form, Button, Alert, Row, Col, Spinner } from "react-bootstrap";
import { useSession } from "next-auth/react";
import { dronesApi } from "@/lib/api";
import type { Drone } from "@/lib/types";

type FormData = {
  nome: string;
  categoria?: string;
  preco?: number;
  autonomia?: number;
  alcance?: number;
  velocidade?: number;
  peso?: number;
  camara?: string;
  imagem?: string;
  descricao?: string;
};

export default function EditarDronePage({
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
  const [erro, setErro] = useState<string | null>(null);
  const [drone, setDrone] = useState<Drone | null>(null);

  useEffect(() => {
    dronesApi.get(documentId, jwt)
      .then((d) => {
        setDrone(d);
        reset({
          nome: d.nome,
          categoria: d.categoria,
          preco: d.preco,
          autonomia: d.autonomia,
          alcance: d.alcance,
          velocidade: d.velocidade,
          peso: d.peso,
          camara: d.camara,
          imagem: d.imagem,
          descricao: d.descricao,
        });
      })
      .catch((e) => setErro(e?.message || String(e)))
      .finally(() => setCarregando(false));
  }, [documentId, jwt, reset]);

  const onSubmit = async (d: FormData) => {
    setErro(null);
    try {
      await dronesApi.update(documentId, d, jwt);
      router.push("/admin/drones");
      router.refresh();
    } catch (e: any) {
      setErro(e?.message || "Erro ao actualizar drone");
    }
  };

  if (carregando) return <div className="text-center py-5"><Spinner animation="border" variant="info" /></div>;
  if (erro && !drone) return <Alert variant="danger">❌ {erro}</Alert>;

  return (
    <>
      <h1 className="dz-section-title">Editar: {drone?.nome}</h1>

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
              <Form.Label>Categoria</Form.Label>
              <Form.Select {...register("categoria")}>
                <option value="">— escolher —</option>
                <option>Fotografia</option>
                <option>Profissional</option>
                <option>Iniciante</option>
                <option>Corrida</option>
                <option>Industrial</option>
                <option>Agricultura</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3}><Form.Group><Form.Label>Preço (€)</Form.Label><Form.Control type="number" {...register("preco", { valueAsNumber: true })} /></Form.Group></Col>
          <Col md={3}><Form.Group><Form.Label>Autonomia (min)</Form.Label><Form.Control type="number" {...register("autonomia", { valueAsNumber: true })} /></Form.Group></Col>
          <Col md={3}><Form.Group><Form.Label>Alcance (km)</Form.Label><Form.Control type="number" {...register("alcance", { valueAsNumber: true })} /></Form.Group></Col>
          <Col md={3}><Form.Group><Form.Label>Velocidade (km/h)</Form.Label><Form.Control type="number" {...register("velocidade", { valueAsNumber: true })} /></Form.Group></Col>

          <Col md={6}><Form.Group><Form.Label>Peso (g)</Form.Label><Form.Control type="number" {...register("peso", { valueAsNumber: true })} /></Form.Group></Col>
          <Col md={6}><Form.Group><Form.Label>Câmara</Form.Label><Form.Control {...register("camara")} /></Form.Group></Col>

          <Col xs={12}><Form.Group><Form.Label>Imagem</Form.Label><Form.Control {...register("imagem")} /></Form.Group></Col>
          <Col xs={12}><Form.Group><Form.Label>Descrição</Form.Label><Form.Control as="textarea" rows={3} {...register("descricao")} /></Form.Group></Col>
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
