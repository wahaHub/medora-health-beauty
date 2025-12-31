import React from 'react';
import { Sparkles, Eye, Scissors, Heart } from 'lucide-react';
import { ServiceItem } from '../types';

const Services: React.FC = () => {
  const services: ServiceItem[] = [
    {
      title: "面部轮廓",
      description: "通过精细化手术改善面部线条，打造精致上镜的小V脸。",
      image: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=800&q=80",
      icon: <Sparkles className="w-6 h-6" />
    },
    {
      title: "眼鼻整形",
      description: "针对东方人面部特点，定制个性化眼鼻综合整形方案。",
      image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80",
      icon: <Eye className="w-6 h-6" />
    },
    {
      title: "身体塑形",
      description: "吸脂塑形与丰胸手术，助您重塑S型迷人曲线。",
      image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80",
      icon: <Heart className="w-6 h-6" />
    },
    {
      title: "微整注射",
      description: "非手术类抗衰老项目，快速恢复，即刻见效。",
      image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80",
      icon: <Scissors className="w-6 h-6" />
    }
  ];

  return (
    <section id="services" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl text-navy-900 mb-4">核心项目</h2>
          <div className="w-20 h-1 bg-gold-500 mx-auto mb-6"></div>
          <p className="text-stone-500 max-w-2xl mx-auto">
            我们提供全方位的医疗美容服务，从面部年轻化到身体塑形，每一项服务都经过严格的安全评估。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div key={index} className="group cursor-pointer">
              <div className="relative overflow-hidden aspect-[3/4] mb-6">
                <img 
                  src={service.image} 
                  alt={service.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-navy-900/0 group-hover:bg-navy-900/20 transition-colors duration-300"></div>
                <div className="absolute bottom-4 left-4 bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 text-gold-600">
                  {service.icon}
                </div>
              </div>
              <h3 className="font-serif text-2xl text-navy-900 mb-2 group-hover:text-gold-600 transition-colors">{service.title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;