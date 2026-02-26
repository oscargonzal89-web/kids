import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Settings, Bell, Shield, HelpCircle, LogOut, Pencil, X } from 'lucide-react';
import { upsertProfile } from '../services/profile.service';

interface ProfileProps {
  parentName?: string;
  parentEmail?: string;
  parentRelationship?: string;
  childName?: string;
  onBack: () => void;
  onLogout: () => void;
  onProfileUpdated?: (data: { name: string; email: string; relationship: string }) => void;
}

export const Profile: React.FC<ProfileProps> = ({
  parentName,
  parentEmail,
  parentRelationship,
  childName,
  onBack: _onBack,
  onLogout,
  onProfileUpdated,
}) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editName, setEditName] = useState(parentName ?? '');
  const [editEmail, setEditEmail] = useState(parentEmail ?? '');
  const [editRelationship, setEditRelationship] = useState(parentRelationship ?? '');

  const handleOpenEdit = () => {
    setEditName(parentName ?? '');
    setEditEmail(parentEmail ?? '');
    setEditRelationship(parentRelationship ?? '');
    setShowEditForm(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim()) return;
    setSaving(true);
    try {
      await upsertProfile({
        name: editName.trim(),
        email: editEmail.trim(),
        relationship: editRelationship || undefined,
      });
      onProfileUpdated?.({
        name: editName.trim(),
        email: editEmail.trim(),
        relationship: editRelationship,
      });
      setShowEditForm(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-pink-50 p-6 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-4 pt-8">
          <Avatar className="w-24 h-24 mx-auto bg-gradient-to-br from-lavender-300 to-pink-300">
            <AvatarFallback className="text-3xl font-bold text-white font-poppins-rounded">
              {(parentName || 'M').charAt(0).toUpperCase()}
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

        <Card className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-0">
          <h2 className="font-bold text-gray-800 font-nunito mb-4">Información</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 font-nunito">Nombre</span>
              <span className="font-semibold text-gray-800 font-nunito">{parentName || 'No especificado'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 font-nunito">Correo</span>
              <span className="font-semibold text-gray-800 font-nunito">{parentEmail || 'No especificado'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 font-nunito">Relación</span>
              <span className="font-semibold text-gray-800 font-nunito">
                {parentRelationship === 'mother' ? 'Mamá' : parentRelationship === 'father' ? 'Papá' : parentRelationship === 'guardian' ? 'Tutor/a' : parentRelationship || 'No especificado'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 font-nunito">Hij@</span>
              <span className="font-semibold text-gray-800 font-nunito">{childName || 'No especificado'}</span>
            </div>
          </div>
          {onProfileUpdated && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4 rounded-xl border-lavender-300 text-lavender-600"
              onClick={handleOpenEdit}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Editar perfil
            </Button>
          )}
        </Card>

        {showEditForm && (
          <Card className="bg-white/90 rounded-2xl p-6 shadow-lg border-0">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-800 font-nunito">Editar perfil</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowEditForm(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <Label className="text-gray-700 font-nunito">Nombre</Label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Tu nombre"
                  className="rounded-xl mt-1"
                  required
                />
              </div>
              <div>
                <Label className="text-gray-700 font-nunito">Correo</Label>
                <Input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="rounded-xl mt-1"
                  required
                />
              </div>
              <div>
                <Label className="text-gray-700 font-nunito">Relación</Label>
                <Select value={editRelationship} onValueChange={setEditRelationship}>
                  <SelectTrigger className="rounded-xl mt-1">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mother">Mamá</SelectItem>
                    <SelectItem value="father">Papá</SelectItem>
                    <SelectItem value="guardian">Tutor/a</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full rounded-xl" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </form>
          </Card>
        )}

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
