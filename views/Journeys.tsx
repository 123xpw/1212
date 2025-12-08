
import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Trash2, MapPin, Circle } from 'lucide-react';
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
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-end border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 font-serif-sc">我的旅程</h2>
          <p className="text-gray-500 text-sm mt-1">足迹与回忆的时间轴</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#4682B4] text-white px-5 py-2.5 rounded-full hover:bg-sky-700 transition-all shadow-md hover:shadow-lg text-sm font-medium"
        >
          <Plus size={16} />
          <span>新增记录</span>
        </button>
      </div>

      {journeys.length === 0 ? (
        <EmptyState 
          icon={MapPin}
          title="暂无旅程记录"
          description="您的护照还很新。开始记录您的第一次冒险吧。"
        />
      ) : (
        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
          {journeys.map((journey) => (
            <div key={journey.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              
              {/* Timeline Dot */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-100 text-[#4682B4] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <Circle size={14} fill="currentColor" />
              </div>

              {/* Card Content */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-1 mb-3">
                  <div className="flex items-center justify-between">
                     <time className="font-mono text-xs text-gray-400 uppercase tracking-wider">
                       {new Date(journey.date).toLocaleDateString('zh-CN')}
                     </time>
                     <button 
                        onClick={() => handleDelete(journey.id)}
                        className="text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 font-serif-sc">{journey.location}</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {journey.description || '暂无描述...'}
                </p>
              </div>
              
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="记录新旅程">
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">地点</label>
            <input
              required
              type="text"
              placeholder="例如：意大利罗马"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-[#4682B4] outline-none transition-all"
              value={newJourney.location || ''}
              onChange={e => setNewJourney({...newJourney, location: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
            <input
              required
              type="date"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-[#4682B4] outline-none transition-all"
              value={newJourney.date || ''}
              onChange={e => setNewJourney({...newJourney, date: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">旅程日记</label>
            <textarea
              rows={4}
              placeholder="记录下那天的天气、心情或难忘的瞬间..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-[#4682B4] outline-none transition-all resize-none"
              value={newJourney.description || ''}
              onChange={e => setNewJourney({...newJourney, description: e.target.value})}
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-[#4682B4] text-white py-3 rounded-lg font-medium hover:bg-sky-700 transition-colors shadow-sm"
            >
              保存记录
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
