import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginApi } from "../../services/auth.service";
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
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<{email?: string; password?: string}>({});
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const validateForm = (): boolean => {
    const errors: {email?: string; password?: string} = {};

    // Email validation
    if (!email) {
      errors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Email inválido";
    } else if (email.length > 255) {
      errors.email = "Email demasiado largo";
    }

    // Password validation
    if (!password) {
      errors.password = "La contraseña es requerida";
    } else if (password.length < 8) {
      errors.password = "Mínimo 8 caracteres";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setError("");
    setLoading(true);

    try {
      await loginApi(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

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

        {error && <p className="login-error">{error}</p>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label className="login-label" htmlFor="login-email">
              Correo electrónico
            </label>
            <input
              className="login-input"
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (validationErrors.email) setValidationErrors({ ...validationErrors, email: undefined });
              }}
              required
            />
            {validationErrors.email && <span className="login-input-error">{validationErrors.email}</span>}
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
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (validationErrors.password) setValidationErrors({ ...validationErrors, password: undefined });
              }}
              required
            />
            {validationErrors.password && <span className="login-input-error">{validationErrors.password}</span>}
          </div>

          <button className="login-submit" type="submit" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p className="login-register">
          ¿No tenés cuenta aún? Registrate <a href="#">aquí</a>
        </p>
      </div>
    </div>
  );
}
