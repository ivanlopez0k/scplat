import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { logout, checkAuth } from "../../services/auth.service";
import { getUsersByRole, type User } from "../../services/user.service";
import { Sidebar, useSidebarConfig } from "../../components/Sidebar";
import EditTeacherModal from "../../components/EditTeacherModal/EditTeacherModal";
import ManageSubjectsModal from "../../components/ManageSubjectsModal/ManageSubjectsModal";
import EditParentModal from "../../components/EditParentModal/EditParentModal";
import AssignStudentModal from "../../components/AssignStudentModal/AssignStudentModal";
import "./adminDashboard.css";

/* ── Grid background ── */
const GridBackground = (): ReactElement => (
  <svg className="admin-dash-grid-bg" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="admin-dash-grid" width="32" height="32" patternUnits="userSpaceOnUse">
        <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#b0b8c1" strokeWidth="0.7" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#admin-dash-grid)" />
  </svg>
);

type TabType = "teachers" | "students" | "parents";

const TABS: { id: TabType; label: string }[] = [
  { id: "teachers", label: "Profesores" },
  { id: "students", label: "Alumno" },
  { id: "parents", label: "Padres" },
];

const ROLE_MAP: Record<TabType, string> = {
  teachers: "teacher",
  students: "student",
  parents: "parent",
};

export default function AdminDashboard(): ReactElement {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("teachers");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [adminName, setAdminName] = useState("Admin");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isManageSubjectsModalOpen, setIsManageSubjectsModalOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const [selectedParentName, setSelectedParentName] = useState("");
  const [isEditParentModalOpen, setIsEditParentModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [isAssignStudentModalOpen, setIsAssignStudentModalOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const status = await checkAuth();
      if (status.user) {
        setAdminName(status.user.name);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const role = ROLE_MAP[activeTab];
        const data = await getUsersByRole(role);
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [activeTab]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleEditTeacher = (teacherId: number) => {
    setSelectedTeacherId(teacherId);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedTeacherId(null);
  };

  const handleEditParent = (parent: User) => {
    setSelectedParentId(parent.id);
    setSelectedParentName(`${parent.lastname}, ${parent.name}`);
    setIsEditParentModalOpen(true);
  };

  const handleCloseEditParentModal = () => {
    setIsEditParentModalOpen(false);
    setSelectedParentId(null);
    setSelectedParentName("");
  };

  const handleAssignStudent = (student: User) => {
    setSelectedStudentId(student.id);
    setSelectedStudentName(`${student.lastname}, ${student.name}`);
    setIsAssignStudentModalOpen(true);
  };

  const handleCloseAssignStudentModal = () => {
    setIsAssignStudentModalOpen(false);
    setSelectedStudentId(null);
    setSelectedStudentName("");
  };

  const sidebarConfig = useSidebarConfig("admin", {
    onLogout: handleLogout,
    onManageSubjects: () => setIsManageSubjectsModalOpen(true),
  });

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.lastname} ${user.name}`.toLowerCase();
    const dni = user.dni.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || dni.includes(search);
  });

  return (
    <div className="admin-dash">
      <GridBackground />

      {/* ── SIDEBAR ── */}
      <Sidebar config={sidebarConfig} />

      {/* ── MAIN AREA ── */}
      <div className="admin-dash-main">
        {/* Header */}
        <header className="admin-dash-header">
          <div>
            <h1 className="admin-dash-header__greeting">Hola, {adminName}</h1>
          </div>
          <div className="admin-dash-header__actions">
            <button className="admin-dash-header__icon-btn" aria-label="Configuración">⚙</button>
            <button className="admin-dash-header__icon-btn" aria-label="Notificaciones">🔔</button>
            <div className="admin-dash-header__avatar" />
          </div>
        </header>

        {/* ── TABS ── */}
        <div className="admin-dash-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`admin-dash-tab ${activeTab === tab.id ? "admin-dash-tab--active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── SEARCH & EXPORT BAR ── */}
        <div className="admin-dash-toolbar">
          <div className="admin-dash-search">
            <svg className="admin-dash-search__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              className="admin-dash-search__input"
              placeholder="Buscar por apellido, nombre o DNI"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="admin-dash-btn admin-dash-btn--buscar">Buscar</button>
          <button className="admin-dash-btn admin-dash-btn--exportar">Exportar</button>
        </div>

        {/* ── TABLE ── */}
        <div className="admin-dash-table-container">
          <table className="admin-dash-table">
            <thead>
              <tr>
                <th>Id</th>
                <th>Apellido y Nombre</th>
                <th>DNI</th>
                {activeTab === "teachers" && <th>Materia</th>}
                {activeTab === "teachers" && <th>Acciones</th>}
                {activeTab === "parents" && <th>Acciones</th>}
                {activeTab === "students" && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={activeTab === "teachers" ? 5 : (activeTab === "parents" || activeTab === "students") ? 4 : 3} className="admin-dash-table__loading">
                    Cargando...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === "teachers" ? 5 : (activeTab === "parents" || activeTab === "students") ? 4 : 3} className="admin-dash-table__empty">
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <tr key={user.id} className={index % 2 === 0 ? "admin-dash-table__row--even" : "admin-dash-table__row--odd"}>
                    <td>{user.id}</td>
                    <td>{user.lastname} {user.name}</td>
                    <td>{user.dni}</td>
                    {activeTab === "teachers" && (
                      <>
                        <td>-</td>
                        <td>
                          <button
                            className="admin-dash-table__edit-btn"
                            onClick={() => handleEditTeacher(user.id)}
                            aria-label="Editar profesor"
                          >
                            ✏️ Editar
                          </button>
                        </td>
                      </>
                    )}
                    {activeTab === "parents" && (
                      <td>
                        <button
                          className="admin-dash-table__edit-btn"
                          onClick={() => handleEditParent(user)}
                          aria-label="Editar padre"
                        >
                          ✏️ Editar
                        </button>
                      </td>
                    )}
                    {activeTab === "students" && (
                      <td>
                        <button
                          className="admin-dash-table__edit-btn"
                          onClick={() => handleAssignStudent(user)}
                          aria-label="Asignar curso"
                        >
                          ✏️ Asignar
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION (placeholder) ── */}
        <div className="admin-dash-pagination">
          <span className="admin-dash-pagination__item admin-dash-pagination__item--disabled">‹</span>
          <span className="admin-dash-pagination__item admin-dash-pagination__item--active">1</span>
          <span className="admin-dash-pagination__item">2</span>
          <span className="admin-dash-pagination__item">3</span>
          <span className="admin-dash-pagination__item">4</span>
          <span className="admin-dash-pagination__item">5</span>
          <span className="admin-dash-pagination__item">...</span>
          <span className="admin-dash-pagination__item">›</span>
        </div>
      </div>

      {/* ── EDIT TEACHER MODAL ── */}
      {selectedTeacherId && (
        <EditTeacherModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          teacherId={selectedTeacherId}
        />
      )}

      {/* ── EDIT PARENT MODAL ── */}
      {selectedParentId && (
        <EditParentModal
          isOpen={isEditParentModalOpen}
          onClose={handleCloseEditParentModal}
          parentId={selectedParentId}
          parentName={selectedParentName}
        />
      )}

      {/* ── ASSIGN STUDENT MODAL ── */}
      {selectedStudentId && (
        <AssignStudentModal
          isOpen={isAssignStudentModalOpen}
          onClose={handleCloseAssignStudentModal}
          studentId={selectedStudentId}
          studentName={selectedStudentName}
        />
      )}

      {/* ── MANAGE SUBJECTS MODAL ── */}
      <ManageSubjectsModal
        isOpen={isManageSubjectsModalOpen}
        onClose={() => setIsManageSubjectsModalOpen(false)}
      />
    </div>
  );
}
