import { Request, Response } from 'express';
import { pool } from '../config/db';
import { logAudit } from '../utils/auditLogger';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { AuthRequest } from '../middleware/authMiddleware';

// 映射函数
const mapWishlistToFrontend = (row: any) => ({
    id: row.id,
    location: row.location,
    plannedDate: row.planned_date,
    reason: row.reason,
    priority: row.priority,
    budget: row.budget,
    status: row.status
});

export const getWishlist = async (req: any, res: any) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM wishlist WHERE user_id = ? ORDER BY priority DESC', [userId]);
    res.json(rows.map(mapWishlistToFrontend));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wishlist', error });
  }
};

export const createWishlistItem = async (req: any, res: any) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const { location, plannedDate, reason, priority, budget, status } = req.body;

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO wishlist (user_id, location, planned_date, reason, priority, budget, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, location, plannedDate, reason, priority, budget, status || 'Pending']
    );

    const newItemId = result.insertId;
    const newItem = { id: newItemId, userId, location, planned_date: plannedDate, reason, priority, budget, status };

    await logAudit({
      userId,
      action: 'INSERT',
      targetTable: 'wishlist',
      targetId: newItemId,
      newValue: newItem,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json(mapWishlistToFrontend(newItem));
  } catch (error) {
    res.status(500).json({ message: 'Error creating wishlist item', error });
  }
};

export const updateWishlistItem = async (req: any, res: any) => {
    try {
      const userId = (req as AuthRequest).user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      const id = req.params.id;
      const { location, plannedDate, reason, priority, budget, status } = req.body;
  
      // 获取旧值
      const [oldRows] = await pool.query<RowDataPacket[]>('SELECT * FROM wishlist WHERE id = ? AND user_id = ?', [id, userId]);
      if (oldRows.length === 0) {
        res.status(404).json({ message: 'Item not found' });
        return;
      }
  
      await pool.execute(
        'UPDATE wishlist SET location=?, planned_date=?, reason=?, priority=?, budget=?, status=? WHERE id=?',
        [location, plannedDate, reason, priority, budget, status, id]
      );
  
      const newValue = { id, userId, location, planned_date: plannedDate, reason, priority, budget, status };
  
      await logAudit({
        userId,
        action: 'UPDATE',
        targetTable: 'wishlist',
        targetId: Number(id),
        oldValue: oldRows[0],
        newValue,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
  
      res.json({ message: 'Updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error updating wishlist item', error });
    }
  };

export const deleteWishlistItem = async (req: any, res: any) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const id = req.params.id;

    const [oldRows] = await pool.query<RowDataPacket[]>('SELECT * FROM wishlist WHERE id = ? AND user_id = ?', [id, userId]);
    if (oldRows.length === 0) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    await pool.execute('DELETE FROM wishlist WHERE id = ?', [id]);

    await logAudit({
      userId,
      action: 'DELETE',
      targetTable: 'wishlist',
      targetId: Number(id),
      oldValue: oldRows[0],
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting wishlist item', error });
  }
};