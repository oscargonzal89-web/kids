import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Plus, Camera, Loader2, X } from 'lucide-react';
import { getMoments, addMoment, type MomentRow } from '../services/moments.service';

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
  childId?: string;
}

const EMOJIS = ['💕', '🦶', '😊', '💬', '👶', '🌟', '🎂', '❤️', '📸', '✨'];

function momentFromRow(row: MomentRow): Moment {
  const meta = row.meta ?? {};
  return {
    id: row.id,
    title: row.value,
    date: meta.date ? new Date(meta.date) : new Date(row.created_at),
    emoji: meta.emoji ?? '💕',
    note: meta.note ?? undefined,
  };
}

export const MomentsKids: React.FC<MomentsKidsProps> = ({ onBack: _onBack, onAddMoment: _onAddMoment, childId }) => {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(!!childId);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [formEmoji, setFormEmoji] = useState('💕');
  const [formNote, setFormNote] = useState('');

  useEffect(() => {
    if (!childId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getMoments(childId)
      .then((rows) => {
        if (!cancelled) setMoments(rows.map(momentFromRow));
      })
      .catch((err) => {
        if (!cancelled) console.error('Error loading moments:', err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [childId]);

  const handleSubmitMoment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childId || !formTitle.trim()) return;
    setSaving(true);
    try {
      const row = await addMoment(childId, {
        title: formTitle.trim(),
        date: formDate,
        emoji: formEmoji,
        note: formNote.trim() || undefined,
      });
      setMoments((prev) => [momentFromRow(row), ...prev]);
      setShowForm(false);
      setFormTitle('');
      setFormNote('');
    } catch (err) {
      console.error('Error adding moment:', err);
    } finally {
      setSaving(false);
    }
  };

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
        <div className="text-center space-y-2 pt-8">
          <h1 className="text-3xl font-bold text-gray-800 font-poppins-rounded">
            Momentos KIDS 💕
          </h1>
          <p className="text-gray-600 font-nunito">Tu diario emocional</p>
        </div>

        {childId && (
          <Button
            onClick={() => setShowForm(true)}
            className="w-full bg-white/80 hover:bg-white text-gray-800 font-poppins-rounded rounded-2xl py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 border-2 border-pink-300"
          >
            <Plus className="w-6 h-6" />
            Agregar recuerdo
          </Button>
        )}

        {showForm && childId && (
          <Card className="bg-white/90 rounded-2xl p-6 shadow-lg border-0">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-800 font-nunito">Nuevo momento</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <form onSubmit={handleSubmitMoment} className="space-y-4">
              <div>
                <Label className="text-gray-700 font-nunito">Título</Label>
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ej: Primer paso"
                  className="rounded-xl mt-1"
                  required
                />
              </div>
              <div>
                <Label className="text-gray-700 font-nunito">Fecha</Label>
                <Input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="rounded-xl mt-1"
                  required
                />
              </div>
              <div>
                <Label className="text-gray-700 font-nunito">Emoji</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormEmoji(emoji)}
                      className={`text-2xl p-2 rounded-xl border-2 transition-all ${
                        formEmoji === emoji ? 'border-pink-400 bg-pink-50' : 'border-gray-200 hover:border-pink-200'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-gray-700 font-nunito">Nota (opcional)</Label>
                <Input
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="Ej: ¡Increíble momento!"
                  className="rounded-xl mt-1"
                />
              </div>
              <Button
                type="submit"
                className="w-full rounded-xl"
                disabled={saving}
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Guardar momento'}
              </Button>
            </form>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          </div>
        ) : moments.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center">
            <p className="text-gray-600 font-nunito">
              {childId
                ? 'Aún no tienes momentos guardados. ¡Agrega el primero!'
                : 'Agrega un hij@ en el perfil para guardar momentos.'}
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {moments.map((moment, index) => (
              <div key={moment.id} className="flex gap-4">
                {index < moments.length - 1 && (
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 rounded-full bg-pink-400 border-4 border-white shadow-lg" />
                    <div className="w-1 h-full bg-gradient-to-b from-pink-300 to-lavender-300 min-h-[100px]" />
                  </div>
                )}
                {index === moments.length - 1 && (
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 rounded-full bg-pink-400 border-4 border-white shadow-lg" />
                  </div>
                )}
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
        )}
      </div>
    </div>
  );
};
