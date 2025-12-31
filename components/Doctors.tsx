import React from 'react';

interface DoctorProps {
  name: string;
  title: string;
  specialty: string;
  image: string;
}

const DoctorCard: React.FC<DoctorProps> = ({ name, title, specialty, image }) => {
  return (
    <div className="group cursor-pointer flex flex-col items-center md:items-start">
      {/* Image Container - Fashion Editorial Style */}
      <div className="relative w-full aspect-[3/4] overflow-hidden mb-6 bg-stone-100">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover object-top transition-transform duration-[1.5s] ease-out group-hover:scale-105 filter grayscale-[20%] group-hover:grayscale-0"
        />
        {/* Subtle overlay on hover */}
        <div className="absolute inset-0 bg-navy-900/0 group-hover:bg-navy-900/10 transition-colors duration-500"></div>
      </div>

      {/* Text Content */}
      <div className="text-center md:text-left w-full">
        <h3 className="font-serif text-2xl text-navy-900 mb-1 group-hover:text-gold-600 transition-colors duration-300">
          {name}
        </h3>
        <p className="text-gold-600 text-[10px] uppercase tracking-[0.2em] font-bold mb-2">
          {specialty}
        </p>
        <div className="w-8 h-[1px] bg-stone-300 mb-3 mx-auto md:mx-0 group-hover:w-16 group-hover:bg-gold-500 transition-all duration-500"></div>
        <p className="text-stone-500 text-xs leading-relaxed font-light uppercase tracking-wider">
          {title}
        </p>
      </div>
    </div>
  );
};

const Doctors: React.FC = () => {
  // Simulating a larger list of doctors to demonstrate the grid
  const doctors: DoctorProps[] = [
    {
      name: "Dr. Zhang Yimei",
      title: "Double Board-Certified Surgeon",
      specialty: "Facial Rejuvenation",
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=2665&auto=format&fit=crop",
    },
    {
      name: "Dr. Michael Chen",
      title: "Board-Certified Plastic Surgeon",
      specialty: "Body Contouring",
      image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=2670&auto=format&fit=crop",
    },
    {
      name: "Dr. Sarah Lin",
      title: "Board-Certified Surgeon",
      specialty: "Breast Specialist",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=1740&auto=format&fit=crop",
    },
    {
      name: "Dr. David Wang",
      title: "Facial Plastic Surgeon",
      specialty: "Rhinoplasty Expert",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2670&auto=format&fit=crop",
    },
    {
      name: "Dr. Emily Zhao",
      title: "Dermatologist",
      specialty: "Non-Surgical Injectables",
      image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=1587&auto=format&fit=crop",
    },
    {
      name: "Dr. James Liu",
      title: "Reconstructive Surgeon",
      specialty: "Mohs Reconstruction",
      image: "https://images.unsplash.com/photo-1622902046580-2b47f47f5471?q=80&w=2574&auto=format&fit=crop",
    },
    {
      name: "Dr. Sophia Wu",
      title: "Aesthetic Specialist",
      specialty: "Laser Treatments",
      image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?q=80&w=2652&auto=format&fit=crop",
    },
    {
      name: "Dr. Robert Yang",
      title: "Plastic Surgeon",
      specialty: "Liposuction & Sculpting",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=2574&auto=format&fit=crop",
    }
  ];

  return (
    <section className="bg-white pb-24 pt-12">
      <div className="container mx-auto px-6">
        {/* Grid Layout: 1 col mobile, 2 col tablet, 3 col desktop, 4 col large desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
          {doctors.map((doc, index) => (
            <DoctorCard key={index} {...doc} />
          ))}
        </div>
        
        {/* 'View All' Button if there are dozens */}
        <div className="mt-20 text-center">
            <button className="border border-navy-900 text-navy-900 px-12 py-4 uppercase tracking-[0.2em] text-xs font-bold hover:bg-navy-900 hover:text-white transition-all duration-300">
              View All 32 Surgeons
            </button>
        </div>
      </div>
    </section>
  );
};

export default Doctors;