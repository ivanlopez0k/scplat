import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { MoonIcon, SunIcon } from "../../components/Icons/ThemeIcons";
import GridBackground from "../../components/GridBackground/GridBackground";
import logo from "/Group_17.png";
import "./home.css";

export default function Home(): ReactElement {
  const [visible, setVisible] = useState<boolean>(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="home-wrapper">
      <GridBackground className="home-grid" />

      <nav className="home-nav">
        <img src={logo} alt="EduCAR logo" />
        <button
          className="home-theme-toggle"
          aria-label="Cambiar tema"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
        >
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
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