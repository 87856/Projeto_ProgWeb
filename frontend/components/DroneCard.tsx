"use client";

// =====================================================================
//  DroneCard.tsx — Cartão individual de cada drone
//  ---------------------------------------------------------------------
//  Client Component (precisa de handlers Como reservar / ver detalhes
//  no futuro). Aceita um modo "admin" que mostra botões de Editar/Apagar.
// =====================================================================

import Link from "next/link";
import { Card, Button } from "react-bootstrap";
import type { Drone } from "@/lib/types";
import { formatEuro } from "@/lib/api";

interface Props {
  drone: Drone;
  /** Quando true, mostra botões de editar/apagar (visível só para o papel autenticado). */
  admin?: boolean;
  onDelete?: (documentId: string) => void;
}

export default function DroneCard({ drone, admin = false, onDelete }: Props) {
  return (
    <Card className="dz-card">
      <div className="position-relative">
        {/* imagem (placeholder se não houver) */}
        <div
          style={{
            height: 180,
            background:
              "linear-gradient(135deg, var(--dz-superficie-2), var(--dz-azul))",
            borderRadius: "16px 16px 0 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--dz-texto)",
            fontSize: "3rem",
          }}
        >
          🛸
        </div>
        {drone.categoria && <span className="dz-etiqueta">{drone.categoria}</span>}
      </div>
      <Card.Body>
        <Card.Title>{drone.nome}</Card.Title>
        <Card.Text className="text-secondary small">{drone.descricao}</Card.Text>
        <ul className="list-unstyled small mt-3">
          {drone.autonomia !== undefined && (
            <li className="d-flex justify-content-between border-bottom border-secondary py-1">
              <span className="text-secondary">Autonomia</span>
              <b>{drone.autonomia} min</b>
            </li>
          )}
          {drone.velocidade !== undefined && (
            <li className="d-flex justify-content-between border-bottom border-secondary py-1">
              <span className="text-secondary">Velocidade</span>
              <b>{drone.velocidade} km/h</b>
            </li>
          )}
          {drone.camara && (
            <li className="d-flex justify-content-between border-bottom border-secondary py-1">
              <span className="text-secondary">Câmara</span>
              <b>{drone.camara}</b>
            </li>
          )}
        </ul>
        <div className="dz-preco">{formatEuro(drone.preco)}</div>

        {admin && (
          <div className="d-flex gap-2 mt-3">
            <Button
              as={Link as any}
              href={`/admin/drones/${drone.documentId}`}
              variant="outline-info"
              size="sm"
            >
              Editar
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => onDelete?.(drone.documentId)}
            >
              Apagar
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
