import { Link } from 'react-router-dom';
import Description from './Description';
import logo from '../assets/images/logo.png';
import hot from '../assets/images/hot.svg';
import text from '../assets/images/text.svg';


export default function HomeHeader() {

  return (
    <div className="top_menu">
      <div className="homepage-header">
        <Link to="/" aria-label="Головна сторінка">
          <img id="logo" src={logo} alt="Cafe Logo" />
        </Link>

        <nav className="top-nav-menu">
          <ul>
            <li>
              <Link className="menu-link" to="/menu">
                <img className="logo-menu" src={hot} alt="Меню" />
                Меню
              </Link>
            </li>
            <li>
              <a className="menu-link" href="#comments">
                <img className="logo-menu" src={text} alt="Відгуки" />
                Відгуки
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <Description />
    </div>
  );
}
