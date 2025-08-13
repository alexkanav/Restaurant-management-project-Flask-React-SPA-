import Header from '../components/Header';
import CommentForm from './CommentForm';
import Footer from '../components/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



export default function FeedbackPage() {

  return (
    <>
      <Header />
      <CommentForm />
      <ToastContainer position="top-center" autoClose={3000} />
      <Footer />
    </>
  )
}