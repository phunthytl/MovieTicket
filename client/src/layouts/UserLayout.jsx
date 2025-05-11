import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/user/Header';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function UserLayout() {
  return (
    <div className="user-layout" style={{ backgroundColor: '#0b1121', minHeight: '100vh', color: 'white' }}>
      <ScrollToTop />
      <Header />
      <main style={{ minHeight: '80vh', padding: '20px 0' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>
      <footer style={{ textAlign: 'center', padding: '10px 0', background: '#0b1121', color: '#ccc' }}>
        © 2025 SuperStar. All rights reserved.
      </footer>
    </div>
  );
}