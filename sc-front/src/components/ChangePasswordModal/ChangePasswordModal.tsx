import { useState, type ReactElement } from "react";
import Modal from "../Modal/Modal";
import { changePassword } from "../../services/auth.service";
import "./ChangePasswordModal.css";

interface ChangePasswordModalProps {
  onClose: () => void;
}

export default function ChangePasswordModal({ onClose }: ChangePasswordModalProps): ReactElement {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validate = (): boolean => {
    if (!currentPassword) {
      setError("Ingresá tu contraseña actual");
      return false;
    }
    if (!newPassword) {
      setError("Ingresá la nueva contraseña");
      return false;
    }
    if (newPassword.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres");
      return false;
    }
    if (!/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setError("La nueva contraseña debe contener al menos una mayúscula, una minúscula y un número");
      return false;
    }
    if (newPassword === currentPassword) {
      setError("La nueva contraseña debe ser diferente a la actual");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess(true);
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cambiar contraseña");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title="Cambiar contraseña"
      footer={
        <>
          <button className="change-pw-btn change-pw-btn--secondary" onClick={handleClose} disabled={loading}>
            Cancelar
          </button>
          {!success && (
            <button className="change-pw-btn change-pw-btn--primary" onClick={handleSubmit} disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </button>
          )}
        </>
      }
    >
      <div className="change-pw">
        {success ? (
          <div className="change-pw__success">
            <span className="change-pw__success-icon">✓</span>
            <p>Contraseña actualizada correctamente</p>
          </div>
        ) : (
          <>
            <div className="change-pw__field">
              <label htmlFor="current-password" className="change-pw__label">
                Contraseña actual
              </label>
              <input
                id="current-password"
                type="password"
                className="change-pw__input"
                value={currentPassword}
                onChange={(e) => { setCurrentPassword(e.target.value); setError(null); }}
                placeholder="Tu contraseña actual"
                disabled={loading}
                autoFocus
              />
            </div>

            <div className="change-pw__field">
              <label htmlFor="new-password" className="change-pw__label">
                Nueva contraseña
              </label>
              <input
                id="new-password"
                type="password"
                className="change-pw__input"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setError(null); }}
                placeholder="Mín. 8 caracteres, 1 mayúscula, 1 minúscula, 1 número"
                disabled={loading}
              />
            </div>

            <div className="change-pw__field">
              <label htmlFor="confirm-password" className="change-pw__label">
                Confirmar contraseña
              </label>
              <input
                id="confirm-password"
                type="password"
                className="change-pw__input"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                placeholder="Repetí la nueva contraseña"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="change-pw__error">{error}</div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
