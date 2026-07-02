"use client";

// =====================================================================
//  app/register/page.tsx — Registo (Strapi POST /api/auth/local/register)
//  ---------------------------------------------------------------------
//  Por defeito o Strapi exige confirmação por email. Em desenvolvimento,
//  podes desactivar essa exigência no admin do Strapi para testes.
// =====================================================================

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Form, Button, Alert } from "react-bootstrap";
import { strapiRegister } from "@/lib/api";

type FormData = { username: string; email: string; password: string };

export default function RegisterPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const onSubmit = async (d: FormData) => {
    setErro(null);
    setSucesso(null);
    try {
      await strapiRegister(d.username, d.email, d.password);

      // tenta fazer login de imediato
      const r = await signIn("credentials", {
        identifier: d.email,
        password: d.password,
        redirect: false,
      });
      if (r?.error) {
        setSucesso("Conta criada! Agora podes iniciar sessão com estas credenciais.");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch (e: any) {
      setErro(e?.message || "Não foi possível criar a conta.");
    }
  };

  return (
    <div style={{ maxWidth: 420 }} className="mx-auto">
      <h1 className="dz-section-title">Criar conta</h1>
      <p className="dz-subtitulo">Receberás o papel <code>authenticated</code> (CRUD completo).</p>

      <div className="dz-card p-4">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Form.Group className="mb-3">
            <Form.Label>Nome de utilizador</Form.Label>
            <Form.Control
              type="text"
              {...register("username", { required: "Obrigatório", minLength: 3 })}
              isInvalid={!!errors.username}
            />
            <Form.Control.Feedback type="invalid">
              {errors.username?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              {...register("email", {
                required: "Obrigatório",
                pattern: { value: /^\S+@\S+\.\S+$/, message: "Email inválido" },
              })}
              isInvalid={!!errors.email}
            />
            <Form.Control.Feedback type="invalid">
              {errors.email?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Palavra-passe</Form.Label>
            <Form.Control
              type="password"
              {...register("password", {
                required: "Obrigatória",
                minLength: { value: 6, message: "Mínimo 6 caracteres" },
              })}
              isInvalid={!!errors.password}
            />
            <Form.Control.Feedback type="invalid">
              {errors.password?.message}
            </Form.Control.Feedback>
          </Form.Group>

          {erro && <Alert variant="danger" className="py-2">{erro}</Alert>}
          {sucesso && <Alert variant="success" className="py-2">{sucesso}</Alert>}

          <Button type="submit" className="btn-dz-primary w-100" disabled={isSubmitting}>
            {isSubmitting ? "A criar…" : "Criar conta"}
          </Button>
        </Form>
      </div>

      <p className="text-secondary text-center mt-3">
        Já tens conta? <Link href="/login">Entrar</Link>.
      </p>
    </div>
  );
}
