import { useNavigate } from "react-router-dom";
import { Header, Footer } from '../components';
import Dashboard from './Dashboard';
import Auth from './Auth';
import note from '../assets/images/note.svg';
import { useAuth } from '../context/AuthContext';


export default function AdminPanel() {
  const { user, setUser, logoutUser } = useAuth();
  const navigate = useNavigate();

  const navLinks =  [{ to: '/admin/orders', src: note, alt: 'Замовлення', name: 'Замовлення' }]

  const handleLogout = async () => {
    await logoutUser();
    navigate("/auth/login", { replace: true });
  };


  return (
    <>
      <Header navLinks={navLinks} />
      <div className='order-note'>
        <span>Користувач: {user ? user : "Не авторизований"}</span>
        <span>
          <button className="cancel-butt" onClick={handleLogout}>Вийти</button>
        </span>
      </div>

      <div className="content">
        <Dashboard />
     </div>
      <Footer />
    </>
  );
}
