import React, { Suspense, lazy } from 'react';
import { Routes, Route, Link } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Stats = lazy(() => import('./pages/Stats'));

export default function App() {
  return (
    <>
      <nav style={{ padding: '1rem', background: '#f0f0f0' }}>
        <Link to="/">Home</Link> | <Link to="/about">About</Link> | <Link to="/stats">Stats</Link>
      </nav>
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
