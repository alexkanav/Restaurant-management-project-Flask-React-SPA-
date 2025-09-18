import { Link } from 'react-router-dom';
import Description from './Description';
import logo from '../assets/images/cafegray.png';
import hot from '../assets/images/hot2.svg';
import text from '../assets/images/text.svg';


export default function HomeHeader() {

  return (
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
  );
}
