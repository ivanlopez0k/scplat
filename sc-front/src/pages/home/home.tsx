import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import logo from "/Group_17.png";

const GridBackground = (): ReactElement => (
  <svg className="home-grid" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
        <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#b0b8c1" strokeWidth="0.7" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" />
  </svg>
);

export default function Home(): ReactElement {
  const [visible, setVisible] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="home-wrapper">
      <GridBackground />

      <nav className="home-nav">
        <img src={logo} alt="EduCAR logo" />
      </nav>

      <main className="home-main">
        <div className={`home-content ${visible ? "visible" : ""}`}>
          <h1 className="home-title">
            Plataforma de
            <br />
            gestión académica
          </h1>

          <p className="home-description">
            Tu espacio para seguir el recorrido escolar de cerca.
            Notas, evaluaciones y comunicados en un solo lugar.
          </p>

          <button className="home-btn" onClick={() => navigate("/login")}>
            Ingresar a la plataforma
          </button>
        </div>
      </main>

      <div className="home-decoration" />
    </div>
  );
}