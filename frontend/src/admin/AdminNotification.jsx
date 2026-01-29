import React, { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { sendToServer } from '../utils/api';
import { Spinner } from '../components';


export default function AdminNotification({ unreadNotificationsCount, setUnreadNotificationsCount }) {
  const [notifications, setNotifications] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleOpen = (id) => {
    setExpandedId(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const markNotif = async (id) => {
    try {
      const { data } = await sendToServer(`/api/admin/notifications/${id}`, null, 'PATCH');
      toast.success(data.message || "Сповіщення помічене як прочитане.");
      setUnreadNotificationsCount(prev => Math.max(0, prev - 1));

    } catch (error) {
      toast.error(error.message || "Не вдалося оновити сповіщення.");
    }
  };

  const handleClose = async (id) => {
    await markNotif(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    setExpandedId(null);
  };

  useEffect(() => {
    const fetchNotif = async () => {
      try {
        const { data } = await sendToServer('/api/admin/notifications', { only_unread: true }, 'GET');
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        toast.error("Помилка завантаження сповіщень.");
      } finally {
        setLoading(false);
      }
    };
    fetchNotif();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className='admin-notification'>
      <div className='notif-container'>
        <h2> Сповіщення адміністратора</h2>
        {notifications.length === 0 ? (
          <p>Немає нових сповіщень.</p>
        ) : (
          <ul className='notif-list'>
            {notifications.map((n) => {
              const isExpanded = expandedId === n.id;
              return (
                <li
                  key={n.id}
                  onClick={() => handleOpen(n.id)}
                  className={`notif-item
                  ${n.is_read ? "read" : "unread"}
                  ${isExpanded ? "expanded" : ""}
                  ${n.type}`}
                >
                  <div className='notif-header'>
                    <strong>{n.title}</strong>
                    <small className='notif-date'>
                      #{n.id}/ {n.created_at}
                    </small>
                  </div>
                  {n.created_staff_id && (
                    <div className='notif-id'>
                      <em>Створено: #{n.created_staff_id}</em>
                    </div>
                  )}
                  <p className='notif-message'>
                    {isExpanded ? n.message : n.message.slice(0, 100) + "..."}
                  </p>

                  {isExpanded && (
                    <button className='notif-butt'
                      onClick={(e) => {
                        e.stopPropagation(); // prevent triggering handleOpen again
                        handleClose(n.id);
                      }}
                    >
                      Позначити як прочитане
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
