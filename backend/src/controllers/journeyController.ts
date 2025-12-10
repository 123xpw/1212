import { Request, Response } from 'express';
import { pool } from '../config/db';
import { logAudit } from '../utils/auditLogger';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { AuthRequest } from '../middleware/authMiddleware';

// 获取所有旅程
export const getJourneys = async (req: any, res: any) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const [rows] = await pool.query('SELECT * FROM travel_footprints WHERE user_id = ? ORDER BY date DESC', [userId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching journeys', error });
  }
};

// 新增旅程
export const createJourney = async (req: any, res: any) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const { location, date, description } = req.body;

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO travel_footprints (user_id, location, date, description) VALUES (?, ?, ?, ?)',
      [userId, location, date, description]
    );

    const newJourneyId = result.insertId;
    const newJourney = { id: newJourneyId, userId, location, date, description };

    await logAudit({
      userId,
      action: 'INSERT',
      targetTable: 'travel_footprints',
      targetId: newJourneyId,
      newValue: newJourney,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json(newJourney);
  } catch (error) {
    res.status(500).json({ message: 'Error creating journey', error });
  }
};

// 删除旅程
export const deleteJourney = async (req: any, res: any) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const journeyId = req.params.id;

    const [oldRows] = await pool.query<RowDataPacket[]>('SELECT * FROM travel_footprints WHERE id = ? AND user_id = ?', [journeyId, userId]);
    if (oldRows.length === 0) {
      res.status(404).json({ message: 'Journey not found' });
      return;
    }

    await pool.execute('DELETE FROM travel_footprints WHERE id = ?', [journeyId]);

    await logAudit({
      userId,
      action: 'DELETE',
      targetTable: 'travel_footprints',
      targetId: Number(journeyId),
      oldValue: oldRows[0],
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ message: 'Journey deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting journey', error });
  }
};