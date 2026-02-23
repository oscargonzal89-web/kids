import React from 'react';
import { Home, Compass, Heart, User, MessageCircle } from 'lucide-react';

interface BottomNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentRoute, onNavigate }) => {
  const navItems = [
    { id: 'home', label: 'Inicio', icon: Home, route: 'home' },
    { id: 'chat', label: 'Chat', icon: MessageCircle, route: 'chat' },
    { id: 'explore', label: 'Explorar', icon: Compass, route: 'explore' },
    { id: 'moments', label: 'Momentos', icon: Heart, route: 'moments' },
    { id: 'profile', label: 'Perfil', icon: User, route: 'profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 shadow-lg z-50">
      <div className="flex justify-around items-center py-2 px-2 max-w-2xl mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.route;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.route)}
              className={`flex flex-col items-center justify-center gap-1 py-2 px-2 flex-1 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'bg-lavender-100 text-lavender-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-2' : ''}`} />
              <span className={`text-xs font-nunito ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

