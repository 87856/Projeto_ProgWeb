"use client";

// =====================================================================
//  app/comparacao/page.tsx — Tabela de comparação
//  ---------------------------------------------------------------------
//  Mostra TODOS os drones lado a lado. Dados vêm da API Strapi.
// =====================================================================

import { Spinner, Alert, Table, Form } from "react-bootstrap";
import useSWR from "swr";
import { useState, useMemo } from "react";
import { dronesApi, formatEuro } from "@/lib/api";
import type { Drone } from "@/lib/types";

export default function ComparacaoPage() {
  const { data: drones, error, isLoading } = useSWR<Drone[]>(
    "drones-all",
    () => dronesApi.list(),
  );

  const [ordenarPor, setOrdenarPor] = useState<keyof Drone | "">("");
  const [asc, setAsc] = useState(true);

  const ordenados = useMemo(() => {
    if (!drones || !ordenarPor) return drones ?? [];
    const copia = [...drones];
    copia.sort((a, b) => {
      const va = (a as any)[ordenarPor] ?? 0;
      const vb = (b as any)[ordenarPor] ?? 0;
      if (typeof va === "string") return asc ? va.localeCompare(vb) : vb.localeCompare(va);
      return asc ? va - vb : vb - va;
    });
    return copia;
  }, [drones, ordenarPor, asc]);

  const clicarOrdenar = (col: keyof Drone) => {
    if (ordenarPor === col) setAsc(!asc);
    else { setOrdenarPor(col); setAsc(true); }
  };

  const seta = (col: string) =>
    ordenarPor === col ? (asc ? " ▲" : " ▼") : "";

  return (
    <>
      <h1 className="dz-section-title">Comparação de drones</h1>
      <p className="dz-subtitulo">Clica no cabeçalho de uma coluna para ordenar.</p>

      {isLoading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="info" />
          <p className="text-secondary mt-3">A carregar drones…</p>
        </div>
      )}

      {error && (
        <Alert variant="danger">❌ Erro: {String(error.message || error)}</Alert>
      )}

      {!isLoading && drones && (
        <div className="table-responsive">
          <Table striped hover className="dz-table">
            <thead>
              <tr>
                <th onClick={() => clicarOrdenar("nome")} style={{ cursor: "pointer" }}>
                  Drone{seta("nome")}
                </th>
                <th onClick={() => clicarOrdenar("categoria")} style={{ cursor: "pointer" }}>
                  Categoria{seta("categoria")}
                </th>
                <th onClick={() => clicarOrdenar("autonomia")} style={{ cursor: "pointer" }}>
                  Autonomia{seta("autonomia")}
                </th>
                <th onClick={() => clicarOrdenar("alcance")} style={{ cursor: "pointer" }}>
                  Alcance{seta("alcance")}
                </th>
                <th onClick={() => clicarOrdenar("velocidade")} style={{ cursor: "pointer" }}>
                  Velocidade{seta("velocidade")}
                </th>
                <th onClick={() => clicarOrdenar("peso")} style={{ cursor: "pointer" }}>
                  Peso{seta("peso")}
                </th>
                <th onClick={() => clicarOrdenar("preco")} style={{ cursor: "pointer" }}>
                  Preço{seta("preco")}
                </th>
              </tr>
            </thead>
            <tbody>
              {ordenados.map((d) => (
                <tr key={d.documentId}>
                  <td><b>{d.nome}</b></td>
                  <td>{d.categoria ?? "—"}</td>
                  <td>{d.autonomia ?? "—"} min</td>
                  <td>{d.alcance ?? "—"} km</td>
                  <td>{d.velocidade ?? "—"} km/h</td>
                  <td>{d.peso ?? "—"} g</td>
                  <td className="text-info fw-bold">{formatEuro(d.preco)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </>
  );
}
