
import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Star, Trash2, Wallet } from 'lucide-react';
import { WishlistItem, Journey } from '../types';
import { storageService } from '../services/storageService';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';

export const WishlistView: React.FC = () => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<WishlistItem>>({ priority: 50 });

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
      priority: newItem.priority ?? 50,
      budgetNote: newItem.budgetNote || ''
    };

    // Sort by priority (High to Low)
    const updated = [...wishlist, item].sort((a, b) => b.priority - a.priority);
    setWishlist(updated);
    storageService.saveWishlist(updated);
    setIsModalOpen(false);
    setNewItem({ priority: 50 });
  };

  const handleRealize = (item: WishlistItem) => {
    if (confirm(`恭喜！确认已完成“${item.location}”的旅行计划？\n这将把它从愿望清单移动到【我的旅程】。`)) {
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
         description: `愿望清单达成！(${item.plannedDate})。\n${item.budgetNote ? `预算回顾：${item.budgetNote}\n` : ''}最初理由：${item.reason}`,
       };
       storageService.saveJourneys([newJourney, ...currentJourneys]);
    }
  };

  const handleDelete = (id: string) => {
     const updated = wishlist.filter(w => w.id !== id);
     setWishlist(updated);
     storageService.saveWishlist(updated);
  };

  const getPriorityColor = (p: number) => {
    if (p >= 75) return 'bg-gradient-to-r from-rose-500 to-red-500';
    if (p >= 50) return 'bg-gradient-to-r from-orange-400 to-orange-500';
    return 'bg-gradient-to-r from-blue-400 to-[#4682B4]';
  };

  const getPriorityLabel = (p: number) => {
    if (p === 100) return '非去不可';
    if (p === 75) return '非常想去';
    if (p === 50) return '有点兴趣';
    if (p === 25) return '随缘';
    return '随便看看';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-end border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 font-serif-sc">愿望清单</h2>
          <p className="text-gray-500 text-sm mt-1">种下梦想，静待花开。</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#4682B4] text-white px-5 py-2.5 rounded-full hover:bg-sky-700 transition-all shadow-md hover:shadow-lg text-sm font-medium"
        >
          <Plus size={16} />
          <span>添加愿望</span>
        </button>
      </div>

      {wishlist.length === 0 ? (
        <EmptyState 
          icon={Star} 
          title="愿望清单为空" 
          description="将心仪的目的地加入这里，用强烈的意念让它们成真。" 
        />
      ) : (
        <div className="grid gap-4">
          {wishlist.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-blue-100 transition-colors">
              
              {/* Content */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between md:justify-start md:gap-4">
                  <h3 className="text-xl font-bold text-gray-800 font-serif-sc">{item.location}</h3>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-md">
                     计划: {item.plannedDate}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm">
                  <span className="text-gray-400 mr-2">理由:</span>
                  {item.reason}
                </p>

                {/* Budget Note Display */}
                {item.budgetNote && (
                  <div className="flex items-center gap-2 text-xs text-[#4682B4] bg-blue-50 w-fit px-2 py-1 rounded border border-blue-100 mt-1">
                    <Wallet size={12} />
                    <span>{item.budgetNote}</span>
                  </div>
                )}

                {/* Priority Bar */}
                <div className="mt-3 max-w-md">
                   <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>{getPriorityLabel(item.priority)}</span>
                      <span>{item.priority}%</span>
                   </div>
                   <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getPriorityColor(item.priority)}`} 
                        style={{ width: `${item.priority}%` }}
                      ></div>
                   </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
                <button 
                  onClick={() => handleRealize(item)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-green-200 text-green-700 bg-green-50 hover:bg-green-100 transition-colors text-sm font-medium whitespace-nowrap"
                  title="标记为已去过，并移动到我的旅程"
                >
                  <CheckCircle2 size={16} /> 
                  <span>愿望达成</span>
                </button>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="删除"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="新的梦想目的地">
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">目的地</label>
            <input
              required
              type="text"
              placeholder="例如：日本京都"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-[#4682B4] outline-none transition-all"
              value={newItem.location || ''}
              onChange={e => setNewItem({...newItem, location: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">计划日期</label>
            <input
              type="text"
              placeholder="例如：明年夏天，或者 2025年10月"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-[#4682B4] outline-none transition-all"
              value={newItem.plannedDate || ''}
              onChange={e => setNewItem({...newItem, plannedDate: e.target.value})}
            />
          </div>

          <div>
             <div className="flex justify-between items-center mb-2">
               <label className="block text-sm font-medium text-gray-700">想去程度优先级</label>
               <span className="text-sm font-bold text-[#4682B4]">
                 {newItem.priority}% - {getPriorityLabel(newItem.priority || 50)}
               </span>
             </div>
             
             {/* Slider Container */}
             <div className="pb-2">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="25"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#4682B4] block"
                  value={newItem.priority ?? 50}
                  onChange={e => setNewItem({...newItem, priority: Number(e.target.value)})}
                />
                
                {/* Labels Container */}
                <div className="flex justify-between text-[11px] text-gray-400 mt-2 px-1">
                   {[0, 25, 50, 75, 100].map(val => (
                      <span 
                        key={val} 
                        className={`cursor-pointer transition-colors ${newItem.priority === val ? 'text-[#4682B4] font-bold' : 'hover:text-gray-600'}`}
                        onClick={() => setNewItem({...newItem, priority: val})}
                      >
                        {val}
                      </span>
                   ))}
                </div>
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">预算规划</label>
            <input
              type="text"
              placeholder="例如：预计花费 2万元 / 游玩7天"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-[#4682B4] outline-none transition-all"
              value={newItem.budgetNote || ''}
              onChange={e => setNewItem({...newItem, budgetNote: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">为什么想去？</label>
            <textarea
              rows={2}
              placeholder="例如：听说那里的咖啡很棒，或者为了看一场演唱会"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-[#4682B4] outline-none transition-all resize-none"
              value={newItem.reason || ''}
              onChange={e => setNewItem({...newItem, reason: e.target.value})}
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-[#4682B4] text-white py-3 rounded-lg font-medium hover:bg-sky-700 transition-colors shadow-sm"
            >
              加入愿望清单
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
