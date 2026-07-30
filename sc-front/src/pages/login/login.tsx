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
  const [showPassword, setShowPassword] = useState<boolean>(false);
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
            <div className="password-wrapper">
              <input
                className="login-input"
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (validationErrors.password) setValidationErrors({ ...validationErrors, password: undefined });
                }}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
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
