import { useNavigate } from 'react-router-dom';
import HomeHeader from './HomeHeader';
import ImageCarousel from './ImageCarousel';
import Comments from './Comments';
import Contacts from './Contacts';
import Footer from '../components/Footer';


export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      <HomeHeader />
      <ImageCarousel />
      <Comments />
      <Contacts />

      <div className="menu-link-wrapper">
        <button className="order-button" onClick={() => navigate('/choice-dish/')}>Меню для замовлення</button>
      </div>

      <Footer />
    </>
  );
}

