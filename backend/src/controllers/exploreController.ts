import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { pool } from '../config/db';
import { RowDataPacket } from 'mysql2';

// 辅助函数：将 DB 行转换为前端 CamelCase 格式
const mapDestinationToFrontend = (row: any) => ({
  id: row.id,
  name: row.name,
  country: row.country,
  description: row.description,
  recommendedReason: row.recommended_reason, // Map snake_case
  bestSeason: row.best_season,               // Map snake_case
  budgetLevel: row.budget_level,             // Map snake_case
  imageUrl: row.image_url,                   // Map snake_case
  tags: row.tags ? (typeof row.tags === 'string' ? row.tags.split(',') : row.tags) : []
});

// 获取公共目的地列表 (支持分类筛选)
export const getDestinations = async (req: any, res: any) => {
  try {
    const category = req.query.category as string; // 'Featured', 'Seasonal', 'Value'

    let query = `
      SELECT d.*, 
      GROUP_CONCAT(t.tag_name) as tags 
      FROM destinations d
      LEFT JOIN destination_tags t ON d.id = t.destination_id
    `;
    
    const params: any[] = [];

    if (category) {
      query += ` WHERE d.id IN (SELECT destination_id FROM destination_tags WHERE tag_name = ?)`;
      params.push(category);
    }

    query += ` GROUP BY d.id`;

    const [rows] = await pool.query<RowDataPacket[]>(query, params);

    const formattedRows = rows.map(mapDestinationToFrontend);

    res.json(formattedRows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching destinations', error });
  }
};

// 获取目的地详情
export const getDestinationById = async (req: any, res: any) => {
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

    const destination = { ...rows[0], tags };
    res.json(mapDestinationToFrontend(destination));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching destination details', error });
  }
};