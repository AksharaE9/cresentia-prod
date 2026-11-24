import pg from 'pg';
const { Pool } = pg;

let pool = null;
let connectionError = null;
let isInitialized = false;

const getConnectionString = () => {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.PGURI ||
    process.env.MONGO_URI
  );
};

export const getPool = () => {
  if (pool) return pool;

  const connectionString = getConnectionString();
  if (!connectionString) {
    throw new Error('Database connection string is missing (DATABASE_URL / POSTGRES_URL)');
  }

  pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client:', err.message);
  });

  return pool;
};

export const initSchema = async () => {
  if (isInitialized) return true;
  const p = getPool();

  const schemaSql = `
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      is_verified BOOLEAN DEFAULT true,
      is_active BOOLEAN DEFAULT true,
      verification_token TEXT,
      verification_token_expires TIMESTAMPTZ,
      created_by VARCHAR(36),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS courses (
      id VARCHAR(36) PRIMARY KEY,
      category TEXT NOT NULL,
      level TEXT DEFAULT 'Beginner',
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      thumbnail TEXT DEFAULT '',
      instructor_name TEXT DEFAULT 'Crescentia Faculty',
      is_published BOOLEAN DEFAULT true,
      learning_outcomes JSONB DEFAULT '[]'::jsonb,
      prerequisites JSONB DEFAULT '[]'::jsonb,
      target_audience TEXT DEFAULT '',
      estimated_duration NUMERIC DEFAULT 0,
      difficulty_level TEXT DEFAULT 'Beginner',
      course_template TEXT DEFAULT 'default',
      duration_minutes INT DEFAULT 0,
      created_by VARCHAR(36) NOT NULL,
      rating_average NUMERIC DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS course_videos (
      id SERIAL PRIMARY KEY,
      course_id VARCHAR(36) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      duration_minutes INT DEFAULT 30,
      thumbnail_url TEXT
    );

    CREATE TABLE IF NOT EXISTS course_quiz_questions (
      id SERIAL PRIMARY KEY,
      course_id VARCHAR(36) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      question TEXT NOT NULL,
      options JSONB NOT NULL,
      correct_answer INT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS course_modules (
      id VARCHAR(36) PRIMARY KEY,
      course_id VARCHAR(36) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      "order" INT NOT NULL,
      video_url TEXT,
      thumbnail_url TEXT,
      duration_minutes INT,
      content TEXT,
      concept_explanation TEXT,
      key_takeaways JSONB DEFAULT '[]'::jsonb,
      questions JSONB DEFAULT '[]'::jsonb,
      time_limit INT DEFAULT 15,
      passing_score INT DEFAULT 70,
      case_study_content TEXT,
      analysis_questions JSONB DEFAULT '[]'::jsonb,
      scenario_description TEXT,
      reflection_prompts JSONB DEFAULT '[]'::jsonb
    );

    CREATE TABLE IF NOT EXISTS course_reviews (
      id SERIAL PRIMARY KEY,
      course_id VARCHAR(36) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      rating INT NOT NULL,
      comment TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS user_assigned_courses (
      user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_id VARCHAR(36) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      PRIMARY KEY (user_id, course_id)
    );

    CREATE TABLE IF NOT EXISTS user_completed_courses (
      user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_id VARCHAR(36) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      PRIMARY KEY (user_id, course_id)
    );

    CREATE TABLE IF NOT EXISTS enrollments (
      id VARCHAR(36) PRIMARY KEY,
      student_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_id VARCHAR(36) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      completed_videos JSONB DEFAULT '[]'::jsonb,
      completed_modules JSONB DEFAULT '[]'::jsonb,
      current_module_index INT DEFAULT 0,
      assessment_results JSONB DEFAULT '[]'::jsonb,
      quiz_score INT DEFAULT 0,
      quiz_attempts INT DEFAULT 0,
      quiz_submitted_at TIMESTAMPTZ,
      progress_percent INT DEFAULT 0,
      completed_at TIMESTAMPTZ,
      total_points_earned INT DEFAULT 0,
      average_assessment_score INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      CONSTRAINT unique_student_course UNIQUE(student_id, course_id)
    );

    CREATE TABLE IF NOT EXISTS user_progress (
      user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_id VARCHAR(36) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      completed_modules JSONB DEFAULT '[]'::jsonb,
      last_accessed_at TIMESTAMPTZ,
      progress_percent INT DEFAULT 0,
      PRIMARY KEY (user_id, course_id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id VARCHAR(36) PRIMARY KEY,
      recipient VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'system',
      link TEXT DEFAULT '',
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(is_published);
    CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
    CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient);
  `;

  await p.query(schemaSql);
  isInitialized = true;
  return true;
};

const connectDB = async (retryCount = 0) => {
  try {
    const rawUri = getConnectionString();
    if (!rawUri) {
      connectionError = 'DATABASE_URL is missing in environment variables';
      console.warn('⚠️  DATABASE_URL is missing in environment variables');
      return false;
    }

    const sanitizedUri = rawUri.replace(/:[^:@]+@/, ':****@');
    console.log(`🔄 PostgreSQL connection attempt to: ${sanitizedUri}`);

    const p = getPool();
    const res = await p.query('SELECT NOW()');
    await initSchema();

    connectionError = null;
    console.log(`✅ PostgreSQL connected successfully at ${res.rows[0].now}`);
    return true;
  } catch (error) {
    connectionError = `${error.name}: ${error.message}`;
    console.error(`❌ PostgreSQL connection error: ${error.message}`);

    if (retryCount < 1) {
      console.log('🔄 Retrying connection immediately...');
      await new Promise(resolve => setTimeout(resolve, 500));
      return connectDB(retryCount + 1);
    }
    return false;
  }
};

export const isConnected = () => isInitialized;
export { connectionError };
export default connectDB;
