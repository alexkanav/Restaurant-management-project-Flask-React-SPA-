import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { OrderProvider } from './context/OrderContext';
import Home from './user/Home';
import DishSelectionPage from './user/DishSelectionPage';
import FeedbackPage from './user/FeedbackPage';


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/choice-dish"
          element={
            <OrderProvider>
              <DishSelectionPage />
            </OrderProvider>
          }
        />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="*" element={<h1>Page Not Found</h1>} />
      </Routes>
    </Router>
  );
}

