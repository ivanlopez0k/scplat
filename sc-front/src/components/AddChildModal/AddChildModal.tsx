import { useState, useEffect } from "react";
import type { ReactElement } from "react";
import Modal from "../Modal/Modal";
import { createParentStudentLink } from "../../services/parent.service";

const API_URL = '/api';

export interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentId: number;
  onChildAdded: (child: { id: number; name: string; lastname: string }) => void;
}

interface Course {
  id: number;
  name: string;
  year: number;
}

export default function AddChildModal({
  isOpen,
  onClose,
  parentId,
  onChildAdded,
}: AddChildModalProps): ReactElement | null {
  const [mode, setMode] = useState<'link' | 'register'>('link');
  
  // Link mode state
  const [childDni, setChildDni] = useState('');
  const [searchedStudent, setSearchedStudent] = useState<{ id: number; name: string; lastname: string; dni: string } | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  
  // Register mode state
  const [courses, setCourses] = useState<Course[]>([]);
  const [childName, setChildName] = useState('');
  const [childLastname, setChildLastname] = useState('');
  const [childDniReg, setChildDniReg] = useState('');
  const [childEmail, setChildEmail] = useState('');
  const [childPassword, setChildPassword] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<number | ''>('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);
  
  // General state
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch courses when switching to register mode
  useEffect(() => {
    if (mode === 'register' && isOpen) {
      fetch(`${API_URL}/courses/public`, {
        credentials: 'include',
      })
        .then(res => res.json())
        .then(data => setCourses(data))
        .catch(err => console.error('Error fetching courses:', err));
    }
  }, [mode, isOpen]);

  const handleSearch = async () => {
    if (!childDni.trim()) {
      setSearchError('Ingresá el DNI de tu hijo');
      return;
    }
    setSearchLoading(true);
    setSearchError(null);
    setSearchedStudent(null);
    setSuccess(null);
    try {
      const response = await fetch(`${API_URL}/user/student/by-dni/${childDni.trim()}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Estudiante no encontrado');
      }
      const student = await response.json();
      setSearchedStudent({
        id: student.id,
        name: student.name,
        lastname: student.lastname,
        dni: student.dni,
      });
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Error al buscar estudiante');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleLink = async () => {
    if (!searchedStudent) return;
    setLinkLoading(true);
    setSearchError(null);
    try {
      await createParentStudentLink(parentId, searchedStudent.id);
      setSuccess('Hijo vinculado correctamente');
      onChildAdded({
        id: searchedStudent.id,
        name: searchedStudent.name,
        lastname: searchedStudent.lastname,
      });
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Error al vincular');
    } finally {
      setLinkLoading(false);
    }
  };

  const handleRegister = async () => {
    // Validation
    if (!childName.trim() || !childLastname.trim() || !childDniReg.trim() || !childEmail.trim() || !childPassword.trim()) {
      setRegisterError('Todos los campos son obligatorios');
      return;
    }
    if (!selectedCourse) {
      setRegisterError('Seleccioná un curso para tu hijo');
      return;
    }
    if (childPassword.length < 6) {
      setRegisterError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setRegisterLoading(true);
    setRegisterError(null);
    setRegisterSuccess(null);

    try {
      const response = await fetch(`${API_URL}/user/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: childName,
          lastname: childLastname,
          dni: childDniReg,
          email: childEmail,
          password: childPassword,
          role: 'student',
          courseId: selectedCourse,
          parentId: parentId, // This will trigger auto-link in backend
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al registrar');
      }

      const student = await response.json();
      setRegisterSuccess('Hijo registrado y vinculado correctamente');
      
      onChildAdded({
        id: student.id,
        name: student.name,
        lastname: student.lastname,
      });
    } catch (err) {
      setRegisterError(err instanceof Error ? err.message : 'Error al registrar');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleClose = () => {
    setChildDni('');
    setSearchedStudent(null);
    setSearchError(null);
    setSuccess(null);
    setSearchLoading(false);
    setLinkLoading(false);
    setMode('link');
    setChildName('');
    setChildLastname('');
    setChildDniReg('');
    setChildEmail('');
    setChildPassword('');
    setSelectedCourse('');
    setRegisterLoading(false);
    setRegisterError(null);
    setRegisterSuccess(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Agregar hijo"
      footer={
        <>
          <button className="add-child-modal-btn add-child-modal-btn--secondary" onClick={handleClose}>
            Cancelar
          </button>
          {mode === 'link' && searchedStudent && (
            <button
              className="add-child-modal-btn add-child-modal-btn--primary"
              onClick={handleLink}
              disabled={linkLoading}
            >
              {linkLoading ? 'Vinculando...' : 'Vincular'}
            </button>
          )}
          {mode === 'register' && (
            <button
              className="add-child-modal-btn add-child-modal-btn--primary"
              onClick={handleRegister}
              disabled={registerLoading}
            >
              {registerLoading ? 'Registrando...' : 'Registrar'}
            </button>
          )}
        </>
      }
    >
      <div className="add-child-modal">
        {/* Mode selector */}
        <div className="add-child-modal__mode-selector">
          <button
            className={`add-child-modal__mode-btn ${mode === 'link' ? 'add-child-modal__mode-btn--active' : ''}`}
            onClick={() => setMode('link')}
            disabled={linkLoading || registerLoading}
          >
            🔍 Vincular hijo existente
          </button>
          <button
            className={`add-child-modal__mode-btn ${mode === 'register' ? 'add-child-modal__mode-btn--active' : ''}`}
            onClick={() => setMode('register')}
            disabled={linkLoading || registerLoading}
          >
            📝 Registrar nuevo hijo
          </button>
        </div>

        {mode === 'link' ? (
          <>
            <p className="add-child-modal__description">
              Ingresá el DNI de tu hijo para vincularlo a tu cuenta:
            </p>

            <div className="add-child-modal__search">
              <input
                type="text"
                className="add-child-modal__input"
                value={childDni}
                onChange={(e) => {
                  setChildDni(e.target.value);
                  setSearchError(null);
                  setSearchedStudent(null);
                  setSuccess(null);
                }}
                placeholder="Ej: 12345678"
                disabled={searchLoading || linkLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !searchLoading && !searchedStudent) {
                    handleSearch();
                  }
                }}
              />
              <button
                type="button"
                className="add-child-modal__search-btn"
                onClick={handleSearch}
                disabled={searchLoading || linkLoading || !childDni.trim()}
              >
                {searchLoading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>

            {/* Student found */}
            {searchedStudent && (
              <div className="add-child-modal__found">
                <span className="add-child-modal__found-icon">✓</span>
                <div className="add-child-modal__found-info">
                  <span className="add-child-modal__found-name">
                    {searchedStudent.lastname}, {searchedStudent.name}
                  </span>
                  <span className="add-child-modal__found-dni">
                    DNI: {searchedStudent.dni}
                  </span>
                </div>
              </div>
            )}

            {/* Messages */}
            {searchError && (
              <div className="add-child-modal__message add-child-modal__message--error">
                {searchError}
              </div>
            )}
            {success && (
              <div className="add-child-modal__message add-child-modal__message--success">
                {success}
              </div>
            )}
          </>
        ) : (
          <>
            <p className="add-child-modal__description">
              Completá el formulario para registrar a tu hijo:
            </p>

            <div className="add-child-modal__form">
              <div className="add-child-modal__form-group">
                <label htmlFor="child-name" className="add-child-modal__label">
                  Nombre *
                </label>
                <input
                  id="child-name"
                  type="text"
                  className="add-child-modal__input"
                  value={childName}
                  onChange={(e) => {
                    setChildName(e.target.value);
                    setRegisterError(null);
                  }}
                  placeholder="Nombre del hijo"
                  disabled={registerLoading}
                />
              </div>

              <div className="add-child-modal__form-group">
                <label htmlFor="child-lastname" className="add-child-modal__label">
                  Apellido *
                </label>
                <input
                  id="child-lastname"
                  type="text"
                  className="add-child-modal__input"
                  value={childLastname}
                  onChange={(e) => {
                    setChildLastname(e.target.value);
                    setRegisterError(null);
                  }}
                  placeholder="Apellido del hijo"
                  disabled={registerLoading}
                />
              </div>

              <div className="add-child-modal__form-group">
                <label htmlFor="child-dni" className="add-child-modal__label">
                  DNI *
                </label>
                <input
                  id="child-dni"
                  type="text"
                  className="add-child-modal__input"
                  value={childDniReg}
                  onChange={(e) => {
                    setChildDniReg(e.target.value);
                    setRegisterError(null);
                  }}
                  placeholder="Ej: 12345678"
                  disabled={registerLoading}
                />
              </div>

              <div className="add-child-modal__form-group">
                <label htmlFor="child-email" className="add-child-modal__label">
                  Email *
                </label>
                <input
                  id="child-email"
                  type="email"
                  className="add-child-modal__input"
                  value={childEmail}
                  onChange={(e) => {
                    setChildEmail(e.target.value);
                    setRegisterError(null);
                  }}
                  placeholder="email@ejemplo.com"
                  disabled={registerLoading}
                />
              </div>

              <div className="add-child-modal__form-group">
                <label htmlFor="child-password" className="add-child-modal__label">
                  Contraseña *
                </label>
                <input
                  id="child-password"
                  type="password"
                  className="add-child-modal__input"
                  value={childPassword}
                  onChange={(e) => {
                    setChildPassword(e.target.value);
                    setRegisterError(null);
                  }}
                  placeholder="Mínimo 6 caracteres"
                  disabled={registerLoading}
                />
              </div>

              <div className="add-child-modal__form-group">
                <label htmlFor="child-course" className="add-child-modal__label">
                  Curso *
                </label>
                <select
                  id="child-course"
                  className="add-child-modal__input add-child-modal__select"
                  value={selectedCourse}
                  onChange={(e) => {
                    setSelectedCourse(Number(e.target.value));
                    setRegisterError(null);
                  }}
                  disabled={registerLoading}
                >
                  <option value="">Seleccioná un curso</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.year}° {course.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Messages */}
            {registerError && (
              <div className="add-child-modal__message add-child-modal__message--error">
                {registerError}
              </div>
            )}
            {registerSuccess && (
              <div className="add-child-modal__message add-child-modal__message--success">
                {registerSuccess}
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
