import { useState } from "react";
import type { ReactElement } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { resetPassword } from "../../services/auth.service";
import "./new-password.css";
import logo from "/Group_17.png";

const GridBackground = (): ReactElement => (
  <svg className="newpass-grid" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="newpass-grid" width="32" height="32" patternUnits="userSpaceOnUse">
        <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#b0b8c1" strokeWidth="0.7" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#newpass-grid)" />
  </svg>
);

export default function NewPassword(): ReactElement {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  const validateForm = (): boolean => {
    const errors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      errors.password = "La contraseña es requerida";
    } else if (password.length < 8) {
      errors.password = "Mínimo 8 caracteres";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Debes confirmar tu contraseña";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("Token inválido");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setError("");
    setLoading(true);

    try {
      await resetPassword(token, password);
      setSuccess(true);

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al restablecer contraseña");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="newpass-wrapper">
        <GridBackground />

        <div className="newpass-logo-container">
          <img className="newpass-logo" src={logo} alt="EducAR logo" />
        </div>

        <div className="newpass-card">
          <div className="newpass-error-icon">✕</div>
          <h1 className="newpass-title">Token inválido</h1>
          <p className="newpass-subtitle">
            El enlace de recuperación es inválido o ha expirado.
          </p>
          <p className="newpass-back">
            <Link to="/forgot-password" className="newpass-back-link">← Volver</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="newpass-wrapper">
      <GridBackground />

      <div className="newpass-logo-container">
        <img className="newpass-logo" src={logo} alt="EducAR logo" />
      </div>

      <div className="newpass-card">
        {!success ? (
          <>
            <h1 className="newpass-title">Nueva contraseña</h1>
            <p className="newpass-subtitle">
              Ingresá tu nueva contraseña. Debe tener al menos 8 caracteres.
            </p>

            {error && <p className="newpass-error">{error}</p>}

            <form className="newpass-form" onSubmit={handleSubmit}>
              <div className="newpass-field">
                <label className="newpass-label" htmlFor="newpass-password">
                  Nueva contraseña
                </label>
                <input
                  className="newpass-input"
                  id="newpass-password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationErrors.password) setValidationErrors({ ...validationErrors, password: undefined });
                  }}
                  required
                />
                {validationErrors.password && <span className="newpass-input-error">{validationErrors.password}</span>}
              </div>

              <div className="newpass-field">
                <label className="newpass-label" htmlFor="newpass-confirm">
                  Confirmar contraseña
                </label>
                <input
                  className="newpass-input"
                  id="newpass-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (validationErrors.confirmPassword) setValidationErrors({ ...validationErrors, confirmPassword: undefined });
                  }}
                  required
                />
                {validationErrors.confirmPassword && <span className="newpass-input-error">{validationErrors.confirmPassword}</span>}
              </div>

              <button className="newpass-submit" type="submit" disabled={loading}>
                {loading ? "Guardando..." : "Guardar contraseña"}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="newpass-success-icon">✓</div>
            <h1 className="newpass-title">¡Cambiada!</h1>
            <p className="newpass-subtitle">
              Tu contraseña ha sido actualizada correctamente. Serás redirigido al login...
            </p>
          </>
        )}

        {!success && (
          <p className="newpass-back">
            <Link to="/login" className="newpass-back-link">← Volver</Link>
          </p>
        )}
      </div>
    </div>
  );
}