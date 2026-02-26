import React, { useState, useEffect, useMemo } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Search, MapPin, ShoppingBag, Users, Calendar, Stethoscope, Bookmark, EyeOff, Loader2 } from 'lucide-react';
import {
  listPlans,
  getInteractions,
  setInteraction,
  removeInteraction,
  type ExplorePlanRow,
} from '../services/explorePlans.service';

interface ExploreProps {
  onBack: () => void;
  childId?: string;
}

export const Explore: React.FC<ExploreProps> = ({ onBack: _onBack, childId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [plans, setPlans] = useState<ExplorePlanRow[]>([]);
  const [interactions, setInteractionsState] = useState<Map<string, 'saved' | 'hidden'>>(new Map());
  const [loading, setLoading] = useState(true);
  const [interactionLoading, setInteractionLoading] = useState<string | null>(null);

  const filters = useMemo(() => ({
    search: searchQuery.trim() || undefined,
  }), [searchQuery]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listPlans(filters)
      .then((data) => {
        if (!cancelled) setPlans(data);
      })
      .catch((err) => {
        if (!cancelled) console.error('Error loading plans:', err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [filters.search]);

  useEffect(() => {
    if (!childId) return;
    let cancelled = false;
    getInteractions(childId)
      .then((map) => {
        if (!cancelled) setInteractionsState(map);
      })
      .catch((err) => {
        if (!cancelled) console.error('Error loading interactions:', err);
      });
    return () => { cancelled = true; };
  }, [childId]);

  const handleSetInteraction = async (planId: string, status: 'saved' | 'hidden') => {
    if (!childId) return;
    setInteractionLoading(planId);
    try {
      await setInteraction(planId, childId, status);
      setInteractionsState((prev) => new Map(prev).set(planId, status));
    } catch (err) {
      console.error('Error saving interaction:', err);
    } finally {
      setInteractionLoading(null);
    }
  };

  const handleRemoveInteraction = async (planId: string) => {
    if (!childId) return;
    setInteractionLoading(planId);
    try {
      await removeInteraction(planId, childId);
      setInteractionsState((prev) => {
        const next = new Map(prev);
        next.delete(planId);
        return next;
      });
    } catch (err) {
      console.error('Error removing interaction:', err);
    } finally {
      setInteractionLoading(null);
    }
  };

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
            placeholder="Buscar planes, actividades..."
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

          {/* Tab: Explorar - Lista de planes desde Supabase */}
          <TabsContent value="explore" className="space-y-4 mt-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-lavender-500" />
              </div>
            ) : plans.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border-0 text-center">
                <MapPin className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                <p className="text-gray-600 font-nunito">
                  {searchQuery.trim() ? 'No hay planes que coincidan con tu búsqueda.' : 'Aún no hay planes. Pronto podrás descubrir actividades por edad y ciudad.'}
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {plans.map((plan) => {
                  const status = interactions.get(plan.id);
                  const busy = interactionLoading === plan.id;
                  return (
                    <Card key={plan.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-0">
                      <div className="flex gap-4">
                        <MapPin className="w-6 h-6 text-blue-400 mt-1 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-800 font-poppins-rounded mb-1">
                            {plan.title}
                          </h3>
                          {plan.description && (
                            <p className="text-gray-600 font-nunito text-sm mb-3">
                              {plan.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2 text-xs text-gray-500 font-nunito mb-3">
                            {plan.category && <span className="bg-lavender-100 px-2 py-0.5 rounded">{plan.category}</span>}
                            {plan.duration_minutes != null && <span>{plan.duration_minutes} min</span>}
                            {plan.cost_level && <span>{plan.cost_level}</span>}
                          </div>
                          {childId && (
                            <div className="flex flex-wrap gap-2">
                              {status === 'saved' ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="rounded-full text-lavender-600 border-lavender-300"
                                    disabled={busy}
                                    onClick={() => handleRemoveInteraction(plan.id)}
                                  >
                                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bookmark className="w-4 h-4 fill-current" />}
                                    <span className="ml-1">Guardado</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="rounded-full"
                                    disabled={busy}
                                    onClick={() => handleSetInteraction(plan.id, 'hidden')}
                                  >
                                    Ocultar
                                  </Button>
                                </>
                              ) : status === 'hidden' ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="rounded-full"
                                    disabled={busy}
                                    onClick={() => handleSetInteraction(plan.id, 'saved')}
                                  >
                                    Guardar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="rounded-full text-gray-600"
                                    disabled={busy}
                                    onClick={() => handleRemoveInteraction(plan.id)}
                                  >
                                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <EyeOff className="w-4 h-4" />}
                                    <span className="ml-1">Oculto</span>
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="rounded-full border-lavender-300 text-lavender-600 hover:bg-lavender-50"
                                    disabled={busy}
                                    onClick={() => handleSetInteraction(plan.id, 'saved')}
                                  >
                                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bookmark className="w-4 h-4" />}
                                    <span className="ml-1">Guardar</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="rounded-full"
                                    disabled={busy}
                                    onClick={() => handleSetInteraction(plan.id, 'hidden')}
                                  >
                                    Ocultar
                                  </Button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Tab: Marketplace - contenido estático */}
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
