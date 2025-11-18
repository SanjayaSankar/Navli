import React from 'react';
import { Menu, Compass } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-6 py-4 pointer-events-none">
      <div className="flex justify-between items-center max-w-7xl mx-auto pointer-events-auto">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all hover:scale-105 backdrop-blur-md"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-2 select-none">
            <div className="relative w-8 h-8">
               <div className="absolute inset-0 bg-gradient-to-tr from-red-500 to-purple-600 rounded-lg rotate-3"></div>
               <div className="absolute inset-0 bg-black rounded-lg flex items-center justify-center border border-white/10">
                  <Compass className="w-5 h-5 text-red-400" />
               </div>
            </div>
            <span className="text-2xl font-bold tracking-tighter font-display">
              Navli
            </span>
          </div>
        </div>
        
        {/* Right side status or profile placeholder */}
        <div className="hidden md:flex items-center gap-4">
           <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/50 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              AI Online
           </div>
        </div>
      </div>
    </header>
  );
};

export default Header;