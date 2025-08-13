import React, { Suspense, lazy, useContext } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { UserContext } from './context/UserContext';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Stats = lazy(() => import('./pages/Stats'));
const Auth = lazy(() => import('./pages/Auth'));

function Header() {
  return (
    <header style={{ background: '#333', padding: '1rem', color: '#fff' }}>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/" style={{ color: '#fff' }}>Home</Link>
          <Link to="/about" style={{ color: '#fff' }}>About</Link>
          <Link to="/stats" style={{ color: '#fff' }}>Stats</Link>
        </nav>
      </header>
  )
}



export default function App() {
  const { user, isInitialized } = useContext(UserContext);
  const location = useLocation();

  const hideHeader = location.pathname === '/auth';

  if (!isInitialized){
    return <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '1.2em'
    }}>
      Loading...
    </div>;
  }
  const shouldRedirectToAuth = () => {
    return user === null;
  };
  const shouldRedirectFromAuth = () => {
    return user !== null;
  };


  return (
    <>
      {!hideHeader && <Header />}
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route 
            path="/" 
            element={shouldRedirectToAuth() ? <Navigate to="/auth" replace /> : <Home />} 
          />
          <Route 
            path="/about" 
            element={shouldRedirectToAuth() ? <Navigate to="/auth" replace /> : <About />} 
          />
          <Route 
            path="/stats" 
            element={shouldRedirectToAuth() ? <Navigate to="/auth" replace /> : <Stats />} 
          />
          <Route
            path="/auth"
            element={shouldRedirectFromAuth() ? <Navigate to="/" replace /> : <Auth />}
          />
          <Route 
            path="*" 
            element={shouldRedirectToAuth() ? <Navigate to="/auth" replace /> : <Navigate to="/" replace />} 
          />
        </Routes>
      </Suspense>
    </>
  );
}
