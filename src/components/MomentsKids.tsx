import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Plus, Camera } from 'lucide-react';

interface Moment {
  id: string;
  title: string;
  date: Date;
  emoji: string;
  note?: string;
}

interface MomentsKidsProps {
  onBack: () => void;
  onAddMoment: () => void;
}

export const MomentsKids: React.FC<MomentsKidsProps> = ({ onBack: _onBack, onAddMoment }) => {
  // Datos de ejemplo - en producción vendrían de Firestore
  const moments: Moment[] = [
    { id: '1', title: 'Primer paso', date: new Date('2025-10-25'), emoji: '🦶', note: '¡Increíble momento!' },
    { id: '2', title: 'Nueva sonrisa', date: new Date('2025-10-24'), emoji: '😊' },
    { id: '3', title: 'Primera palabra', date: new Date('2025-10-20'), emoji: '💬', note: 'Dijo "mamá"' },
  ];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-200 via-lavender-200 to-pink-300 p-6 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 pt-8">
          <h1 className="text-3xl font-bold text-gray-800 font-poppins-rounded">
            Momentos KIDS 💕
          </h1>
          <p className="text-gray-600 font-nunito">Tu diario emocional</p>
        </div>

        {/* Botón agregar */}
        <Button
          onClick={onAddMoment}
          className="w-full bg-white/80 hover:bg-white text-gray-800 font-poppins-rounded rounded-2xl py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 border-2 border-pink-300"
        >
          <Plus className="w-6 h-6" />
          Agregar recuerdo
        </Button>

        {/* Línea de tiempo */}
        <div className="space-y-6">
          {moments.map((moment, index) => (
            <div key={moment.id} className="flex gap-4">
              {/* Línea vertical */}
              {index < moments.length - 1 && (
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-pink-400 border-4 border-white shadow-lg"></div>
                  <div className="w-1 h-full bg-gradient-to-b from-pink-300 to-lavender-300 min-h-[100px]"></div>
                </div>
              )}
              {index === moments.length - 1 && (
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-pink-400 border-4 border-white shadow-lg"></div>
                </div>
              )}

              {/* Card del momento */}
              <Card className="flex-1 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-0">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{moment.emoji}</div>
                  <div className="flex-1 space-y-2">
                    <h3 className="font-bold text-gray-800 font-nunito text-lg">{moment.title}</h3>
                    <p className="text-sm text-gray-500 font-nunito">{formatDate(moment.date)}</p>
                    {moment.note && (
                      <p className="text-gray-600 font-nunito">{moment.note}</p>
                    )}
                  </div>
                  <Camera className="w-5 h-5 text-gray-400" />
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


