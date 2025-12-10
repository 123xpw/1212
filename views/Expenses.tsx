import React, { useState, useEffect, useMemo } from 'react';
import { Plus, DollarSign, TrendingUp, StickyNote, Filter, Pencil, Trash2, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Expense, ExpenseCategory } from '../types';
import { apiService } from '../services/apiService';
import { CATEGORY_COLORS } from '../constants';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';

export const ExpensesView: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  const [formData, setFormData] = useState<Partial<Omit<Expense, 'amount'> & { amount: string | number }>>({
    category: ExpenseCategory.Food,
    date: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    try {
      const data = await apiService.getExpenses();
      setExpenses(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredExpenses = useMemo(() => {
    if (selectedMonth === 'all') return expenses;
    return expenses.filter(e => {
      const month = new Date(e.date).getMonth() + 1;
      return month.toString() === selectedMonth;
    });
  }, [expenses, selectedMonth]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.location || !formData.amount) return;

    try {
        const payload = {
            location: formData.location,
            amount: Number(formData.amount),
            category: formData.category as ExpenseCategory,
            date: formData.date || new Date().toISOString().split('T')[0],
            note: formData.note
        };

        if (editingId) {
            await apiService.updateExpense(editingId, payload);
            setExpenses(expenses.map(item => item.id === editingId ? { ...item, ...payload, id: editingId } : item));
        } else {
            const newExpense = await apiService.createExpense(payload);
            setExpenses([newExpense, ...expenses]);
        }
        closeModal();
    } catch (e) {
        alert('保存失败');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这条消费记录吗？')) {
      try {
        await apiService.deleteExpense(id);
        setExpenses(expenses.filter(e => e.id !== id));
      } catch (e) {
        alert('删除失败');
      }
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setFormData({
      location: expense.location,
      amount: expense.amount,
      category: expense.category,
      date: expense.date.toString().split('T')[0], // Ensure date string format
      note: expense.note
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
       category: ExpenseCategory.Food,
       date: new Date().toISOString().split('T')[0],
       location: '',
       amount: '',
       note: ''
    });
  };

  const totalSpent = useMemo(() => filteredExpenses.reduce((sum, item) => sum + Number(item.amount), 0), [filteredExpenses]);

  const chartData = useMemo(() => {
    const data: Record<string, number> = {};
    filteredExpenses.forEach(e => {
      const name = e.category; 
      data[name] = (data[name] || 0) + Number(e.amount);
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [filteredExpenses]);

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#4682B4]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 font-serif-sc">消费记录</h2>
          <p className="text-gray-500">追踪您的旅行开销。</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full md:w-40 pl-9 pr-4 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-sky-500/20 outline-none appearance-none"
            >
              <option value="all">所有月份</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{m}月</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-shrink-0 flex items-center gap-2 bg-[#4682B4] text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-all shadow-md text-sm font-medium"
          >
            <Plus size={18} />
            <span className="hidden md:inline">新增消费</span>
            <span className="md:hidden">新增</span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <div className="text-sm text-gray-500 mb-1 flex items-center gap-2">
            <TrendingUp size={16} /> 
            {selectedMonth === 'all' ? '总支出' : `${selectedMonth}月总支出`}
          </div>
          <div className="text-4xl font-bold text-gray-800">¥{totalSpent.toLocaleString()}</div>
          <div className="text-xs text-gray-400 mt-2">共 {filteredExpenses.length} 笔交易</div>
        </div>

        <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-64">
           {filteredExpenses.length > 0 ? (
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
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name as ExpenseCategory] || '#ccc'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `¥${value}`} />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
           ) : (
             <div className="flex items-center justify-center h-full text-gray-400 text-sm">
               该时段暂无图表数据
             </div>
           )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 font-semibold text-gray-700 flex justify-between items-center">
          <span>近期交易</span>
          {selectedMonth !== 'all' && <span className="text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded">筛选中: {selectedMonth}月</span>}
        </div>
        {filteredExpenses.length === 0 ? (
           <div className="py-10">
            <EmptyState icon={DollarSign} title="暂无消费记录" description="添加您的第一笔消费以查看分析。" />
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3 font-medium">日期</th>
                  <th className="px-6 py-3 font-medium">地点/内容</th>
                  <th className="px-6 py-3 font-medium">类别</th>
                  <th className="px-6 py-3 font-medium text-right">金额</th>
                  <th className="px-6 py-3 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 text-gray-600 w-32 whitespace-nowrap">{new Date(expense.date).toLocaleDateString('zh-CN')}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{expense.location}</div>
                      {expense.note && (
                        <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                          <StickyNote size={10} /> {expense.note}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span 
                        className="px-2 py-1 rounded-full text-xs font-medium text-white whitespace-nowrap"
                        style={{ backgroundColor: CATEGORY_COLORS[expense.category] }}
                      >
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-800">¥{Number(expense.amount).toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                           onClick={() => handleEdit(expense)}
                           className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                           title="修正"
                         >
                           <Pencil size={14} />
                         </button>
                         <button 
                           onClick={() => handleDelete(expense.id)}
                           className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                           title="删除"
                         >
                           <Trash2 size={14} />
                         </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "修正消费记录" : "新增消费"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">目的地 / 商家</label>
            <input
              required
              type="text"
              placeholder="例如：星巴克，或 伦敦希思罗机场"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
              value={formData.location || ''}
              onChange={e => setFormData({...formData, location: e.target.value})}
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
                value={formData.amount || ''}
                onChange={e => setFormData({...formData, amount: e.target.value})}
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
              <input
                required
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                value={formData.date || ''}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">备注 (可选)</label>
            <input
              type="text"
              placeholder="例如：给朋友带的礼物，打车去酒店"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
              value={formData.note || ''}
              onChange={e => setFormData({...formData, note: e.target.value})}
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">类别</label>
             <div className="grid grid-cols-3 gap-2">
                {Object.values(ExpenseCategory).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData({...formData, category: cat})}
                    className={`text-xs py-2 rounded-lg border transition-all ${
                      formData.category === cat 
                      ? 'border-sky-500 bg-sky-50 text-sky-700 font-semibold' 
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
             </div>
          </div>
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-[#4682B4] text-white py-2 rounded-lg font-medium hover:bg-sky-700 transition-colors"
            >
              {editingId ? '保存修改' : '保存消费记录'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};