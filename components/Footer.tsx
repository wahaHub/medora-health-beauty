import React from 'react';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-100 pt-16 pb-8 border-t border-stone-200">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand */}
          <div>
            <div className="mb-6 flex items-baseline gap-2 leading-none">
              <span className="font-serif text-2xl tracking-widest font-bold text-navy-900">
                MEDORA HEALTH
              </span>
              <span className="text-xs uppercase tracking-[0.2em] text-gold-500 font-medium">
                : BEAUTY
              </span>
            </div>
            <p className="text-stone-500 text-sm leading-relaxed mb-6">
              Medora Health : Beauty 致力于为每一位求美者提供世界级的医疗美容服务。我们相信美是独特的，是个性的，是需要精心呵护的。
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-navy-900 hover:text-gold-500 transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-navy-900 hover:text-gold-500 transition-colors"><Facebook size={20} /></a>
              <a href="#" className="text-navy-900 hover:text-gold-500 transition-colors"><Twitter size={20} /></a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-serif text-navy-900 text-lg mb-6">快速链接</h4>
            <ul className="space-y-3 text-sm text-stone-500">
              <li><a href="#" className="hover:text-gold-600 transition-colors">关于我们</a></li>
              <li><a href="#" className="hover:text-gold-600 transition-colors">专家团队</a></li>
              <li><a href="#" className="hover:text-gold-600 transition-colors">整形项目</a></li>
              <li><a href="#" className="hover:text-gold-600 transition-colors">成功案例</a></li>
              <li><a href="#" className="hover:text-gold-600 transition-colors">隐私政策</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-serif text-navy-900 text-lg mb-6">热门项目</h4>
            <ul className="space-y-3 text-sm text-stone-500">
              <li><a href="#" className="hover:text-gold-600 transition-colors">鼻部综合整形</a></li>
              <li><a href="#" className="hover:text-gold-600 transition-colors">眼部年轻化</a></li>
              <li><a href="#" className="hover:text-gold-600 transition-colors">360度环吸</a></li>
              <li><a href="#" className="hover:text-gold-600 transition-colors">自体脂肪填充</a></li>
              <li><a href="#" className="hover:text-gold-600 transition-colors">热玛吉抗衰</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-navy-900 text-lg mb-6">联系方式</h4>
            <ul className="space-y-4 text-sm text-stone-500">
              <li className="flex items-start gap-3">
                <MapPin className="text-gold-500 shrink-0 mt-0.5" size={18} />
                <span>北京市朝阳区建国路88号<br/>华贸中心 1座 28层</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-gold-500 shrink-0" size={18} />
                <span>400-888-8888</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-gold-500 shrink-0" size={18} />
                <span>consult@medora-health.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-200 pt-8 text-center text-xs text-stone-400">
          <p>&copy; {new Date().getFullYear()} Medora Health : Beauty. All rights reserved. 医疗广告审查证明文号：(京)医广【2024】第01-01-01号</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;