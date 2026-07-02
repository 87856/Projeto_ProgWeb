"use client";



import dynamic from "next/dynamic";

const MapaSimulador = dynamic(() => import("@/components/MapaSimulador"), {
  ssr: false,
  loading: () => (
    <div className="dz-card p-5 text-center">
      <p>A carregar o mapa…</p>
    </div>
  ),
});

export default function MapaPage() {
  return (
    <>
      <h1 className="dz-section-title">Simulador de voo em tempo real (DEMO)</h1>
      <p className="dz-subtitulo">
        O drone parte de Praia de Carcavelos e percorre um trajecto pelas zonas de voo
        de Portugal carregadas pela API Strapi. O sistema alerta em zonas restritas
        ou proibidas, ou quando o drone excede o alcance máximo.
      </p>
      <MapaSimulador />
    </>
  );
}
