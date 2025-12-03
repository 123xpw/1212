import React, { useState, useEffect } from 'react';
import { Plus, Check, Star, Trash2 } from 'lucide-react';
import { WishlistItem, Journey } from '../types';
import { storageService } from '../services/storageService';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';

export const WishlistView: React.FC = () => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<WishlistItem>>({ priority: 'Medium' });

  useEffect(() => {
    setWishlist(storageService.getWishlist());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.location) return;

    const item: WishlistItem = {
      id: Date.now().toString(),
      location: newItem.location,
      plannedDate: newItem.plannedDate || '待定',
      reason: newItem.reason || '',
      priority: newItem.priority as 'High' | 'Medium' | 'Low'
    };

    const updated = [...wishlist, item];
    setWishlist(updated);
    storageService.saveWishlist(updated);
    setIsModalOpen(false);
    setNewItem({ priority: 'Medium' });
  };

  const handleRealize = (item: WishlistItem) => {
    if (confirm(`标记“${item.location}”为已实现？这将把它移动到“我的旅程”。`)) {
       // Remove from wishlist
       const updatedWishlist = wishlist.filter(w => w.id !== item.id);
       setWishlist(updatedWishlist);
       storageService.saveWishlist(updatedWishlist);

       // Add to journeys
       const currentJourneys = storageService.getJourneys();
       const newJourney: Journey = {
         id: Date.now().toString(),
         location: item.location,
         date: new Date().toISOString().split('T')[0],
         description: `梦想成真！最初计划理由：${item.reason}`,
         imageUrl: `https://picsum.photos/seed/${item.location}/800/400`
       };
       storageService.saveJourneys([newJourney, ...currentJourneys]);
    }
  };

  const handleDelete = (id: string) => {
     const updated = wishlist.filter(w => w.id !== id);
     setWishlist(updated);
     storageService.saveWishlist(updated);
  };

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const priorityLabels: Record<string, string> = {
    'High': '高',
    'Medium': '中',
    'Low': '低'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 font-serif-sc">愿望清单</h2>
          <p className="text-gray-500">等待实现的梦想。</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#4682B4] text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-all shadow-md"
        >
          <Plus size={18} />
          <span>添加愿望</span>
        </button>
      </div>

      {wishlist.length === 0 ? (
        <EmptyState 
          icon={Star} 
          title="愿望清单为空" 
          description="发现了美丽的地方？添加到这里，让旅行梦想保持鲜活。" 
        />
      ) : (
        <div className="grid gap-4">
          {wishlist.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:shadow-md transition-all">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold text-gray-800">{item.location}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityColor(item.priority)}`}>
                    {priorityLabels[item.priority]}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mb-1">计划：<span className="text-gray-700">{item.plannedDate}</span></div>
                <p className="text-gray-600 text-sm italic">"{item.reason}"</p>
              </div>
              
              <div className="flex items-center gap-3 md:border-l md:pl-6 md:border-gray-100">
                <button 
                  onClick={() => handleRealize(item)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-200 text-green-700 bg-green-50 hover:bg-green-100 transition-colors text-sm font-medium"
                >
                  <Check size={16} /> 已实现
                </button>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="新的梦想目的地">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">目的地</label>
            <input
              required
              type="text"
              placeholder="例如：日本京都"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
              value={newItem.location || ''}
              onChange={e => setNewItem({...newItem, location: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">计划日期</label>
              <input
                type="text"
                placeholder="例如：明年夏天"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                value={newItem.plannedDate || ''}
                onChange={e => setNewItem({...newItem, plannedDate: e.target.value})}
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">优先级</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none bg-white"
                value={newItem.priority}
                onChange={e => setNewItem({...newItem, priority: e.target.value as any})}
              >
                <option value="High">高</option>
                <option value="Medium">中</option>
                <option value="Low">低</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">为什么想去？</label>
            <textarea
              rows={2}
              placeholder="例如：为了看樱花"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
              value={newItem.reason || ''}
              onChange={e => setNewItem({...newItem, reason: e.target.value})}
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-[#4682B4] text-white py-2 rounded-lg font-medium hover:bg-sky-700 transition-colors"
            >
              加入愿望清单
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};