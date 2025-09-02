import React, { useEffect, useState } from 'react';
import { VIEWS } from '../constants/views';
import { checkAuth, logout } from '../utils/authUtils';


export default function Dashboard({ userName, setUserName, goTo }) {
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

  return (
    <>
      <div className="notice">
        <button className="cancel-butt" onClick={handleLogout}>Вийти</button>
      </div>

      Користувач: {userName}

      <div>
        {!loading && userName && (
          <div className="content"> Dashboard... </div>
        )}
      </div>
    </>
  );
}
