import React from 'react';

const About: React.FC = () => {
  return (
    <section id="about" className="py-24 bg-gold-100">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          <div className="lg:w-1/2 relative">
            <div className="relative z-10">
              <img 
                src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=1000&q=80" 
                alt="Dr. Zhang Profile" 
                className="w-full shadow-xl rounded-sm"
              />
            </div>
            {/* Decorative border */}
            <div className="absolute top-8 left-8 w-full h-full border-2 border-gold-400 z-0 hidden md:block"></div>
          </div>

          <div className="lg:w-1/2">
            <h4 className="text-gold-600 uppercase tracking-widest text-sm font-bold mb-2">Meet Our Surgeon</h4>
            <h2 className="font-serif text-4xl md:text-5xl text-navy-900 mb-6">张艺美 博士</h2>
            <p className="text-xl text-navy-800 font-serif italic mb-6">
              "整形不仅是医学技术，更是一门关于平衡与和谐的艺术。"
            </p>
            <div className="space-y-4 text-stone-600 mb-8">
              <p>
                作为艺美整形中心的首席专家，张博士拥有超过20年的临床经验。她曾在韩国、美国顶级整形机构进修，擅长将东方美学与现代医学技术相结合。
              </p>
              <p>
                她坚持“微创、自然、个性化”的手术理念，已成功为数万名求美者完成了美丽蜕变。她相信，真正的美不是改变你，而是让你成为更好的自己。
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <span className="block text-3xl font-serif text-gold-600">20+</span>
                <span className="text-sm uppercase tracking-wide text-stone-500">年从业经验</span>
              </div>
              <div>
                <span className="block text-3xl font-serif text-gold-600">15k+</span>
                <span className="text-sm uppercase tracking-wide text-stone-500">成功案例</span>
              </div>
            </div>

            <button className="text-navy-900 border-b border-navy-900 pb-1 hover:text-gold-600 hover:border-gold-600 transition-colors uppercase tracking-widest text-sm">
              查看医生详细履历
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;