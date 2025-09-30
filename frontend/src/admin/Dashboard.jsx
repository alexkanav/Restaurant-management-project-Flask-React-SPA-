import React, { useEffect, useState } from 'react';
import { VIEWS } from '../constants/views';
import { checkAuth, logout } from '../utils/authUtils';
import UpdateProductMenu from './UpdateProductMenu';
import Chart from '../components/Chart';
import Statistics from './Statistics';
import MenuManagement from './MenuManagement';
import AdminNotification from './AdminNotification';

export default function Dashboard({ userName, setUserName, goTo }) {
  const [activeTab, setActiveTab] = useState('statistics');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      await checkAuth(setUserName);
      setLoading(false);
    };
    verify();
  }, [setUserName]);

  useEffect(() => {
    if (!loading && userName === '') {
      goTo(VIEWS.LOGIN);
    }
  }, [userName, loading, goTo]);

  const handleLogout = async () => {
    await logout(setUserName);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'statistics': return <Statistics />;
      case 'management': return <MenuManagement />;
      case 'notification': return <AdminNotification />;
      default: return <Statistics />;
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
          className={`menu-btn ${activeTab === 'statistics' ? 'active' : ''}`}
          onClick={() => setActiveTab('statistics')}
        >
          Статистика
        </button>
        <button
          className={`menu-btn ${activeTab === 'management' ? 'active' : ''}`}
          onClick={() => setActiveTab('management')}
        >
          Керування
        </button>
                <button
          className={`menu-btn ${activeTab === 'notification' ? 'active' : ''}`}
          onClick={() => setActiveTab('notification')}
        >
          Cповіщення
        </button>

      </div>

      {!loading && userName && (
         renderContent()
      )}
    </>
  );
}
