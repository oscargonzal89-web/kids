import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Cloud, ArrowRight } from 'lucide-react';

interface OnboardingParentProps {
  onNext: (data: ParentData) => void;
}

export interface ParentData {
  name: string;
  relationship: string;
  email: string;
}

export const OnboardingParent: React.FC<OnboardingParentProps> = ({ onNext }) => {
  const [formData, setFormData] = useState<ParentData>({
    name: '',
    relationship: '',
    email: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.relationship && formData.email) {
      onNext(formData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-lavender-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Avatar de Nani */}
        <div className="flex justify-center">
          <Cloud className="w-20 h-20 text-lavender-300 fill-lavender-200" />
        </div>

        {/* Mensaje de Nani */}
        <div className="text-center space-y-2">
          <p className="text-xl text-gray-700 font-nunito">
            Encantada de conocerte 💙
          </p>
          <p className="text-sm text-gray-600 font-nunito">
            Empecemos configurando tu perfil
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700 font-nunito">
              Tu nombre
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Ej: Laura Gómez"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="rounded-xl border-lavender-200 focus:border-lavender-400"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationship" className="text-gray-700 font-nunito">
              Tu relación
            </Label>
            <Select
              value={formData.relationship}
              onValueChange={(value) => setFormData({ ...formData, relationship: value })}
            >
              <SelectTrigger className="rounded-xl border-lavender-200 focus:border-lavender-400">
                <SelectValue placeholder="Selecciona tu relación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mother">Mamá</SelectItem>
                <SelectItem value="father">Papá</SelectItem>
                <SelectItem value="guardian">Tutor/a</SelectItem>
                <SelectItem value="other">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 font-nunito">
              Correo electrónico
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="rounded-xl border-lavender-200 focus:border-lavender-400"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-lavender-400 hover:bg-lavender-500 text-white font-poppins-rounded rounded-xl py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
          >
            Siguiente <ArrowRight className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};


