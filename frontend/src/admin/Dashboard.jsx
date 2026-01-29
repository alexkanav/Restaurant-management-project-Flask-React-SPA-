import React, { useEffect, useState } from 'react';
import { VIEWS } from '../constants/views';
import { sendToServer } from '../utils/api';
import Statistics from './Statistics';
import MenuManagement from './MenuManagement';
import AdminNotification from './AdminNotification';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState(VIEWS.STATISTICS);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const { data } = await sendToServer(
          '/api/admin/notifications/unread/count',
          null,
          'GET'
        );
        setUnreadNotificationsCount(data.unread_notif_count || 0);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotificationCount();
  }, []);

  const TABS = {
    [VIEWS.STATISTICS]: { name: 'Статистика', component: <Statistics /> },
    [VIEWS.MANAGEMENT]: { name: 'Керування', component: <MenuManagement /> },
    [VIEWS.NOTIFICATION]: {
      name: 'Сповіщення',
      component: (
        <AdminNotification
          unreadNotificationsCount={unreadNotificationsCount}
          setUnreadNotificationsCount={setUnreadNotificationsCount}
        />
      ),
    },
  };

  return (
    <>
      <div className="admin-menu">
        {Object.entries(TABS).map(([key, value]) => (
          <button
            key={key}
            className={`menu-btn ${activeTab === key ? 'active' : ''}`}
            onClick={() => setActiveTab(key)}
          >
            {value.name}

            {key === VIEWS.NOTIFICATION && unreadNotificationsCount > 0 && (
              <span className="notification-badge">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {TABS[activeTab].component}
      </div>
    </>
  );
}
