import { Link } from 'react-router-dom';
import logo from '../assets/images/logo.png';
import home from '../assets/images/home.svg';


const NavMenu = ({ to, src, alt, name }) => {
  const isAnchor = typeof to === 'string' && to.startsWith('#');
  const isExternal = typeof to === 'string' && (to.startsWith('http://') || to.startsWith('https://'));
  const isInternal = typeof to === 'string' && !isAnchor && !isExternal;

  const navData = () => (
    <>
      <img loading="lazy" className="nav-icon__image" src={src} alt={alt} />
      {name}
    </>
  );

  if (isAnchor || isExternal) {
    return (
      <a className="nav-link" href={to}>
        {navData()}
      </a>
    );
  }

  if (isInternal) {
    return (
      <Link className="nav-link" to={to}>
        {navData()}
      </Link>
    );
  }

  return null;
};

export default function Header({ navLinks }) {

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
        {navLinks.map((linkData, index) => (
      <NavMenu key={index} {...linkData} />
        ))}
      </nav>
    </header>
  );
}

