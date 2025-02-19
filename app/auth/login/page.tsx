'use client';

import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/hooks/use-auth';
import { useState, useEffect } from 'react';

export default function LoginPage() {
  const { signInWithGithub } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Mouse hareketlerini takip et
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (

    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 to-white overflow-hidden">


      {/* 🌟 Mouse Takip Eden Glow Efekti */}
      <div 
        className="absolute w-[250px] h-[250px] bg-indigo-400 opacity-40 rounded-full filter blur-3xl pointer-events-none transition-transform duration-75 ease-out"
        style={{
          left: `${mousePosition.x - 125}px`,
          top: `${mousePosition.y - 125}px`,
        }}
      ></div>
      <Badge className="absolute top-4 right-4">v0.1.0</Badge>
        <div className='absolute top-4 left-4'>
      <Badge className="py-1 px-4 mb-4" variant="default" color="indigo">
                🚀 Takımlar için güçlü proje yönetimi.
      </Badge>
      </div>
      {/* Giriş Kartı */}
      <div className="relative z-10 max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-[0_0_80px_rgba(79,70,229,0.9)] 
      group transition-all duration-300 hover:shadow-[0_0_50px_rgba(79,70,229,0.9)]" >
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Jira Teknopar</h1>
          <h2 className="text-xl font-medium text-gray-600">
            Proje yönetimi artık daha kolay <br />
          </h2>
        </div>

        <div className="mt-8">
          <div className="space-y-4">
            <button
              onClick={signInWithGithub}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-[#24292F]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#24292F]/50 transition-all duration-200"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.934.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.137 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
              </svg>
              GitHub ile Giriş Yap
            </button>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-center text-sm text-gray-500">
            GitHub hesabınızla giriş yaparak başlayın. Tüm projelerinizi ve görevlerinizi tek bir yerden yönetin.
          </p>
        </div>
      </div>

    </div>

    
    
  );
}
