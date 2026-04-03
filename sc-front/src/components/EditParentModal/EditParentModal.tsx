import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import Modal from "../Modal/Modal";
import { getUsersByRole, type User } from "../../services/user.service";
import {
  getStudentsByParent,
  updateParentStudents,
  type ParentStudentLink,
} from "../../services/parent.service";
import "./EditParentModal.css";

export interface EditParentModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentId: number;
  parentName: string;
}

export default function EditParentModal({
  isOpen,
  onClose,
  parentId,
  parentName,
}: EditParentModalProps): ReactElement | null {
  const [students, setStudents] = useState<User[]>([]);
  const [linkedStudentIds, setLinkedStudentIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && parentId) {
      loadData(parentId);
    }
  }, [isOpen, parentId]);

  const loadData = async (id: number) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const [studentsData, linksData] = await Promise.all([
        getUsersByRole('student'),
        getStudentsByParent(id),
      ]);
      setStudents(studentsData);
      const ids = linksData.map((link: ParentStudentLink) => link.student_id);
      setLinkedStudentIds(ids);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStudent = (studentId: number) => {
    setLinkedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (linkedStudentIds.length === filteredStudents.length) {
      setLinkedStudentIds([]);
    } else {
      setLinkedStudentIds(filteredStudents.map((s) => s.id));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updateParentStudents(parentId, linkedStudentIds);
      setSuccess("Vínculos actualizados correctamente");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar vínculos");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStudents([]);
    setLinkedStudentIds([]);
    setSearchTerm("");
    setError(null);
    setSuccess(null);
    onClose();
  };

  const filteredStudents = students.filter((student) =>
    student.dni.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const allSelected = filteredStudents.length > 0 && filteredStudents.every((s) => linkedStudentIds.includes(s.id));
  const someSelected = filteredStudents.some((s) => linkedStudentIds.includes(s.id)) && !allSelected;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Editar Padre: ${parentName}`}
      footer={
        <>
          <button className="edit-parent-modal-btn edit-parent-modal-btn--secondary" onClick={handleClose}>
            Cancelar
          </button>
          <button
            className="edit-parent-modal-btn edit-parent-modal-btn--primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </>
      }
    >
      <div className="edit-parent-modal">
        <p className="edit-parent-modal__description">
          Seleccioná los hijos que querés vincular con este padre:
        </p>

        {/* Search bar */}
        {students.length > 0 && (
          <div className="edit-parent-modal__search">
            <svg className="edit-parent-modal__search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              className="edit-parent-modal__search-input"
              placeholder="Buscar por DNI"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        {/* Select All toggle */}
        {students.length > 0 && (
          <div className="edit-parent-modal__select-all">
            <label className="edit-parent-modal__checkbox-label">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected;
                }}
                onChange={handleSelectAll}
              />
              {allSelected ? "Deseleccionar todos" : "Seleccionar todos"}
            </label>
            <span className="edit-parent-modal__count">
              {linkedStudentIds.length} de {students.length} seleccionados
            </span>
          </div>
        )}

        {/* Students list */}
        {loading && !success && !error && (
          <p className="edit-parent-modal__loading">Cargando...</p>
        )}

        {!loading && students.length === 0 && (
          <p className="edit-parent-modal__empty">
            No hay estudiantes registrados
          </p>
        )}

        {!loading && students.length > 0 && (
          <>
            {filteredStudents.length === 0 ? (
              <p className="edit-parent-modal__empty">
                No se encontraron resultados para "{searchTerm}"
              </p>
            ) : (
              <ul className="edit-parent-modal__students">
                {filteredStudents.map((student) => {
                  const isLinked = linkedStudentIds.includes(student.id);
                  return (
                    <li
                      key={student.id}
                      className={`edit-parent-modal__student-item ${
                        isLinked ? "edit-parent-modal__student-item--selected" : ""
                      }`}
                      onClick={() => handleToggleStudent(student.id)}
                    >
                      <div className="edit-parent-modal__checkbox-wrapper">
                        <input
                          type="checkbox"
                          checked={isLinked}
                          onChange={() => handleToggleStudent(student.id)}
                          id={`student-${student.id}`}
                        />
                        <label htmlFor={`student-${student.id}`}>
                          {student.lastname}, {student.name}
                        </label>
                      </div>
                      <span className="edit-parent-modal__student-dni">
                        DNI: {student.dni}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}

        {/* Messages */}
        {error && (
          <div className="edit-parent-modal__message edit-parent-modal__message--error">
            {error}
          </div>
        )}
        {success && (
          <div className="edit-parent-modal__message edit-parent-modal__message--success">
            {success}
          </div>
        )}
      </div>
    </Modal>
  );
}
