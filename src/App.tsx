import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import AssistantChat from './components/AssistantChat';
import Home from './pages/Home';
import BusinessJourney from './pages/BusinessJourney';
import ConsumerJourney from './pages/ConsumerJourney';
import StandardsPage from './pages/StandardsPage';
import Assistant from './pages/Assistant';
import HelpPage from './pages/HelpPage';
import VerifyPage from './pages/VerifyPage';
import JudgeDemo from './components/JudgeDemo';
import NotFound from './pages/NotFound';
import CookieConsent from './components/CookieConsent';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-full focus:bg-saffron-500 focus:text-black focus:text-sm focus:font-semibold"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/business" element={<BusinessJourney />} />
          <Route path="/consumer" element={<ConsumerJourney />} />
          <Route path="/standards" element={<StandardsPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/judge" element={<JudgeDemo />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <AssistantChat />
      <CookieConsent />
    </div>
  );
}
