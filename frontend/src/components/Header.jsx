import { Link } from 'react-router-dom';
import logo from '../assets/images/logo.png';
import home from '../assets/images/home.svg';
import heart from '../assets/images/heart.svg';
import star from '../assets/images/star.svg';
import { popular, recommended } from '../../config.json';


export default function Header() {
  return (
    <header className="header">
      <Link to="/">
        <img id="logo" src={logo} alt="Cafe Logo" />
      </Link>

      <div className="nav-icon">
        <Link to="/">
          <img className="nav-icon__image" src={home} alt="Головна сторінка" />
        </Link>
      </div>

      <nav className="top-nav-menu">
        <a className="nav-link" href={popular}>
          <img
            loading="lazy"
            className="nav-icon__image"
            src={heart}
            alt="Популярні страви"
          />
          Популярне
        </a>
        <a className="nav-link" href={recommended}>
          <img
            loading="lazy"
            className="nav-icon__image"
            src={star}
            alt="Рекомендовані страви"
          />
          Рекомендуємо
        </a>
      </nav>
    </header>
  );
}

