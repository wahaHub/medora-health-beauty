import React from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import Header from './components/Header';
import Intro from './components/Intro';
import Partnership from './components/Partnership';
import Categories from './components/Categories';
import TeamIntro from './components/TeamIntro';
import Doctors from './components/Doctors';
import TravelProgram from './components/TravelProgram';
import Testimonials from './components/Testimonials';
import GalleryCTA from './components/GalleryCTA';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import ProcedureDetail from './components/ProcedureDetail';
import CaseDetail from './components/CaseDetail';
import OurTeam from './components/OurTeam';
import AllSurgeons from './pages/AllSurgeons';
import Gallery from './components/Gallery';
import ProcedureGallery from './components/ProcedureGallery';
import TravelPage from './components/TravelPage';
import ReviewsPage from './components/ReviewsPage';
import SurgeonProfile from './components/SurgeonProfile';
import PatientForm from './components/PatientForm';
import ProceduresList from './pages/ProceduresList';

// Home page component
function HomePage() {
  const navigate = useNavigate();

  const handleNavigate = (page: string) => {
    navigate(`/${page}`);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <Intro />
      <Partnership />
      <Categories />
      <TeamIntro />
      <Doctors />
      <TravelProgram />
      <Testimonials />
      <GalleryCTA onNavigate={handleNavigate} />
      <Contact />
    </>
  );
}

// Procedure Detail Wrapper
function ProcedureDetailWrapper() {
  const { procedureName } = useParams<{ procedureName: string }>();
  const navigate = useNavigate();

  return (
    <ProcedureDetail 
      procedureName={procedureName || 'Chin Augmentation'} 
      onBack={() => {
        navigate('/');
        window.scrollTo(0, 0);
      }} 
      onCaseClick={(caseId) => {
        // 使用 encodeURIComponent 确保包含 / 的名称也能正确编码
        navigate(`/procedure/${encodeURIComponent(procedureName || '')}/case/${caseId}`);
        window.scrollTo(0, 0);
      }}
    />
  );
}

// Case Detail Wrapper
function CaseDetailWrapper() {
  const { procedureName, caseId, '*': wildcardPath } = useParams<{ procedureName: string; caseId: string; '*': string }>();
  const navigate = useNavigate();

  // 处理通配符路由：从 URL 路径中提取 procedure 名称
  // 对于 /procedure/Temples Lift / Temporofrontal Lift/case/1001510
  // wildcardPath 会是完整路径，需要提取出 procedure 名称
  let actualProcedureName = procedureName;
  if (!procedureName && wildcardPath) {
    // 从通配符路径中提取 procedure 名称（去掉最后的 /case/xxx）
    const match = window.location.pathname.match(/\/procedure\/(.+)\/case\//);
    if (match) {
      actualProcedureName = decodeURIComponent(match[1]);
    }
  }

  return (
    <CaseDetail
      caseId={caseId || '1001510'}
      procedureName={actualProcedureName || 'Chin Augmentation'}
      onBack={() => {
        navigate(`/procedure/${encodeURIComponent(actualProcedureName || '')}`);
        window.scrollTo(0, 0);
      }}
    />
  );
}

// Gallery Wrapper
function GalleryWrapper() {
  const navigate = useNavigate();

  return (
    <Gallery
      onNavigate={(proc) => {
        navigate(`/procedure/${encodeURIComponent(proc)}`);
        window.scrollTo(0, 0);
      }}
    />
  );
}

// Procedure Gallery Wrapper
function ProcedureGalleryWrapper() {
  const { procedureName } = useParams<{ procedureName: string }>();
  const navigate = useNavigate();

  return (
    <ProcedureGallery
      procedureName={procedureName}
      onBack={() => {
        navigate(`/procedure/${encodeURIComponent(procedureName || '')}`);
        window.scrollTo(0, 0);
      }}
      onCaseClick={(caseId) => {
        navigate(`/procedure/${encodeURIComponent(procedureName || '')}/case/${caseId}`);
        window.scrollTo(0, 0);
      }}
    />
  );
}

function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen flex flex-col font-sans selection:bg-gold-200 selection:text-navy-900">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/team" element={<OurTeam />} />
            <Route path="/surgeons" element={<AllSurgeons />} />
            <Route path="/gallery" element={<GalleryWrapper />} />
            <Route path="/travel" element={<TravelPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/patient-form" element={<PatientForm />} />
            <Route path="/surgeon/:surgeonName" element={<SurgeonProfile />} />
            <Route path="/procedures/:category" element={<ProceduresList />} />
            <Route path="/procedure/:procedureName" element={<ProcedureDetailWrapper />} />
            <Route path="/procedure/:procedureName/gallery" element={<ProcedureGalleryWrapper />} />
            <Route path="/procedure/:procedureName/case/:caseId" element={<CaseDetailWrapper />} />
            {/* 通配符路由：处理包含 / 的 procedure 名称 */}
            <Route path="/procedure/*/case/:caseId" element={<CaseDetailWrapper />} />
          </Routes>
        </main>
        <Footer />
        <ChatWidget />
      </div>
    </LanguageProvider>
  );
}

export default App;