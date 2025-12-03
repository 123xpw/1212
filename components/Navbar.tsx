import React from 'react';
import { Map, CreditCard, Star, Compass, Menu } from 'lucide-react';
import { ViewName } from '../types';

interface NavbarProps {
  currentView: ViewName;
  onNavigate: (view: ViewName) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const navItems: { id: ViewName; label: string; icon: any }[] = [
    { id: 'journeys', label: '我的旅程', icon: Map },
    { id: 'expenses', label: '消费记录', icon: CreditCard },
    { id: 'wishlist', label: '愿望清单', icon: Star },
    { id: 'explore', label: '探索发现', icon: Compass },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('journeys')}>
              <div className="bg-[#4682B4] p-1.5 rounded-lg">
                <Map className="text-white" size={20} />
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-800 font-serif-sc">Curio Travel</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    isActive
                      ? 'bg-blue-50 text-[#4682B4]'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Mobile Menu Button (simplified for this demo) */}
          <div className="flex md:hidden items-center">
             <div className="flex gap-2">
                {navItems.map((item) => (
                   <button 
                     key={item.id}
                     onClick={() => onNavigate(item.id)}
                     className={`p-2 rounded-full ${currentView === item.id ? 'text-[#4682B4] bg-blue-50' : 'text-gray-400'}`}
                   >
                     <item.icon size={20} />
                   </button>
                ))}
             </div>
          </div>
        </div>
      </div>
    </nav>
  );
};