
import React, { useState } from 'react';
import { Heart, Wallet, Calendar, Star, Info, ArrowRight, Sun, Snowflake, Leaf, MapPin } from 'lucide-react';
import { EXPLORE_DESTINATIONS } from '../constants';
import { storageService } from '../services/storageService';
import { WishlistItem, Destination } from '../types';
import { Modal } from '../components/Modal';

export const ExploreView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Featured' | 'Seasonal' | 'Value'>('Featured');
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);

  const tabs = [
    { 
      id: 'Featured', 
      label: '精选推荐', 
      icon: Star,
      desc: '全球旅行者评分最高的必去之地，经典中的经典。'
    },
    { 
      id: 'Seasonal', 
      label: '季节推荐', 
      icon: Calendar,
      desc: '此时此刻景色最美，不错过最佳花期、雪景或气候。'
    },
    { 
      id: 'Value', 
      label: '高性价比', 
      icon: Wallet,
      desc: '花更少的钱享受超值体验，背包客与精明旅行者的最爱。'
    },
  ];

  // Filter logic
  const filteredDestinations = EXPLORE_DESTINATIONS.filter(d => 
    d.tags.includes(activeTab)
  );

  const handleAddToWishlist = (dest: Destination) => {
    const currentList = storageService.getWishlist();
    if (currentList.some(item => item.location === dest.name)) {
      alert(`${dest.name} 已经在您的愿望清单中了！`);
      return;
    }

    const newItem: WishlistItem = {
      id: Date.now().toString(),
      location: dest.name,
      plannedDate: '待定',
      reason: `[探索发现] ${dest.recommendedReason}`,
      priority: 50,
    };

    storageService.saveWishlist([...currentList, newItem]);
    alert(`已将 ${dest.name} 加入您的愿望清单！`);
    setSelectedDestination(null);
  };

  const getActiveTabDesc = () => tabs.find(t => t.id === activeTab)?.desc;

  // Helper to render special badge based on category
  const renderSpecialBadge = (dest: Destination) => {
    if (activeTab === 'Seasonal') {
       return (
         <span className="flex items-center gap-1 bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-bold">
           <Calendar size={10} /> {dest.bestSeason}
         </span>
       );
    }
    if (activeTab === 'Value') {
      return (
         <span className="flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">
           <Wallet size={10} /> 预算: {dest.budgetLevel === 'Low' ? '极低' : '适中'}
         </span>
      );
    }
    // Default Featured
    return (
       <span className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-bold">
         <Star size={10} /> 必去精选
       </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 font-serif-sc">探索目的地</h2>
        <p className="text-gray-500 mt-1">发现灵感，开启您的下一段旅程。</p>
      </div>

      {/* Category Tabs */}
      <div className="space-y-4">
        <div className="flex bg-gray-100/50 p-1 rounded-xl w-full md:w-fit">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-white text-[#4682B4] shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
        
        {/* Dynamic Subtitle */}
        <div className="bg-blue-50/50 text-[#4682B4] px-4 py-2 rounded-lg text-sm flex items-center gap-2 animate-fade-in">
           <Info size={14} />
           {getActiveTabDesc()}
        </div>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
        {filteredDestinations.map(dest => (
          <div key={dest.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all group flex flex-col h-full">
            {/* Image Area */}
            <div className="relative h-48 overflow-hidden">
              <img 
                src={dest.imageUrl} 
                alt={dest.name} 
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-3 left-3 flex gap-2">
                 <span className="bg-black/40 backdrop-blur-md text-white text-xs px-2 py-1 rounded-md font-medium flex items-center gap-1">
                   <MapPin size={10} /> {dest.country}
                 </span>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-gray-800 font-serif-sc">{dest.name}</h3>
                {renderSpecialBadge(dest)}
              </div>
              
              <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">
                {dest.description}
              </p>

              {/* Contextual Info Row */}
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-4 pt-3 border-t border-gray-50">
                 {activeTab === 'Seasonal' && (
                   <>
                     <span className="bg-gray-100 px-2 py-1 rounded">📅 最佳: {dest.bestSeason}</span>
                   </>
                 )}
                 {activeTab === 'Value' && (
                   <>
                     <span className="bg-gray-100 px-2 py-1 rounded">💰 消费: {dest.budgetLevel === 'Low' ? '低' : '中等'}</span>
                   </>
                 )}
                 {activeTab === 'Featured' && (
                    <span className="italic">"{dest.recommendedReason.substring(0, 15)}..."</span>
                 )}
              </div>

              <div className="mt-auto">
                <button 
                  onClick={() => setSelectedDestination(dest)}
                  className="w-full py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-[#4682B4] hover:border-blue-200 transition-colors flex items-center justify-center gap-1"
                >
                  查看详情 <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Details Modal */}
      {selectedDestination && (
        <Modal 
          isOpen={!!selectedDestination} 
          onClose={() => setSelectedDestination(null)} 
          title={selectedDestination.name}
        >
          <div className="space-y-6">
            <div className="h-48 rounded-xl overflow-hidden relative">
              <img 
                src={selectedDestination.imageUrl} 
                alt={selectedDestination.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                 <p className="text-white font-serif-sc text-lg flex items-center gap-2">
                   <MapPin size={18} /> {selectedDestination.country}
                 </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-gray-800 mb-1 flex items-center gap-2">
                  <Info size={16} className="text-[#4682B4]" /> 简介
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">{selectedDestination.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-xs text-gray-400 block mb-1">最佳旅行季节</span>
                    <span className="text-sm font-medium text-gray-800 flex items-center gap-1">
                      <Calendar size={14} className="text-[#4682B4]" />
                      {selectedDestination.bestSeason}
                    </span>
                 </div>
                 <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-xs text-gray-400 block mb-1">当地消费水平</span>
                    <span className="text-sm font-medium text-gray-800 flex items-center gap-1">
                      <Wallet size={14} className="text-[#4682B4]" />
                      {selectedDestination.budgetLevel === 'Low' ? '低 (高性价比)' : 
                       selectedDestination.budgetLevel === 'Medium' ? '中等' : '高 (奢华)'}
                    </span>
                 </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-800 mb-1 flex items-center gap-2">
                  <Heart size={16} className="text-rose-500" /> 推荐理由
                </h4>
                <p className="text-gray-600 text-sm italic border-l-2 border-rose-200 pl-3">
                  “{selectedDestination.recommendedReason}”
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => handleAddToWishlist(selectedDestination)}
                className="w-full bg-[#4682B4] text-white py-3 rounded-lg font-medium hover:bg-sky-700 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Star size={18} />
                <span>加入我的愿望清单</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};