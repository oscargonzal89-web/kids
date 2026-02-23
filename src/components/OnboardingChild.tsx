import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Cloud, ArrowRight } from 'lucide-react';

interface OnboardingChildProps {
  onNext: (data: ChildData) => void;
  parentName?: string;
}

export interface ChildData {
  name: string;
  nickname: string;
  birthDate: string;
  favoriteColor: string;
  favoriteAnimal: string;
  city: string;
}

const colors = [
  { value: 'red', label: 'Rojo', hex: '#FF6B6B' },
  { value: 'blue', label: 'Azul', hex: '#4ECDC4' },
  { value: 'green', label: 'Verde', hex: '#95E1D3' },
  { value: 'yellow', label: 'Amarillo', hex: '#FCE38A' },
  { value: 'pink', label: 'Rosa', hex: '#F38181' },
  { value: 'purple', label: 'Morado', hex: '#AA96DA' },
];

const animals = [
  { value: 'dog', label: 'Perro', emoji: '🐕' },
  { value: 'cat', label: 'Gato', emoji: '🐱' },
  { value: 'dinosaur', label: 'Dinosaurio', emoji: '🦕' },
  { value: 'lion', label: 'León', emoji: '🦁' },
  { value: 'elephant', label: 'Elefante', emoji: '🐘' },
  { value: 'butterfly', label: 'Mariposa', emoji: '🦋' },
];

export const OnboardingChild: React.FC<OnboardingChildProps> = ({ onNext, parentName }) => {
  const [formData, setFormData] = useState<ChildData>({
    name: '',
    nickname: '',
    birthDate: '',
    favoriteColor: '',
    favoriteAnimal: '',
    city: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.birthDate && formData.favoriteColor && formData.favoriteAnimal && formData.city) {
      onNext(formData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-sky-200 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Avatar de Nani */}
        <div className="flex justify-center">
          <Cloud className="w-20 h-20 text-lavender-300 fill-lavender-200" />
        </div>

        {/* Mensaje de Nani */}
        <div className="text-center space-y-2">
          <p className="text-xl text-gray-700 font-nunito">
            {parentName && `Hola ${parentName}! `}💙
          </p>
          <p className="text-lg text-gray-700 font-nunito">
            ¿Cómo te gusta que le diga a tu hij@? ¿Por su nombre o apodo?
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700 font-nunito">
              Nombre
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Ej: Sofía"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="rounded-xl border-lavender-200 focus:border-lavender-400"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nickname" className="text-gray-700 font-nunito">
              Apodo (opcional)
            </Label>
            <Input
              id="nickname"
              type="text"
              placeholder="Ej: Sofi"
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              className="rounded-xl border-lavender-200 focus:border-lavender-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate" className="text-gray-700 font-nunito">
              Fecha de nacimiento
            </Label>
            <Input
              id="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              className="rounded-xl border-lavender-200 focus:border-lavender-400"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700 font-nunito">
              Color favorito
            </Label>
            <div className="grid grid-cols-6 gap-3">
              {colors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, favoriteColor: color.value })}
                  className={`w-12 h-12 rounded-full border-4 transition-all ${
                    formData.favoriteColor === color.value
                      ? 'border-gray-800 scale-110 shadow-lg'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  aria-label={color.label}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700 font-nunito">
              Animal favorito
            </Label>
            <div className="grid grid-cols-6 gap-3">
              {animals.map((animal) => (
                <button
                  key={animal.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, favoriteAnimal: animal.value })}
                  className={`w-16 h-16 rounded-2xl border-4 transition-all flex items-center justify-center text-3xl ${
                    formData.favoriteAnimal === animal.value
                      ? 'border-gray-800 scale-110 shadow-lg bg-gray-50'
                      : 'border-transparent hover:scale-105 bg-white/50'
                  }`}
                  aria-label={animal.label}
                >
                  {animal.emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city" className="text-gray-700 font-nunito">
              Ciudad
            </Label>
            <Input
              id="city"
              type="text"
              placeholder="Ej: Bogotá"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="rounded-xl border-lavender-200 focus:border-lavender-400"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-400 hover:bg-blue-500 text-white font-poppins-rounded rounded-xl py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
          >
            Siguiente <ArrowRight className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};


