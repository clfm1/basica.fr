import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Accomplishments from './components/Accomplishments';
import Shop from './components/Shop';
import VideoShowcase from './components/VideoShowcase';
import Footer from './components/Footer';
import BackgroundParticles from './components/BackgroundParticles';
import Terms from './components/Terms';
import Privacy from './components/Privacy';
import Refund from './components/Refund';
import Account from './components/Account';
import ProductPage from './pages/ProductPage';
import CheckoutPage from './pages/CheckoutPage';
import { useEffect } from 'react';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function MainLayout() {
  return (
    <>
      <Hero />
      <Accomplishments />
      <Shop />
      <VideoShowcase />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="relative min-h-screen font-sans selection:bg-orange-600/30">
        <BackgroundParticles />
        <Navbar />
        
        <main className="relative z-10">
          <Routes>
            <Route path="/" element={<MainLayout />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/checkout/:id" element={<CheckoutPage />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/refund" element={<Refund />} />
            <Route path="/my-account" element={<Account />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}
