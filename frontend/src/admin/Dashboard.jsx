import React, { useEffect, useState } from 'react';
import { VIEWS } from '../constants/views';
import { checkAuth, logout } from '../utils/authUtils';
import { sendToServer } from '../utils/api';
import Statistics from './Statistics';
import MenuManagement from './MenuManagement';
import AdminNotification from './AdminNotification';


export default function Dashboard({ userName, setUserName, goTo }) {
  const [activeTab, setActiveTab] = useState('management');
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Check authentication
  useEffect(() => {
    const verify = async () => {
      await checkAuth(setUserName);
      setLoading(false);
    };
    verify();
  }, [setUserName]);

  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const { data } = await sendToServer('/admin/api/notification/count', null, 'GET');
        setNotificationCount(data.unread_notif_number || 0);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotificationCount();
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && userName === '') {
      goTo(VIEWS.LOGIN);
    }
  }, [userName, loading, goTo]);

  const handleLogout = async () => {
    await logout(setUserName);
  };

  const handleOpenTab = (tab) => {
    setActiveTab(tab);
    if (tab === 'notification') {
      setNotificationCount(0);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'statistics':
        return <Statistics />;
      case 'management':
        return <MenuManagement />;
      case 'notification':
        return <AdminNotification />;
      default:
        return <MenuManagement />;
    }
  };

  return (
    <>
      <div className='order-note'>
        <span>Користувач: {userName ? userName : "Не авторизований"}</span>
        <span>
          <button className="cancel-butt" onClick={handleLogout}>Вийти</button>
        </span>
      </div>

      <div className="admin-menu">
        <button
          className={`menu-btn ${activeTab === 'management' ? 'active' : ''}`}
          onClick={() => handleOpenTab('management')}
        >
          Керування
        </button>

        <button
          className={`menu-btn ${activeTab === 'statistics' ? 'active' : ''}`}
          onClick={() => handleOpenTab('statistics')}
        >
          Статистика
        </button>

        <button
          className={`menu-btn ${activeTab === 'notification' ? 'active' : ''}`}
          onClick={() => handleOpenTab('notification')}
        >
          Сповіщення
          {notificationCount > 0 && (
            <span className="notification-badge">{notificationCount}</span>
          )}
        </button>
      </div>

      {!loading && userName && renderContent()}
    </>
  );
}
