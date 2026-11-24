import bcrypt from 'bcryptjs';
import { getPool } from '../config/db.js';
import { generateId, normalizeId } from './utils.js';

class UserInstance {
  constructor(data) {
    Object.assign(this, data);
    this._id = this.id;
    if (this.assigned_courses && !this.assignedCourses) {
      this.assignedCourses = this.assigned_courses;
    }
    if (!this.assignedCourses) {
      this.assignedCourses = [];
    }
    if (!this.completedCourses) {
      this.completedCourses = [];
    }
  }

  async matchPassword(enteredPassword) {
    if (!this.password) return false;
    return bcrypt.compare(enteredPassword, this.password);
  }

  async save() {
    const pool = getPool();
    // Check if password needs hashing (if not already bcrypt hashed)
    if (this.password && !this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    const updatedAt = new Date();
    await pool.query(
      `UPDATE users SET 
        name = $1, email = $2, password = $3, role = $4, is_verified = $5, 
        is_active = $6, verification_token = $7, verification_token_expires = $8, 
        created_by = $9, updated_at = $10 
      WHERE id = $11`,
      [
        this.name,
        this.email?.toLowerCase(),
        this.password,
        this.role || 'user',
        this.isVerified ?? this.is_verified ?? true,
        this.isActive ?? this.is_active ?? true,
        this.verificationToken || this.verification_token || null,
        this.verificationTokenExpires || this.verification_token_expires || null,
        normalizeId(this.createdBy || this.created_by) || null,
        updatedAt,
        this.id
      ]
    );

    this.updated_at = updatedAt;
    this.updatedAt = updatedAt;

    // Save assignedCourses if present
    if (Array.isArray(this.assignedCourses)) {
      // Clear existing user_assigned_courses for this user
      await pool.query('DELETE FROM user_assigned_courses WHERE user_id = $1', [this.id]);
      for (const courseItem of this.assignedCourses) {
        const cId = normalizeId(courseItem);
        if (cId) {
          await pool.query(
            'INSERT INTO user_assigned_courses (user_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [this.id, cId]
          );
        }
      }
    }

    return this;
  }

  toObject() {
    const copy = { ...this };
    copy._id = this.id;
    return copy;
  }
}

class UserQuery {
  constructor(executor) {
    this._executor = executor;
    this._selectFields = null;
    this._populates = [];
    this._sortObj = null;
    this._limitNum = null;
    this._isLean = false;
  }

  select(fields) {
    this._selectFields = fields;
    return this;
  }

  populate(options) {
    this._populates.push(options);
    return this;
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
    let result = await this._executor();
    if (!result) return null;

    const isArray = Array.isArray(result);
    let items = isArray ? result : [result];

    // Handle populate
    for (const pop of this._populates) {
      const path = typeof pop === 'string' ? pop : pop.path;
      const select = typeof pop === 'object' ? pop.select : null;

      if (path === 'assignedCourses') {
        const pool = getPool();
        for (const item of items) {
          const res = await pool.query(
            `SELECT c.* FROM courses c 
             JOIN user_assigned_courses uac ON c.id = uac.course_id 
             WHERE uac.user_id = $1`,
            [item.id]
          );

          item.assignedCourses = res.rows.map(row => {
            const courseObj = {
              ...row,
              _id: row.id,
              instructorName: row.instructor_name,
              isPublished: row.is_published,
              durationMinutes: row.duration_minutes,
              learningOutcomes: row.learning_outcomes,
              estimatedDuration: row.estimated_duration,
              ratingAverage: row.rating_average,
              createdAt: row.created_at,
              updatedAt: row.updated_at
            };

            // Filter select fields if specified
            if (select) {
              const allowed = select.split(' ').filter(Boolean);
              if (allowed.length > 0) {
                const filtered = { _id: courseObj._id, id: courseObj.id };
                for (const field of allowed) {
                  if (courseObj[field] !== undefined) filtered[field] = courseObj[field];
                }
                return filtered;
              }
            }
            return courseObj;
          });
        }
      }
    }

    // Handle select (e.g. -password)
    if (this._selectFields) {
      const parts = this._selectFields.split(' ').filter(Boolean);
      const isExclude = parts.some(p => p.startsWith('-'));

      items = items.map(item => {
        const obj = this._isLean ? (item.toObject ? item.toObject() : { ...item }) : item;
        if (isExclude) {
          for (const p of parts) {
            if (p.startsWith('-')) {
              delete obj[p.slice(1)];
            }
          }
        }
        return obj;
      });
    }

    if (this._isLean) {
      items = items.map(item => (item.toObject ? item.toObject() : item));
    }

    return isArray ? items : items[0];
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }

  catch(reject) {
    return this.exec().catch(reject);
  }
}

const mapRowToUser = async (row) => {
  if (!row) return null;
  const pool = getPool();

  // Load assigned course IDs
  const assignedRes = await pool.query(
    'SELECT course_id FROM user_assigned_courses WHERE user_id = $1',
    [row.id]
  );
  const assignedCourses = assignedRes.rows.map(r => r.course_id);

  // Load completed course IDs
  const completedRes = await pool.query(
    'SELECT course_id FROM user_completed_courses WHERE user_id = $1',
    [row.id]
  );
  const completedCourses = completedRes.rows.map(r => r.course_id);

  return new UserInstance({
    id: row.id,
    _id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    role: row.role,
    isVerified: row.is_verified,
    isActive: row.is_active,
    verificationToken: row.verification_token,
    verificationTokenExpires: row.verification_token_expires,
    createdBy: row.created_by,
    assignedCourses,
    completedCourses,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  });
};

const User = {
  findOne(query = {}) {
    return new UserQuery(async () => {
      const pool = getPool();
      let sql = 'SELECT * FROM users WHERE 1=1';
      const params = [];

      if (query.email) {
        params.push(query.email.toLowerCase().trim());
        sql += ` AND LOWER(email) = LOWER($${params.length})`;
      }
      if (query._id || query.id) {
        const id = normalizeId(query._id || query.id);
        params.push(id);
        sql += ` AND id = $${params.length}`;
      }
      if (query.role) {
        params.push(query.role);
        sql += ` AND role = $${params.length}`;
      }
      if (query.verificationToken) {
        params.push(query.verificationToken);
        sql += ` AND verification_token = $${params.length}`;
      }
      if (query.verificationTokenExpires && query.verificationTokenExpires.$gt) {
        params.push(query.verificationTokenExpires.$gt);
        sql += ` AND verification_token_expires > $${params.length}`;
      }
      if (query.isActive !== undefined) {
        params.push(query.isActive);
        sql += ` AND is_active = $${params.length}`;
      }

      sql += ' LIMIT 1';
      const res = await pool.query(sql, params);
      if (res.rows.length === 0) return null;
      return await mapRowToUser(res.rows[0]);
    });
  },

  findById(id) {
    return this.findOne({ id: normalizeId(id) });
  },

  find(query = {}) {
    return new UserQuery(async () => {
      const pool = getPool();
      let sql = 'SELECT * FROM users WHERE 1=1';
      const params = [];

      if (query.role) {
        params.push(query.role);
        sql += ` AND role = $${params.length}`;
      }
      if (query.isActive !== undefined) {
        params.push(query.isActive);
        sql += ` AND is_active = $${params.length}`;
      }

      sql += ' ORDER BY created_at DESC';
      const res = await pool.query(sql, params);

      const users = [];
      for (const row of res.rows) {
        users.push(await mapRowToUser(row));
      }
      return users;
    });
  },

  async create(data) {
    const pool = getPool();
    const id = data._id || data.id || generateId();
    let password = data.password;

    if (password && !password.startsWith('$2a$') && !password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);
    }

    const email = data.email?.toLowerCase().trim();
    const name = data.name?.trim();
    const role = data.role || 'user';
    const isVerified = data.isVerified !== undefined ? data.isVerified : true;
    const isActive = data.isActive !== undefined ? data.isActive : true;
    const createdBy = normalizeId(data.createdBy) || null;
    const now = new Date();

    await pool.query(
      `INSERT INTO users (id, name, email, password, role, is_verified, is_active, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [id, name, email, password, role, isVerified, isActive, createdBy, now, now]
    );

    if (Array.isArray(data.assignedCourses)) {
      for (const courseId of data.assignedCourses) {
        const cId = normalizeId(courseId);
        if (cId) {
          await pool.query(
            'INSERT INTO user_assigned_courses (user_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [id, cId]
          );
        }
      }
    }

    return await this.findById(id);
  },

  async countDocuments(query = {}) {
    const pool = getPool();
    let sql = 'SELECT COUNT(*)::int as count FROM users WHERE 1=1';
    const params = [];

    if (query.role) {
      params.push(query.role);
      sql += ` AND role = $${params.length}`;
    }
    if (query.isActive !== undefined) {
      params.push(query.isActive);
      sql += ` AND is_active = $${params.length}`;
    }

    const res = await pool.query(sql, params);
    return res.rows[0].count;
  },

  async findByIdAndUpdate(id, update, options = {}) {
    const cleanId = normalizeId(id);
    const pool = getPool();

    // Check $addToSet for assignedCourses
    if (update.$addToSet && update.$addToSet.assignedCourses) {
      const courseId = normalizeId(update.$addToSet.assignedCourses);
      await pool.query(
        'INSERT INTO user_assigned_courses (user_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [cleanId, courseId]
      );
    }

    const user = await this.findById(cleanId);
    if (!user) return null;

    if (update.name) user.name = update.name;
    if (update.email) user.email = update.email.toLowerCase().trim();
    if (update.role) user.role = update.role;
    if (update.password) user.password = update.password;
    if (update.isActive !== undefined) user.isActive = update.isActive;
    if (update.isVerified !== undefined) user.isVerified = update.isVerified;

    await user.save();
    return user;
  },

  async findByIdAndDelete(id) {
    const cleanId = normalizeId(id);
    const pool = getPool();
    await pool.query('DELETE FROM users WHERE id = $1', [cleanId]);
    return { _id: cleanId, id: cleanId };
  },

  async deleteMany(query = {}) {
    const pool = getPool();
    await pool.query('DELETE FROM users');
    return { acknowledged: true };
  },

  async aggregate(pipeline = []) {
    const pool = getPool();
    // Support [ { $group: { _id: '$role', count: { $sum: 1 } } } ]
    const groupStage = pipeline.find(p => p.$group);
    if (groupStage && groupStage.$group._id === '$role') {
      const res = await pool.query('SELECT role as _id, count(*)::int as count FROM users GROUP BY role');
      return res.rows;
    }
    return [];
  }
};

export default User;
