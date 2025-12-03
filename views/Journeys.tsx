import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Calendar, Trash2, Plane } from 'lucide-react';
import { Journey } from '../types';
import { storageService } from '../services/storageService';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';

export const JourneysView: React.FC = () => {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newJourney, setNewJourney] = useState<Partial<Journey>>({});

  useEffect(() => {
    setJourneys(storageService.getJourneys());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJourney.location || !newJourney.date) return;

    const journey: Journey = {
      id: Date.now().toString(),
      location: newJourney.location,
      date: newJourney.date,
      description: newJourney.description || '',
      imageUrl: `https://picsum.photos/seed/${newJourney.location}/800/400`
    };

    const updated = [journey, ...journeys].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setJourneys(updated);
    storageService.saveJourneys(updated);
    setIsModalOpen(false);
    setNewJourney({});
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这段美好的回忆吗？')) {
      const updated = journeys.filter(j => j.id !== id);
      setJourneys(updated);
      storageService.saveJourneys(updated);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 font-serif-sc">我的旅程</h2>
          <p className="text-gray-500">收藏时光，而非物品。</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#4682B4] text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-all shadow-md hover:shadow-lg"
        >
          <Plus size={18} />
          <span>新增旅程</span>
        </button>
      </div>

      {journeys.length === 0 ? (
        <EmptyState 
          icon={Plane}
          title="暂无旅程记录"
          description="开始记录您的旅行足迹，创建美好的回忆时间轴。"
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {journeys.map((journey) => (
            <div key={journey.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={journey.imageUrl} 
                  alt={journey.location} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                <div className="absolute bottom-3 left-4 text-white">
                  <h3 className="font-bold text-xl drop-shadow-md">{journey.location}</h3>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <Calendar size={14} />
                  <span>{new Date(journey.date).toLocaleDateString('zh-CN')}</span>
                </div>
                <p className="text-gray-600 text-sm line-clamp-3 mb-4 min-h-[3rem]">
                  {journey.description || '暂无描述。'}
                </p>
                <div className="flex justify-end pt-2 border-t border-gray-50">
                  <button 
                    onClick={() => handleDelete(journey.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-2"
                    title="删除记录"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="新增旅程">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">地点</label>
            <input
              required
              type="text"
              placeholder="例如：法国巴黎"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
              value={newJourney.location || ''}
              onChange={e => setNewJourney({...newJourney, location: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
            <input
              required
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
              value={newJourney.date || ''}
              onChange={e => setNewJourney({...newJourney, date: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <textarea
              rows={3}
              placeholder="这次旅行有什么特别之处？"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
              value={newJourney.description || ''}
              onChange={e => setNewJourney({...newJourney, description: e.target.value})}
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-[#4682B4] text-white py-2 rounded-lg font-medium hover:bg-sky-700 transition-colors"
            >
              保存回忆
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};