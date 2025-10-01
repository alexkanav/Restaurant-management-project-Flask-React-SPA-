import { Link, useNavigate } from 'react-router-dom';
import Description from './Description';
import ImageCarousel from './ImageCarousel';
import Comments from './Comments';
import Contacts from './Contacts';
import Footer from '../components/Footer';
import logo from '../assets/images/cafegray.png';
import hot from '../assets/images/hot2.svg';
import text from '../assets/images/text.svg';


export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      <div className="fixed-bg">
        <div className="home-content">
          <div className="top_menu">
            <div className="homepage-header">
              <Link to="/" aria-label="Головна сторінка">
                <img id="logo" src={logo} alt="Cafe Logo" />
              </Link>
              <nav className="top-nav-menu">
                <Link className="header-butt" to="/menu">
                  <img className="logo-menu" src={hot} alt="Меню" />
                  <span className="top-menu-label">Меню</span>
                </Link>
                <a className="header-butt" href="#comments">
                  <img className="logo-menu" src={text} alt="Відгуки" />
                  <span className="top-menu-label">Відгуки</span>
                </a>
              </nav>
            </div>

            <Description />

          </div>
          <div className="main-block-name"><span className="main-title">Наші страви:</span></div>
          <div className="view-block">
            <div className="main-block-wrap">
              <ImageCarousel />
            </div>
          </div>
          <div className="main-block-name"><span className="main-title">Відгуки наших клієнтів:</span></div>
        </div>

        <Comments />

        <div className="main-block-name"><span className="main-title">Наші контакти:</span></div>

        <Contacts />

        <div className="button-wrapper">
          <button className="order-button" onClick={() => navigate('/menu')}>Меню для замовлення</button>
        </div>

        <Footer />
      </div>
    </>
  );
}

