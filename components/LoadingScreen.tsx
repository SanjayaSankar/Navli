import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface LoadingScreenProps {
  message: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
        <div className="bg-white p-4 rounded-2xl shadow-xl border border-blue-100 relative z-10">
           <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
        <div className="absolute -top-2 -right-2 bg-yellow-400 p-1.5 rounded-full shadow-sm z-20 animate-bounce">
           <Sparkles className="w-4 h-4 text-white" />
        </div>
      </div>
      <h3 className="mt-8 text-xl font-bold text-slate-800">{message}</h3>
      <p className="text-slate-500 mt-2 text-center max-w-sm">
        Consulting with our AI travel experts to find the perfect match for you...
      </p>
    </div>
  );
};

export default LoadingScreen;