import { useEffect, useState, useRef, type ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { logout, checkAuth } from "../../services/auth.service";
import { Sidebar, useSidebarConfig } from "../../components/Sidebar";
import {
  getTeacherContacts,
  getConversation,
  sendMessage,
  markAsRead,
  type TeacherContact,
  type Message,
} from "../../services/message.service";
import "./TeacherMessages.css";

const GridBackground = (): ReactElement => (
  <svg className="teacher-msg-grid-bg" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="teacher-msg-grid" width="32" height="32" patternUnits="userSpaceOnUse">
        <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#b0b8c1" strokeWidth="0.7" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#teacher-msg-grid)" />
  </svg>
);

export default function TeacherMessages(): ReactElement {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<number | null>(null);
  const [contacts, setContacts] = useState<TeacherContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<TeacherContact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const status = await checkAuth();
      if (status.user) {
        setUserId(status.user.id ?? null);

        if (status.user.id && status.user.role === "teacher") {
          try {
            const teacherContacts = await getTeacherContacts(status.user.id);
            setContacts(teacherContacts);
          } catch (err) {
            console.error("Error fetching contacts:", err);
          }
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const sidebarConfig = useSidebarConfig("teacher", {
    onLogout: handleLogout,
  });

  const handleSelectContact = async (contact: TeacherContact) => {
    setSelectedContact(contact);
    setChatLoading(true);
    setNewMessage("");
    try {
      if (userId) {
        const conversation = await getConversation(userId, contact.id);
        setMessages(conversation);

        // Mark messages as read
        for (const msg of conversation) {
          if (msg.receiver === userId && !msg.is_read) {
            await markAsRead(msg.id, userId);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching conversation:", err);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId || !selectedContact) return;

    setSending(true);
    try {
      const msg = await sendMessage(userId, selectedContact.id, newMessage.trim());
      setMessages((prev) => [...prev, msg]);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return "Hoy";
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return "Ayer";
    return date.toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
  };

  return (
    <div className="teacher-msg-page">
      <GridBackground />
      <Sidebar config={sidebarConfig} />

      <div className="teacher-msg-main">
        <div className="teacher-msg-container">
          {/* Contacts sidebar */}
          <aside className="teacher-msg-contacts">
            <h2 className="teacher-msg-contacts__title">Contactos</h2>
            {loading ? (
              <div className="teacher-msg-contacts__loading">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="teacher-msg-contact__skeleton" />
                ))}
              </div>
            ) : contacts.length === 0 ? (
              <p className="teacher-msg-contacts__empty">
                No hay padres de alumnos en tus cursos.
              </p>
            ) : (
              <div className="teacher-msg-contacts__list">
                {contacts.map((contact) => {
                  const studentNames = contact.students
                    .map((s) => `${s.lastname}, ${s.name}`)
                    .join(", ");
                  return (
                    <button
                      key={contact.id}
                      className={`teacher-msg-contact ${selectedContact?.id === contact.id ? "teacher-msg-contact--active" : ""}`}
                      onClick={() => handleSelectContact(contact)}
                    >
                      <div className="teacher-msg-contact__avatar">
                        {contact.name[0]}{contact.lastname[0]}
                      </div>
                      <div className="teacher-msg-contact__info">
                        <span className="teacher-msg-contact__name">
                          {contact.lastname}, {contact.name}
                        </span>
                        <span className="teacher-msg-contact__students">
                          {studentNames}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </aside>

          {/* Chat area */}
          <div className="teacher-msg-chat">
            {selectedContact ? (
              <>
                <header className="teacher-msg-chat__header">
                  <div className="teacher-msg-chat__header-info">
                    <div className="teacher-msg-chat__header-avatar">
                      {selectedContact.name[0]}{selectedContact.lastname[0]}
                    </div>
                    <div>
                      <h3 className="teacher-msg-chat__header-name">
                        {selectedContact.lastname}, {selectedContact.name}
                      </h3>
                      <p className="teacher-msg-chat__header-students">
                        Padre de: {selectedContact.students.map((s) => s.lastname).join(", ")}
                      </p>
                    </div>
                  </div>
                </header>

                <div className="teacher-msg-chat__messages">
                  {chatLoading ? (
                    <div className="teacher-msg-chat__loading">
                      <div className="teacher-msg-chat__skeleton" />
                      <div className="teacher-msg-chat__skeleton" />
                    </div>
                  ) : messages.length === 0 ? (
                    <p className="teacher-msg-chat__empty">
                      Enviale un mensaje al padre/madre para iniciar la conversación.
                    </p>
                  ) : (
                    <div className="teacher-msg-chat__messages-list">
                      {messages.map((msg, i) => {
                        const isSent = msg.sender === userId;
                        const showDate =
                          i === 0 ||
                          formatDate(msg.created_at) !== formatDate(messages[i - 1].created_at);
                        return (
                          <div key={msg.id}>
                            {showDate && (
                              <div className="teacher-msg-chat__date-divider">
                                <span>{formatDate(msg.created_at)}</span>
                              </div>
                            )}
                            <div className={`teacher-msg-chat__bubble ${isSent ? "teacher-msg-chat__bubble--sent" : "teacher-msg-chat__bubble--received"}`}>
                              <p className="teacher-msg-chat__bubble-text">{msg.content}</p>
                              <span className="teacher-msg-chat__bubble-time">{formatTime(msg.created_at)}</span>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                <form className="teacher-msg-chat__input" onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    className="teacher-msg-chat__input-field"
                    placeholder="Escribí un mensaje..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    className="teacher-msg-chat__input-btn"
                    disabled={sending || !newMessage.trim()}
                  >
                    {sending ? "..." : "Enviar"}
                  </button>
                </form>
              </>
            ) : (
              <div className="teacher-msg-chat__placeholder">
                <p className="teacher-msg-chat__placeholder-icon">💬</p>
                <h3>Mensajes</h3>
                <p>Seleccioná un contacto para ver la conversación.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
