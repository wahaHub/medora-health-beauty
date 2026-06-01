import React from 'react';

const OurTeam: React.FC = () => {
  return (
    <div className="animate-fade-in-up bg-white">
      {/* 1. Hero Section - Matching Image 3 */}
      <section className="relative h-[60vh] min-h-[500px]">
        <img 
          src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop" 
          className="w-full h-full object-cover object-center" 
          alt="YiMei Team" 
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 flex flex-col justify-center px-6 container mx-auto">
           <div className="text-white pt-20">
             <div className="text-[10px] md:text-xs uppercase tracking-widest mb-4 opacity-90 font-sans">
               Home <span className="mx-2">|</span> About <span className="mx-2">|</span> Our Team
             </div>
             <h1 className="font-serif text-5xl md:text-7xl text-white uppercase tracking-wide font-light">
               Our Team
             </h1>
           </div>
        </div>
      </section>

      {/* 2. Intro Text - Matching Image 2 Top Text */}
      <section className="py-24 bg-white text-center">
        <div className="container mx-auto px-6 max-w-4xl">
           <h2 className="font-serif text-4xl md:text-5xl text-navy-900 mb-8">Advanced Practice Providers</h2>
           <p className="text-stone-600 text-lg leading-relaxed font-light">
             While there are more than 100 amazing men and women working across YiMei practices, we'd like to introduce you to just a few whom you will encounter during your surgical journey.
           </p>
        </div>
      </section>

      {/* 3. Advanced Practice Providers Images - Matching Image 2 */}
      <section className="pb-24 bg-white">
         <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
               <div className="aspect-[3/4] bg-stone-100 relative group overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=1587&auto=format&fit=crop" 
                    alt="Advanced Practice Provider 1" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
               </div>
               <div className="aspect-[3/4] bg-stone-100 relative group overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=1740&auto=format&fit=crop" 
                    alt="Advanced Practice Provider 2" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
               </div>
            </div>
         </div>
      </section>

      {/* 4. Patient Consultants - Matching Image 1 */}
      <section className="pb-24 bg-white">
         <div className="container mx-auto px-6">
             <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {[
                  { name: "Bridget", title: "Patient Consultant", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2576&auto=format&fit=crop" },
                  { name: "Brooke", title: "Patient Consultant", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop" },
                  { name: "Erin", title: "Patient Consultant", img: "https://images.unsplash.com/photo-1598550832236-81f9376939e0?q=80&w=2070&auto=format&fit=crop" }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col h-full group cursor-pointer">
                     <div className="aspect-[3/4] overflow-hidden">
                        <img 
                          src={item.img} 
                          alt={item.name} 
                          className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                        />
                     </div>
                     {/* Dark text box at the bottom */}
                     <div className="bg-[#2a2624] text-white text-center py-10 px-4 mt-[-1px] transition-colors group-hover:bg-[#3d3632]">
                        <h3 className="font-serif text-3xl mb-2">{item.name}</h3>
                        <p className="text-stone-400 font-light text-sm uppercase tracking-widest">{item.title}</p>
                     </div>
                  </div>
                ))}
             </div>
         </div>
      </section>
    </div>
  );
};

export default OurTeam;