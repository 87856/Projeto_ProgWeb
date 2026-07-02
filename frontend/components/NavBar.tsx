"use client";

// =====================================================================
//  NavBar.tsx — Barra de navegação principal (Client Component)
// =====================================================================

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Container, Nav, Navbar, NavDropdown, Spinner } from "react-bootstrap";

export default function NavBar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isLogged = status === "authenticated";

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Navbar expand="lg" sticky="top" className="dz-navbar" collapseOnSelect>
      <Container>
        <Navbar.Brand as={Link} href="/">
          Drone<span>Zone</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="dz-navbar" />
        <Navbar.Collapse id="dz-navbar">
          <Nav className="me-auto">
            <Nav.Link as={Link} href="/" active={isActive("/")}>
              Início
            </Nav.Link>
            <Nav.Link as={Link} href="/catalogo" active={isActive("/catalogo")}>
              Catálogo
            </Nav.Link>
            <Nav.Link as={Link} href="/comparacao" active={isActive("/comparacao")}>
              Comparação
            </Nav.Link>
            <Nav.Link as={Link} href="/sobre" active={isActive("/sobre")}>
              Sobre
            </Nav.Link>
            <Nav.Link as={Link} href="/mapa" active={isActive("/mapa")}>
              Mapa
            </Nav.Link>
            <Nav.Link as={Link} href="/contacto" active={isActive("/contacto")}>
              Contacto
            </Nav.Link>
            {isLogged && (
              <Nav.Link as={Link} href="/admin" active={isActive("/admin")}>
                Admin
              </Nav.Link>
            )}
          </Nav>
          <Nav>
            {status === "loading" && (
              <Spinner animation="border" size="sm" variant="light" />
            )}
            {status === "unauthenticated" && (
              <>
                <Nav.Link as={Link} href="/login">Login</Nav.Link>
                <Nav.Link as={Link} href="/register">Registar</Nav.Link>
              </>
            )}
            {isLogged && session?.user && (
              <NavDropdown
                title={
                  <>
                    👤 {session.user.username}{" "}
                    <span className="badge bg-info text-dark">{session.user.role}</span>
                  </>
                }
                id="dz-user-menu"
                align="end"
              >
                <NavDropdown.Item as={Link} href="/admin">
                  Painel de administração
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={() => signOut({ callbackUrl: "/" })}>
                  Terminar sessão
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
