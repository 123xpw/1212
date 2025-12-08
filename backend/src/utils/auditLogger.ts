import { pool } from '../config/db';

interface AuditLogParams {
  userId: number;
  action: 'INSERT' | 'UPDATE' | 'DELETE' | 'LOGIN';
  targetTable: string;
  targetId?: number;
  oldValue?: any;
  newValue?: any;
  ip?: string;
  userAgent?: string;
}

export const logAudit = async (params: AuditLogParams) => {
  const { userId, action, targetTable, targetId, oldValue, newValue, ip, userAgent } = params;

  const query = `
    INSERT INTO audit_log 
    (user_id, action, target_table, target_id, old_value, new_value, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    await pool.execute(query, [
      userId,
      action,
      targetTable,
      targetId || null,
      oldValue ? JSON.stringify(oldValue) : null,
      newValue ? JSON.stringify(newValue) : null,
      ip || null,
      userAgent || null
    ]);
    console.log(`📝 Audit Log Recorded: [${action}] on ${targetTable} by User ${userId}`);
  } catch (error) {
    console.error('Failed to record audit log:', error);
    // Don't throw error here to avoid blocking the main business logic
  }
};