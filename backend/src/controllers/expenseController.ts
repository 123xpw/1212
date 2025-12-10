import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { pool } from '../config/db';
import { logAudit } from '../utils/auditLogger';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

interface AuthRequest extends ExpressRequest {
  user?: { id: number };
}

// 获取消费列表
export const getExpenses = async (req: any, res: any) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) {
      res.status(401).json({ message: 'User ID missing' });
      return;
    }
    const [rows] = await pool.query('SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC', [userId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expenses', error });
  }
};

// 新增消费
export const createExpense = async (req: any, res: any) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) {
      res.status(401).json({ message: 'User ID missing' });
      return;
    }
    // 修正：使用 location 和 note
    const { location, amount, date, category, note } = req.body;

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO expenses (user_id, location, amount, date, category, note) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, location, amount, date, category, note]
    );

    const newExpenseId = result.insertId;
    const newExpenseData = { id: newExpenseId, userId, location, amount, date, category, note };

    // 记录审计日志
    await logAudit({
      userId,
      action: 'INSERT',
      targetTable: 'expenses',
      targetId: newExpenseId,
      newValue: newExpenseData,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json(newExpenseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating expense', error });
  }
};

// 更新消费
export const updateExpense = async (req: any, res: any) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) {
      res.status(401).json({ message: 'User ID missing' });
      return;
    }
    const expenseId = Number(req.params.id);
    const { location, amount, date, category, note } = req.body;

    // 1. 获取旧值 (用于审计)
    const [oldRows] = await pool.query<RowDataPacket[]>('SELECT * FROM expenses WHERE id = ? AND user_id = ?', [expenseId, userId]);
    if (oldRows.length === 0) {
      res.status(404).json({ message: 'Expense not found' });
      return;
    }
    const oldValue = oldRows[0];

    // 2. 执行更新
    await pool.execute(
      'UPDATE expenses SET location = ?, amount = ?, date = ?, category = ?, note = ? WHERE id = ?',
      [location, amount, date, category, note, expenseId]
    );

    const newValue = { ...oldValue, location, amount, date, category, note };

    // 3. 记录审计日志
    await logAudit({
      userId,
      action: 'UPDATE',
      targetTable: 'expenses',
      targetId: expenseId,
      oldValue: oldValue,
      newValue: newValue,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ message: 'Expense updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating expense', error });
  }
};

// 删除消费
export const deleteExpense = async (req: any, res: any) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) {
      res.status(401).json({ message: 'User ID missing' });
      return;
    }
    const expenseId = Number(req.params.id);

    // 1. 获取旧值
    const [oldRows] = await pool.query<RowDataPacket[]>('SELECT * FROM expenses WHERE id = ? AND user_id = ?', [expenseId, userId]);
    if (oldRows.length === 0) {
      res.status(404).json({ message: 'Expense not found' });
      return;
    }
    const oldValue = oldRows[0];

    // 2. 执行删除
    await pool.execute('DELETE FROM expenses WHERE id = ?', [expenseId]);

    // 3. 记录审计
    await logAudit({
      userId,
      action: 'DELETE',
      targetTable: 'expenses',
      targetId: expenseId,
      oldValue: oldValue,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting expense', error });
  }
};