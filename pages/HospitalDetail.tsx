import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronRight, Star, MapPin, Phone, Globe, Clock, X, ChevronLeft,
  CreditCard, Award, Shield, Wifi, Car, Plane, Heart, Play,
  CheckCircle, Users, Camera, Quote, ChevronDown, ChevronUp, Loader2
} from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useTranslation } from '../hooks/useTranslation';
import { useConsultation } from '../contexts/ConsultationContext';
import { useHospital, CompleteHospitalData } from '../hooks/useData';
import { useLanguage } from '../contexts/LanguageContext';
import { getProcedureCaseImage } from '../utils/imageUtils';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_HOSPITAL = {
  id: 'bangkok-aesthetic-center',
  name: 'Bangkok Aesthetic Surgery Center',
  tagline: 'World-Class Cosmetic Surgery in the Heart of Bangkok',
  rating: 4.9,
  reviewCount: 847,
  yearEstablished: 2005,
  ratingBreakdown: [
    { label: 'Doctor', score: 4.9 },
    { label: 'Facilities', score: 4.8 },
    { label: 'Staff', score: 4.9 },
    { label: 'Language Assistance', score: 4.8 },
    { label: 'Support', score: 4.7 },
  ],
  totalPatients: 6740,
  recommendRate: 94,
  description: `Bangkok Aesthetic Surgery Center is one of Southeast Asia's most prestigious cosmetic surgery destinations, offering world-class surgical and non-surgical procedures in a state-of-the-art facility. Our center combines the expertise of internationally trained surgeons with cutting-edge technology and the renowned warmth of Thai hospitality.

With nearly two decades of experience serving international patients, we have developed comprehensive care protocols that ensure safety, comfort, and exceptional results. Our facility is JCI-accredited and meets the highest international standards for patient care and safety.`,
  highlights: [
    { icon: 'award', text: 'JCI Accredited since 2012' },
    { icon: 'shield', text: 'ISO 9001:2015 Certified' },
    { icon: 'users', text: '50,000+ International Patients Served' },
    { icon: 'globe', text: 'Multilingual Staff (EN, ZH, KR, JP, AR)' },
    { icon: 'wifi', text: 'Private Recovery Suites with Wi-Fi' },
    { icon: 'car', text: 'Complimentary Airport Transfer' },
    { icon: 'plane', text: 'Medical Tourism Concierge Service' },
    { icon: 'heart', text: 'Lifetime Follow-up Care Program' },
  ],
  paymentMethods: [
    'Visa', 'Mastercard', 'American Express', 'UnionPay',
    'Wire Transfer', 'Cash (THB/USD)', 'Medical Financing', 'Cryptocurrency'
  ],
  photos: [
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2670&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=2670&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?q=80&w=2670&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?q=80&w=2670&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1551190822-a9ce113ac100?q=80&w=2670&auto=format&fit=crop',
  ],
  surgeries: [
    { name: 'Rhinoplasty', priceRange: '$2,800 – $5,500', popular: true },
    { name: 'Facelift', priceRange: '$4,500 – $8,000', popular: true },
    { name: 'Breast Augmentation', priceRange: '$3,500 – $6,000', popular: true },
    { name: 'Liposuction', priceRange: '$2,000 – $5,000', popular: false },
    { name: 'Tummy Tuck', priceRange: '$4,000 – $7,500', popular: false },
    { name: 'Eyelid Surgery', priceRange: '$1,500 – $3,000', popular: true },
    { name: 'Brazilian Butt Lift', priceRange: '$4,500 – $8,500', popular: false },
    { name: 'Hair Transplant (FUE)', priceRange: '$3,000 – $6,000', popular: false },
    { name: 'Chin Augmentation', priceRange: '$2,000 – $4,000', popular: false },
    { name: 'Neck Lift', priceRange: '$3,500 – $6,500', popular: false },
    { name: 'Lip Lift', priceRange: '$1,200 – $2,500', popular: false },
    { name: 'Botox (per area)', priceRange: '$150 – $350', popular: true },
  ],
  doctors: [
    {
      id: 'dr-somchai',
      name: 'Dr. Somchai Rattanaphan',
      title: 'Chief Plastic Surgeon',
      specialties: ['Rhinoplasty', 'Facelift', 'Revision Surgery'],
      experience: 22,
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2670&auto=format&fit=crop',
      caseCount: 3500,
    },
    {
      id: 'dr-narin',
      name: 'Dr. Narin Kongkiat',
      title: 'Senior Cosmetic Surgeon',
      specialties: ['Breast Surgery', 'Body Contouring', 'Liposuction'],
      experience: 18,
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2670&auto=format&fit=crop',
      caseCount: 2800,
    },
    {
      id: 'dr-anong',
      name: 'Dr. Anong Srisawat',
      title: 'Oculoplastic Specialist',
      specialties: ['Eyelid Surgery', 'Brow Lift', 'Under-eye Rejuvenation'],
      experience: 15,
      image: 'https://images.unsplash.com/photo-1594824476967-48c8b964ac31?q=80&w=2670&auto=format&fit=crop',
      caseCount: 2100,
    },
    {
      id: 'dr-piyarat',
      name: 'Dr. Piyarat Chaiyakul',
      title: 'Non-Surgical Aesthetics Director',
      specialties: ['Injectables', 'Laser Treatments', 'Skin Rejuvenation'],
      experience: 12,
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=2670&auto=format&fit=crop',
      caseCount: 5200,
    },
  ],
  beforeAfter: [
    { id: 1, procedure: 'Rhinoplasty', beforeImg: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=800&auto=format&fit=crop', afterImg: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=800&auto=format&fit=crop', doctor: 'Dr. Somchai Rattanaphan', patientInfo: 'Female, 32' },
    { id: 2, procedure: 'Facelift', beforeImg: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=800&auto=format&fit=crop', afterImg: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=800&auto=format&fit=crop', doctor: 'Dr. Somchai Rattanaphan', patientInfo: 'Female, 55' },
    { id: 3, procedure: 'Breast Augmentation', beforeImg: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop', afterImg: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop', doctor: 'Dr. Narin Kongkiat', patientInfo: 'Female, 28' },
    { id: 4, procedure: 'Eyelid Surgery', beforeImg: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=800&auto=format&fit=crop', afterImg: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=800&auto=format&fit=crop', doctor: 'Dr. Anong Srisawat', patientInfo: 'Female, 41' },
    { id: 5, procedure: 'Liposuction', beforeImg: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop', afterImg: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop', doctor: 'Dr. Narin Kongkiat', patientInfo: 'Male, 38' },
    { id: 6, procedure: 'Rhinoplasty', beforeImg: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=800&auto=format&fit=crop', afterImg: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=800&auto=format&fit=crop', doctor: 'Dr. Somchai Rattanaphan', patientInfo: 'Male, 29' },
  ],
  reviews: [
    { id: 1, author: 'Sarah M.', country: 'Australia', rating: 5, date: '2024-11-15', procedure: 'Rhinoplasty', text: 'Absolutely incredible experience from start to finish. The hospital is immaculate, the staff speaks perfect English, and Dr. Somchai is a true artist. My nose looks completely natural and I couldn\'t be happier. The recovery suite felt like a luxury hotel.' },
    { id: 2, author: 'James L.', country: 'United Kingdom', rating: 5, date: '2024-10-28', procedure: 'Facelift', text: 'I traveled from London specifically for this clinic after extensive research. The results exceeded my expectations. The pre-op consultations were thorough, and the aftercare was world-class. I look 15 years younger and everyone thinks I just came back from holiday.' },
    { id: 3, author: 'Yuki T.', country: 'Japan', rating: 5, date: '2024-09-20', procedure: 'Eyelid Surgery', text: 'Dr. Anong understood exactly what I wanted. The communication was seamless with Japanese-speaking coordinators. Surgery was quick and recovery was smooth. Very happy with the natural-looking results.' },
    { id: 4, author: 'Ahmed K.', country: 'UAE', rating: 4, date: '2024-08-12', procedure: 'Liposuction', text: 'Professional team and excellent facilities. The VIP package included everything from airport pickup to a private recovery suite. Results are great and the savings compared to Dubai are significant. Would definitely recommend.' },
    { id: 5, author: 'Maria G.', country: 'United States', rating: 5, date: '2024-07-05', procedure: 'Breast Augmentation', text: 'Dr. Narin is exceptionally skilled. He took the time to understand my goals and recommended the perfect implant size. The facility is modern and clean, and the nursing staff checked on me constantly. Truly a five-star experience.' },
    { id: 6, author: 'Chen Wei', country: 'China', rating: 5, date: '2024-06-18', procedure: 'Rhinoplasty', text: 'I chose this hospital because of the Chinese-speaking staff and JCI accreditation. Everything was organized perfectly. My results are beautiful and very natural. The price was a fraction of what it would cost in Shanghai.' },
  ],
  videoTestimonials: [
    { id: 1, title: 'Sarah\'s Rhinoplasty Journey', thumbnail: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=800&auto=format&fit=crop', duration: '4:32', procedure: 'Rhinoplasty', country: 'Australia' },
    { id: 2, title: 'James\'s Facelift Transformation', thumbnail: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=800&auto=format&fit=crop', duration: '6:15', procedure: 'Facelift', country: 'UK' },
    { id: 3, title: 'Maria\'s Breast Augmentation Story', thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop', duration: '5:48', procedure: 'Breast Augmentation', country: 'USA' },
    { id: 4, title: 'Chen\'s Experience from China', thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop', duration: '3:55', procedure: 'Rhinoplasty', country: 'China' },
  ],
  location: {
    address: '888 Sukhumvit Road, Khlong Toei, Bangkok 10110, Thailand',
    phone: '+66 2 XXX XXXX',
    email: 'info@bangkokaesthetic.com',
    website: 'www.bangkokaesthetic.com',
    hours: 'Mon–Sat: 9:00 AM – 6:00 PM',
    mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.6!2d100.56!3d13.73!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDQzJzQ4LjAiTiAxMDDCsDMzJzM2LjAiRQ!5e0!3m2!1sen!2sth!4v1',
    nearbyAttractions: [
      '5 min from BTS Asok Station',
      '20 min from Suvarnabhumi Airport',
      'Walking distance to Terminal 21 Shopping Mall',
      'Adjacent to 5-star Sheraton Grande Hotel',
    ],
  },
};

// ─── Helper icon mapping ──────────────────────────────────────────────────────

const highlightIconMap: Record<string, React.ReactNode> = {
  award: <Award size={20} />,
  shield: <Shield size={20} />,
  users: <Users size={20} />,
  globe: <Globe size={20} />,
  wifi: <Wifi size={20} />,
  car: <Car size={20} />,
  plane: <Plane size={20} />,
  heart: <Heart size={20} />,
};

// ─── Component ────────────────────────────────────────────────────────────────

const HospitalDetail: React.FC = () => {
  const { hospitalSlug } = useParams<{ hospitalSlug: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { openConsultation } = useConsultation();
  const { currentLanguage } = useLanguage();

  console.log('🏥 [HospitalDetail] Component render - hospitalSlug:', hospitalSlug, 'lang:', currentLanguage);

  // Fetch hospital data from backend
  const { data: hospitalData, isLoading, error } = useHospital(hospitalSlug, currentLanguage);
  console.log('🏥 [HospitalDetail] Query state - isLoading:', isLoading, 'error:', error?.message, 'hasData:', !!hospitalData);

  // Transform backend data to match the component's expected format
  console.log('🏥 [HospitalDetail] Starting useMemo...');
  const memoStart = performance.now();
  const hospital = useMemo(() => {
    console.log('🏥 [HospitalDetail] Inside useMemo execution');
    if (!hospitalData) return MOCK_HOSPITAL; // Fallback to mock data

    const { hospital: h, translation, ratingBreakdown, procedures, location, nearbyAttractions, reviews, videoTestimonials, surgeons, cases } = hospitalData;

    return {
      id: h.slug,
      name: h.name,
      tagline: translation?.tagline || MOCK_HOSPITAL.tagline,
      rating: h.rating,
      reviewCount: h.review_count,
      yearEstablished: h.year_established,
      ratingBreakdown: ratingBreakdown.length > 0
        ? ratingBreakdown.map(r => ({ label: r.label, score: r.score }))
        : MOCK_HOSPITAL.ratingBreakdown,
      totalPatients: h.total_patients,
      recommendRate: h.recommend_rate,
      description: translation?.description || MOCK_HOSPITAL.description,
      highlights: (translation?.highlights || h.highlights || MOCK_HOSPITAL.highlights) as { icon: string; text: string }[],
      paymentMethods: h.payment_methods || MOCK_HOSPITAL.paymentMethods,
      photos: h.photos?.length > 0 ? h.photos : MOCK_HOSPITAL.photos,
      surgeries: procedures.length > 0
        ? procedures.map(p => ({
            name: p.procedures?.procedure_name || '',
            priceRange: p.price_range || '',
            popular: p.is_popular,
          }))
        : MOCK_HOSPITAL.surgeries,
      doctors: surgeons.length > 0
        ? surgeons.map(s => ({
            id: s.surgeon_id,
            name: s.name,
            title: s.title || '',
            specialties: s.specialties || [],
            experience: s.experience_years || 0,
            image: s.images?.hero || s.images?.[0] || MOCK_HOSPITAL.doctors[0].image,
            caseCount: 0, // TODO: aggregate from cases
          }))
        : MOCK_HOSPITAL.doctors,
      beforeAfter: cases.length > 0
        ? cases.map((c, idx) => {
            const procedureName = c.procedures?.procedure_name || '';
            return {
              id: idx + 1,
              procedure: procedureName,
              beforeImg: procedureName && c.case_number
                ? getProcedureCaseImage(procedureName, c.case_number, 1)
                : MOCK_HOSPITAL.beforeAfter[0].beforeImg,
              afterImg: procedureName && c.case_number
                ? getProcedureCaseImage(procedureName, c.case_number, 2)
                : MOCK_HOSPITAL.beforeAfter[0].afterImg,
              doctor: c.surgeons?.name || '',
              patientInfo: `${c.patient_gender || ''}, ${c.patient_age || ''}`.replace(/^, |, $/g, ''),
            };
          })
        : MOCK_HOSPITAL.beforeAfter,
      reviews: reviews.length > 0
        ? reviews.map((r, idx) => ({
            id: idx + 1,
            author: r.author_name,
            country: r.country || '',
            rating: r.rating,
            date: r.review_date || '',
            procedure: r.procedures?.procedure_name || '',
            text: r.review_text,
          }))
        : MOCK_HOSPITAL.reviews,
      videoTestimonials: videoTestimonials.length > 0
        ? videoTestimonials.map((v, idx) => ({
            id: idx + 1,
            title: v.title,
            thumbnail: v.thumbnail_url || MOCK_HOSPITAL.videoTestimonials[0].thumbnail,
            duration: v.duration || '',
            procedure: v.procedures?.procedure_name || '',
            country: v.country || '',
          }))
        : MOCK_HOSPITAL.videoTestimonials,
      location: location
        ? {
            address: location.address || '',
            phone: location.phone || '',
            email: location.email || '',
            website: location.website || '',
            hours: location.hours || '',
            mapEmbed: location.map_embed || MOCK_HOSPITAL.location.mapEmbed,
            nearbyAttractions: nearbyAttractions.length > 0
              ? nearbyAttractions.map(a => a.name)
              : MOCK_HOSPITAL.location.nearbyAttractions,
          }
        : MOCK_HOSPITAL.location,
    };
  }, [hospitalData]);
  console.log('🏥 [HospitalDetail] useMemo completed in', (performance.now() - memoStart).toFixed(0), 'ms');
  console.log('🏥 [HospitalDetail] Hospital data:', hospital.name, 'photos:', hospital.photos?.length, 'doctors:', hospital.doctors?.length);
  console.log('🏥 [HospitalDetail] Photo URLs:', hospital.photos);
  console.log('🏥 [HospitalDetail] Map embed:', hospital.location?.mapEmbed?.substring(0, 100));

  // State
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [modalPhotoIndex, setModalPhotoIndex] = useState(0);
  const [showAllPrices, setShowAllPrices] = useState(false);
  const [activeReviewFilter, setActiveReviewFilter] = useState<string>('all');
  const [visibleReviews, setVisibleReviews] = useState(3);
  const [consultWidgetOpen, setConsultWidgetOpen] = useState(true);

  // Scroll reveal
  // Important: only start reveal *after* data is loaded and the real DOM exists.
  // Otherwise elements with `scroll-reveal` stay `opacity: 0` (invisible but still clickable).
  useScrollReveal(!isLoading);

  // Filter reviews
  const filteredReviews = activeReviewFilter === 'all'
    ? hospital.reviews
    : hospital.reviews.filter(r => r.procedure === activeReviewFilter);

  const displayedSurgeries = showAllPrices ? hospital.surgeries : hospital.surgeries.slice(0, 6);

  // Unique procedures for filter
  const reviewProcedures = [...new Set(hospital.reviews.map(r => r.procedure))];

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-gold-600 mx-auto mb-4" />
          <p className="text-stone-500">Loading hospital details...</p>
        </div>
      </div>
    );
  }

  // Error state (still show page with mock data as fallback)
  if (error) {
    console.warn('Failed to fetch hospital data, using fallback:', error);
  }

  console.log('🏥 [HospitalDetail] RENDERING JSX - data ready, about to return');

  return (
    <>
    <div className="bg-white animate-fade-in-up">

      {/* ═══════════════════════════════════════════════════════════════════════
          1. HERO SECTION — Dark background with text (like SurgeonProfile)
         ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[700px] bg-luxury-green flex items-end overflow-hidden pb-16">
        {/* Subtle background image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f201b] via-[#0f201b]/90 to-[#0f201b]/70 z-10" />
          <img
            src={hospital.photos[0]}
            alt={hospital.name}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 relative z-20 pt-32">
          {/* Brand mark */}
          <div className="mb-8 opacity-90">
            <div className="font-serif text-3xl italic tracking-wide text-white">Medora Health</div>
            <div className="text-xs uppercase tracking-[0.2em] font-light text-sage-200 border-t border-white/30 pt-1 mt-1 inline-block">
              Center for Plastic Surgery
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="text-[10px] md:text-xs uppercase tracking-widest mb-4 font-sans">
            <button onClick={() => navigate('/')} className="text-gold-500 hover:text-gold-400 transition-colors">
              Home
            </button>
            <span className="mx-2 text-white/40">|</span>
            <span className="text-gold-500">Hospitals</span>
            <span className="mx-2 text-white/40">|</span>
            <span className="text-white">{hospital.name}</span>
          </div>

          <h1 className="font-serif text-4xl md:text-5xl lg:text-7xl text-white uppercase tracking-wide font-light mb-4 leading-tight max-w-4xl scroll-reveal">
            {hospital.name}
          </h1>

          <p className="text-sage-200 text-lg font-light mb-8 max-w-2xl scroll-reveal">
            {hospital.tagline}
          </p>

          {/* Rating badges */}
          <div className="flex flex-wrap items-center gap-4 scroll-reveal">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2">
              <Star size={18} className="text-gold-400 fill-gold-400" />
              <span className="text-white font-bold">{hospital.rating}</span>
              <span className="text-sage-300 text-sm">({hospital.reviewCount} reviews)</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2">
              <MapPin size={16} className="text-gold-400" />
              <span className="text-sage-200 text-sm">Bangkok, Thailand</span>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2">
              <Award size={16} className="text-gold-400" />
              <span className="text-sage-200 text-sm">Est. {hospital.yearEstablished}</span>
            </div>
          </div>

          <button
            onClick={() => openConsultation()}
            className="mt-8 bg-[#8b5e3c] text-white px-8 py-4 uppercase tracking-[0.15em] text-sm font-bold hover:bg-[#6d4a2f] transition-colors scroll-reveal"
          >
            Request A Consultation
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          1b. PHOTO GALLERY — Left 50% big + Right 2x2 grid
         ═══════════════════════════════════════════════════════════════════════ */}
      <section className="pt-8 pb-4 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-xl overflow-hidden h-[420px]">
            {/* Left — Large photo (50%) */}
            <div
              className="relative group cursor-pointer overflow-hidden"
              onClick={() => { setModalPhotoIndex(0); setPhotoModalOpen(true); }}
            >
              <img
                src={hospital.photos[0]}
                alt={`${hospital.name} - Main`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* Right — 2x2 grid (50%) */}
            <div className="hidden md:grid grid-cols-2 grid-rows-2 gap-2">
              {hospital.photos.slice(1, 5).map((photo, idx) => (
                <div
                  key={idx}
                  className="relative group cursor-pointer overflow-hidden"
                  onClick={() => { setModalPhotoIndex(idx + 1); setPhotoModalOpen(true); }}
                >
                  <img
                    src={photo}
                    alt={`${hospital.name} - ${idx + 2}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* "Show all photos" on last cell */}
                  {idx === 3 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setModalPhotoIndex(0); setPhotoModalOpen(true); }}
                      className="absolute bottom-3 right-3 z-10 bg-white/95 backdrop-blur-sm text-navy-900 text-sm font-medium px-4 py-2 rounded-full shadow-md hover:bg-white transition-colors flex items-center gap-2"
                    >
                      <Camera size={14} />
                      Show all photos
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile — show button below the single image */}
            <div className="md:hidden flex justify-center -mt-14 relative z-10 pb-4">
              <button
                onClick={() => { setModalPhotoIndex(0); setPhotoModalOpen(true); }}
                className="bg-white/95 backdrop-blur-sm text-navy-900 text-sm font-medium px-5 py-2.5 rounded-full shadow-md hover:bg-white transition-colors flex items-center gap-2"
              >
                <Camera size={14} />
                Show all {hospital.photos.length} photos
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ PHOTO MODAL ═══════════ */}
      {photoModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col">
          {/* Modal header */}
          <div className="flex items-center justify-between px-6 py-4 shrink-0">
            <span className="text-white/70 text-sm">
              {modalPhotoIndex + 1} / {hospital.photos.length}
            </span>
            <button
              onClick={() => setPhotoModalOpen(false)}
              className="text-white/70 hover:text-white p-2 transition-colors"
            >
              <X size={28} />
            </button>
          </div>

          {/* Modal body — main image */}
          <div className="flex-1 flex items-center justify-center px-16 pb-8 relative min-h-0">
            {/* Prev */}
            <button
              onClick={() => setModalPhotoIndex((prev) => (prev - 1 + hospital.photos.length) % hospital.photos.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/50 hover:text-white transition-colors"
            >
              <ChevronLeft size={36} />
            </button>

            <img
              src={hospital.photos[modalPhotoIndex]}
              alt={`Photo ${modalPhotoIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
            />

            {/* Next */}
            <button
              onClick={() => setModalPhotoIndex((prev) => (prev + 1) % hospital.photos.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/50 hover:text-white transition-colors"
            >
              <ChevronRight size={36} />
            </button>
          </div>

          {/* Modal footer — thumbnails */}
          <div className="shrink-0 px-6 pb-6">
            <div className="flex gap-2 justify-center overflow-x-auto">
              {hospital.photos.map((photo, idx) => (
                <button
                  key={idx}
                  onClick={() => setModalPhotoIndex(idx)}
                  className={`shrink-0 w-20 h-14 overflow-hidden rounded transition-all ${
                    idx === modalPhotoIndex
                      ? 'ring-2 ring-gold-500 opacity-100'
                      : 'opacity-40 hover:opacity-70'
                  }`}
                >
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          1c. RATING & STATS BAR
         ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-6">
          <div className="border border-sage-100 rounded-lg p-6 md:p-8 shadow-sm">
            {/* Top row — Overall rating + Category tags */}
            <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6">
              {/* Overall rating */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-center">
                  <div className="font-serif text-4xl text-navy-900 font-bold leading-none">{hospital.rating}</div>
                  <div className="flex gap-0.5 mt-1 justify-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="text-gold-500 fill-gold-500" />
                    ))}
                  </div>
                </div>
                <div className="h-12 w-px bg-stone-200" />
                <div>
                  <div className="font-serif text-2xl text-navy-900 font-bold">{hospital.reviewCount}</div>
                  <div className="text-stone-500 text-sm">reviews</div>
                </div>
              </div>

              {/* Category rating tags */}
              <div className="flex flex-wrap gap-2">
                {hospital.ratingBreakdown.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 bg-sage-50 border border-sage-100 text-stone-700 text-sm px-3 py-1.5 rounded-full"
                  >
                    {item.label} <span className="font-bold text-navy-900">{item.score}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom row — Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 bg-sage-50 rounded-lg p-4 border border-sage-100">
                <div className="w-12 h-12 rounded-full bg-gold-600/10 flex items-center justify-center shrink-0">
                  <CheckCircle size={24} className="text-gold-600" />
                </div>
                <div>
                  <div className="text-navy-900 font-bold text-lg">{hospital.totalPatients.toLocaleString()} patients</div>
                  <div className="text-stone-500 text-sm font-light">chose clinic for Plastic Surgery</div>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-sage-50 rounded-lg p-4 border border-sage-100">
                <div className="w-12 h-12 rounded-full bg-gold-600/10 flex items-center justify-center shrink-0">
                  <Heart size={24} className="text-gold-600" />
                </div>
                <div>
                  <div className="text-navy-900 font-bold text-lg">{hospital.recommendRate}% Patients</div>
                  <div className="text-stone-500 text-sm font-light">recommended this clinic</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          2. OVERVIEW — Highlights + Payment Methods
         ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white scroll-reveal">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            {/* Left — About */}
            <div className="lg:w-1/2">
              <h2 className="font-serif text-4xl md:text-5xl text-navy-900 mb-8 leading-tight">
                Overview
              </h2>
              <div className="text-stone-600 text-lg leading-relaxed font-light space-y-4">
                {hospital.description.split('\n\n').map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-10">
                <button
                  onClick={() => openConsultation()}
                  className="bg-[#8b5e3c] text-white px-8 py-4 uppercase tracking-[0.15em] text-sm font-bold hover:bg-[#6d4a2f] transition-colors"
                >
                  Request A Consultation
                </button>
              </div>
            </div>

            {/* Right — Highlights + Payment */}
            <div className="lg:w-1/2 space-y-8">
              {/* Highlights */}
              <div className="bg-sage-50 p-8 border border-sage-100">
                <h3 className="font-serif text-2xl text-navy-900 mb-6">Highlights</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {hospital.highlights.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="shrink-0 w-10 h-10 rounded-full bg-gold-600/10 flex items-center justify-center text-gold-600">
                        {highlightIconMap[item.icon] || <CheckCircle size={20} />}
                      </div>
                      <span className="text-stone-700 text-sm leading-relaxed pt-2">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white border border-stone-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard size={24} className="text-gold-600" />
                  <h3 className="font-serif text-2xl text-navy-900">Accepted Payment Methods</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {hospital.paymentMethods.map((method, idx) => (
                    <span
                      key={idx}
                      className="bg-sage-50 text-stone-700 px-4 py-2 text-sm rounded-full border border-sage-100"
                    >
                      {method}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          3. PRICES — Surgery Price List
         ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-sage-50 scroll-reveal">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-gold-600 uppercase tracking-[0.2em] text-xs font-bold mb-4 block">
              Transparent Pricing
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-navy-900 mb-4">
              Surgery Prices
            </h2>
            <p className="text-stone-500 max-w-2xl mx-auto font-light text-lg">
              All prices include pre-operative consultation, surgery, anesthesia, hospital stay, and standard follow-up care.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedSurgeries.map((surgery, idx) => (
                <div
                  key={idx}
                  className="bg-white p-6 border border-sage-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-gold-600 shrink-0" />
                    <span className="text-navy-900 font-medium truncate">{surgery.name}</span>
                    {surgery.popular && (
                      <span className="shrink-0 inline-block bg-gold-600/10 text-gold-600 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                  <span className="text-stone-700 font-light text-lg shrink-0">{surgery.priceRange}</span>
                </div>
              ))}
            </div>

            {/* Show more / less */}
            {hospital.surgeries.length > 6 && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setShowAllPrices(!showAllPrices)}
                  className="inline-flex items-center gap-2 text-navy-900 uppercase tracking-widest text-sm font-bold hover:text-gold-600 transition-colors"
                >
                  {showAllPrices ? 'Show Less' : `View All ${hospital.surgeries.length} Procedures`}
                  {showAllPrices ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
              </div>
            )}

            {/* Price note */}
            <div className="mt-8 bg-[#f9f5f1] p-6 border-l-4 border-gold-600">
              <p className="text-stone-600 text-sm font-light leading-relaxed">
                <span className="font-bold text-navy-900">Note:</span> Prices are estimates and may vary based on individual patient needs, complexity of the procedure, and surgeon selection. Final pricing will be provided during your personal consultation. All prices are in USD.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          4. DOCTORS
         ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#1c1c1c] py-24 text-white scroll-reveal-scale">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-gold-600 uppercase tracking-widest text-sm font-bold mb-4 block">
              Expert Surgical Team
            </span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white">
              Our Doctors
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 max-w-7xl mx-auto">
            {hospital.doctors.map((doctor) => {
              const lastName = doctor.name.split(' ').pop();
              return (
                <div key={doctor.id} className="flex flex-col group">
                  <div className="mb-6 aspect-[4/3] overflow-hidden">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <h3 className="font-bold text-xl mb-2">{doctor.name}</h3>
                  <p className="text-stone-400 text-sm mb-3 font-light">{doctor.title}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {doctor.specialties.map((s, i) => (
                      <span key={i} className="text-xs bg-white/10 text-sage-200 px-2 py-1 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-stone-400 mb-4 mt-auto">
                    <span>{doctor.experience}+ yrs</span>
                    <span className="w-1 h-1 bg-stone-600 rounded-full" />
                    <span>{doctor.caseCount.toLocaleString()} cases</span>
                  </div>
                  <button
                    onClick={() => navigate(`/surgeon/${encodeURIComponent(doctor.id)}`)}
                    className="text-gold-500 hover:text-white uppercase tracking-wider text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    Meet Dr. {lastName} <ChevronRight size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          5. BEFORE & AFTER PHOTOS
         ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white scroll-reveal">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-gold-600 uppercase tracking-[0.2em] text-xs font-bold mb-4 block">
              Real Results
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-navy-900 mb-4">
              Before & After Photos
            </h2>
            <p className="text-stone-500 max-w-2xl mx-auto font-light">
              View real patient transformations performed by our expert surgical team.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hospital.beforeAfter.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer border border-stone-100"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-sage-50">
                  <img
                    src={item.beforeImg}
                    alt={`${item.procedure} - Before & After`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/50 to-transparent flex items-end justify-center pb-8 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                    <span className="inline-flex items-center gap-2 text-white uppercase tracking-widest text-sm font-medium bg-gold-600 px-6 py-3 rounded-full">
                      View Case Details
                      <ChevronRight size={16} />
                    </span>
                  </div>
                  {/* Procedure badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/95 backdrop-blur-sm text-navy-900 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
                      {item.procedure}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-6">
                  <h3 className="text-navy-900 font-semibold text-lg group-hover:text-gold-600 transition-colors mb-2">
                    {item.procedure}
                  </h3>
                  <div className="space-y-1.5 text-sm text-stone-500">
                    <p className="flex items-center gap-2">
                      <span className="text-stone-400">Doctor:</span>
                      <span>{item.doctor}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-stone-400">Patient:</span>
                      <span>{item.patientInfo}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View all gallery button */}
          <div className="text-center mt-12">
            <button
              onClick={() => navigate(`/hospital/${hospitalSlug}/gallery`)}
              className="inline-flex items-center gap-2 bg-transparent border-2 border-navy-900 text-navy-900 px-10 py-4 uppercase tracking-[0.15em] text-sm font-bold hover:bg-navy-900 hover:text-white transition-all duration-300"
            >
              View Full Gallery
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          6. REVIEWS
         ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#f9f5f1] scroll-reveal">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-gold-600 uppercase tracking-[0.2em] text-xs font-bold mb-4 block">
              Patient Testimonials
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-navy-900 mb-4">
              Reviews
            </h2>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} className="text-gold-500 fill-gold-500" />
                ))}
              </div>
              <span className="text-navy-900 font-bold text-xl">{hospital.rating}</span>
              <span className="text-stone-500">based on {hospital.reviewCount} reviews</span>
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <button
              onClick={() => setActiveReviewFilter('all')}
              className={`px-5 py-2 text-sm uppercase tracking-wider font-medium transition-all ${
                activeReviewFilter === 'all'
                  ? 'bg-navy-900 text-white'
                  : 'bg-white text-stone-600 hover:bg-navy-900 hover:text-white border border-stone-200'
              }`}
            >
              All
            </button>
            {reviewProcedures.map((proc) => (
              <button
                key={proc}
                onClick={() => setActiveReviewFilter(proc)}
                className={`px-5 py-2 text-sm uppercase tracking-wider font-medium transition-all ${
                  activeReviewFilter === proc
                    ? 'bg-navy-900 text-white'
                    : 'bg-white text-stone-600 hover:bg-navy-900 hover:text-white border border-stone-200'
                }`}
              >
                {proc}
              </button>
            ))}
          </div>

          {/* Review cards */}
          <div className="max-w-4xl mx-auto space-y-6">
            {filteredReviews.slice(0, visibleReviews).map((review) => (
              <div key={review.id} className="bg-white p-8 shadow-sm border border-sage-100">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-navy-900 font-bold text-lg">{review.author}</h4>
                      <span className="text-stone-400 text-sm">from {review.country}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} size={14} className="text-gold-500 fill-gold-500" />
                        ))}
                      </div>
                      <span className="text-stone-400 text-xs">|</span>
                      <span className="text-gold-600 text-sm font-medium">{review.procedure}</span>
                    </div>
                  </div>
                  <span className="text-stone-400 text-sm shrink-0">{review.date}</span>
                </div>
                <p className="text-stone-600 leading-relaxed font-light">
                  <Quote size={16} className="inline text-gold-300 mr-2 -mt-1" />
                  {review.text}
                </p>
              </div>
            ))}
          </div>

          {/* Show more reviews */}
          {filteredReviews.length > visibleReviews && (
            <div className="text-center mt-10">
              <button
                onClick={() => setVisibleReviews((prev) => prev + 3)}
                className="inline-flex items-center gap-2 text-navy-900 uppercase tracking-widest text-sm font-bold hover:text-gold-600 transition-colors"
              >
                Load More Reviews
                <ChevronDown size={18} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          7. VIDEO TESTIMONIALS
         ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white scroll-reveal">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-gold-600 uppercase tracking-[0.2em] text-xs font-bold mb-4 block">
              Watch Their Stories
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-navy-900 mb-4">
              Video Testimonials
            </h2>
            <p className="text-stone-500 max-w-2xl mx-auto font-light">
              Hear directly from our patients about their experience and results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {hospital.videoTestimonials.map((video) => (
              <div key={video.id} className="group cursor-pointer">
                <div className="relative aspect-video overflow-hidden rounded-lg bg-sage-100 mb-5 shadow-sm">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                    <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <Play size={32} className="text-navy-900 ml-1" fill="currentColor" />
                    </div>
                  </div>
                  {/* Duration badge */}
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded">
                    {video.duration}
                  </div>
                  {/* Country flag badge */}
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-navy-900 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
                    {video.procedure}
                  </div>
                </div>
                <h4 className="text-navy-900 font-semibold text-lg group-hover:text-gold-600 transition-colors mb-1">
                  {video.title}
                </h4>
                <p className="text-stone-500 text-sm">{video.procedure} &middot; {video.country}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          8. LOCATION
         ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-sage-50 scroll-reveal">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-gold-600 uppercase tracking-[0.2em] text-xs font-bold mb-4 block">
              Visit Us
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-navy-900 mb-4">
              Location
            </h2>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
            {/* Map */}
            <div className="lg:w-2/3">
              <div className="aspect-[16/9] bg-sage-100 rounded-lg overflow-hidden shadow-sm">
                <iframe
                  src={hospital.location.mapEmbed}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Hospital Location"
                  className="w-full h-full"
                />
              </div>
            </div>

            {/* Contact info */}
            <div className="lg:w-1/3 space-y-6">
              <div className="bg-white p-8 border border-sage-100 shadow-sm">
                <h3 className="font-serif text-2xl text-navy-900 mb-6">Contact Information</h3>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <MapPin size={20} className="text-gold-600 mt-1 shrink-0" />
                    <div>
                      <p className="text-navy-900 font-medium text-sm mb-1">Address</p>
                      <p className="text-stone-600 text-sm font-light">{hospital.location.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Phone size={20} className="text-gold-600 mt-1 shrink-0" />
                    <div>
                      <p className="text-navy-900 font-medium text-sm mb-1">Phone</p>
                      <p className="text-stone-600 text-sm font-light">{hospital.location.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Globe size={20} className="text-gold-600 mt-1 shrink-0" />
                    <div>
                      <p className="text-navy-900 font-medium text-sm mb-1">Website</p>
                      <p className="text-stone-600 text-sm font-light">{hospital.location.website}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Clock size={20} className="text-gold-600 mt-1 shrink-0" />
                    <div>
                      <p className="text-navy-900 font-medium text-sm mb-1">Hours</p>
                      <p className="text-stone-600 text-sm font-light">{hospital.location.hours}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nearby */}
              <div className="bg-white p-8 border border-sage-100 shadow-sm">
                <h3 className="font-serif text-xl text-navy-900 mb-4">Nearby</h3>
                <ul className="space-y-3">
                  {hospital.location.nearbyAttractions.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-stone-600 text-sm font-light">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-600 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          9. CTA SECTION
         ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-navy-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-serif text-4xl md:text-5xl mb-6">
            Begin Your Transformation
          </h2>
          <p className="text-sage-200 text-lg max-w-2xl mx-auto mb-10 font-light">
            Take the first step toward your aesthetic goals. Schedule a personalized consultation with our expert team at {hospital.name}.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => openConsultation()}
              className="bg-gold-600 text-white px-12 py-4 uppercase tracking-[0.15em] text-sm font-bold hover:bg-gold-500 transition-colors"
            >
              Book Consultation
            </button>
            <button
              onClick={() => navigate('/travel')}
              className="bg-transparent border-2 border-white text-white px-12 py-4 uppercase tracking-[0.15em] text-sm font-bold hover:bg-white hover:text-navy-900 transition-colors"
            >
              Travel Guide
            </button>
          </div>
        </div>
      </section>

    </div>

    {/* ═══════════════════════════════════════════════════════════════════════
        FLOATING CONSULTATION WIDGET — outside animated div so fixed works
       ═══════════════════════════════════════════════════════════════════════ */}
    <div className="fixed bottom-6 right-6 z-50">
      {consultWidgetOpen ? (
        <div className="bg-white rounded-lg shadow-2xl border border-sage-100 w-[320px] overflow-hidden">
          {/* Header */}
          <div className="bg-navy-900 px-6 py-5 relative">
            <button
              onClick={() => setConsultWidgetOpen(false)}
              className="absolute top-3 right-3 text-white/50 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
            <h3 className="font-serif text-xl text-white leading-snug">
              Get a Free Consultation
            </h3>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-navy-900 flex items-center justify-center shrink-0">
                <span className="font-serif text-lg italic text-white">M</span>
              </div>
              <div>
                <p className="text-navy-900 font-bold text-sm leading-tight">{hospital.name}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star size={12} className="text-gold-500 fill-gold-500" />
                  <span className="text-xs text-stone-600">{hospital.rating} ({hospital.reviewCount} reviews)</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-sage-50 rounded p-3 border border-sage-100">
              <CheckCircle size={18} className="text-gold-600 mt-0.5 shrink-0" />
              <p className="text-stone-600 text-sm font-light leading-relaxed">
                Individual treatment program and cost estimate
              </p>
            </div>

            <button
              onClick={() => { setConsultWidgetOpen(false); navigate(`/get-quote?hospital=${hospital.id}`); }}
              className="w-full bg-[#8b5e3c] text-white py-3.5 uppercase tracking-[0.15em] text-sm font-bold hover:bg-[#6d4a2f] transition-colors rounded"
            >
              Get a Free Quote
            </button>

            <div className="flex items-center justify-center gap-2 text-stone-400 text-xs">
              <Clock size={14} />
              <span>Average answering time – 5 minutes</span>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setConsultWidgetOpen(true)}
          className="bg-[#8b5e3c] text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center hover:bg-[#6d4a2f] transition-colors hover:scale-110"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}
    </div>
    </>
  );
};

export default HospitalDetail;
