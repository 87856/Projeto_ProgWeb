import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="d-flex gap-2 mb-4 flex-wrap">
        <Link href="/admin" className="btn btn-dz-outline">
          🏠 Painel
        </Link>
        <Link href="/admin/perfil" className="btn btn-dz-outline">
          👤 O meu perfil
        </Link>
        <Link href="/admin/drones" className="btn btn-dz-outline">
          🛸 Drones
        </Link>
        <Link href="/admin/zonas" className="btn btn-dz-outline">
          🗺️ Zonas 
        </Link>
      </div>
      {children}
    </>
  );
}
