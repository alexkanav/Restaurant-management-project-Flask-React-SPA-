import Header from '../components/Header';
import CommentForm from './CommentForm';
import Footer from '../components/Footer';
import hot from '../assets/images/hot.svg';
import home from '../assets/images/home.svg';


export default function FeedbackPage() {
  const navLinks = [
    { to: "/", src: home, alt: 'Головна', name: 'Головна' },
    { to: "/menu", src: hot, alt: 'Меню', name: 'Меню' },
  ];

  return (
    <>
      <Header navLinks={navLinks}/>
      <CommentForm />
      <Footer />
    </>
  )
}