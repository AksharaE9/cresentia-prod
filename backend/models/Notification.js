import { getPool } from '../config/db.js';
import { generateId, normalizeId } from './utils.js';

class NotificationInstance {
  constructor(data) {
    Object.assign(this, data);
    this._id = this.id;
  }

  toObject() {
    const copy = { ...this };
    copy._id = this.id;
    return copy;
  }

  async save() {
    const pool = getPool();
    const now = new Date();
    await pool.query(
      `UPDATE notifications SET
        title = $1, message = $2, type = $3, link = $4, is_read = $5, updated_at = $6
       WHERE id = $7`,
      [
        this.title,
        this.message,
        this.type || 'system',
        this.link || '',
        this.isRead !== undefined ? this.isRead : (this.is_read !== undefined ? this.is_read : false),
        now,
        this.id
      ]
    );
    this.updated_at = now;
    this.updatedAt = now;
    return this;
  }
}

class NotificationQuery {
  constructor(executor) {
    this._executor = executor;
    this._sortObj = null;
    this._limitNum = null;
    this._isLean = false;
  }

  sort(sortObj) {
    this._sortObj = sortObj;
    return this;
  }

  limit(limitNum) {
    this._limitNum = limitNum;
    return this;
  }

  lean() {
    this._isLean = true;
    return this;
  }

  async exec() {
    const items = await this._executor(this._limitNum);
    if (!items) return null;
    if (this._isLean) {
      return items.map(item => (item.toObject ? item.toObject() : item));
    }
    return items;
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }

  catch(reject) {
    return this.exec().catch(reject);
  }
}

const mapRowToNotification = (row) => {
  if (!row) return null;
  return new NotificationInstance({
    id: row.id,
    _id: row.id,
    recipient: row.recipient,
    title: row.title,
    message: row.message,
    type: row.type,
    link: row.link,
    isRead: row.is_read,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  });
};

const Notification = {
  findOne(query = {}) {
    return (async () => {
      const pool = getPool();
      let sql = 'SELECT * FROM notifications WHERE 1=1';
      const params = [];

      if (query._id || query.id) {
        params.push(normalizeId(query._id || query.id));
        sql += ` AND id = $${params.length}`;
      }
      if (query.recipient) {
        params.push(normalizeId(query.recipient));
        sql += ` AND recipient = $${params.length}`;
      }

      sql += ' LIMIT 1';
      const res = await pool.query(sql, params);
      if (res.rows.length === 0) return null;
      return mapRowToNotification(res.rows[0]);
    })();
  },

  find(query = {}) {
    return new NotificationQuery(async (limitNum) => {
      const pool = getPool();
      let sql = 'SELECT * FROM notifications WHERE 1=1';
      const params = [];

      if (query.recipient) {
        params.push(normalizeId(query.recipient));
        sql += ` AND recipient = $${params.length}`;
      }
      if (query.isRead !== undefined) {
        params.push(query.isRead);
        sql += ` AND is_read = $${params.length}`;
      }

      sql += ' ORDER BY created_at DESC';
      if (limitNum) {
        params.push(limitNum);
        sql += ` LIMIT $${params.length}`;
      }

      const res = await pool.query(sql, params);
      return res.rows.map(mapRowToNotification);
    });
  },

  async create(data) {
    const pool = getPool();
    const id = data._id || data.id || generateId();
    const recipient = normalizeId(data.recipient);
    const now = new Date();

    const res = await pool.query(
      `INSERT INTO notifications (id, recipient, title, message, type, link, is_read, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        id,
        recipient,
        data.title,
        data.message,
        data.type || 'system',
        data.link || '',
        data.isRead || false,
        now,
        now
      ]
    );

    return mapRowToNotification(res.rows[0]);
  },

  async insertMany(list) {
    const results = [];
    for (const item of list) {
      results.push(await this.create(item));
    }
    return results;
  },

  async updateMany(query = {}, update = {}) {
    const pool = getPool();
    let sql = 'UPDATE notifications SET ';
    const setParts = [];
    const params = [];

    if (update.$set && update.$set.isRead !== undefined) {
      params.push(update.$set.isRead);
      setParts.push(`is_read = $${params.length}`);
    }

    setParts.push(`updated_at = NOW()`);
    sql += setParts.join(', ') + ' WHERE 1=1';

    if (query.recipient) {
      params.push(normalizeId(query.recipient));
      sql += ` AND recipient = $${params.length}`;
    }
    if (query.isRead !== undefined) {
      params.push(query.isRead);
      sql += ` AND is_read = $${params.length}`;
    }

    const res = await pool.query(sql, params);
    return { acknowledged: true, modifiedCount: res.rowCount };
  },

  async countDocuments(query = {}) {
    const pool = getPool();
    let sql = 'SELECT COUNT(*)::int as count FROM notifications WHERE 1=1';
    const params = [];

    if (query.recipient) {
      params.push(normalizeId(query.recipient));
      sql += ` AND recipient = $${params.length}`;
    }
    if (query.isRead !== undefined) {
      params.push(query.isRead);
      sql += ` AND is_read = $${params.length}`;
    }

    const res = await pool.query(sql, params);
    return res.rows[0].count;
  }
};

export default Notification;
