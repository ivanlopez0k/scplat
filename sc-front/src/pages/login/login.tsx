import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import logo from "/Group_17.png";

const GridBackground = (): ReactElement => (
  <svg className="login-grid" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="login-grid" width="32" height="32" patternUnits="userSpaceOnUse">
        <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#b0b8c1" strokeWidth="0.7" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#login-grid)" />
  </svg>
);

export default function Login(): ReactElement {
  const [visible, setVisible] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="login-wrapper">
      <GridBackground />

      {/* Logo */}
      <div className="login-logo-container">
        <img className="login-logo" src={logo} alt="EducAR logo" />
      </div>

      {/* Card */}
      <div className={`login-card ${visible ? "visible" : ""}`}>
        <button
          className="login-close"
          aria-label="Cerrar"
          onClick={() => navigate("/")}
        >
          ✕
        </button>

        <h1 className="login-title">Iniciar sesión</h1>

        <form className="login-form" onSubmit={(e) => e.preventDefault()}>
          <div className="login-field">
            <label className="login-label" htmlFor="login-email">
              Correo electrónico
            </label>
            <input
              className="login-input"
              id="login-email"
              type="email"
              autoComplete="email"
            />
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="login-password">
              Contraseña
            </label>
            <input
              className="login-input"
              id="login-password"
              type="password"
              autoComplete="current-password"
            />
          </div>

          <button className="login-submit" type="submit">
            Ingresar
          </button>
        </form>

        <p className="login-register">
          ¿No tenés cuenta aún? Registrate <a href="#">aquí</a>
        </p>
      </div>
    </div>
  );
}
