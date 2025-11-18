import React from 'react';
import { Bell, Shield, Globe, Moon, Volume2, HelpCircle, ChevronRight } from 'lucide-react';

const Settings: React.FC = () => {
  const settingSections = [
    {
      title: "Preferences",
      items: [
        { icon: Globe, label: "Currency", value: "INR (₹)" },
        { icon: Globe, label: "Language", value: "English (UK)" },
        { icon: Moon, label: "Theme", value: "Dark Nebula" },
      ]
    },
    {
      title: "Notifications",
      items: [
        { icon: Bell, label: "Push Notifications", toggle: true },
        { icon: Volume2, label: "Sound Effects", toggle: true },
      ]
    },
    {
      title: "Privacy & Security",
      items: [
        { icon: Shield, label: "Privacy Policy", link: true },
        { icon: HelpCircle, label: "Help Center", link: true },
      ]
    }
  ];

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500 pb-20">
      <h2 className="text-4xl font-bold text-white mb-8">Settings</h2>

      <div className="space-y-8">
        {settingSections.map((section, idx) => (
          <div key={idx}>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-4 pl-2">{section.title}</h3>
            <div className="glass-panel rounded-2xl overflow-hidden">
              {section.items.map((item, itemIdx) => (
                <div 
                  key={itemIdx} 
                  className="p-4 flex items-center justify-between border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 group-hover:text-white group-hover:scale-110 transition-all">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-white">{item.label}</span>
                  </div>

                  {item.value && (
                    <div className="flex items-center gap-2 text-white/40 group-hover:text-white/60 transition-colors">
                      <span className="text-sm">{item.value}</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  )}

                  {item.toggle && (
                    <div className="w-12 h-6 bg-red-500/20 rounded-full border border-red-500/30 relative p-1">
                      <div className="w-4 h-4 bg-red-500 rounded-full shadow-lg shadow-red-500/50 translate-x-6 transition-transform"></div>
                    </div>
                  )}
                  
                  {item.link && (
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-white/20 text-xs">Navli App v2.4.0 (Pro)</p>
      </div>
    </div>
  );
};

export default Settings;