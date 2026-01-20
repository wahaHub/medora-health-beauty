import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Award, GraduationCap, Languages, Loader2, ArrowLeft, Calendar, MapPin } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface SurgeonDetail {
  surgeon_id: string;
  name: string;
  title: string;
  experience_years: number;
  image_url: string | null;
  image_prompt: string;
  specialties: string[];
  languages: string[];
  education: string[];
  certifications: string[];
  procedures_count: { [key: string]: number };
  bio: {
    intro: string;
    expertise: string;
    philosophy: string;
    achievements: string[];
  };
  created_at: string;
  updated_at: string;
}

const SurgeonProfile: React.FC = () => {
  const { surgeonName } = useParams<{ surgeonName: string }>();
  const navigate = useNavigate();
  const [surgeon, setSurgeon] = useState<SurgeonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Enable scroll reveal animations - only after data is loaded
  useScrollReveal(!loading && surgeon !== null);

  // Placeholder images
  const placeholderHeroImage = "https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=2670&auto=format&fit=crop";
  const placeholderOfficeImage = "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop";

  useEffect(() => {
    const fetchSurgeonDetail = async () => {
      if (!surgeonName) {
        setError('Surgeon ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Extract surgeon_id from URL (could be "Dr.%20Min%20Zhang" or "min-zhang")
        const surgeonId = decodeURIComponent(surgeonName)
          .replace('Dr. ', '')
          .replace(/\s+/g, '-')
          .toLowerCase();

        const response = await fetch(`https://www.medorabeauty.com/api/surgeon-detail?surgeon_id=${surgeonId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch surgeon details');
        }

        const result = await response.json();

        if (result.success && result.data) {
          setSurgeon(result.data);
        } else {
          throw new Error('Surgeon not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching surgeon details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSurgeonDetail();
  }, [surgeonName]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-gold-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading surgeon profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !surgeon) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <h1 className="text-3xl font-serif text-navy-900 mb-4">Surgeon Not Found</h1>
          <p className="text-gray-600 mb-8">{error || 'The surgeon you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/surgeons')}
            className="bg-navy-900 text-white px-8 py-3 rounded-lg hover:bg-navy-800 transition-colors"
          >
            View All Surgeons
          </button>
        </div>
      </div>
    );
  }

  // Calculate total procedures (with safe fallback)
  const totalProcedures = surgeon.procedures_count
    ? Object.values(surgeon.procedures_count).reduce((sum, count) => sum + count, 0)
    : 0;

  return (
    <div className="bg-white animate-fade-in-up">
      {/* 1. HERO SECTION - Green Gradient with Surgeon Photo */}
      <section className="relative h-screen min-h-[600px] bg-luxury-green flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f201b] via-[#0f201b]/80 to-transparent z-10 w-full lg:w-2/3"></div>
          <img
            src={surgeon.image_url || placeholderHeroImage}
            alt={surgeon.name}
            className="absolute inset-0 w-full h-full object-cover object-[70%_20%] lg:object-[center_20%]"
          />
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 relative z-20 pt-20">
          <div className="flex flex-col lg:flex-row-reverse gap-8 items-start">
            {/* Left Sidebar - Stats & Certifications */}
            <div className="w-full lg:w-80 shrink-0 space-y-6 lg:order-first">
              {/* Surgical Volume Highlights */}
              {surgeon.procedures_count && Object.keys(surgeon.procedures_count).length > 0 && (
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 scroll-reveal">
                  <h3 className="text-gold-400 uppercase tracking-[0.2em] text-xs font-bold mb-4">
                    Surgical Volume Highlights
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(surgeon.procedures_count).map(([procedure, count]) => {
                      const maxCount = Math.max(...Object.values(surgeon.procedures_count));
                      const percentage = (count / maxCount) * 100;
                      return (
                        <div key={procedure}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-white text-sm capitalize">
                              {procedure.replace(/_/g, ' ')}
                            </span>
                            <span className="text-gold-400 font-bold text-sm">{count}</span>
                          </div>
                          <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-gold-400 h-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Board Certifications */}
              {surgeon.certifications && surgeon.certifications.length > 0 && (
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 scroll-reveal">
                  <h3 className="text-gold-400 uppercase tracking-[0.2em] text-xs font-bold mb-4">
                    Board Certifications
                  </h3>
                  <div className="space-y-3">
                    {surgeon.certifications.map((cert, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="shrink-0 w-5 h-5 rounded-full bg-gold-400 flex items-center justify-center mt-0.5">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <span className="text-white text-sm leading-relaxed">{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Content - Main Info */}
            <div className="flex-1">
              <div className="mb-8">
                <div className="font-serif text-3xl italic tracking-wide text-white">Medora Health</div>
                <div className="text-xs uppercase tracking-[0.2em] font-light text-sage-200 border-t border-sage-200/30 pt-1 mt-1 inline-block">
                  Center for Plastic Surgery
                </div>
              </div>

              {/* Breadcrumb */}
              <div className="text-[10px] md:text-xs uppercase tracking-widest mb-4 font-sans">
                <button
                  onClick={() => navigate('/')}
                  className="text-gold-500 hover:text-gold-400 transition-colors"
                >
                  Home
                </button>
                <span className="mx-2 text-white/40">|</span>
                <button
                  onClick={() => navigate('/surgeons')}
                  className="text-gold-500 hover:text-gold-400 transition-colors"
                >
                  About
                </button>
                <span className="mx-2 text-white/40">|</span>
                <button
                  onClick={() => navigate('/surgeons')}
                  className="text-gold-500 hover:text-gold-400 transition-colors"
                >
                  Our Surgeons
                </button>
                <span className="mx-2 text-white/40">|</span>
                <span className="text-white">{surgeon.name}</span>
              </div>

              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-white uppercase tracking-wide font-light mb-4 leading-tight scroll-reveal">
                {surgeon.name}
              </h1>

              <p className="text-sage-100 text-base md:text-lg mb-8 font-light scroll-reveal">
                {surgeon.title}
              </p>

              <p className="text-sage-200 text-lg leading-relaxed mb-10 max-w-lg font-light scroll-reveal">
                {surgeon.bio.intro}
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                <div className="flex items-center gap-2 text-sage-200">
                  <Calendar size={18} />
                  <span>{surgeon.experience_years}+ Years Experience</span>
                </div>
                <div className="flex items-center gap-2 text-sage-200">
                  <Award size={18} />
                  <span>{surgeon.specialties.length} Specialties</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/contact')}
                className="bg-[#8b5e3c] text-white px-8 py-4 uppercase tracking-[0.15em] text-sm font-bold hover:bg-[#6d4a2f] transition-colors"
              >
                Request A Consultation
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EXPERTISE SECTION */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <div className="lg:w-1/2">
              <h2 className="font-serif text-4xl md:text-5xl text-navy-900 mb-8 leading-tight scroll-reveal">
                Expertise & Specialization
              </h2>
              <div className="prose prose-lg text-stone-600 leading-relaxed font-light">
                <div dangerouslySetInnerHTML={{ __html: surgeon.bio.expertise.replace(/\n\n/g, '</p><p class="mb-4">') }} />
              </div>
            </div>

            {/* Specialties Card */}
            <div className="lg:w-1/2">
              <div className="bg-sage-50 p-8 border border-sage-100 scroll-reveal">
                <h3 className="font-serif text-2xl text-navy-900 mb-6">Areas of Specialization</h3>
                <div className="grid grid-cols-1 gap-3">
                  {surgeon.specialties.map((specialty, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-stone-700">
                      <div className="w-2 h-2 bg-gold-600 rounded-full"></div>
                      <span className="font-medium">{specialty}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Languages */}
              {surgeon.languages && surgeon.languages.length > 0 && (
                <div className="mt-8 bg-white border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Languages size={24} className="text-gold-600" />
                    <h3 className="font-serif text-xl text-navy-900">Languages Spoken</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {surgeon.languages.map((lang, idx) => (
                      <span key={idx} className="bg-sage-50 text-stone-700 px-4 py-2 text-sm rounded-full">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. STATS - Procedures Count */}
      {totalProcedures > 0 && (
        <section className="py-20 bg-sage-50">
          <div className="container mx-auto px-6 text-center">
            <h2 className="font-serif text-4xl md:text-5xl text-navy-900 mb-6 scroll-reveal">
              Expertise Refined Through Experience
            </h2>
            <p className="text-stone-500 text-lg mb-16 max-w-2xl mx-auto font-light">
              {surgeon.name} has performed thousands of procedures with consistently excellent results.
            </p>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {Object.entries(surgeon.procedures_count).map(([procedure, count], idx) => (
                <div key={idx} className="bg-white p-10 shadow-sm hover:shadow-md transition-shadow border border-sage-100 scroll-reveal">
                  <div className="font-serif text-5xl md:text-6xl text-navy-900 mb-2">{count.toLocaleString()}+</div>
                  <div className="text-gold-600 font-bold uppercase tracking-widest text-sm">
                    {procedure.replace(/_/g, ' ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. CREDENTIALS & EDUCATION */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16">
            {/* Left Column - Image */}
            <div className="lg:w-1/2">
              <img
                src={placeholderOfficeImage}
                alt={`${surgeon.name} at conference`}
                className="w-full h-auto shadow-lg mb-6"
              />

              {/* Education */}
              <div className="mt-12 space-y-4 scroll-reveal">
                <div className="flex items-center gap-3 mb-4">
                  <GraduationCap size={24} className="text-gold-600" />
                  <h3 className="font-serif text-2xl text-navy-900">Education & Training</h3>
                </div>
                <div className="space-y-4">
                  {surgeon.education.map((edu, idx) => (
                    <div key={idx} className="pl-4 border-l-2 border-gold-200">
                      <p className="text-stone-600 font-light">{edu}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Certifications & Achievements */}
            <div className="lg:w-1/2">
              <div className="mb-12 scroll-reveal">
                <div className="flex items-center gap-3 mb-6">
                  <Award size={24} className="text-gold-600" />
                  <h2 className="font-serif text-3xl text-navy-900">Board Certifications</h2>
                </div>
                <div className="space-y-4">
                  {surgeon.certifications.map((cert, idx) => (
                    <div key={idx} className="bg-sage-50 p-4 border-l-4 border-gold-600">
                      <p className="text-stone-700 font-medium">{cert}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              {surgeon.bio.achievements && surgeon.bio.achievements.length > 0 && (
                <div className="mb-12 scroll-reveal">
                  <h2 className="font-serif text-3xl text-navy-900 mb-6 border-b border-gold-200 pb-4">
                    Notable Achievements
                  </h2>
                  <ul className="space-y-4">
                    {surgeon.bio.achievements.map((achievement, idx) => (
                      <li key={idx} className="flex gap-3 text-stone-600 font-light">
                        <span className="text-gold-500 mt-1 shrink-0">•</span>
                        <span>{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 5. PHILOSOPHY QUOTE */}
      <section className="py-24 bg-[#f5f0eb]">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="flex gap-6 md:gap-10">
            <div className="w-2 md:w-3 bg-[#8b5e3c] shrink-0"></div>
            <div>
              <h2 className="font-serif text-3xl md:text-4xl text-navy-900 mb-2 leading-tight">
                Philosophy
              </h2>
              <div className="text-stone-600 text-lg leading-relaxed font-light mb-8">
                {surgeon.bio.philosophy.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-4">{paragraph}</p>
                ))}
              </div>
              <p className="text-navy-900 font-bold text-xl font-serif">
                {surgeon.name}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CTA SECTION */}
      <section className="py-24 bg-navy-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-serif text-4xl md:text-5xl mb-6">
            Schedule Your Consultation
          </h2>
          <p className="text-sage-200 text-lg max-w-2xl mx-auto mb-10 font-light">
            Take the first step towards achieving your aesthetic goals with {surgeon.name}.
            Schedule a personalized consultation to discuss your needs and learn about your options.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => navigate('/contact')}
              className="bg-gold-600 text-white px-12 py-4 uppercase tracking-[0.15em] text-sm font-bold hover:bg-gold-500 transition-colors"
            >
              Book Consultation
            </button>
            <button
              onClick={() => navigate('/surgeons')}
              className="bg-transparent border-2 border-white text-white px-12 py-4 uppercase tracking-[0.15em] text-sm font-bold hover:bg-white hover:text-navy-900 transition-colors"
            >
              View All Surgeons
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SurgeonProfile;
