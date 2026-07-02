"use client";

// =====================================================================
//  app/login/page.tsx — Login (Credentials Provider → Strapi /api/auth/local)
// =====================================================================

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Form, Button, Alert } from "react-bootstrap";

type FormData = { identifier: string; password: string };

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const callbackUrl = search?.get("callbackUrl") || "/admin";
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();
  const [erro, setErro] = useState<string | null>(null);

  const onSubmit = async (d: FormData) => {
    setErro(null);
    const res = await signIn("credentials", {
      identifier: d.identifier,
      password: d.password,
      redirect: false,
    });
    if (res?.error) {
      setErro("Credenciais inválidas. Verifica utilizador/email e palavra-passe.");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <div style={{ maxWidth: 420 }} className="mx-auto">
      <h1 className="dz-section-title">Entrar</h1>
      <p className="dz-subtitulo">Usa o teu utilizador ou email do Strapi.</p>

      <div className="dz-card p-4">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Form.Group className="mb-3">
            <Form.Label>Utilizador ou email</Form.Label>
            <Form.Control
              type="text"
              autoComplete="username"
              {...register("identifier", { required: "Campo obrigatório" })}
              isInvalid={!!errors.identifier}
            />
            <Form.Control.Feedback type="invalid">
              {errors.identifier?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Palavra-passe</Form.Label>
            <Form.Control
              type="password"
              autoComplete="current-password"
              {...register("password", { required: "Campo obrigatório", minLength: { value: 6, message: "Mínimo 6 caracteres" } })}
              isInvalid={!!errors.password}
            />
            <Form.Control.Feedback type="invalid">
              {errors.password?.message}
            </Form.Control.Feedback>
          </Form.Group>

          {erro && <Alert variant="danger" className="py-2">{erro}</Alert>}

          <Button type="submit" className="btn-dz-primary w-100" disabled={isSubmitting}>
            {isSubmitting ? "A entrar…" : "Entrar"}
          </Button>
        </Form>
      </div>

      <p className="text-secondary text-center mt-3">
        Ainda não tens conta? <Link href="/register">Cria uma aqui</Link>.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="text-secondary">A carregar formulário…</p>}>
      <LoginForm />
    </Suspense>
  );
}
