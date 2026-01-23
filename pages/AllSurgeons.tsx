import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, GraduationCap, Clock, Loader2 } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface Surgeon {
  surgeon_id: string;
  name: string;
  title: string;
  specialties: string[];
  experience_years: number;
  image_url: string | null;
  images?: {
    hero?: string;
    [key: string]: string | undefined;
  };
}

interface SurgeonsAPIResponse {
  success: boolean;
  data: {
    surgeonsBySpecialty: { [key: string]: Surgeon[] };
    allSpecialties: string[];
    totalSurgeons: number;
  };
}

const AllSurgeons: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("All");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [surgeonsData, setSurgeonsData] = useState<{
    surgeonsBySpecialty: { [key: string]: Surgeon[] };
    allSpecialties: string[];
    totalSurgeons: number;
  } | null>(null);

  // Enable scroll reveal animations - only after data is loaded
  useScrollReveal(!loading && surgeonsData !== null);

  // Fetch surgeons data from API
  useEffect(() => {
    const fetchSurgeons = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://www.medorabeauty.com/api/surgeons');

        if (!response.ok) {
          throw new Error('Failed to fetch surgeons data');
        }

        const result: SurgeonsAPIResponse = await response.json();

        if (result.success) {
          setSurgeonsData(result.data);
        } else {
          throw new Error('API returned unsuccessful response');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching surgeons:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSurgeons();
  }, []);

  // Get all surgeons as flat array
  const allSurgeons = surgeonsData
    ? Object.values(surgeonsData.surgeonsBySpecialty).flat()
    : [];

  // Remove duplicates based on surgeon_id
  const uniqueSurgeons = allSurgeons.filter((surgeon: Surgeon, index: number, self: Surgeon[]) =>
    index === self.findIndex((s: Surgeon) => s.surgeon_id === surgeon.surgeon_id)
  );

  // Filter surgeons by specialty
  const filteredSurgeons = selectedSpecialty === "All"
    ? uniqueSurgeons
    : (surgeonsData?.surgeonsBySpecialty[selectedSpecialty] || []);

  // Placeholder image for surgeons without photos
  const placeholderImage = "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2670&auto=format&fit=crop";

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-navy-900 text-white py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-gold-600/20 to-transparent"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-6">
              <span className="text-gold-400 uppercase tracking-[0.3em] text-xs font-bold border-b border-gold-400 pb-2">
                Excellence in Plastic Surgery
              </span>
            </div>

            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl mb-6 leading-tight scroll-reveal">
              Meet Our Surgical Team
            </h1>

            <p className="text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto scroll-reveal">
              Board-certified plastic surgeons dedicated to delivering exceptional results with the highest standards of care and artistry.
            </p>

            {/* Stats */}
            {!loading && surgeonsData && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto scroll-reveal">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gold-400 mb-2">{surgeonsData.totalSurgeons}+</div>
                  <div className="text-sm uppercase tracking-wider text-gray-400">Expert Surgeons</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-gold-400 mb-2">{surgeonsData.allSpecialties.length}+</div>
                  <div className="text-sm uppercase tracking-wider text-gray-400">Specialties</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-gold-400 mb-2">15K+</div>
                  <div className="text-sm uppercase tracking-wider text-gray-400">Procedures Performed</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-gold-400 mb-2">98%</div>
                  <div className="text-sm uppercase tracking-wider text-gray-400">Patient Satisfaction</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Filter Section */}
      {!loading && surgeonsData && (
        <section className="py-12 border-b border-gray-200 bg-white shadow-sm">
          <div className="container mx-auto px-6">
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => setSelectedSpecialty("All")}
                className={`px-6 py-2 rounded-full text-sm font-medium tracking-wide transition-all duration-300 ${
                  selectedSpecialty === "All"
                    ? 'bg-navy-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Surgeons ({uniqueSurgeons.length})
              </button>
              {surgeonsData.allSpecialties.slice(0, 15).map((specialty: string) => (
                <button
                  key={specialty}
                  onClick={() => setSelectedSpecialty(specialty)}
                  className={`px-6 py-2 rounded-full text-sm font-medium tracking-wide transition-all duration-300 ${
                    selectedSpecialty === specialty
                      ? 'bg-navy-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {specialty}
                </button>
              ))}
            </div>
            {surgeonsData.allSpecialties.length > 15 && (
              <div className="text-center mt-4">
                <p className="text-sm text-gray-500">
                  + {surgeonsData.allSpecialties.length - 15} more specialties available
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Loading State */}
      {loading && (
        <section className="py-32">
          <div className="container mx-auto px-6">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-12 h-12 text-gold-600 animate-spin" />
              <p className="text-gray-600 text-lg">Loading our expert surgeons...</p>
            </div>
          </div>
        </section>
      )}

      {/* Error State */}
      {error && !loading && (
        <section className="py-32">
          <div className="container mx-auto px-6">
            <div className="text-center">
              <p className="text-red-600 text-lg mb-4">Error loading surgeons: {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-navy-900 text-white px-8 py-3 rounded-lg hover:bg-navy-800 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Surgeons Grid */}
      {!loading && !error && surgeonsData && (
        <section className="py-20">
          <div className="container mx-auto px-6">
            {selectedSpecialty !== "All" && (
              <div className="mb-12 text-center">
                <h2 className="font-serif text-3xl md:text-4xl text-navy-900 mb-4">
                  {selectedSpecialty} Specialists
                </h2>
                <p className="text-gray-600">
                  {filteredSurgeons.length} {filteredSurgeons.length === 1 ? 'surgeon' : 'surgeons'} specializing in {selectedSpecialty}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {filteredSurgeons.map((surgeon: Surgeon) => (
                <div
                  key={surgeon.surgeon_id}
                  className="group bg-white border border-gray-200 hover:border-gold-400 transition-all duration-300 hover:shadow-xl overflow-hidden scroll-reveal cursor-pointer"
                  onClick={() => navigate(`/surgeon/${surgeon.surgeon_id}`)}
                >
                  {/* Image */}
                  <div className="relative h-80 overflow-hidden bg-gray-100">
                    <img
                      src={surgeon.images?.hero || surgeon.image_url || placeholderImage}
                      alt={surgeon.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-serif text-2xl text-navy-900 mb-1">
                      {surgeon.name}
                    </h3>
                    <p className="text-gold-600 text-sm font-medium mb-4 uppercase tracking-wide">
                      {surgeon.title}
                    </p>

                    {/* Info Grid */}
                    <div className="space-y-3 mb-4 text-sm">
                      <div className="flex items-start gap-2 text-gray-600">
                        <Clock size={16} className="mt-0.5 shrink-0" />
                        <span>{surgeon.experience_years}+ years Experience</span>
                      </div>
                      <div className="flex items-start gap-2 text-gray-600">
                        <GraduationCap size={16} className="mt-0.5 shrink-0" />
                        <span>Board-Certified Specialist</span>
                      </div>
                    </div>

                    {/* Specialties */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {surgeon.specialties.slice(0, 3).map((spec: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
                          >
                            {spec}
                          </span>
                        ))}
                        {surgeon.specialties.length > 3 && (
                          <span className="text-xs bg-gold-100 text-gold-700 px-3 py-1 rounded-full">
                            +{surgeon.specialties.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Certification Badge */}
                    <div className="flex items-center gap-2 mb-6 pt-4 border-t border-gray-100">
                      <Award size={16} className="text-gold-600" />
                      <span className="text-xs text-gray-600">
                        Board Certified • {surgeon.specialties.length} Specialties
                      </span>
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        navigate(`/surgeon/${surgeon.surgeon_id}`);
                      }}
                      className="w-full bg-navy-900 text-white py-3 uppercase tracking-[0.2em] text-xs font-bold hover:bg-gold-600 transition-colors duration-300"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results */}
            {filteredSurgeons.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg mb-4">No surgeons found in this specialty.</p>
                <button
                  onClick={() => setSelectedSpecialty("All")}
                  className="text-gold-600 hover:text-gold-700 font-medium"
                >
                  View All Surgeons
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA Section */}
      {!loading && !error && (
        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-6 text-center">
            <h2 className="font-serif text-4xl text-navy-900 mb-6 scroll-reveal">
              Ready to Meet Your Surgeon?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
              Schedule a consultation to discuss your goals and learn how our expert team can help you achieve the results you desire.
            </p>
            <button
              onClick={() => navigate('/contact')}
              className="bg-gold-600 text-white px-12 py-4 uppercase tracking-[0.2em] text-sm font-bold hover:bg-gold-500 transition-colors"
            >
              Schedule Consultation
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default AllSurgeons;
