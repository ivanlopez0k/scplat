import { useState } from "react";
import type { ReactElement } from "react";
import { useNavigate, Link } from "react-router-dom";
import { requestPasswordReset } from "../../services/auth.service";
import "./forgot-password.css";
import logo from "/Group_17.png";

const GridBackground = (): ReactElement => (
  <svg className="forgot-grid" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="forgot-grid" width="32" height="32" patternUnits="userSpaceOnUse">
        <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#b0b8c1" strokeWidth="0.7" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#forgot-grid)" />
  </svg>
);

export default function ForgotPassword(): ReactElement {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await requestPasswordReset(email);
      setSuccess(true);

      // Show token in dev mode
      if (result.resetToken) {
        setDevToken(result.resetToken);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar solicitud");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-wrapper">
      <GridBackground />

      <div className="forgot-logo-container">
        <img className="forgot-logo" src={logo} alt="EducAR logo" />
      </div>

      <div className="forgot-card">
        {!success ? (
          <>
            <h1 className="forgot-title">Recuperar contraseña</h1>
            <p className="forgot-subtitle">
              Ingresá tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </p>

            {error && <p className="forgot-error">{error}</p>}

            <form className="forgot-form" onSubmit={handleSubmit}>
              <div className="forgot-field">
                <label className="forgot-label" htmlFor="forgot-email">
                  Correo electrónico
                </label>
                <input
                  className="forgot-input"
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button className="forgot-submit" type="submit" disabled={loading}>
                {loading ? "Enviando..." : "Enviar enlace"}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="forgot-success-icon">✓</div>
            <h1 className="forgot-title">¡Listo!</h1>
            <p className="forgot-subtitle">
              Si el correo electrónico existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.
            </p>

            {devToken && (
              <div className="forgot-dev-token">
                <p className="forgot-dev-label">DEV MODE - Token:</p>
                <code className="forgot-dev-code">{devToken}</code>
              </div>
            )}
          </>
        )}

        <p className="forgot-back">
          <Link to="/login" className="forgot-back-link">← Volver</Link>
        </p>
      </div>
    </div>
  );
}