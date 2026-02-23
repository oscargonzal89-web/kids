import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Cloud, Check } from 'lucide-react';

interface OnboardingHomeProps {
  onComplete: (data: HomeData) => void;
  childName?: string;
}

export interface HomeData {
  hasPets: boolean;
  sleepTime: string;
  mealTime: string;
}

export const OnboardingHome: React.FC<OnboardingHomeProps> = ({ onComplete, childName }) => {
  const [formData, setFormData] = useState<HomeData>({
    hasPets: false,
    sleepTime: '',
    mealTime: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.sleepTime && formData.mealTime) {
      onComplete(formData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-mint-100 to-mint-200 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Avatar de Nani */}
        <div className="flex justify-center">
          <Cloud className="w-20 h-20 text-lavender-300 fill-lavender-200" />
        </div>

        {/* Mensaje de Nani */}
        <div className="text-center space-y-2">
          <p className="text-xl text-gray-700 font-nunito">
            Último paso! 💚
          </p>
          <p className="text-lg text-gray-700 font-nunito">
            {childName && `¿A qué hora suele dormirse ${childName}? `}
            Puedo ayudarte a crear su rutina.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg">
          <div className="space-y-2">
            <Label htmlFor="sleepTime" className="text-gray-700 font-nunito">
              Hora de dormir
            </Label>
            <Input
              id="sleepTime"
              type="time"
              value={formData.sleepTime}
              onChange={(e) => setFormData({ ...formData, sleepTime: e.target.value })}
              className="rounded-xl border-lavender-200 focus:border-lavender-400"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mealTime" className="text-gray-700 font-nunito">
              Hora de comida principal
            </Label>
            <Input
              id="mealTime"
              type="time"
              value={formData.mealTime}
              onChange={(e) => setFormData({ ...formData, mealTime: e.target.value })}
              className="rounded-xl border-lavender-200 focus:border-lavender-400"
              required
            />
          </div>

          <div className="space-y-3">
            <Label className="text-gray-700 font-nunito">
              ¿Tienen mascotas en casa?
            </Label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, hasPets: true })}
                className={`flex-1 py-4 rounded-xl border-4 transition-all font-nunito ${
                  formData.hasPets
                    ? 'border-mint-500 bg-mint-100 text-mint-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-mint-300'
                }`}
              >
                Sí 🐾
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, hasPets: false })}
                className={`flex-1 py-4 rounded-xl border-4 transition-all font-nunito ${
                  !formData.hasPets
                    ? 'border-mint-500 bg-mint-100 text-mint-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-mint-300'
                }`}
              >
                No
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-mint-400 hover:bg-mint-500 text-white font-poppins-rounded rounded-xl py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
          >
            Finalizar configuración <Check className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};


