import React from 'react';
import { motion } from 'framer-motion';

function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300  border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-8 py-20">
        <div className="grid gap-12 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          
          {/* BRAND COLUMN */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-rose-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-rose-900/20">
                H
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                Hospital Connect
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Bridging the gap between healthcare providers. A unified network for real-time resource management and life-saving coordination.
            </p>
            <div className="flex gap-4">
              {['twitter', 'linkedin', 'facebook'].map((social) => (
                <motion.div 
                  key={social}
                  whileHover={{ y: -3, color: '#e11d48' }}
                  className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                >
                  <span className="text-xs uppercase font-bold">{social[0]}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Platform</h3>
            <ul className="space-y-4 text-sm">
              {['Network Map', 'Hospital Directory', 'Live Bed Status', 'Blood Reserves'].map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-rose-500 transition-colors duration-200">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* SERVICES */}
          <div>
            <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Support</h3>
            <ul className="space-y-4 text-sm">
              {['Emergency Protocol', 'Resource Requests', 'API Documentation', 'Privacy Policy'].map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-rose-500 transition-colors duration-200">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Get in Touch</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-rose-500">📍</span>
                <span>Arera Hills, Bhopal,<br /> Madhya Pradesh 462011</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-rose-500">📞</span>
                <span>+91 755 244 0000</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-rose-500">✉</span>
                <span className="hover:text-rose-500 cursor-pointer">network@hospitalconnect.in</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-500 uppercase tracking-tighter">
          <p>© 2026 Hospital Connect Network. Empowering Healthcare.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition">Terms</a>
            <a href="#" className="hover:text-white transition">Security</a>
            <a href="#" className="hover:text-white transition">Status</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;