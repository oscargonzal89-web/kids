import React from 'react';
import { Button } from './ui/button';
import { Cloud } from 'lucide-react';

interface SplashScreenProps {
  onStart: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-cream-light flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center space-y-8 max-w-md">
        {/* Logo KIDS grande */}
        <h1 className="text-6xl font-bold text-pink-400 font-poppins-rounded">
          KIDS
        </h1>

        {/* Ilustración de Nani (nube sonriente) */}
        <div className="relative">
          <Cloud className="w-32 h-32 text-lavender-300 fill-lavender-200" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Mensaje de bienvenida */}
        <div className="text-center space-y-4">
          <p className="text-xl text-gray-700 font-nunito leading-relaxed">
            Hola, soy <span className="font-semibold text-lavender-400">Nani</span> 💬
          </p>
          <p className="text-lg text-gray-600 font-nunito">
            Estoy aquí para acompañarte a ti y a tu hij@.
          </p>
        </div>

        {/* Botón comenzar */}
        <Button
          onClick={onStart}
          className="bg-pink-300 hover:bg-pink-400 text-white font-poppins-rounded px-8 py-6 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Comenzar
        </Button>
      </div>
    </div>
  );
};


