import React from 'react';
import { ArrowRight } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
          alt="Elegant woman skin" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-200/40 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 relative z-10 text-center md:text-left pt-20">
        <div className="max-w-2xl">
          <p className="text-gold-600 tracking-[0.2em] uppercase text-sm font-semibold mb-4 animate-fade-in-up">
            Rediscover Your Confidence
          </p>
          <h1 className="font-serif text-5xl md:text-7xl text-navy-900 leading-tight mb-6 animate-fade-in-up delay-100">
            精雕细琢 <br/>
            <span className="italic font-light">诠释自然之美</span>
          </h1>
          <p className="text-stone-600 text-lg mb-10 max-w-lg leading-relaxed animate-fade-in-up delay-200">
            YiMei 艺美整形中心致力于将医学与艺术完美融合。我们拥有世界顶级的医疗团队，为您提供安全、私密、个性化的美学定制方案。
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 animate-fade-in-up delay-300">
            <button className="bg-navy-900 text-white px-8 py-4 uppercase tracking-widest hover:bg-navy-800 transition-colors">
              探索我们的服务
            </button>
            <button className="border border-navy-900 text-navy-900 px-8 py-4 uppercase tracking-widest hover:bg-navy-900 hover:text-white transition-colors flex items-center justify-center gap-2">
              在线评估 <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;