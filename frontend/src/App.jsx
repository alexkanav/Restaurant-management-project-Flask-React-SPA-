import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { OrderProvider } from './context/OrderContext';
import Home from './user/Home';
import DishSelectionPage from './user/DishSelectionPage';
import FeedbackPage from './user/FeedbackPage';
import AdminPanel from './admin/AdminPanel';
import OrderPanel from './admin/OrderPanel';


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu"
          element={
            <OrderProvider>
              <DishSelectionPage />
            </OrderProvider>
          }
        />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/order-panel" element={<OrderPanel />} />
      </Routes>
      <ToastContainer position="top-center" autoClose={3000} />
    </Router>
  );
}

