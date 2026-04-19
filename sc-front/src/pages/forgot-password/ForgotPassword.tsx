import { useState, type ReactElement } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { requestPasswordReset } from "../../services/auth.service";
import GridBackground from "../../components/GridBackground/GridBackground";
import logo from "/Group_17.png";
import "./forgot-password.css";

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
      toast.success('Si el email existe, recibirás un enlace');

      // Show token in dev mode
      if (result.resetToken) {
        setDevToken(result.resetToken);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar solicitud");
      toast.error('Error al procesar solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-wrapper">
      <GridBackground className="forgot-grid" />

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
                  className={`forgot-input ${error ? "forgot-input--error" : ""}`}
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
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