import React, { useState, useEffect, useMemo } from 'react';
import { Plus, DollarSign, TrendingUp, Filter } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Expense, ExpenseCategory } from '../types';
import { storageService } from '../services/storageService';
import { CATEGORY_COLORS } from '../constants';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';

// Helper for display text
const categoryNames: Record<ExpenseCategory, string> = {
  [ExpenseCategory.Transport]: '交通',
  [ExpenseCategory.Accommodation]: '住宿',
  [ExpenseCategory.Food]: '餐饮',
  [ExpenseCategory.Shopping]: '购物',
  [ExpenseCategory.Activities]: '活动',
  [ExpenseCategory.Other]: '其他'
};

export const ExpensesView: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    category: ExpenseCategory.Food,
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    setExpenses(storageService.getExpenses());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.location || !newExpense.amount) return;

    const expense: Expense = {
      id: Date.now().toString(),
      location: newExpense.location,
      amount: Number(newExpense.amount),
      category: newExpense.category as ExpenseCategory,
      date: newExpense.date || new Date().toISOString().split('T')[0]
    };

    const updated = [expense, ...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setExpenses(updated);
    storageService.saveExpenses(updated);
    setIsModalOpen(false);
    setNewExpense({
       category: ExpenseCategory.Food,
       date: new Date().toISOString().split('T')[0]
    });
  };

  const totalSpent = useMemo(() => expenses.reduce((sum, item) => sum + item.amount, 0), [expenses]);

  const chartData = useMemo(() => {
    const data: Record<string, number> = {};
    expenses.forEach(e => {
      // Use Chinese name for chart
      const name = categoryNames[e.category];
      data[name] = (data[name] || 0) + e.amount;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  // Helper to find original key for color mapping
  const getCategoryColor = (chineseName: string) => {
     const entry = Object.entries(categoryNames).find(([key, val]) => val === chineseName);
     if (entry) {
        return CATEGORY_COLORS[entry[0] as ExpenseCategory];
     }
     return '#ccc';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 font-serif-sc">消费记录</h2>
          <p className="text-gray-500">追踪您的旅行开销。</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#4682B4] text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-all shadow-md"
        >
          <Plus size={18} />
          <span>新增消费</span>
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Stats Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <div className="text-sm text-gray-500 mb-1 flex items-center gap-2">
            <TrendingUp size={16} /> 总支出
          </div>
          <div className="text-4xl font-bold text-gray-800">¥{totalSpent.toLocaleString()}</div>
          <div className="text-xs text-gray-400 mt-2">共 {expenses.length} 笔交易</div>
        </div>

        {/* Chart Card */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-64">
           {expenses.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `¥${value}`} />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
           ) : (
             <div className="flex items-center justify-center h-full text-gray-400 text-sm">
               暂无图表数据
             </div>
           )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 font-semibold text-gray-700">近期交易</div>
        {expenses.length === 0 ? (
           <div className="py-10">
            <EmptyState icon={DollarSign} title="暂无消费记录" description="添加您的第一笔消费以查看分析。" />
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3 font-medium">日期</th>
                  <th className="px-6 py-3 font-medium">地点</th>
                  <th className="px-6 py-3 font-medium">类别</th>
                  <th className="px-6 py-3 font-medium text-right">金额</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-600">{new Date(expense.date).toLocaleDateString('zh-CN')}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{expense.location}</td>
                    <td className="px-6 py-4">
                      <span 
                        className="px-2 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: CATEGORY_COLORS[expense.category] }}
                      >
                        {categoryNames[expense.category]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-800">¥{expense.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="新增消费">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">目的地</label>
            <input
              required
              type="text"
              placeholder="例如：伦敦"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
              value={newExpense.location || ''}
              onChange={e => setNewExpense({...newExpense, location: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">金额 (¥)</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                value={newExpense.amount || ''}
                onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
              <input
                required
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                value={newExpense.date || ''}
                onChange={e => setNewExpense({...newExpense, date: e.target.value})}
              />
            </div>
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">类别</label>
             <div className="grid grid-cols-3 gap-2">
                {Object.values(ExpenseCategory).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setNewExpense({...newExpense, category: cat})}
                    className={`text-xs py-2 rounded-lg border transition-all ${
                      newExpense.category === cat 
                      ? 'border-sky-500 bg-sky-50 text-sky-700 font-semibold' 
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {categoryNames[cat]}
                  </button>
                ))}
             </div>
          </div>
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-[#4682B4] text-white py-2 rounded-lg font-medium hover:bg-sky-700 transition-colors"
            >
              添加交易
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};