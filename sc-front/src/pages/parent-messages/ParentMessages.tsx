import { useEffect, useState, useRef, type ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { logout, checkAuth } from "../../services/auth.service";
import { Sidebar, useSidebarConfig } from "../../components/Sidebar";
import {
  getParentContacts,
  getConversation,
  sendMessage,
  markAsRead,
  type ParentContact,
  type Message,
} from "../../services/message.service";
import "./ParentMessages.css";

const GridBackground = (): ReactElement => (
  <svg className="parent-msg-grid-bg" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="parent-msg-grid" width="32" height="32" patternUnits="userSpaceOnUse">
        <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#b0b8c1" strokeWidth="0.7" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#parent-msg-grid)" />
  </svg>
);

export default function ParentMessages(): ReactElement {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<number | null>(null);
  const [contacts, setContacts] = useState<ParentContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<ParentContact | null>(null);
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

        if (status.user.id && status.user.role === "parent") {
          try {
            const parentContacts = await getParentContacts(status.user.id);
            setContacts(parentContacts);
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

  const sidebarConfig = useSidebarConfig("parent", {
    onLogout: handleLogout,
  });

  const handleSelectContact = async (contact: ParentContact) => {
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
    <div className="parent-msg-page">
      <GridBackground />
      <Sidebar config={sidebarConfig} />

      <div className="parent-msg-main">
        <div className="parent-msg-container">
          {/* Contacts sidebar */}
          <aside className="parent-msg-contacts">
            <h2 className="parent-msg-contacts__title">Profesores</h2>
            {loading ? (
              <div className="parent-msg-contacts__loading">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="parent-msg-contact__skeleton" />
                ))}
              </div>
            ) : contacts.length === 0 ? (
              <p className="parent-msg-contacts__empty">
                No hay profesores de tus hijos.
              </p>
            ) : (
              <div className="parent-msg-contacts__list">
                {contacts.map((contact) => (
                  <button
                    key={contact.id}
                    className={`parent-msg-contact ${selectedContact?.id === contact.id ? "parent-msg-contact--active" : ""}`}
                    onClick={() => handleSelectContact(contact)}
                  >
                    <div className="parent-msg-contact__avatar">
                      {contact.name[0]}{contact.lastname[0]}
                    </div>
                    <div className="parent-msg-contact__info">
                      <span className="parent-msg-contact__name">
                        {contact.lastname}, {contact.name}
                      </span>
                      <span className="parent-msg-contact__subjects">
                        {contact.subjects.join(", ")}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </aside>

          {/* Chat area */}
          <div className="parent-msg-chat">
            {selectedContact ? (
              <>
                <header className="parent-msg-chat__header">
                  <div className="parent-msg-chat__header-info">
                    <div className="parent-msg-chat__header-avatar">
                      {selectedContact.name[0]}{selectedContact.lastname[0]}
                    </div>
                    <div>
                      <h3 className="parent-msg-chat__header-name">
                        {selectedContact.lastname}, {selectedContact.name}
                      </h3>
                      <p className="parent-msg-chat__header-subjects">
                        {selectedContact.subjects.join(", ")}
                      </p>
                    </div>
                  </div>
                </header>

                <div className="parent-msg-chat__messages">
                  {chatLoading ? (
                    <div className="parent-msg-chat__loading">
                      <div className="parent-msg-chat__skeleton" />
                      <div className="parent-msg-chat__skeleton" />
                    </div>
                  ) : messages.length === 0 ? (
                    <p className="parent-msg-chat__empty">
                      Enviale un mensaje al profesor para iniciar la conversación.
                    </p>
                  ) : (
                    <div className="parent-msg-chat__messages-list">
                      {messages.map((msg, i) => {
                        const isSent = msg.sender === userId;
                        const showDate =
                          i === 0 ||
                          formatDate(msg.created_at) !== formatDate(messages[i - 1].created_at);
                        return (
                          <div key={msg.id}>
                            {showDate && (
                              <div className="parent-msg-chat__date-divider">
                                <span>{formatDate(msg.created_at)}</span>
                              </div>
                            )}
                            <div className={`parent-msg-chat__bubble ${isSent ? "parent-msg-chat__bubble--sent" : "parent-msg-chat__bubble--received"}`}>
                              <p className="parent-msg-chat__bubble-text">{msg.content}</p>
                              <span className="parent-msg-chat__bubble-time">{formatTime(msg.created_at)}</span>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                <form className="parent-msg-chat__input" onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    className="parent-msg-chat__input-field"
                    placeholder="Escribí un mensaje..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    className="parent-msg-chat__input-btn"
                    disabled={sending || !newMessage.trim()}
                  >
                    {sending ? "..." : "Enviar"}
                  </button>
                </form>
              </>
            ) : (
              <div className="parent-msg-chat__placeholder">
                <p className="parent-msg-chat__placeholder-icon">💬</p>
                <h3>Mensajes</h3>
                <p>Seleccioná un profesor para ver la conversación.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
