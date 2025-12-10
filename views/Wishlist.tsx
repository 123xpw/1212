import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Star, Trash2, Wallet, Pencil, CircleDashed, Loader2 } from 'lucide-react';
import { WishlistItem } from '../types';
import { apiService } from '../services/apiService';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';

export const WishlistView: React.FC = () => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<WishlistItem>>({ priority: 50 });

  const fetchData = async () => {
    try {
      const data = await apiService.getWishlist();
      setWishlist(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.location) return;

    try {
        if (editingId) {
            await apiService.updateWishlistItem(editingId, {
                location: formData.location,
                plannedDate: formData.plannedDate,
                reason: formData.reason,
                priority: formData.priority,
                budget: formData.budget,
                status: 'Pending'
            });
            // 简单起见，重新获取
            fetchData();
        } else {
            const newItem = await apiService.createWishlistItem({
                location: formData.location,
                plannedDate: formData.plannedDate || '待定',
                reason: formData.reason || '',
                priority: formData.priority ?? 50,
                budget: formData.budget || '',
                status: 'Pending'
            });
            setWishlist([newItem, ...wishlist].sort((a, b) => b.priority - a.priority));
        }
        closeModal();
    } catch (e) {
        alert("保存失败");
    }
  };

  const handleEdit = (item: WishlistItem) => {
    setEditingId(item.id);
    setFormData({
      location: item.location,
      plannedDate: item.plannedDate,
      reason: item.reason,
      priority: item.priority,
      budget: item.budget
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ priority: 50, location: '', reason: '', budget: '', plannedDate: '' });
  };

  const handleToggleStatus = async (item: WishlistItem) => {
    const newStatus: 'Pending' | 'Realized' = item.status === 'Realized' ? 'Pending' : 'Realized';
    
    try {
        await apiService.updateWishlistItem(item.id, { status: newStatus });
        const updated = wishlist.map(w => w.id === item.id ? { ...w, status: newStatus } : w);
        setWishlist(updated);
    } catch (e) {
        alert("更新状态失败");
    }
  };

  const handleDelete = async (id: string) => {
     if(confirm('确定要删除这个愿望吗？')) {
        try {
            await apiService.deleteWishlistItem(id);
            setWishlist(wishlist.filter(w => w.id !== id));
        } catch (e) {
            alert("删除失败");
        }
     }
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

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#4682B4]" /></div>;

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
          {wishlist.map((item) => {
            const isRealized = item.status === 'Realized';
            return (
              <div key={item.id} className={`bg-white p-6 rounded-xl shadow-sm border flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${isRealized ? 'border-green-200 bg-green-50/30' : 'border-gray-100 hover:border-blue-100'}`}>
                
                {/* Content */}
                <div className="flex-1 space-y-2 relative">
                  <div className="flex items-center gap-3">
                    <h3 className={`text-xl font-bold font-serif-sc ${isRealized ? 'text-green-800 line-through decoration-green-400/50 decoration-2' : 'text-gray-800'}`}>
                      {item.location}
                    </h3>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${isRealized ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                      {isRealized ? '愿望已达成' : '愿望未达成'}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-md ml-auto md:ml-0">
                      计划: {item.plannedDate}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm">
                    <span className="text-gray-400 mr-2">理由:</span>
                    {item.reason}
                  </p>

                  {item.budget && (
                    <div className="flex items-center gap-2 text-xs text-[#4682B4] bg-blue-50 w-fit px-2 py-1 rounded border border-blue-100 mt-1">
                      <Wallet size={12} />
                      <span>{item.budget}</span>
                    </div>
                  )}

                  <div className="mt-3 max-w-md opacity-90">
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
                <div className="flex items-center gap-2 pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
                  <button 
                    onClick={() => handleToggleStatus(item)}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium whitespace-nowrap transition-colors ${
                      isRealized 
                      ? 'border-gray-200 text-gray-500 bg-white hover:bg-gray-50'
                      : 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100'
                    }`}
                    title={isRealized ? "标记为未达成" : "标记为已达成"}
                  >
                    {isRealized ? <CircleDashed size={16} /> : <CheckCircle2 size={16} />}
                    <span>{isRealized ? '撤销达成' : '愿望达成'}</span>
                  </button>

                  <div className="flex gap-1 border-l border-gray-200 pl-2 ml-1">
                    <button 
                      onClick={() => handleEdit(item)}
                      className="p-2 text-gray-400 hover:text-[#4682B4] hover:bg-blue-50 rounded-lg transition-colors"
                      title="修正"
                    >
                      <Pencil size={18} />
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
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "修正愿望" : "新的梦想目的地"}>
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">目的地</label>
            <input
              required
              type="text"
              placeholder="例如：日本京都"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-[#4682B4] outline-none transition-all"
              value={formData.location || ''}
              onChange={e => setFormData({...formData, location: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">计划日期</label>
            <input
              type="text"
              placeholder="例如：明年夏天，或者 2025年10月"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-[#4682B4] outline-none transition-all"
              value={formData.plannedDate || ''}
              onChange={e => setFormData({...formData, plannedDate: e.target.value})}
            />
          </div>

          <div>
             <div className="flex justify-between items-center mb-2">
               <label className="block text-sm font-medium text-gray-700">想去程度 (优先级)</label>
               <span className="text-sm font-bold text-[#4682B4]">
                 {formData.priority}% - {getPriorityLabel(formData.priority || 50)}
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
                  value={formData.priority ?? 50}
                  onChange={e => setFormData({...formData, priority: Number(e.target.value)})}
                />
                
                {/* Labels Container */}
                <div className="flex justify-between text-[11px] text-gray-400 mt-2 px-1">
                   {[0, 25, 50, 75, 100].map(val => (
                      <span 
                        key={val} 
                        className={`cursor-pointer transition-colors ${formData.priority === val ? 'text-[#4682B4] font-bold' : 'hover:text-gray-600'}`}
                        onClick={() => setFormData({...formData, priority: val})}
                      >
                        {val}
                      </span>
                   ))}
                </div>
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">预算规划 (备注)</label>
            <input
              type="text"
              placeholder="例如：预计花费 2万元 / 游玩7天"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-[#4682B4] outline-none transition-all"
              value={formData.budget || ''}
              onChange={e => setFormData({...formData, budget: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">为什么想去？</label>
            <textarea
              required
              rows={3}
              placeholder="请写下您的理由（必填）..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-[#4682B4] outline-none transition-all resize-none"
              value={formData.reason || ''}
              onChange={e => setFormData({...formData, reason: e.target.value})}
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-[#4682B4] text-white py-3 rounded-lg font-medium hover:bg-sky-700 transition-colors shadow-sm"
            >
              {editingId ? '保存修改' : '加入愿望清单'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};