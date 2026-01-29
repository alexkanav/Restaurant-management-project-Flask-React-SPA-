import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { checkAuth } from '../utils/authUtils';
import { Spinner } from '../components';

export default function ProtectedRoute({ children, role }) {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      const id = await checkAuth(role);
      setUserId(id);
      setLoading(false);
    };
    verify();
  }, [role]);

  if (loading) return <Spinner />;

  if (!userId) {
    return <Navigate to="/admin-panel" replace />;
  }

  return children;
}
