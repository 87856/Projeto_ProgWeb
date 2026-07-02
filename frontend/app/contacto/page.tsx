"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Form, Button, Alert } from "react-bootstrap";

type FormData = { nome: string; email: string; mensagem: string };

export default function ContactoPage() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();
  const [enviado, setEnviado] = useState(false);

  const onSubmit = (d: FormData) => {
    // Em produção isto chamaria POST /api/contactos do Strapi
    console.log("Contacto:", d);
    setEnviado(true);
    reset();
  };

  return (
    <>
      <h1 className="dz-section-title">Contacta-nos</h1>
      <p className="dz-subtitulo">Tens dúvidas sobre drones? Escreve-nos.</p>

      <div className="dz-card p-4" style={{ maxWidth: 560 }}>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Form.Group className="mb-3" controlId="nome">
            <Form.Label>Nome</Form.Label>
            <Form.Control
              type="text"
              placeholder="O teu nome"
              {...register("nome", { required: "O nome é obrigatório" })}
              isInvalid={!!errors.nome}
            />
            <Form.Control.Feedback type="invalid">{errors.nome?.message}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="o.teu@email.com"
              {...register("email", {
                required: "O email é obrigatório",
                pattern: { value: /^\S+@\S+\.\S+$/, message: "Email inválido" },
              })}
              isInvalid={!!errors.email}
            />
            <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="mensagem">
            <Form.Label>Mensagem</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Escreve aqui…"
              {...register("mensagem", { required: "A mensagem é obrigatória", minLength: { value: 10, message: "Mínimo 10 caracteres" } })}
              isInvalid={!!errors.mensagem}
            />
            <Form.Control.Feedback type="invalid">{errors.mensagem?.message}</Form.Control.Feedback>
          </Form.Group>

          <Button type="submit" className="btn-dz-primary">
            Enviar mensagem
          </Button>

          {enviado && (
            <Alert variant="success" className="mt-3 mb-0">
              ✅ Obrigado! A tua mensagem foi enviada com sucesso.
            </Alert>
          )}
        </Form>
      </div>
    </>
  );
}
