import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";

import type { Metadata } from "next";
import Providers from "./providers";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "DroneZone — Catálogo, Mapa e Simulador de Drones",
  description:
    "Plataforma completa sobre drones em Portugal: catálogo, comparação, mapa de zonas de voo e simulador em tempo real.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" data-bs-theme="dark">
      <body>
        <Providers>
          <NavBar />
          <main className="container py-4" style={{ maxWidth: 1100 }}>
            {children}
          </main>
          <footer className="dz-footer">
            <div className="container">
              
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
