import { useState, type ReactElement, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../../services/auth.service";
import logo from "/Group_17.png";
import "./register.css";

/* ── Grid background ── */
const GridBackground = (): ReactElement => (
  <svg className="reg-grid-bg" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="reg-grid" width="32" height="32" patternUnits="userSpaceOnUse">
        <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#b0b8c1" strokeWidth="0.7" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#reg-grid)" />
  </svg>
);

type UserRole = 'student' | 'teacher' | 'parent';

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'student', label: 'Alumno' },
  { value: 'teacher', label: 'Profesor' },
  { value: 'parent', label: 'Padre' },
];

export default function Register(): ReactElement {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    lastname: '',
    name: '',
    dni: '',
    email: '',
    password: '',
    role: 'student' as UserRole,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate password
    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setLoading(false);
      return;
    }

    // Validate password has uppercase, lowercase and number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    if (!passwordRegex.test(formData.password)) {
      setError('La contraseña debe tener al menos una mayúscula, una minúscula y un número');
      setLoading(false);
      return;
    }

    try {
      await register(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reg">
      <GridBackground />

      <div className="reg-container">
        {/* ── LOGO ── */}
        <div className="reg-logo">
          <img src={logo} alt="EducAR" />
        </div>

        {/* ── FORM CARD ── */}
        <div className="reg-card">
          <h1 className="reg-card__title">Crear cuenta</h1>
          <p className="reg-card__subtitle">
            Completá los datos para registrarte
          </p>

          {success && (
            <div className="reg-card__success">
              ¡Registro exitoso! Redirigiendo al login...
            </div>
          )}

          {error && (
            <div className="reg-card__error">
              {error}
            </div>
          )}

          <form className="reg-form" onSubmit={handleSubmit}>
            {/* ── ROW 1: Apellido y Nombre ── */}
            <div className="reg-form__row">
              <div className="reg-form__group">
                <label htmlFor="lastname" className="reg-form__label">
                  Apellido
                </label>
                <input
                  type="text"
                  id="lastname"
                  name="lastname"
                  className="reg-form__input"
                  value={formData.lastname}
                  onChange={handleChange}
                  required
                  placeholder="Ej: Rodríguez"
                />
              </div>

              <div className="reg-form__group">
                <label htmlFor="name" className="reg-form__label">
                  Nombre
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="reg-form__input"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Ej: Juan Carlos"
                />
              </div>
            </div>

            {/* ── ROW 2: DNI y Email ── */}
            <div className="reg-form__row">
              <div className="reg-form__group">
                <label htmlFor="dni" className="reg-form__label">
                  DNI
                </label>
                <input
                  type="text"
                  id="dni"
                  name="dni"
                  className="reg-form__input"
                  value={formData.dni}
                  onChange={handleChange}
                  required
                  placeholder="Ej: 12345678"
                />
              </div>

              <div className="reg-form__group">
                <label htmlFor="email" className="reg-form__label">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="reg-form__input"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Ej: juan@email.com"
                />
              </div>
            </div>

            {/* ── ROW 3: Contraseña ── */}
            <div className="reg-form__group">
              <label htmlFor="password" className="reg-form__label">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="reg-form__input"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Mínimo 8 caracteres"
              />
              <p className="reg-form__hint">
                Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número
              </p>
            </div>

            {/* ── ROW 4: Rol ── */}
            <div className="reg-form__group">
              <label htmlFor="role" className="reg-form__label">
                Soy
              </label>
              <div className="reg-form__select-wrapper">
                <select
                  id="role"
                  name="role"
                  className="reg-form__select"
                  value={formData.role}
                  onChange={handleChange}
                >
                  {ROLE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="reg-form__select-arrow">▼</span>
              </div>
            </div>

            {/* ── SUBMIT BUTTON ── */}
            <button
              type="submit"
              className="reg-form__submit"
              disabled={loading || success}
            >
              {loading ? 'Registrando...' : 'Registrarme'}
            </button>
          </form>

          {/* ── LOGIN LINK ── */}
          <p className="reg-card__login">
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" className="reg-card__login-link">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
