import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from 'react-hot-toast';
import { login as loginApi } from "../../services/auth.service";
import GridBackground from "../../components/GridBackground/GridBackground";
import logo from "/Group_17.png";
import "./login.css";

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
      toast.success('Bienvenido!');
      navigate("/dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Credenciales inválidas";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <GridBackground className="login-grid" />

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

        <p className="login-forgot">
          <Link to="/forgot-password" className="login-forgot-link">¿Olvidaste tu contraseña?</Link>
        </p>

        <p className="login-register">
          ¿No tenés cuenta aún? Registrate <Link to="/register" className="login-register-link">aquí</Link>
        </p>
      </div>
    </div>
  );
}
