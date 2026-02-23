import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Search, MapPin, ShoppingBag, Users, Calendar, Stethoscope } from 'lucide-react';

interface ExploreProps {
  onBack: () => void;
}

export const Explore: React.FC<ExploreProps> = ({ onBack: _onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-lavender-200 p-6 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 pt-8">
          <h1 className="text-3xl font-bold text-gray-800 font-poppins-rounded">
            Explorar 🌟
          </h1>
        </div>

        {/* Buscador */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar pediatra, psicólogo, terapeuta..."
            className="pl-12 rounded-full border-lavender-200 focus:border-lavender-400 bg-white/80 backdrop-blur-sm"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="explore" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm rounded-full p-1">
            <TabsTrigger value="explore" className="rounded-full font-nunito">
              Explorar
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="rounded-full font-nunito">
              Marketplace
            </TabsTrigger>
            <TabsTrigger value="community" className="rounded-full font-nunito">
              Comunidad
            </TabsTrigger>
          </TabsList>

          {/* Tab: Explorar */}
          <TabsContent value="explore" className="space-y-4 mt-6">
            <Card className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-0">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-blue-400 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 font-nunito mb-2">
                    Planes locales por edad
                  </h3>
                  <p className="text-gray-600 font-nunito text-sm">
                    Descubre actividades recomendadas según la edad de tu hij@
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 rounded-full border-lavender-300 text-lavender-600 hover:bg-lavender-50"
                  >
                    Ver planes
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-0">
              <div className="flex items-start gap-4">
                <Calendar className="w-6 h-6 text-purple-400 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 font-nunito mb-2">
                    Actividades por clima
                  </h3>
                  <p className="text-gray-600 font-nunito text-sm">
                    Planes adaptados al clima de hoy
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 rounded-full border-lavender-300 text-lavender-600 hover:bg-lavender-50"
                  >
                    Ver actividades
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Tab: Marketplace */}
          <TabsContent value="marketplace" className="space-y-4 mt-6">
            <Card className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-0">
              <div className="flex items-start gap-4">
                <ShoppingBag className="w-6 h-6 text-mint-400 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 font-nunito mb-2">
                    Productos recomendados
                  </h3>
                  <div className="space-y-3 mt-4">
                    <div className="flex items-center gap-3 p-3 bg-mint-50 rounded-xl">
                      <span className="text-2xl">🧩</span>
                      <div>
                        <p className="font-semibold text-gray-800 font-nunito text-sm">Cubo sensorial</p>
                        <p className="text-xs text-gray-500">Recomendado por Nani</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-mint-50 rounded-xl">
                      <span className="text-2xl">🦷</span>
                      <div>
                        <p className="font-semibold text-gray-800 font-nunito text-sm">Mordedera</p>
                        <p className="text-xs text-gray-500">Para la dentición</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-mint-50 rounded-xl">
                      <span className="text-2xl">👕</span>
                      <div>
                        <p className="font-semibold text-gray-800 font-nunito text-sm">Ropa infantil</p>
                        <p className="text-xs text-gray-500">Colección especial</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Tab: Comunidad */}
          <TabsContent value="community" className="space-y-4 mt-6">
            <Card className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-0">
              <div className="flex items-start gap-4">
                <Users className="w-6 h-6 text-pink-400 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 font-nunito mb-2">
                    Foros activos
                  </h3>
                  <div className="space-y-3 mt-4">
                    <div className="p-3 bg-pink-50 rounded-xl">
                      <p className="font-semibold text-gray-800 font-nunito text-sm">Tips de sueño</p>
                      <p className="text-xs text-gray-500">15 comentarios nuevos</p>
                    </div>
                    <div className="p-3 bg-pink-50 rounded-xl">
                      <p className="font-semibold text-gray-800 font-nunito text-sm">Lactancia</p>
                      <p className="text-xs text-gray-500">8 comentarios nuevos</p>
                    </div>
                    <div className="p-3 bg-pink-50 rounded-xl">
                      <p className="font-semibold text-gray-800 font-nunito text-sm">Alimentación</p>
                      <p className="text-xs text-gray-500">22 comentarios nuevos</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="mt-4 rounded-full border-lavender-300 text-lavender-600 hover:bg-lavender-50"
                  >
                    Ver foro completo
                  </Button>
                </div>
              </div>
            </Card>

            {/* Directorio Médico */}
            <Card className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-0">
              <div className="flex items-start gap-4">
                <Stethoscope className="w-6 h-6 text-blue-400 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 font-nunito mb-2">
                    Directorio Médico
                  </h3>
                  <p className="text-gray-600 font-nunito text-sm mb-4">
                    Especialistas recomendados cerca de ti
                  </p>
                  <Button
                    variant="outline"
                    className="w-full rounded-full border-lavender-300 text-lavender-600 hover:bg-lavender-50"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Agendar con Nani
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};


