import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { pool } from '../config/db';
import { RowDataPacket } from 'mysql2';

// 获取公共目的地列表 (支持分类筛选)
export const getDestinations = async (req: ExpressRequest, res: ExpressResponse) => {
  try {
    const category = req.query.category as string; // 'Featured', 'Seasonal', 'Value'

    let query = `
      SELECT d.*, 
      GROUP_CONCAT(t.tag_name) as tags 
      FROM destinations d
      LEFT JOIN destination_tags t ON d.id = t.destination_id
    `;
    
    const params: any[] = [];

    // 如果有分类参数，先通过子查询或Join过滤
    if (category) {
      query += ` WHERE d.id IN (SELECT destination_id FROM destination_tags WHERE tag_name = ?)`;
      params.push(category);
    }

    query += ` GROUP BY d.id`;

    const [rows] = await pool.query<RowDataPacket[]>(query, params);

    // 处理 tags 字符串转数组 (GROUP_CONCAT 返回 "Featured,Seasonal")
    const formattedRows = rows.map(row => ({
      ...row,
      tags: row.tags ? (row.tags as string).split(',') : []
    }));

    res.json(formattedRows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching destinations', error });
  }
};

// 获取目的地详情
export const getDestinationById = async (req: ExpressRequest, res: ExpressResponse) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM destinations WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      res.status(404).json({ message: 'Destination not found' });
      return;
    }
    
    // 获取 Tags
    const [tagRows] = await pool.query<RowDataPacket[]>('SELECT tag_name FROM destination_tags WHERE destination_id = ?', [id]);
    const tags = tagRows.map(row => row.tag_name);

    res.json({ ...rows[0], tags });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching destination details', error });
  }
};