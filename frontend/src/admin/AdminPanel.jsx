import React, { useState } from 'react';
import { Header, Footer } from '../components';
import Dashboard from './Dashboard';
import Register from './Register';
import Login from './Login';
import { VIEWS } from '../constants/views';
import note from '../assets/images/note.svg';


export default function AdminPanel() {
  const [userName, setUserName] = useState('');
  const [currentComponent, setCurrentComponent] = useState(VIEWS.DASHBOARD);

  const goTo = (view) => setCurrentComponent(view);

  const COMPONENTS = {
    [VIEWS.DASHBOARD]: <Dashboard userName={userName} setUserName={setUserName} goTo={goTo} />,
    [VIEWS.LOGIN]: <Login userName={userName} setUserName={setUserName} goTo={goTo}/>,
    [VIEWS.REGISTER]: <Register userName={userName} setUserName={setUserName} goTo={goTo} />,
  };

  const navLinks = (currentComponent===VIEWS.DASHBOARD)
    ? [{ to: '/order-panel', src: note, alt: 'Замовлення', name: 'Замовлення' }]
    : [] ;


  return (
    <>
      <Header navLinks={navLinks}/>
      <div className="content">
        {COMPONENTS[currentComponent]}
      </div>
      <Footer />
    </>
  );
}
