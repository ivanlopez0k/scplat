import { useState, useEffect, type ReactElement, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../../services/auth.service";
import { getCourses, type Course } from "../../services/course.service";
import GridBackground from "../../components/GridBackground/GridBackground";
import logo from "/Group_17.png";
import "./register.css";

const API_URL = '/api';

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
    courseId: '' as string,
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [childRegistered, setChildRegistered] = useState(false);
  const [childDni, setChildDni] = useState('');
  const [childDniError, setChildDniError] = useState<string | null>(null);
  const [childDniLoading, setChildDniLoading] = useState(false);
  const [childDniVerified, setChildDniVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (formData.role === 'student') {
      setCoursesLoading(true);
      getCourses()
        .then((data) => setCourses(data))
        .catch(() => setCourses([]))
        .finally(() => setCoursesLoading(false));
    } else {
      setCourses([]);
      setFormData((prev) => ({ ...prev, courseId: '' }));
    }
    // Reset child data when role changes
    if (formData.role !== 'parent') {
      setChildRegistered(false);
      setChildDni('');
      setChildDniError(null);
      setChildDniVerified(false);
    }
  }, [formData.role]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const handleVerifyChildDni = async () => {
    if (!childDni.trim()) {
      setChildDniError('Ingresá el DNI de tu hijo');
      return;
    }
    setChildDniLoading(true);
    setChildDniError(null);
    setChildDniVerified(false);
    try {
      const response = await fetch(`${API_URL}/user/student/by-dni/${childDni.trim()}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Estudiante no encontrado');
      }
      await response.json();
      setChildDniVerified(true);
      setChildDniError(null);
    } catch (err) {
      setChildDniVerified(false);
      setChildDniError(err instanceof Error ? err.message : 'Error al buscar estudiante');
    } finally {
      setChildDniLoading(false);
    }
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

    // Validate course selection for students
    if (formData.role === 'student' && !formData.courseId) {
      setError('Debes seleccionar un curso');
      setLoading(false);
      return;
    }

    // Validate child DNI for parents
    if (formData.role === 'parent' && childRegistered) {
      if (!childDni.trim()) {
        setError('Ingresá el DNI de tu hijo');
        setLoading(false);
        return;
      }
      if (!childDniVerified) {
        setError('Verificá el DNI de tu hijo antes de continuar');
        setLoading(false);
        return;
      }
    }

    try {
      const registerData = {
        name: formData.name,
        lastname: formData.lastname,
        dni: formData.dni,
        email: formData.email,
        password: formData.password,
        role: formData.role as 'student' | 'teacher' | 'parent',
        courseId: formData.role === 'student' && formData.courseId ? formData.courseId : undefined,
        childDni: formData.role === 'parent' && childRegistered && childDniVerified ? childDni.trim() : undefined,
      };

      await register(registerData);
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
      <GridBackground className="reg-grid-bg" />

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

            {/* ── ROW 5: Curso (solo Alumno) ── */}
            {formData.role === 'student' && (
              <div className="reg-form__group">
                <label htmlFor="courseId" className="reg-form__label">
                  Curso
                </label>
                <div className="reg-form__select-wrapper">
                  <select
                    id="courseId"
                    name="courseId"
                    className="reg-form__select"
                    value={formData.courseId}
                    onChange={handleChange}
                    disabled={coursesLoading}
                  >
                    <option value="" disabled>
                      {coursesLoading ? 'Cargando cursos...' : 'Seleccionar curso'}
                    </option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.year}° {course.name}
                      </option>
                    ))}
                  </select>
                  <span className="reg-form__select-arrow">▼</span>
                </div>
                {courses.length === 0 && !coursesLoading && (
                  <p className="reg-form__hint">
                    No hay cursos disponibles. Contactá al administrador.
                  </p>
                )}
              </div>
            )}

            {/* ── ROW 6: Hijo registrado (solo Padre) ── */}
            {formData.role === 'parent' && (
              <>
                <div className="reg-form__group">
                  <label className="reg-form__checkbox-row">
                    <input
                      type="checkbox"
                      checked={childRegistered}
                      onChange={(e) => {
                        setChildRegistered(e.target.checked);
                        if (!e.target.checked) {
                          setChildDni('');
                          setChildDniError(null);
                          setChildDniVerified(false);
                        }
                      }}
                    />
                    <span>Mi hijo ya está registrado</span>
                  </label>
                </div>

                {childRegistered && (
                  <div className="reg-form__group">
                    <label htmlFor="childDni" className="reg-form__label">
                      DNI de tu hijo
                    </label>
                    <div className="reg-form__child-dni-row">
                      <input
                        type="text"
                        id="childDni"
                        className={`reg-form__input ${childDniError ? 'reg-form__input--error' : ''}`}
                        value={childDni}
                        onChange={(e) => {
                          setChildDni(e.target.value);
                          setChildDniError(null);
                          setChildDniVerified(false);
                        }}
                        placeholder="Ej: 12345678"
                        disabled={childDniLoading}
                      />
                      <button
                        type="button"
                        className="reg-form__verify-btn"
                        onClick={handleVerifyChildDni}
                        disabled={childDniLoading || !childDni.trim()}
                      >
                        {childDniLoading ? 'Verificando...' : 'Verificar'}
                      </button>
                    </div>
                    {childDniVerified && (
                      <p className="reg-form__hint reg-form__hint--success">
                        ✓ Hijo verificado correctamente
                      </p>
                    )}
                    {childDniError && (
                      <p className="reg-form__hint reg-form__hint--error">
                        {childDniError}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

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
