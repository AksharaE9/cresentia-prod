import { getPool } from '../config/db.js';
import { generateId, normalizeId } from './utils.js';
import Course from './Course.js';

class EnrollmentInstance {
  constructor(data) {
    Object.assign(this, data);
    this._id = this.id;
    if (!Array.isArray(this.completedVideos)) this.completedVideos = [];
    if (!Array.isArray(this.completedModules)) this.completedModules = [];
    if (!Array.isArray(this.assessmentResults)) this.assessmentResults = [];
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
      `UPDATE enrollments SET
        completed_videos = $1, completed_modules = $2, current_module_index = $3,
        assessment_results = $4, quiz_score = $5, quiz_attempts = $6,
        quiz_submitted_at = $7, progress_percent = $8, completed_at = $9,
        total_points_earned = $10, average_assessment_score = $11, updated_at = $12
      WHERE id = $13`,
      [
        JSON.stringify(this.completedVideos || []),
        JSON.stringify(this.completedModules || []),
        this.currentModuleIndex !== undefined ? this.currentModuleIndex : 0,
        JSON.stringify(this.assessmentResults || []),
        this.quizScore !== undefined ? this.quizScore : 0,
        this.quizAttempts !== undefined ? this.quizAttempts : 0,
        this.quizSubmittedAt || null,
        this.progressPercent !== undefined ? this.progressPercent : 0,
        this.completedAt || null,
        this.totalPointsEarned !== undefined ? this.totalPointsEarned : 0,
        this.averageAssessmentScore !== undefined ? this.averageAssessmentScore : 0,
        now,
        this.id
      ]
    );

    this.updated_at = now;
    this.updatedAt = now;
    return this;
  }
}

class EnrollmentQuery {
  constructor(executor) {
    this._executor = executor;
    this._populates = [];
    this._sortObj = null;
    this._isLean = false;
  }

  populate(field, select) {
    this._populates.push({ field, select });
    return this;
  }

  sort(sortObj) {
    this._sortObj = sortObj;
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

    const pool = getPool();

    for (const pop of this._populates) {
      const field = typeof pop.field === 'string' ? pop.field : pop.field?.path;
      const select = pop.select || pop.field?.select;

      if (field === 'course') {
        for (const item of items) {
          const cId = normalizeId(item.course);
          if (cId) {
            const course = await Course.findById(cId);
            if (course) {
              if (select) {
                const allowed = select.split(' ').filter(Boolean);
                const filtered = { _id: course._id, id: course.id };
                for (const k of allowed) {
                  if (course[k] !== undefined) filtered[k] = course[k];
                }
                item.course = filtered;
              } else {
                item.course = course.toObject ? course.toObject() : course;
              }
            }
          }
        }
      } else if (field === 'student') {
        for (const item of items) {
          const sId = normalizeId(item.student);
          if (sId) {
            const uRes = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [sId]);
            if (uRes.rows.length > 0) {
              const u = uRes.rows[0];
              item.student = { _id: u.id, id: u.id, name: u.name, email: u.email };
            }
          }
        }
      }
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

const mapRowToEnrollment = (row) => {
  if (!row) return null;
  return new EnrollmentInstance({
    id: row.id,
    _id: row.id,
    student: row.student_id,
    student_id: row.student_id,
    course: row.course_id,
    course_id: row.course_id,
    completedVideos: typeof row.completed_videos === 'string' ? JSON.parse(row.completed_videos) : row.completed_videos || [],
    completedModules: typeof row.completed_modules === 'string' ? JSON.parse(row.completed_modules) : row.completed_modules || [],
    currentModuleIndex: row.current_module_index || 0,
    assessmentResults: typeof row.assessment_results === 'string' ? JSON.parse(row.assessment_results) : row.assessment_results || [],
    quizScore: row.quiz_score || 0,
    quizAttempts: row.quiz_attempts || 0,
    quizSubmittedAt: row.quiz_submitted_at,
    progressPercent: row.progress_percent || 0,
    completedAt: row.completed_at,
    totalPointsEarned: row.total_points_earned || 0,
    averageAssessmentScore: row.average_assessment_score || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  });
};

const Enrollment = {
  findOne(query = {}) {
    return new EnrollmentQuery(async () => {
      const pool = getPool();
      let sql = 'SELECT * FROM enrollments WHERE 1=1';
      const params = [];

      if (query._id || query.id) {
        params.push(normalizeId(query._id || query.id));
        sql += ` AND id = $${params.length}`;
      }
      if (query.student) {
        params.push(normalizeId(query.student));
        sql += ` AND student_id = $${params.length}`;
      }
      if (query.course) {
        params.push(normalizeId(query.course));
        sql += ` AND course_id = $${params.length}`;
      }

      sql += ' LIMIT 1';
      const res = await pool.query(sql, params);
      if (res.rows.length === 0) return null;
      return mapRowToEnrollment(res.rows[0]);
    });
  },

  find(query = {}) {
    return new EnrollmentQuery(async () => {
      const pool = getPool();
      let sql = 'SELECT * FROM enrollments WHERE 1=1';
      const params = [];

      if (query.student) {
        params.push(normalizeId(query.student));
        sql += ` AND student_id = $${params.length}`;
      }
      if (query.course) {
        params.push(normalizeId(query.course));
        sql += ` AND course_id = $${params.length}`;
      }

      sql += ' ORDER BY updated_at DESC';
      const res = await pool.query(sql, params);
      return res.rows.map(mapRowToEnrollment);
    });
  },

  async create(data) {
    const pool = getPool();
    const id = data._id || data.id || generateId();
    const studentId = normalizeId(data.student || data.student_id);
    const courseId = normalizeId(data.course || data.course_id);
    const now = new Date();

    const insertSql = `
      INSERT INTO enrollments (
        id, student_id, course_id, completed_videos, completed_modules,
        current_module_index, assessment_results, quiz_score, quiz_attempts,
        quiz_submitted_at, progress_percent, completed_at, total_points_earned,
        average_assessment_score, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      ON CONFLICT (student_id, course_id) DO UPDATE SET updated_at = $16
      RETURNING *
    `;

    const res = await pool.query(insertSql, [
      id,
      studentId,
      courseId,
      JSON.stringify(data.completedVideos || []),
      JSON.stringify(data.completedModules || []),
      data.currentModuleIndex || 0,
      JSON.stringify(data.assessmentResults || []),
      data.quizScore || 0,
      data.quizAttempts || 0,
      data.quizSubmittedAt || null,
      data.progressPercent || 0,
      data.completedAt || null,
      data.totalPointsEarned || 0,
      data.averageAssessmentScore || 0,
      now,
      now
    ]);

    return mapRowToEnrollment(res.rows[0]);
  },

  async insertMany(list) {
    const results = [];
    for (const item of list) {
      results.push(await this.create(item));
    }
    return results;
  },

  async countDocuments(query = {}) {
    const pool = getPool();
    let sql = 'SELECT COUNT(*)::int as count FROM enrollments WHERE 1=1';
    const params = [];

    if (query.progressPercent !== undefined) {
      params.push(query.progressPercent);
      sql += ` AND progress_percent = $${params.length}`;
    }

    const res = await pool.query(sql, params);
    return res.rows[0].count;
  },

  async findByIdAndDelete(id) {
    const cleanId = normalizeId(id);
    const pool = getPool();
    await pool.query('DELETE FROM enrollments WHERE id = $1', [cleanId]);
    return { _id: cleanId, id: cleanId };
  },

  async findOneAndDelete(query = {}) {
    const pool = getPool();
    let sql = 'DELETE FROM enrollments WHERE 1=1';
    const params = [];

    if (query.student) {
      params.push(normalizeId(query.student));
      sql += ` AND student_id = $${params.length}`;
    }
    if (query.course) {
      params.push(normalizeId(query.course));
      sql += ` AND course_id = $${params.length}`;
    }

    await pool.query(sql, params);
    return { acknowledged: true };
  },

  async deleteMany(query = {}) {
    const pool = getPool();
    let sql = 'DELETE FROM enrollments WHERE 1=1';
    const params = [];

    if (query.student) {
      params.push(normalizeId(query.student));
      sql += ` AND student_id = $${params.length}`;
    }
    if (query.course) {
      params.push(normalizeId(query.course));
      sql += ` AND course_id = $${params.length}`;
    }

    await pool.query(sql, params);
    return { acknowledged: true };
  }
};

export default Enrollment;
