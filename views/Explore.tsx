import React, { useState } from 'react';
import { Search, Heart, Info, DollarSign, Calendar } from 'lucide-react';
import { EXPLORE_DESTINATIONS } from '../constants';
import { storageService } from '../services/storageService';
import { WishlistItem } from '../types';

export const ExploreView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredDestinations = EXPLORE_DESTINATIONS.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddToWishlist = (name: string) => {
    const currentList = storageService.getWishlist();
    if (currentList.some(item => item.location === name)) {
      alert(`${name} 已经在您的愿望清单中了！`);
      return;
    }

    const newItem: WishlistItem = {
      id: Date.now().toString(),
      location: name,
      plannedDate: '待定',
      reason: '在“探索”中发现',
      priority: 'Medium'
    };

    storageService.saveWishlist([...currentList, newItem]);
    alert(`已将 ${name} 加入您的愿望清单！`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 font-serif-sc">探索目的地</h2>
          <p className="text-gray-500">发现您的下一次冒险。</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="搜索地点..." 
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-sky-500 outline-none w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDestinations.map(dest => (
          <div key={dest.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="h-56 overflow-hidden relative">
              <img 
                src={dest.imageUrl} 
                alt={dest.name} 
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                 <h3 className="text-2xl font-bold font-serif-sc">{dest.name}</h3>
              </div>
            </div>
            <div className="p-5">
              <p className="text-gray-600 text-sm mb-4 min-h-[2.5rem]">{dest.description}</p>
              
              <div className="space-y-2 mb-6">
                 <div className="flex items-center text-xs text-gray-500">
                    <Calendar size={14} className="mr-2 text-sky-500" />
                    <span>最佳季节：<strong className="text-gray-700">{dest.bestSeason}</strong></span>
                 </div>
                 <div className="flex items-center text-xs text-gray-500">
                    <DollarSign size={14} className="mr-2 text-green-500" />
                    <span>预算：<strong className="text-gray-700">{dest.budgetLevel}</strong></span>
                 </div>
              </div>

              <button 
                onClick={() => handleAddToWishlist(dest.name)}
                className="w-full flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-[#4682B4] hover:border-[#4682B4] transition-all font-medium text-sm"
              >
                <Heart size={16} />
                <span>加入愿望清单</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {filteredDestinations.length === 0 && (
         <div className="text-center py-20 text-gray-400">
           未找到匹配的目的地。
         </div>
      )}
    </div>
  );
};