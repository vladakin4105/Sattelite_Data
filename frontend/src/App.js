import React, { Suspense, lazy } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Stats = lazy(() => import('./pages/Stats'));

export default function App() {
  return (
    <>
      <header style={{ background: '#333', padding: '1rem', color: '#fff' }}>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/" style={{ color: '#fff' }}>Home</Link>
          <Link to="/about" style={{ color: '#fff' }}>About</Link>
          <Link to="/stats" style={{ color: '#fff' }}>Stats</Link>
        </nav>
      </header>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </Suspense>
    </>
  );
}
