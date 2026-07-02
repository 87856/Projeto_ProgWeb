"use client";


import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Form, Button, Alert, Row, Col } from "react-bootstrap";
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

export default function NovoDronePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const jwt = session?.user?.jwt || "";
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();
  const [erro, setErro] = useState<string | null>(null);

  const onSubmit = async (d: FormData) => {
    setErro(null);
    try {
      await dronesApi.create(d as Omit<Drone, "id" | "documentId" | "createdAt" | "updatedAt" | "publishedAt">, jwt);
      router.push("/admin/drones");
      router.refresh();
    } catch (e: any) {
      setErro(e?.message || "Erro ao criar drone");
    }
  };

  return (
    <>
      <h1 className="dz-section-title">Novo drone</h1>
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

          <Col md={3}>
            <Form.Group>
              <Form.Label>Preço (€)</Form.Label>
              <Form.Control type="number" {...register("preco", { valueAsNumber: true })} />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Autonomia (min)</Form.Label>
              <Form.Control type="number" {...register("autonomia", { valueAsNumber: true })} />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Alcance (km)</Form.Label>
              <Form.Control type="number" {...register("alcance", { valueAsNumber: true })} />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Velocidade (km/h)</Form.Label>
              <Form.Control type="number" {...register("velocidade", { valueAsNumber: true })} />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Peso (g)</Form.Label>
              <Form.Control type="number" {...register("peso", { valueAsNumber: true })} />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Câmara</Form.Label>
              <Form.Control placeholder="ex: 4K / 48MP" {...register("camara")} />
            </Form.Group>
          </Col>

          <Col xs={12}>
            <Form.Group>
              <Form.Label>Imagem (URL ou caminho)</Form.Label>
              <Form.Control placeholder="imagens/drone-X.png" {...register("imagem")} />
            </Form.Group>
          </Col>
          <Col xs={12}>
            <Form.Group>
              <Form.Label>Descrição</Form.Label>
              <Form.Control as="textarea" rows={3} {...register("descricao")} />
            </Form.Group>
          </Col>
        </Row>

        {erro && <Alert variant="danger" className="mt-3 mb-0">{erro}</Alert>}

        <div className="d-flex gap-2 mt-4">
          <Button type="submit" className="btn-dz-primary" disabled={isSubmitting}>
            {isSubmitting ? "A criar…" : "Criar drone"}
          </Button>
          <Button variant="secondary" type="button" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </Form>
    </>
  );
}
