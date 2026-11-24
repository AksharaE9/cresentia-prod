import { getPool } from '../config/db.js';
import { generateId, normalizeId } from './utils.js';

class CourseInstance {
  constructor(data) {
    Object.assign(this, data);
    this._id = this.id;
    if (!Array.isArray(this.videos)) this.videos = [];
    if (!Array.isArray(this.quizQuestions)) this.quizQuestions = [];
    if (!Array.isArray(this.modules)) this.modules = [];
    if (!Array.isArray(this.reviews)) this.reviews = [];
    if (!Array.isArray(this.learningOutcomes)) this.learningOutcomes = [];
    if (!Array.isArray(this.prerequisites)) this.prerequisites = [];
    if (!Array.isArray(this.assignedUsers)) this.assignedUsers = [];
    if (!Array.isArray(this.studentsAssigned)) this.studentsAssigned = [];
  }

  get totalPoints() {
    if (this.modules && this.modules.length > 0) {
      return this.modules.reduce((total, mod) => {
        if (mod.questions && mod.questions.length > 0) {
          return total + mod.questions.reduce((sum, q) => sum + (q.points || 1), 0);
        }
        return total;
      }, 0);
    }
    return 0;
  }

  toObject() {
    const copy = { ...this };
    copy._id = this.id;
    copy.totalPoints = this.totalPoints;
    return copy;
  }

  async save() {
    const pool = getPool();
    const now = new Date();

    await pool.query(
      `UPDATE courses SET 
        category = $1, level = $2, title = $3, description = $4, thumbnail = $5,
        instructor_name = $6, is_published = $7, learning_outcomes = $8, prerequisites = $9,
        target_audience = $10, estimated_duration = $11, difficulty_level = $12, course_template = $13,
        duration_minutes = $14, created_by = $15, rating_average = $16, updated_at = $17
      WHERE id = $18`,
      [
        this.category,
        this.level || 'Beginner',
        this.title,
        this.description,
        this.thumbnail || '',
        this.instructorName || this.instructor_name || 'Crescentia Faculty',
        this.isPublished !== undefined ? this.isPublished : (this.is_published !== undefined ? this.is_published : true),
        JSON.stringify(this.learningOutcomes || []),
        JSON.stringify(this.prerequisites || []),
        this.targetAudience || this.target_audience || '',
        this.estimatedDuration || this.estimated_duration || 0,
        this.difficultyLevel || this.difficulty_level || 'Beginner',
        this.courseTemplate || this.course_template || 'default',
        this.durationMinutes || this.duration_minutes || 0,
        normalizeId(this.createdBy || this.created_by),
        this.ratingAverage || this.rating_average || 0,
        now,
        this.id
      ]
    );

    this.updated_at = now;
    this.updatedAt = now;

    // Sync videos if updated
    if (Array.isArray(this.videos)) {
      await pool.query('DELETE FROM course_videos WHERE course_id = $1', [this.id]);
      for (const v of this.videos) {
        await pool.query(
          'INSERT INTO course_videos (course_id, title, url, duration_minutes, thumbnail_url) VALUES ($1, $2, $3, $4, $5)',
          [this.id, v.title, v.url, v.durationMinutes || v.duration_minutes || 30, v.thumbnailUrl || v.thumbnail_url || null]
        );
      }
    }

    // Sync quiz questions if updated
    if (Array.isArray(this.quizQuestions)) {
      await pool.query('DELETE FROM course_quiz_questions WHERE course_id = $1', [this.id]);
      for (const q of this.quizQuestions) {
        await pool.query(
          'INSERT INTO course_quiz_questions (course_id, question, options, correct_answer) VALUES ($1, $2, $3, $4)',
          [this.id, q.question, JSON.stringify(q.options), q.correctAnswer ?? q.correct_answer]
        );
      }
    }

    // Sync modules if updated
    if (Array.isArray(this.modules)) {
      await pool.query('DELETE FROM course_modules WHERE course_id = $1', [this.id]);
      for (const m of this.modules) {
        const mId = m.id || m._id || generateId();
        await pool.query(
          `INSERT INTO course_modules (
            id, course_id, type, title, "order", video_url, thumbnail_url,
            duration_minutes, content, concept_explanation, key_takeaways,
            questions, time_limit, passing_score, case_study_content,
            analysis_questions, scenario_description, reflection_prompts
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
          [
            mId,
            this.id,
            m.type,
            m.title,
            m.order !== undefined ? m.order : 0,
            m.videoUrl || m.video_url || null,
            m.thumbnailUrl || m.thumbnail_url || null,
            m.durationMinutes || m.duration_minutes || null,
            m.content || null,
            m.conceptExplanation || m.concept_explanation || null,
            JSON.stringify(m.keyTakeaways || m.key_takeaways || []),
            JSON.stringify(m.questions || []),
            m.timeLimit !== undefined ? m.timeLimit : 15,
            m.passingScore !== undefined ? m.passingScore : 70,
            m.caseStudyContent || m.case_study_content || null,
            JSON.stringify(m.analysisQuestions || m.analysis_questions || []),
            m.scenarioDescription || m.scenario_description || null,
            JSON.stringify(m.reflectionPrompts || m.reflection_prompts || [])
          ]
        );
      }
    }

    // Sync reviews if updated
    if (Array.isArray(this.reviews)) {
      await pool.query('DELETE FROM course_reviews WHERE course_id = $1', [this.id]);
      for (const r of this.reviews) {
        await pool.query(
          'INSERT INTO course_reviews (course_id, user_id, name, rating, comment, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [this.id, normalizeId(r.user || r.user_id), r.name, r.rating, r.comment, r.createdAt || now, r.updatedAt || now]
        );
      }
    }

    return this;
  }
}

class CourseQuery {
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

  populate(field, select) {
    this._populates.push({ field, select });
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
    let result = await this._executor(this._limitNum);
    if (!result) return null;

    const isArray = Array.isArray(result);
    let items = isArray ? result : [result];

    // Handle populate
    for (const pop of this._populates) {
      const field = typeof pop.field === 'string' ? pop.field : pop.field?.path;
      const select = pop.select || pop.field?.select;

      if (field === 'createdBy') {
        const pool = getPool();
        for (const item of items) {
          const uId = normalizeId(item.createdBy);
          if (uId) {
            const uRes = await pool.query('SELECT id, name FROM users WHERE id = $1', [uId]);
            if (uRes.rows.length > 0) {
              item.createdBy = { _id: uRes.rows[0].id, id: uRes.rows[0].id, name: uRes.rows[0].name };
            }
          }
        }
      } else if (field === 'reviews.user') {
        const pool = getPool();
        for (const item of items) {
          if (Array.isArray(item.reviews)) {
            for (const r of item.reviews) {
              const uId = normalizeId(r.user);
              if (uId) {
                const uRes = await pool.query('SELECT id, name FROM users WHERE id = $1', [uId]);
                if (uRes.rows.length > 0) {
                  r.user = { _id: uRes.rows[0].id, id: uRes.rows[0].id, name: uRes.rows[0].name };
                }
              }
            }
          }
        }
      }
    }

    if (this._selectFields) {
      const allowed = this._selectFields.split(' ').filter(Boolean);
      items = items.map(item => {
        const base = this._isLean ? (item.toObject ? item.toObject() : { ...item }) : item;
        const res = { _id: base._id, id: base.id };
        for (const k of allowed) {
          if (base[k] !== undefined) res[k] = base[k];
        }
        return res;
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

const mapRowToCourse = async (row, includeChildren = true) => {
  if (!row) return null;
  const pool = getPool();
  let videos = [];
  let quizQuestions = [];
  let modules = [];
  let reviews = [];
  let assignedUsers = [];

  if (includeChildren) {
    // Videos
    const vRes = await pool.query('SELECT * FROM course_videos WHERE course_id = $1 ORDER BY id ASC', [row.id]);
    videos = vRes.rows.map(v => ({
      _id: v.id.toString(),
      id: v.id,
      title: v.title,
      url: v.url,
      durationMinutes: v.duration_minutes,
      thumbnailUrl: v.thumbnail_url
    }));

    // Quiz Questions
    const qRes = await pool.query('SELECT * FROM course_quiz_questions WHERE course_id = $1 ORDER BY id ASC', [row.id]);
    quizQuestions = qRes.rows.map(q => ({
      _id: q.id.toString(),
      id: q.id,
      question: q.question,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
      correctAnswer: q.correct_answer
    }));

    // Modules
    const mRes = await pool.query('SELECT * FROM course_modules WHERE course_id = $1 ORDER BY "order" ASC', [row.id]);
    modules = mRes.rows.map(m => ({
      _id: m.id,
      id: m.id,
      type: m.type,
      title: m.title,
      order: m.order,
      videoUrl: m.video_url,
      thumbnailUrl: m.thumbnail_url,
      durationMinutes: m.duration_minutes,
      content: m.content,
      conceptExplanation: m.concept_explanation,
      keyTakeaways: typeof m.key_takeaways === 'string' ? JSON.parse(m.key_takeaways) : m.key_takeaways || [],
      questions: typeof m.questions === 'string' ? JSON.parse(m.questions) : m.questions || [],
      timeLimit: m.time_limit,
      passingScore: m.passing_score,
      caseStudyContent: m.case_study_content,
      analysisQuestions: typeof m.analysis_questions === 'string' ? JSON.parse(m.analysis_questions) : m.analysis_questions || [],
      scenarioDescription: m.scenario_description,
      reflectionPrompts: typeof m.reflection_prompts === 'string' ? JSON.parse(m.reflection_prompts) : m.reflection_prompts || []
    }));

    // Reviews
    const rRes = await pool.query('SELECT * FROM course_reviews WHERE course_id = $1 ORDER BY created_at DESC', [row.id]);
    reviews = rRes.rows.map(r => ({
      _id: r.id.toString(),
      id: r.id,
      user: r.user_id,
      name: r.name,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));

    // Assigned Users
    const uRes = await pool.query('SELECT user_id FROM user_assigned_courses WHERE course_id = $1', [row.id]);
    assignedUsers = uRes.rows.map(r => r.user_id);
  }

  return new CourseInstance({
    id: row.id,
    _id: row.id,
    category: row.category,
    level: row.level,
    title: row.title,
    description: row.description,
    thumbnail: row.thumbnail,
    instructorName: row.instructor_name,
    isPublished: row.is_published,
    learningOutcomes: typeof row.learning_outcomes === 'string' ? JSON.parse(row.learning_outcomes) : row.learning_outcomes || [],
    prerequisites: typeof row.prerequisites === 'string' ? JSON.parse(row.prerequisites) : row.prerequisites || [],
    targetAudience: row.target_audience,
    estimatedDuration: row.estimated_duration ? Number(row.estimated_duration) : 0,
    difficultyLevel: row.difficulty_level,
    courseTemplate: row.course_template,
    durationMinutes: row.duration_minutes || 0,
    createdBy: row.created_by,
    ratingAverage: row.rating_average ? Number(row.rating_average) : 0,
    videos,
    quizQuestions,
    modules,
    reviews,
    assignedUsers,
    studentsAssigned: assignedUsers,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  });
};

const Course = {
  findOne(query = {}) {
    return new CourseQuery(async () => {
      const pool = getPool();
      let sql = 'SELECT * FROM courses WHERE 1=1';
      const params = [];

      if (query._id || query.id) {
        const id = normalizeId(query._id || query.id);
        params.push(id);
        sql += ` AND id = $${params.length}`;
      }

      sql += ' LIMIT 1';
      const res = await pool.query(sql, params);
      if (res.rows.length === 0) return null;
      return await mapRowToCourse(res.rows[0], true);
    });
  },

  findById(id) {
    return this.findOne({ id: normalizeId(id) });
  },

  find(query = {}) {
    return new CourseQuery(async (limitNum) => {
      const pool = getPool();
      let sql = 'SELECT * FROM courses WHERE 1=1';
      const params = [];

      if (query.category) {
        params.push(query.category);
        sql += ` AND category = $${params.length}`;
      }

      if (query.level) {
        params.push(query.level);
        sql += ` AND level = $${params.length}`;
      }

      if (query.isPublished !== undefined) {
        params.push(query.isPublished);
        sql += ` AND is_published = $${params.length}`;
      }

      if (query.createdBy) {
        params.push(normalizeId(query.createdBy));
        sql += ` AND created_by = $${params.length}`;
      }

      if (query._id && query._id.$in) {
        const ids = query._id.$in.map(normalizeId).filter(Boolean);
        if (ids.length === 0) {
          return [];
        }
        params.push(ids);
        sql += ` AND id = ANY($${params.length}::text[])`;
      }

      if (query.title && query.title.$regex) {
        const term = query.title.$regex.replace(/^\^/, '');
        params.push(`%${term}%`);
        sql += ` AND title ILIKE $${params.length}`;
      }

      if (query.$or) {
        const conditions = [];
        for (const cond of query.$or) {
          if (cond.title?.$regex) {
            params.push(`%${cond.title.$regex}%`);
            conditions.push(`title ILIKE $${params.length}`);
          } else if (cond.description?.$regex) {
            params.push(`%${cond.description.$regex}%`);
            conditions.push(`description ILIKE $${params.length}`);
          }
        }
        if (conditions.length > 0) {
          sql += ` AND (${conditions.join(' OR ')})`;
        }
      }

      sql += ' ORDER BY created_at DESC';
      if (limitNum) {
        params.push(limitNum);
        sql += ` LIMIT $${params.length}`;
      }

      const res = await pool.query(sql, params);
      const courses = [];
      for (const row of res.rows) {
        courses.push(await mapRowToCourse(row, true));
      }
      return courses;
    });
  },

  async create(data) {
    const pool = getPool();
    const id = data._id || data.id || generateId();
    const now = new Date();

    const course = new CourseInstance({
      ...data,
      id,
      _id: id,
      created_at: now,
      updated_at: now
    });

    await pool.query(
      `INSERT INTO courses (
        id, category, level, title, description, thumbnail, instructor_name,
        is_published, learning_outcomes, prerequisites, target_audience,
        estimated_duration, difficulty_level, course_template, duration_minutes,
        created_by, rating_average, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
      [
        id,
        data.category,
        data.level || 'Beginner',
        data.title,
        data.description,
        data.thumbnail || '',
        data.instructorName || 'Crescentia Faculty',
        data.isPublished !== undefined ? data.isPublished : true,
        JSON.stringify(data.learningOutcomes || []),
        JSON.stringify(data.prerequisites || []),
        data.targetAudience || '',
        data.estimatedDuration || 0,
        data.difficultyLevel || data.level || 'Beginner',
        data.courseTemplate || 'default',
        data.durationMinutes || 0,
        normalizeId(data.createdBy),
        data.ratingAverage || 0,
        now,
        now
      ]
    );

    await course.save();
    return await this.findById(id);
  },

  async insertMany(coursesList) {
    const created = [];
    for (const c of coursesList) {
      created.push(await this.create(c));
    }
    return created;
  },

  async distinct(field) {
    const pool = getPool();
    const colName = field === 'category' ? 'category' : field;
    const res = await pool.query(`SELECT DISTINCT "${colName}" FROM courses WHERE "${colName}" IS NOT NULL`);
    return res.rows.map(r => r[colName]);
  },

  async countDocuments(query = {}) {
    const pool = getPool();
    let sql = 'SELECT COUNT(*)::int as count FROM courses WHERE 1=1';
    const params = [];

    if (query.isPublished !== undefined) {
      params.push(query.isPublished);
      sql += ` AND is_published = $${params.length}`;
    }

    const res = await pool.query(sql, params);
    return res.rows[0].count;
  },

  async findByIdAndDelete(id) {
    const cleanId = normalizeId(id);
    const pool = getPool();
    await pool.query('DELETE FROM courses WHERE id = $1', [cleanId]);
    return { _id: cleanId, id: cleanId };
  },

  async deleteMany(query = {}) {
    const pool = getPool();
    await pool.query('DELETE FROM courses');
    return { acknowledged: true };
  }
};

export default Course;
