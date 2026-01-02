import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, GraduationCap, Clock, MapPin } from 'lucide-react';

interface Surgeon {
  id: number;
  name: string;
  title: string;
  specialty: string[];
  location: string;
  experience: string;
  education: string;
  image: string;
  certifications: string[];
  languages: string[];
  featured?: boolean;
}

// Mock data - 这里可以替换成从 Supabase 获取的真实数据
const surgeons: Surgeon[] = [
  {
    id: 1,
    name: "Dr. Vito Medora",
    title: "Founder & Lead Plastic Surgeon",
    specialty: ["Facial Surgery", "Rhinoplasty", "Deep-Plane Facelift"],
    location: "San Francisco, CA",
    experience: "20+ years",
    education: "Harvard Medical School",
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=2670&auto=format&fit=crop",
    certifications: ["Board Certified", "ASPS Member"],
    languages: ["English", "Italian", "Spanish"],
    featured: true
  },
  {
    id: 2,
    name: "Dr. Heather Lee",
    title: "Facial Plastic Surgeon",
    specialty: ["Brow Lift", "Eyelid Surgery", "Facial Rejuvenation"],
    location: "San Francisco, CA",
    experience: "15+ years",
    education: "Stanford Medical School",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2670&auto=format&fit=crop",
    certifications: ["Board Certified", "AAFPRS Fellow"],
    languages: ["English", "Korean", "Mandarin"],
    featured: true
  },
  {
    id: 3,
    name: "Dr. Michael Chen",
    title: "Body Contouring Specialist",
    specialty: ["Liposuction", "Tummy Tuck", "Body Lift"],
    location: "Los Angeles, CA",
    experience: "18+ years",
    education: "Johns Hopkins University",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2670&auto=format&fit=crop",
    certifications: ["Board Certified", "ASPS Member"],
    languages: ["English", "Mandarin", "Cantonese"]
  },
  {
    id: 4,
    name: "Dr. Sarah Thompson",
    title: "Breast Surgery Specialist",
    specialty: ["Breast Augmentation", "Breast Lift", "Breast Reduction"],
    location: "San Francisco, CA",
    experience: "12+ years",
    education: "Yale School of Medicine",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=2574&auto=format&fit=crop",
    certifications: ["Board Certified", "ASAPS Member"],
    languages: ["English", "French"]
  },
  {
    id: 5,
    name: "Dr. James Rodriguez",
    title: "Reconstructive Surgery Specialist",
    specialty: ["Scar Revision", "Post-Weight Loss Surgery", "Skin Cancer Reconstruction"],
    location: "San Diego, CA",
    experience: "22+ years",
    education: "UCLA Medical School",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=2564&auto=format&fit=crop",
    certifications: ["Board Certified", "ASPS Member"],
    languages: ["English", "Spanish"]
  },
  {
    id: 6,
    name: "Dr. Emily Zhang",
    title: "Non-Surgical Aesthetics Specialist",
    specialty: ["Injectables", "Dermal Fillers", "Skin Rejuvenation"],
    location: "San Francisco, CA",
    experience: "10+ years",
    education: "UCSF Medical School",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2576&auto=format&fit=crop",
    certifications: ["Board Certified Dermatologist"],
    languages: ["English", "Mandarin"]
  }
];

const AllSurgeons: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("All");

  // 提取所有独特的专业领域
  const allSpecialties = ["All", ...new Set(surgeons.flatMap(s => s.specialty))];

  // 筛选医生
  const filteredSurgeons = selectedSpecialty === "All" 
    ? surgeons 
    : surgeons.filter(s => s.specialty.includes(selectedSpecialty));

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
            
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl mb-6 leading-tight">
              Meet Our Surgical Team
            </h1>
            
            <p className="text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
              Board-certified plastic surgeons dedicated to delivering exceptional results with the highest standards of care and artistry.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-gold-400 mb-2">{surgeons.length}+</div>
                <div className="text-sm uppercase tracking-wider text-gray-400">Expert Surgeons</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gold-400 mb-2">10+</div>
                <div className="text-sm uppercase tracking-wider text-gray-400">Years Experience</div>
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
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-12 border-b border-gray-200 sticky top-0 bg-white z-40 shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap gap-3 justify-center">
            {allSpecialties.map((specialty) => (
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
        </div>
      </section>

      {/* Surgeons Grid */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSurgeons.map((surgeon) => (
              <div 
                key={surgeon.id}
                className="group bg-white border border-gray-200 hover:border-gold-400 transition-all duration-300 hover:shadow-xl overflow-hidden"
              >
                {/* Image */}
                <div className="relative h-80 overflow-hidden bg-gray-100">
                  {surgeon.featured && (
                    <div className="absolute top-4 left-4 z-10">
                      <span className="bg-gold-600 text-white text-xs uppercase tracking-wider px-3 py-1 font-bold">
                        Featured
                      </span>
                    </div>
                  )}
                  <img 
                    src={surgeon.image}
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
                      <span>{surgeon.experience} Experience</span>
                    </div>
                    <div className="flex items-start gap-2 text-gray-600">
                      <GraduationCap size={16} className="mt-0.5 shrink-0" />
                      <span>{surgeon.education}</span>
                    </div>
                    <div className="flex items-start gap-2 text-gray-600">
                      <MapPin size={16} className="mt-0.5 shrink-0" />
                      <span>{surgeon.location}</span>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {surgeon.specialty.slice(0, 3).map((spec, idx) => (
                        <span 
                          key={idx}
                          className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Certifications */}
                  <div className="flex items-center gap-2 mb-6 pt-4 border-t border-gray-100">
                    <Award size={16} className="text-gold-600" />
                    <span className="text-xs text-gray-600">
                      {surgeon.certifications.join(" • ")}
                    </span>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => navigate(`/surgeon/${surgeon.name.replace('Dr. ', '').replace(' ', '-').toLowerCase()}`)}
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
              <p className="text-gray-500 text-lg">No surgeons found in this specialty.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-serif text-4xl text-navy-900 mb-6">
            Ready to Meet Your Surgeon?
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
            Schedule a consultation to discuss your goals and learn how our expert team can help you achieve the results you desire.
          </p>
          <button className="bg-gold-600 text-white px-12 py-4 uppercase tracking-[0.2em] text-sm font-bold hover:bg-gold-500 transition-colors">
            Schedule Consultation
          </button>
        </div>
      </section>
    </div>
  );
};

export default AllSurgeons;

