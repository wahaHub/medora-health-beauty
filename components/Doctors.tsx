import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { Loader2 } from 'lucide-react';

interface Surgeon {
  surgeon_id: string;
  name: string;
  title: string;
  specialties: string[];
  experience_years: number;
  image_url: string | null;
}

interface DoctorCardProps {
  surgeon: Surgeon;
  onClick: () => void;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ surgeon, onClick }) => {
  const placeholderImage = "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2670&auto=format&fit=crop";

  return (
    <div
      className="group cursor-pointer flex flex-col items-center md:items-start"
      onClick={onClick}
    >
      {/* Image Container - Fashion Editorial Style */}
      <div className="relative w-full aspect-[3/4] overflow-hidden mb-6 bg-stone-100">
        <img
          src={surgeon.image_url || placeholderImage}
          alt={surgeon.name}
          className="w-full h-full object-cover object-top transition-transform duration-[1.5s] ease-out group-hover:scale-105 filter grayscale-[20%] group-hover:grayscale-0"
        />
        {/* Subtle overlay on hover */}
        <div className="absolute inset-0 bg-navy-900/0 group-hover:bg-navy-900/10 transition-colors duration-500"></div>
      </div>

      {/* Text Content */}
      <div className="text-center md:text-left w-full">
        <h3 className="font-serif text-2xl text-navy-900 mb-1 group-hover:text-gold-600 transition-colors duration-300">
          {surgeon.name}
        </h3>
        <p className="text-gold-600 text-[10px] uppercase tracking-[0.2em] font-bold mb-2">
          {surgeon.specialties[0] || 'Plastic Surgery'}
        </p>
        <div className="w-8 h-[1px] bg-stone-300 mb-3 mx-auto md:mx-0 group-hover:w-16 group-hover:bg-gold-500 transition-all duration-500"></div>
        <p className="text-stone-500 text-xs leading-relaxed font-light uppercase tracking-wider">
          {surgeon.title}
        </p>
      </div>
    </div>
  );
};

const Doctors: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [surgeons, setSurgeons] = useState<Surgeon[]>([]);
  const [totalSurgeons, setTotalSurgeons] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSurgeons = async () => {
      try {
        const response = await fetch('https://www.medorabeauty.com/api/surgeons');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            // Get unique surgeons from all specialties
            const allSurgeons = Object.values(result.data.surgeonsBySpecialty).flat() as Surgeon[];
            const uniqueSurgeons = allSurgeons.filter((surgeon: Surgeon, index: number, self: Surgeon[]) =>
              index === self.findIndex((s: Surgeon) => s.surgeon_id === surgeon.surgeon_id)
            );
            // Sort by name and take first 8 for display
            const sortedSurgeons = uniqueSurgeons
              .sort((a, b) => a.name.localeCompare(b.name))
              .slice(0, 8);
            setSurgeons(sortedSurgeons);
            setTotalSurgeons(result.data.totalSurgeons || uniqueSurgeons.length);
          }
        }
      } catch (error) {
        console.error('Failed to fetch surgeons:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSurgeons();
  }, []);

  if (loading) {
    return (
      <section className="bg-white pb-24 pt-12">
        <div className="container mx-auto px-6 flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-12 h-12 text-gold-600 animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white pb-24 pt-12">
      <div className="container mx-auto px-6">
        {/* Grid Layout: 1 col mobile, 2 col tablet, 3 col desktop, 4 col large desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
          {surgeons.map((surgeon) => (
            <DoctorCard
              key={surgeon.surgeon_id}
              surgeon={surgeon}
              onClick={() => navigate(`/surgeon/${surgeon.surgeon_id}`)}
            />
          ))}
        </div>

        {/* 'View All' Button */}
        <div className="mt-20 text-center">
            <button
              onClick={() => navigate('/surgeons')}
              className="border border-navy-900 text-navy-900 px-12 py-4 uppercase tracking-[0.2em] text-xs font-bold hover:bg-navy-900 hover:text-white transition-all duration-300"
            >
              {t('viewAllSurgeons')} {totalSurgeons} {t('viewAllSurgeonsCount')}
            </button>
        </div>
      </div>
    </section>
  );
};

export default Doctors;
