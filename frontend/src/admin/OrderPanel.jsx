import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Footer } from '../components';
import OrderBoard from './OrderBoard';
import OrderCard from './OrderCard';
import { checkAuth, logout } from '../utils/authUtils';
import control from '../assets/images/control.svg';


export default function OrderPanel() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const verify = async () => {
      await checkAuth(setUserName);
      setLoading(false);
    };
    verify();
  }, []);

  useEffect(() => {
    if (!loading && userName === '') {
      navigate('/admin');
    }
  }, [userName, loading, navigate]);

  const navLinks =  [{ to: '/admin', src: control, alt: 'Панель', name: 'Панель' }]

  return (
    <>
      <Header navLinks={navLinks}/>
      <div className='content'>
        {selectedOrder ? (
          <OrderCard selectedOrder={selectedOrder} setSelectedOrder={setSelectedOrder} />
        ) : (
          userName && <OrderBoard setSelectedOrder={setSelectedOrder} name={userName}/>
        )}
      </div>
      <Footer />
    </>
  );
}