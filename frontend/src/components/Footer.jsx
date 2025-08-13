import facebook from '../assets/images/facebook.svg';
import insta from '../assets/images/insta.svg';


export default function Footer() {

  return (
    <div className="footer">
      Ми у соціальних мережах:
      <div className="social-icon">
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img className="top-menu-logo" src={facebook} alt="Facebook" />
        </a>

        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img className="top-menu-logo" src={insta} alt="Instagram" />
        </a>
      </div>
    </div>
  )
}