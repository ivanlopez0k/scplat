import { useState } from "react";
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

export default function AddChildModal({
  isOpen,
  onClose,
  parentId,
  onChildAdded,
}: AddChildModalProps): ReactElement | null {
  const [childDni, setChildDni] = useState('');
  const [searchedStudent, setSearchedStudent] = useState<{ id: number; name: string; lastname: string; dni: string } | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

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

  const handleClose = () => {
    setChildDni('');
    setSearchedStudent(null);
    setSearchError(null);
    setSuccess(null);
    setSearchLoading(false);
    setLinkLoading(false);
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
          {searchedStudent && (
            <button
              className="add-child-modal-btn add-child-modal-btn--primary"
              onClick={handleLink}
              disabled={linkLoading}
            >
              {linkLoading ? 'Vinculando...' : 'Vincular'}
            </button>
          )}
        </>
      }
    >
      <div className="add-child-modal">
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
      </div>
    </Modal>
  );
}
