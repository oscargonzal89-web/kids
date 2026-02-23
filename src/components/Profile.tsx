import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Settings, Bell, Shield, HelpCircle, LogOut } from 'lucide-react';

interface ProfileProps {
  parentName?: string;
  childName?: string;
  onBack: () => void;
  onLogout: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ parentName, childName, onBack: _onBack, onLogout }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-pink-50 p-6 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <Avatar className="w-24 h-24 mx-auto bg-gradient-to-br from-lavender-300 to-pink-300">
            <AvatarFallback className="text-3xl font-bold text-white font-poppins-rounded">
              {parentName?.charAt(0).toUpperCase() || 'M'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 font-poppins-rounded">
              {parentName || 'Mamá'}
            </h1>
            <p className="text-gray-600 font-nunito mt-1">
              Mamá de <span className="font-semibold">{childName || 'tu hij@'}</span>
            </p>
          </div>
        </div>

        {/* Información del perfil */}
        <Card className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-0">
          <h2 className="font-bold text-gray-800 font-nunito mb-4">Información</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 font-nunito">Nombre</span>
              <span className="font-semibold text-gray-800 font-nunito">{parentName || 'No especificado'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 font-nunito">Hij@</span>
              <span className="font-semibold text-gray-800 font-nunito">{childName || 'No especificado'}</span>
            </div>
          </div>
        </Card>

        {/* Opciones */}
        <div className="space-y-3">
          <Button
            variant="ghost"
            className="w-full justify-start bg-white/80 hover:bg-white rounded-2xl p-4 h-auto font-nunito"
          >
            <Settings className="w-5 h-5 mr-3 text-gray-600" />
            <span className="text-gray-800">Configuración</span>
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start bg-white/80 hover:bg-white rounded-2xl p-4 h-auto font-nunito"
          >
            <Bell className="w-5 h-5 mr-3 text-gray-600" />
            <span className="text-gray-800">Notificaciones</span>
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start bg-white/80 hover:bg-white rounded-2xl p-4 h-auto font-nunito"
          >
            <Shield className="w-5 h-5 mr-3 text-gray-600" />
            <span className="text-gray-800">Privacidad y seguridad</span>
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start bg-white/80 hover:bg-white rounded-2xl p-4 h-auto font-nunito"
          >
            <HelpCircle className="w-5 h-5 mr-3 text-gray-600" />
            <span className="text-gray-800">Ayuda y soporte</span>
          </Button>

          <Button
            variant="ghost"
            onClick={onLogout}
            className="w-full justify-start bg-red-50 hover:bg-red-100 rounded-2xl p-4 h-auto font-nunito border border-red-200"
          >
            <LogOut className="w-5 h-5 mr-3 text-red-600" />
            <span className="text-red-600">Cerrar sesión</span>
          </Button>
        </div>
      </div>
    </div>
  );
};


