import initSqlJs from 'sql.js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 确保目录存在
const dataDir = join(__dirname, '..', 'data')
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true })
}

const dbPath = join(dataDir, 'chat.db')

export let db = null

// 初始化数据库
export async function initDatabase() {
  const SQL = await initSqlJs()
  
  // 尝试读取现有数据库
  if (existsSync(dbPath)) {
    const fileBuffer = readFileSync(dbPath)
    db = new SQL.Database(fileBuffer)
  } else {
    db = new SQL.Database()
  }

  // 创建表
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT UNIQUE NOT NULL,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('user', 'ai')),
      content TEXT NOT NULL,
      time TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT,
      size INTEGER DEFAULT 0,
      path TEXT NOT NULL,
      category TEXT DEFAULT 'tmp' CHECK(category IN ('tmp', 'docs', 'videos', 'other')),
      session_id TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE SET NULL
    )
  `)

  // ============ 个人面板相关表 ============

  // 知识基础表
  db.run(`
    CREATE TABLE IF NOT EXISTS knowledge_base (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT DEFAULT 'default',
      subject TEXT NOT NULL,
      score INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime')),
      UNIQUE(user_id, subject)
    )
  `)

  // 认知风格表
  db.run(`
    CREATE TABLE IF NOT EXISTS cognitive_style (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT DEFAULT 'default',
      style TEXT NOT NULL,
      score INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime')),
      UNIQUE(user_id, style)
    )
  `)

  // 易错点表
  db.run(`
    CREATE TABLE IF NOT EXISTS error_points (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT DEFAULT 'default',
      topic TEXT NOT NULL,
      question_type TEXT NOT NULL,
      error_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime')),
      UNIQUE(user_id, topic, question_type)
    )
  `)

  // 错题本表 - 详细记录每道错题
  db.run(`
    CREATE TABLE IF NOT EXISTS error_book (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT DEFAULT 'default',
      exam_id TEXT,
      subject TEXT NOT NULL,
      question_id TEXT,
      question_type TEXT NOT NULL,
      question_content TEXT NOT NULL,
      options TEXT,
      correct_answer TEXT NOT NULL,
      user_answer TEXT,
      analysis TEXT,
      knowledge_points TEXT,
      score INTEGER DEFAULT 0,
      full_score INTEGER DEFAULT 0,
      error_reason TEXT,
      mastery_status TEXT DEFAULT 'unmastered' CHECK(mastery_status IN ('unmastered', 'mastering', 'mastered')),
      review_count INTEGER DEFAULT 0,
      last_reviewed_at TEXT,
      next_review_at TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `)

  // 学习目标表
  db.run(`
    CREATE TABLE IF NOT EXISTS study_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT DEFAULT 'default',
      title TEXT NOT NULL,
      description TEXT,
      deadline TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('completed', 'in_progress', 'pending')),
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `)

  // 兴趣方向表
  db.run(`
    CREATE TABLE IF NOT EXISTS interests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT DEFAULT 'default',
      interest TEXT NOT NULL,
      weight INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime')),
      UNIQUE(user_id, interest)
    )
  `)

  // 学习记录表
  db.run(`
    CREATE TABLE IF NOT EXISTS study_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT DEFAULT 'default',
      record_date TEXT NOT NULL,
      efficiency INTEGER DEFAULT 0,
      duration REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime')),
      UNIQUE(user_id, record_date)
    )
  `)

  // ============ 学习资料表 ============
  db.run(`
    CREATE TABLE IF NOT EXISTS learning_materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      file_path TEXT NOT NULL,
      original_name TEXT,
      category TEXT NOT NULL CHECK(category IN ('video', 'document', 'ppt')),
      subject TEXT NOT NULL,
      difficulty TEXT DEFAULT 'medium' CHECK(difficulty IN ('easy', 'medium', 'hard')),
      file_size INTEGER DEFAULT 0,
      mime_type TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `)

  db.run(`CREATE INDEX IF NOT EXISTS idx_materials_subject ON learning_materials(subject)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_materials_category ON learning_materials(category)`)

  // ============ 学科表 ============
  db.run(`
    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      keywords TEXT DEFAULT '',
      icon TEXT DEFAULT 'book',
      color TEXT DEFAULT 'primary',
      sort_order INTEGER DEFAULT 0,
      enabled INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `)

  // 为已有表添加 keywords 字段（如果不存在）
  try {
    db.run(`ALTER TABLE subjects ADD COLUMN keywords TEXT DEFAULT ''`)
  } catch (e) {}

  // 初始化默认学科（包含关键词）
  const defaultSubjects = [
    { name: 'math', display_name: '高等数学', keywords: '高等数学,数学,微积分,极限,导数,微分,积分,函数,数列,级数,calculus,derivative,integral,limit', icon: 'calculate', color: 'primary', sort_order: 1 },
    { name: 'linear_algebra', display_name: '线性代数', keywords: '线性代数,矩阵,行列式,向量,线性方程组,特征值,特征向量,线性空间,线性变换,matrix,vector,eigenvalue', icon: 'grid', color: 'secondary', sort_order: 2 },
    { name: 'probability', display_name: '概率论', keywords: '概率,概率论,随机,期望,方差,分布,概率密度,二项分布,正态分布,大数定律,中心极限定理,贝叶斯,probability,random,expectation', icon: 'chart', color: 'accent', sort_order: 3 },
    { name: 'physics', display_name: '大学物理', keywords: '物理,力学,热学,电磁学,光学,量子,相对论,牛顿,速度,加速度,动量,能量,physics,mechanics,thermodynamics', icon: 'atom', color: 'info', sort_order: 4 },
    { name: 'major', display_name: '专业课', keywords: '专业课,专业,课程', icon: 'book', color: 'warning', sort_order: 5 },
    { name: 'english', display_name: '英语', keywords: '英语,英文,词汇,语法,阅读,听力,口语,写作,托福,雅思,四六级,english,vocabulary,grammar', icon: 'language', color: 'success', sort_order: 6 },
    { name: 'programming', display_name: '编程', keywords: '编程,程序,代码,算法,数据结构,python,java,c++,javascript,前端,后端,数据库,programming,code,algorithm', icon: 'code', color: 'error', sort_order: 7 },
    { name: 'politics', display_name: '政治', keywords: '政治,马克思主义,毛泽东思想,中国特色社会主义,近代史,思修,时事,politics,marxism', icon: 'flag', color: 'ghost', sort_order: 8 }
  ]

  defaultSubjects.forEach(subject => {
    const exists = db.exec(`SELECT id FROM subjects WHERE name = ?`, [subject.name])
    if (exists.length === 0 || exists[0].values.length === 0) {
      db.run(`INSERT INTO subjects (name, display_name, keywords, icon, color, sort_order) VALUES (?, ?, ?, ?, ?, ?)`,
        [subject.name, subject.display_name, subject.keywords, subject.icon, subject.color, subject.sort_order])
    } else {
      // 如果已存在但没有关键词，更新关键词
      const current = db.exec(`SELECT keywords FROM subjects WHERE name = ?`, [subject.name])
      if (current.length > 0 && current[0].values.length > 0 && !current[0].values[0][0]) {
        db.run(`UPDATE subjects SET keywords = ? WHERE name = ?`, [subject.keywords, subject.name])
      }
    }
  })

  // 创建索引
  db.run(`CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_sessions_updated ON sessions(updated_at)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_files_session ON files(session_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_knowledge_user ON knowledge_base(user_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_cognitive_user ON cognitive_style(user_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_error_user ON error_points(user_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_goals_user ON study_goals(user_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_interests_user ON interests(user_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_records_user_date ON study_records(user_id, record_date)`)

  // 初始化学习计划相关表
  initStudyTodosTable()
  initStudySchedulesTable()

  // 初始化 PPT 模板表
  initPptTemplatesTable()

  // 初始化 AI 任务表
  initAiTasksTable()

  // 初始化考试相关表
  initExamsTable()

  // 保存数据库
  saveDatabase()
  
  console.log('✅ 数据库初始化完成')
  return db
}

// 保存数据库到文件
export function saveDatabase() {
  if (db) {
    const data = db.export()
    const buffer = Buffer.from(data)
    writeFileSync(dbPath, buffer)
  }
}

// ============ 会话操作 ============

export const sessionDB = {
  create(sessionId) {
    db.run('INSERT INTO sessions (session_id) VALUES (?)', [sessionId])
    saveDatabase()
    return sessionId
  },

  getAll() {
    const results = db.exec(`
      SELECT 
        s.session_id,
        s.created_at,
        s.updated_at,
        (SELECT content FROM messages WHERE session_id = s.session_id AND role = 'user' ORDER BY id ASC LIMIT 1) as first_message,
        (SELECT content FROM messages WHERE session_id = s.session_id ORDER BY id DESC LIMIT 1) as last_message,
        (SELECT time FROM messages WHERE session_id = s.session_id ORDER BY id DESC LIMIT 1) as last_time,
        (SELECT COUNT(*) FROM messages WHERE session_id = s.session_id) as message_count
      FROM sessions s
      ORDER BY s.updated_at DESC
    `)
    
    if (results.length === 0) return []
    
    const columns = results[0].columns
    return results[0].values.map(row => {
      const obj = {}
      columns.forEach((col, i) => obj[col] = row[i])
      return obj
    })
  },

  get(sessionId) {
    const results = db.exec('SELECT * FROM sessions WHERE session_id = ?', [sessionId])
    if (results.length === 0 || results[0].values.length === 0) return null
    const columns = results[0].columns
    const row = results[0].values[0]
    const obj = {}
    columns.forEach((col, i) => obj[col] = row[i])
    return obj
  },

  updateTime(sessionId) {
    db.run("UPDATE sessions SET updated_at = datetime('now', 'localtime') WHERE session_id = ?", [sessionId])
    saveDatabase()
  },

  delete(sessionId) {
    db.run('DELETE FROM messages WHERE session_id = ?', [sessionId])
    db.run('DELETE FROM sessions WHERE session_id = ?', [sessionId])
    saveDatabase()
  },

  clearAll() {
    db.run('DELETE FROM messages')
    db.run('DELETE FROM sessions')
    saveDatabase()
  }
}

// ============ 消息操作 ============

export const messageDB = {
  add(sessionId, role, content, time = null) {
    const t = time || new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    db.run('INSERT INTO messages (session_id, role, content, time) VALUES (?, ?, ?, ?)', [sessionId, role, content, t])
    sessionDB.updateTime(sessionId)
    saveDatabase()
  },

  getBySession(sessionId) {
    const results = db.exec('SELECT * FROM messages WHERE session_id = ? ORDER BY id ASC', [sessionId])
    if (results.length === 0) return []
    
    const columns = results[0].columns
    return results[0].values.map(row => {
      const obj = {}
      columns.forEach((col, i) => obj[col] = row[i])
      return obj
    })
  },

  clear(sessionId) {
    db.run('DELETE FROM messages WHERE session_id = ?', [sessionId])
    sessionDB.updateTime(sessionId)
    saveDatabase()
  }
}

// ============ 文件操作 ============

export const fileDB = {
  add(filename, originalName, mimeType, size, path, category = 'tmp', sessionId = null) {
    db.run(`
      INSERT INTO files (filename, original_name, mime_type, size, path, category, session_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [filename, originalName, mimeType, size, path, category, sessionId])
    
    const result = db.exec('SELECT last_insert_rowid() as id')
    saveDatabase()
    return { lastInsertRowid: result[0].values[0][0] }
  },

  getBySession(sessionId) {
    const results = db.exec('SELECT * FROM files WHERE session_id = ? ORDER BY created_at DESC', [sessionId])
    if (results.length === 0) return []
    
    const columns = results[0].columns
    return results[0].values.map(row => {
      const obj = {}
      columns.forEach((col, i) => obj[col] = row[i])
      return obj
    })
  },

  get(id) {
    const results = db.exec('SELECT * FROM files WHERE id = ?', [id])
    if (results.length === 0 || results[0].values.length === 0) return null
    const columns = results[0].columns
    const row = results[0].values[0]
    const obj = {}
    columns.forEach((col, i) => obj[col] = row[i])
    return obj
  },

  delete(id) {
    db.run('DELETE FROM files WHERE id = ?', [id])
    saveDatabase()
  },

  getByCategory(category) {
    const results = db.exec('SELECT * FROM files WHERE category = ? ORDER BY created_at DESC', [category])
    if (results.length === 0) return []
    
    const columns = results[0].columns
    return results[0].values.map(row => {
      const obj = {}
      columns.forEach((col, i) => obj[col] = row[i])
      return obj
    })
  }
}

// ============ 个人面板数据操作 ============

// 知识基础 - 各学科掌握程度
export const knowledgeDB = {
  // 初始化用户知识数据（可选单个学科）
  init(userId = 'default', singleSubject = null) {
    if (singleSubject) {
      // 只初始化单个学科
      const exists = db.exec(`SELECT * FROM knowledge_base WHERE user_id = ? AND subject = ?`, [userId, singleSubject])
      if (exists.length === 0 || exists[0].values.length === 0) {
        db.run(`INSERT INTO knowledge_base (user_id, subject, score) VALUES (?, ?, 0)`, [userId, singleSubject])
        saveDatabase()
      }
      return
    }
    
    // 初始化默认学科列表
    const defaultSubjects = ['math', 'linear_algebra', 'probability', 'physics', 'major', 'english', 'programming', 'politics']
    defaultSubjects.forEach(subject => {
      const exists = db.exec(`SELECT * FROM knowledge_base WHERE user_id = ? AND subject = ?`, [userId, subject])
      if (exists.length === 0 || exists[0].values.length === 0) {
        db.run(`INSERT INTO knowledge_base (user_id, subject, score) VALUES (?, ?, 0)`, [userId, subject])
      }
    })
    saveDatabase()
  },

  // 获取知识数据
  getAll(userId = 'default') {
    // 从subjects表获取学科列表
    const subjectResults = db.exec(`SELECT name, display_name FROM subjects WHERE enabled = 1 ORDER BY sort_order ASC`)
    const subjectMap = {}
    if (subjectResults.length > 0) {
      subjectResults[0].values.forEach(row => {
        subjectMap[row[0]] = row[1]
      })
    }
    
    const results = db.exec(`SELECT * FROM knowledge_base WHERE user_id = ?`, [userId])
    if (results.length === 0) return []
    const columns = results[0].columns
    return results[0].values.map(row => {
      const obj = {}
      columns.forEach((col, i) => obj[col] = row[i])
      // 添加显示名称
      obj.display_name = subjectMap[obj.subject] || obj.subject
      return obj
    })
  },

  // 更新单科分数
  updateScore(userId, subject, score) {
    db.run(`UPDATE knowledge_base SET score = ?, updated_at = datetime('now', 'localtime') WHERE user_id = ? AND subject = ?`, [score, userId, subject])
    saveDatabase()
  },

  // 批量更新分数
  updateBatch(userId, scores) {
    scores.forEach(item => {
      db.run(`UPDATE knowledge_base SET score = ?, updated_at = datetime('now', 'localtime') WHERE user_id = ? AND subject = ?`, [item.score, userId, item.subject])
    })
    saveDatabase()
  }
}

// 认知风格数据
export const cognitiveStyleDB = {
  init(userId = 'default') {
    const styles = ['hands_on', 'visual', 'auditory', 'summarize', 'social']
    styles.forEach(style => {
      const exists = db.exec(`SELECT * FROM cognitive_style WHERE user_id = ? AND style = ?`, [userId, style])
      if (exists.length === 0 || exists[0].values.length === 0) {
        db.run(`INSERT INTO cognitive_style (user_id, style, score) VALUES (?, ?, 0)`, [userId, style])
      }
    })
    saveDatabase()
  },

  getAll(userId = 'default') {
    const results = db.exec(`SELECT * FROM cognitive_style WHERE user_id = ?`, [userId])
    if (results.length === 0) return []
    const columns = results[0].columns
    return results[0].values.map(row => {
      const obj = {}
      columns.forEach((col, i) => obj[col] = row[i])
      return obj
    })
  },

  updateScore(userId, style, score) {
    db.run(`UPDATE cognitive_style SET score = ?, updated_at = datetime('now', 'localtime') WHERE user_id = ? AND style = ?`, [score, userId, style])
    saveDatabase()
  }
}

// 易错点数据
export const errorPointDB = {
  init(userId = 'default') {
    const topics = ['function', 'equation', 'geometry', 'probability', 'algorithm', 'proof']
    const questionTypes = ['choice', 'fill', 'essay']
    
    topics.forEach(topic => {
      questionTypes.forEach(qtype => {
        const exists = db.exec(`SELECT * FROM error_points WHERE user_id = ? AND topic = ? AND question_type = ?`, [userId, topic, qtype])
        if (exists.length === 0 || exists[0].values.length === 0) {
          db.run(`INSERT INTO error_points (user_id, topic, question_type, error_count) VALUES (?, ?, ?, 0)`, [userId, topic, qtype])
        }
      })
    })
    saveDatabase()
  },

  getAll(userId = 'default') {
    const results = db.exec(`SELECT * FROM error_points WHERE user_id = ?`, [userId])
    if (results.length === 0) return []
    const columns = results[0].columns
    return results[0].values.map(row => {
      const obj = {}
      columns.forEach((col, i) => obj[col] = row[i])
      return obj
    })
  },

  // 记录错误
  recordError(userId, topic, questionType) {
    db.run(`UPDATE error_points SET error_count = error_count + 1, updated_at = datetime('now', 'localtime') WHERE user_id = ? AND topic = ? AND question_type = ?`, [userId, topic, questionType])
    saveDatabase()
  },

  // 批量更新错误数
  updateBatch(userId, data) {
    data.forEach(item => {
      db.run(`UPDATE error_points SET error_count = ?, updated_at = datetime('now', 'localtime') WHERE user_id = ? AND topic = ? AND question_type = ?`, [item.errorCount, userId, item.topic, item.questionType])
    })
    saveDatabase()
  }
}

// 错题本数据
export const errorBookDB = {
  // 添加错题
  add(errorData) {
    const {
      userId = 'default',
      examId,
      subject,
      questionId,
      questionType,
      questionContent,
      options,
      correctAnswer,
      userAnswer,
      analysis,
      knowledgePoints,
      score = 0,
      fullScore = 0,
      errorReason = ''
    } = errorData

    // 检查是否已存在相同题目
    const exists = db.exec(
      `SELECT id FROM error_book WHERE user_id = ? AND question_content = ?`,
      [userId, questionContent]
    )

    if (exists.length > 0 && exists[0].values.length > 0) {
      // 更新现有记录
      const id = exists[0].values[0][0]
      db.run(
        `UPDATE error_book SET
          exam_id = ?,
          user_answer = ?,
          score = ?,
          error_reason = ?,
          review_count = review_count + 1,
          updated_at = datetime('now', 'localtime')
        WHERE id = ?`,
        [examId, userAnswer, score, errorReason, id]
      )
      saveDatabase()
      return { id, isNew: false }
    }

    // 插入新记录
    db.run(
      `INSERT INTO error_book (
        user_id, exam_id, subject, question_id, question_type,
        question_content, options, correct_answer, user_answer,
        analysis, knowledge_points, score, full_score, error_reason,
        next_review_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '+1 day', 'localtime'))`,
      [
        userId, examId, subject, questionId, questionType,
        questionContent, JSON.stringify(options), correctAnswer, userAnswer,
        analysis, JSON.stringify(knowledgePoints), score, fullScore, errorReason
      ]
    )
    saveDatabase()

    const result = db.exec('SELECT last_insert_rowid() as id')
    return { id: result[0].values[0][0], isNew: true }
  },

  // 获取所有错题
  getAll(userId = 'default', filters = {}) {
    let sql = `SELECT * FROM error_book WHERE user_id = ?`
    const params = [userId]

    if (filters.subject) {
      sql += ` AND subject = ?`
      params.push(filters.subject)
    }
    if (filters.questionType) {
      sql += ` AND question_type = ?`
      params.push(filters.questionType)
    }
    if (filters.masteryStatus) {
      sql += ` AND mastery_status = ?`
      params.push(filters.masteryStatus)
    }

    sql += ` ORDER BY created_at DESC`

    const results = db.exec(sql, params)
    if (results.length === 0) return []

    const columns = results[0].columns
    return results[0].values.map(row => {
      const obj = {}
      columns.forEach((col, i) => {
        obj[col] = row[i]
        // 解析JSON字段
        if (col === 'options' || col === 'knowledge_points') {
          try {
            obj[col] = JSON.parse(row[i] || '[]')
          } catch {
            obj[col] = []
          }
        }
      })
      return obj
    })
  },

  // 获取错题统计
  getStats(userId = 'default') {
    // 总错题数
    const totalResult = db.exec(`SELECT COUNT(*) as count FROM error_book WHERE user_id = ?`, [userId])
    const total = totalResult[0]?.values[0][0] || 0

    // 按学科统计
    const subjectResult = db.exec(
      `SELECT subject, COUNT(*) as count FROM error_book WHERE user_id = ? GROUP BY subject`,
      [userId]
    )
    const bySubject = {}
    if (subjectResult.length > 0) {
      subjectResult[0].values.forEach(row => {
        bySubject[row[0]] = row[1]
      })
    }

    // 按题型统计
    const typeResult = db.exec(
      `SELECT question_type, COUNT(*) as count FROM error_book WHERE user_id = ? GROUP BY question_type`,
      [userId]
    )
    const byType = {}
    if (typeResult.length > 0) {
      typeResult[0].values.forEach(row => {
        byType[row[0]] = row[1]
      })
    }

    // 按掌握状态统计
    const statusResult = db.exec(
      `SELECT mastery_status, COUNT(*) as count FROM error_book WHERE user_id = ? GROUP BY mastery_status`,
      [userId]
    )
    const byStatus = {}
    if (statusResult.length > 0) {
      statusResult[0].values.forEach(row => {
        byStatus[row[0]] = row[1]
      })
    }

    // 今日待复习
    const todayReviewResult = db.exec(
      `SELECT COUNT(*) as count FROM error_book WHERE user_id = ? AND next_review_at <= datetime('now', 'localtime')`,
      [userId]
    )
    const todayReview = todayReviewResult[0]?.values[0][0] || 0

    return { total, bySubject, byType, byStatus, todayReview }
  },

  // 获取单个错题
  getById(id, userId = 'default') {
    const results = db.exec(`SELECT * FROM error_book WHERE id = ? AND user_id = ?`, [id, userId])
    if (results.length === 0 || results[0].values.length === 0) return null

    const columns = results[0].columns
    const row = results[0].values[0]
    const obj = {}
    columns.forEach((col, i) => {
      obj[col] = row[i]
      if (col === 'options' || col === 'knowledge_points') {
        try {
          obj[col] = JSON.parse(row[i] || '[]')
        } catch {
          obj[col] = []
        }
      }
    })
    return obj
  },

  // 更新掌握状态
  updateMasteryStatus(id, status, userId = 'default') {
    const reviewIntervals = {
      'unmastered': 1,    // 1天后复习
      'mastering': 3,     // 3天后复习
      'mastered': 7       // 7天后复习
    }
    const interval = reviewIntervals[status] || 1

    db.run(
      `UPDATE error_book SET
        mastery_status = ?,
        review_count = review_count + 1,
        last_reviewed_at = datetime('now', 'localtime'),
        next_review_at = datetime('now', '+${interval} day', 'localtime'),
        updated_at = datetime('now', 'localtime')
      WHERE id = ? AND user_id = ?`,
      [status, id, userId]
    )
    saveDatabase()
    return true
  },

  // 更新错误原因
  updateErrorReason(id, errorReason, userId = 'default') {
    db.run(
      `UPDATE error_book SET error_reason = ?, updated_at = datetime('now', 'localtime') WHERE id = ? AND user_id = ?`,
      [errorReason, id, userId]
    )
    saveDatabase()
    return true
  },

  // 删除错题
  delete(id, userId = 'default') {
    db.run(`DELETE FROM error_book WHERE id = ? AND user_id = ?`, [id, userId])
    saveDatabase()
    return true
  },

  // 获取今日待复习错题
  getTodayReview(userId = 'default') {
    const results = db.exec(
      `SELECT * FROM error_book WHERE user_id = ? AND next_review_at <= datetime('now', 'localtime') ORDER BY next_review_at ASC`,
      [userId]
    )
    if (results.length === 0) return []

    const columns = results[0].columns
    return results[0].values.map(row => {
      const obj = {}
      columns.forEach((col, i) => {
        obj[col] = row[i]
        if (col === 'options' || col === 'knowledge_points') {
          try {
            obj[col] = JSON.parse(row[i] || '[]')
          } catch {
            obj[col] = []
          }
        }
      })
      return obj
    })
  },

  // 批量添加错题（从考试结果）
  addFromExam(userId, examId, subject, wrongQuestions) {
    const results = []
    wrongQuestions.forEach(q => {
      const result = this.add({
        userId,
        examId,
        subject,
        questionId: q.questionId || q.id,
        questionType: q.type,
        questionContent: q.content,
        options: q.options,
        correctAnswer: q.correctAnswer,
        userAnswer: q.userAnswer,
        analysis: q.analysis,
        knowledgePoints: q.knowledgePoints,
        score: q.score || 0,
        fullScore: q.fullScore || q.score || 0
      })
      results.push(result)
    })
    return results
  }
}

// 学习目标数据
export const goalDB = {
  add(userId, title, description = '', deadline = null) {
    db.run(`INSERT INTO study_goals (user_id, title, description, deadline, status) VALUES (?, ?, ?, ?, 'pending')`, [userId, title, description, deadline])
    saveDatabase()
    const result = db.exec('SELECT last_insert_rowid() as id')
    return result[0].values[0][0]
  },

  getAll(userId = 'default') {
    const results = db.exec(`SELECT * FROM study_goals WHERE user_id = ? ORDER BY created_at DESC`, [userId])
    if (results.length === 0) return []
    const columns = results[0].columns
    return results[0].values.map(row => {
      const obj = {}
      columns.forEach((col, i) => obj[col] = row[i])
      return obj
    })
  },

  updateStatus(userId, goalId, status) {
    db.run(`UPDATE study_goals SET status = ?, updated_at = datetime('now', 'localtime') WHERE user_id = ? AND id = ?`, [status, userId, goalId])
    saveDatabase()
  },

  delete(userId, goalId) {
    db.run(`DELETE FROM study_goals WHERE user_id = ? AND id = ?`, [userId, goalId])
    saveDatabase()
  },

  getStats(userId = 'default') {
    const results = db.exec(`
      SELECT 
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        COUNT(*) as total
      FROM study_goals WHERE user_id = ?
    `, [userId])
    if (results.length === 0 || results[0].values.length === 0) return { completed: 0, in_progress: 0, pending: 0, total: 0 }
    return {
      completed: results[0].values[0][0] || 0,
      in_progress: results[0].values[0][1] || 0,
      pending: results[0].values[0][2] || 0,
      total: results[0].values[0][3] || 0
    }
  }
}

// 兴趣方向数据
export const interestDB = {
  init(userId = 'default') {
    const interests = ['programming', 'math', 'physics', 'music', 'reading', 'science', 'art', 'history', 'biology', 'game_design', 'ai', 'astronomy']
    interests.forEach(interest => {
      const exists = db.exec(`SELECT * FROM interests WHERE user_id = ? AND interest = ?`, [userId, interest])
      if (exists.length === 0 || exists[0].values.length === 0) {
        db.run(`INSERT INTO interests (user_id, interest, weight) VALUES (?, ?, 0)`, [userId, interest])
      }
    })
    saveDatabase()
  },

  getAll(userId = 'default') {
    const results = db.exec(`SELECT * FROM interests WHERE user_id = ?`, [userId])
    if (results.length === 0) return []
    const columns = results[0].columns
    return results[0].values.map(row => {
      const obj = {}
      columns.forEach((col, i) => obj[col] = row[i])
      return obj
    })
  },

  updateWeight(userId, interest, weight) {
    db.run(`UPDATE interests SET weight = ?, updated_at = datetime('now', 'localtime') WHERE user_id = ? AND interest = ?`, [weight, userId, interest])
    saveDatabase()
  },

  updateBatch(userId, data) {
    data.forEach(item => {
      db.run(`UPDATE interests SET weight = ?, updated_at = datetime('now', 'localtime') WHERE user_id = ? AND interest = ?`, [item.weight, userId, item.interest])
    })
    saveDatabase()
  }
}

// 学习记录数据
export const studyRecordDB = {
  add(userId, date, efficiency, duration) {
    const exists = db.exec(`SELECT * FROM study_records WHERE user_id = ? AND record_date = ?`, [userId, date])
    if (exists.length > 0 && exists[0].values.length > 0) {
      db.run(`UPDATE study_records SET efficiency = ?, duration = ?, updated_at = datetime('now', 'localtime') WHERE user_id = ? AND record_date = ?`, [efficiency, duration, userId, date])
    } else {
      db.run(`INSERT INTO study_records (user_id, record_date, efficiency, duration) VALUES (?, ?, ?, ?)`, [userId, date, efficiency, duration])
    }
    saveDatabase()
  },

  getByWeek(userId = 'default') {
    const results = db.exec(`SELECT * FROM study_records WHERE user_id = ? AND record_date >= date('now', '-7 days') ORDER BY record_date ASC`, [userId])
    if (results.length === 0) return []
    const columns = results[0].columns
    return results[0].values.map(row => {
      const obj = {}
      columns.forEach((col, i) => obj[col] = row[i])
      return obj
    })
  },

  getByMonth(userId = 'default') {
    const results = db.exec(`SELECT * FROM study_records WHERE user_id = ? AND record_date >= date('now', '-30 days') ORDER BY record_date ASC`, [userId])
    if (results.length === 0) return []
    const columns = results[0].columns
    return results[0].values.map(row => {
      const obj = {}
      columns.forEach((col, i) => obj[col] = row[i])
      return obj
    })
  },

  getAll(userId = 'default') {
    const results = db.exec(`SELECT * FROM study_records WHERE user_id = ? ORDER BY record_date DESC`, [userId])
    if (results.length === 0) return []
    const columns = results[0].columns
    return results[0].values.map(row => {
      const obj = {}
      columns.forEach((col, i) => obj[col] = row[i])
      return obj
    })
  }
}

// ============ 学习资料操作 ============
export const learningMaterialDB = {
  add(title, description, filePath, originalName, category, subject, difficulty = 'medium', fileSize = 0, mimeType = '') {
    db.run(`
      INSERT INTO learning_materials (title, description, file_path, original_name, category, subject, difficulty, file_size, mime_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, description, filePath, originalName, category, subject, difficulty, fileSize, mimeType])
    const result = db.exec('SELECT last_insert_rowid() as id')
    saveDatabase()
    return result[0].values[0][0]
  },

  getAll() {
    const results = db.exec('SELECT * FROM learning_materials ORDER BY created_at DESC')
    if (results.length === 0) return []
    const columns = results[0].columns
    return results[0].values.map(row => {
      const obj = {}
      columns.forEach((col, i) => obj[col] = row[i])
      return obj
    })
  },

  getByCategory(category) {
    const results = db.exec('SELECT * FROM learning_materials WHERE category = ? ORDER BY created_at DESC', [category])
    if (results.length === 0) return []
    const columns = results[0].columns
    return results[0].values.map(row => {
      const obj = {}
      columns.forEach((col, i) => obj[col] = row[i])
      return obj
    })
  },

  getBySubject(subject) {
    const results = db.exec('SELECT * FROM learning_materials WHERE subject = ? ORDER BY created_at DESC', [subject])
    if (results.length === 0) return []
    const columns = results[0].columns
    return results[0].values.map(row => {
      const obj = {}
      columns.forEach((col, i) => obj[col] = row[i])
      return obj
    })
  },

  getByCategoryAndSubject(category, subject) {
    let sql = 'SELECT * FROM learning_materials WHERE 1=1'
    const params = []
    if (category && category !== 'all') {
      sql += ' AND category = ?'
      params.push(category)
    }
    if (subject && subject !== 'all') {
      sql += ' AND subject = ?'
      params.push(subject)
    }
    sql += ' ORDER BY created_at DESC'
    const results = db.exec(sql, params)
    if (results.length === 0) return []
    const columns = results[0].columns
    return results[0].values.map(row => {
      const obj = {}
      columns.forEach((col, i) => obj[col] = row[i])
      return obj
    })
  },

  get(id) {
    const results = db.exec('SELECT * FROM learning_materials WHERE id = ?', [id])
    if (results.length === 0 || results[0].values.length === 0) return null
    const columns = results[0].columns
    const row = results[0].values[0]
    const obj = {}
    columns.forEach((col, i) => obj[col] = row[i])
    return obj
  },

  update(id, data) {
    const fields = []
    const params = []
    if (data.title !== undefined) { fields.push('title = ?'); params.push(data.title) }
    if (data.description !== undefined) { fields.push('description = ?'); params.push(data.description) }
    if (data.subject !== undefined) { fields.push('subject = ?'); params.push(data.subject) }
    if (data.difficulty !== undefined) { fields.push('difficulty = ?'); params.push(data.difficulty) }
    if (fields.length === 0) return false
    fields.push("updated_at = datetime('now', 'localtime')")
    params.push(id)
    db.run(`UPDATE learning_materials SET ${fields.join(', ')} WHERE id = ?`, params)
    saveDatabase()
    return true
  },

  delete(id) {
    db.run('DELETE FROM learning_materials WHERE id = ?', [id])
    saveDatabase()
  },

  getStats() {
    const results = db.exec(`
      SELECT
        category,
        COUNT(*) as count
      FROM learning_materials
      GROUP BY category
    `)
    if (results.length === 0) return { video: 0, document: 0, ppt: 0 }
    const stats = { video: 0, document: 0, ppt: 0 }
    results[0].values.forEach(row => {
      stats[row[0]] = row[1]
    })
    return stats
  },

  getStatsBySubject() {
    const results = db.exec(`
      SELECT
        subject,
        COUNT(*) as count
      FROM learning_materials
      GROUP BY subject
    `)
    if (results.length === 0) return {}
    const stats = {}
    results[0].values.forEach(row => {
      stats[row[0]] = row[1]
    })
    return stats
  },

  getSubjects() {
    const results = db.exec('SELECT DISTINCT subject FROM learning_materials ORDER BY subject')
    if (results.length === 0) return []
    return results[0].values.map(row => row[0])
  }
}

// ============ 学科操作 ============
export const subjectDB = {
  getAll(enabledOnly = true) {
    let sql = 'SELECT * FROM subjects'
    if (enabledOnly) {
      sql += ' WHERE enabled = 1'
    }
    sql += ' ORDER BY sort_order ASC, id ASC'
    const results = db.exec(sql)
    if (results.length === 0) return []
    const columns = results[0].columns
    return results[0].values.map(row => {
      const obj = {}
      columns.forEach((col, i) => obj[col] = row[i])
      return obj
    })
  },

  get(name) {
    const results = db.exec('SELECT * FROM subjects WHERE name = ?', [name])
    if (results.length === 0 || results[0].values.length === 0) return null
    const columns = results[0].columns
    const row = results[0].values[0]
    const obj = {}
    columns.forEach((col, i) => obj[col] = row[i])
    return obj
  },

  getAllWithKeywords() {
    const results = db.exec('SELECT * FROM subjects WHERE enabled = 1 AND keywords IS NOT NULL AND keywords != "" ORDER BY sort_order ASC')
    if (results.length === 0) return []
    const columns = results[0].columns
    return results[0].values.map(row => {
      const obj = {}
      columns.forEach((col, i) => obj[col] = row[i])
      return obj
    })
  },

  add(name, displayName, icon = 'book', color = 'primary', sortOrder = 0, keywords = '') {
    const exists = db.exec('SELECT id FROM subjects WHERE name = ?', [name])
    if (exists.length > 0 && exists[0].values.length > 0) {
      return false
    }
    db.run(`INSERT INTO subjects (name, display_name, keywords, icon, color, sort_order) VALUES (?, ?, ?, ?, ?, ?)`,
      [name, displayName, keywords, icon, color, sortOrder])
    saveDatabase()
    return true
  },

  update(name, data) {
    const fields = []
    const params = []
    if (data.display_name !== undefined) { fields.push('display_name = ?'); params.push(data.display_name) }
    if (data.keywords !== undefined) { fields.push('keywords = ?'); params.push(data.keywords) }
    if (data.icon !== undefined) { fields.push('icon = ?'); params.push(data.icon) }
    if (data.color !== undefined) { fields.push('color = ?'); params.push(data.color) }
    if (data.sort_order !== undefined) { fields.push('sort_order = ?'); params.push(data.sort_order) }
    if (data.enabled !== undefined) { fields.push('enabled = ?'); params.push(data.enabled) }
    if (fields.length === 0) return false
    params.push(name)
    db.run(`UPDATE subjects SET ${fields.join(', ')} WHERE name = ?`, params)
    saveDatabase()
    return true
  },

  delete(name) {
    db.run('DELETE FROM subjects WHERE name = ?', [name])
    saveDatabase()
  },

  // 模糊搜索学科
  fuzzySearch(text) {
    if (!text) return []
    const lowerText = text.toLowerCase()
    const results = db.exec('SELECT * FROM subjects WHERE enabled = 1 ORDER BY sort_order ASC')
    if (results.length === 0) return []

    const columns = results[0].columns
    const matches = []

    for (const row of results[0].values) {
      const obj = {}
      columns.forEach((col, i) => obj[col] = row[i])

      let score = 0
      const displayLower = obj.display_name.toLowerCase()
      const nameLower = obj.name.toLowerCase()
      const keywordsStr = (obj.keywords || '').toLowerCase()

      // 完全匹配 display_name 或 name
      if (displayLower === lowerText || nameLower === lowerText) {
        score = 100
      }
      // 包含匹配 display_name 或 name
      else if (displayLower.includes(lowerText) || nameLower.includes(lowerText)) {
        score = 80
      }
      // 关键词匹配
      else if (keywordsStr) {
        const keywords = keywordsStr.split(',')
        for (const keyword of keywords) {
          if (keyword === lowerText) {
            score = 90
            break
          } else if (keyword.includes(lowerText) || lowerText.includes(keyword)) {
            score = Math.max(score, 60)
          }
        }
      }

      if (score > 0) {
        matches.push({ ...obj, matchScore: score })
      }
    }

    // 按匹配度排序
    return matches.sort((a, b) => b.matchScore - a.matchScore)
  }
}

// 获取所有面板数据
export const profileDB = {
  getAllData(userId = 'default') {
    return {
      knowledge: knowledgeDB.getAll(userId),
      cognitiveStyle: cognitiveStyleDB.getAll(userId),
      errorPoints: errorPointDB.getAll(userId),
      goals: goalDB.getAll(userId),
      goalStats: goalDB.getStats(userId),
      interests: interestDB.getAll(userId),
      studyRecords: studyRecordDB.getByWeek(userId)
    }
  },

  // 初始化所有数据
  initAll(userId = 'default') {
    knowledgeDB.init(userId)
    cognitiveStyleDB.init(userId)
    errorPointDB.init(userId)
    interestDB.init(userId)
  }
}

// ============ 待办清单表 ============
function initStudyTodosTable() {
  db.run(`
    CREATE TABLE IF NOT EXISTS study_todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT DEFAULT 'default',
      text TEXT NOT NULL,
      subject TEXT DEFAULT '',
      priority TEXT DEFAULT 'medium',
      completed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `)
  // 添加新字段（如果不存在）
  try {
    db.run(`ALTER TABLE study_todos ADD COLUMN priority TEXT DEFAULT 'medium'`)
  } catch (e) {}
}

export const todoDB = {
  getAll(userId = 'default') {
    const stmt = db.prepare(`SELECT * FROM study_todos WHERE user_id = ? ORDER BY created_at DESC`)
    stmt.bind([userId])
    const rows = []
    while (stmt.step()) {
      rows.push(stmt.getAsObject())
    }
    stmt.free()
    return rows.map(row => {
      row.completed = row.completed === 1
      return row
    })
  },

  add(userId, text, subject = '', priority = 'medium') {
    db.run(`INSERT INTO study_todos (user_id, text, subject, priority) VALUES (?, ?, ?, ?)`, [userId, text, subject, priority])
    saveDatabase()
    const result = db.exec('SELECT last_insert_rowid() as id')
    return result[0].values[0][0]
  },

  toggle(userId, id) {
    db.run(`UPDATE study_todos SET completed = CASE WHEN completed = 1 THEN 0 ELSE 1 END, updated_at = datetime('now', 'localtime') WHERE user_id = ? AND id = ?`, [userId, id])
    saveDatabase()
  },

  delete(userId, id) {
    db.run(`DELETE FROM study_todos WHERE user_id = ? AND id = ?`, [userId, id])
    saveDatabase()
  },

  getStats(userId = 'default') {
    const results = db.exec(`
      SELECT
        SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN completed = 0 THEN 1 ELSE 0 END) as pending,
        COUNT(*) as total
      FROM study_todos WHERE user_id = ?
    `, [userId])
    if (results.length === 0 || results[0].values.length === 0) return { completed: 0, pending: 0, total: 0 }
    return {
      completed: results[0].values[0][0] || 0,
      pending: results[0].values[0][1] || 0,
      total: results[0].values[0][2] || 0
    }
  }
}

// ============ 学习日程表 ============
function initStudySchedulesTable() {
  db.run(`
    CREATE TABLE IF NOT EXISTS study_schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT DEFAULT 'default',
      text TEXT NOT NULL,
      subject TEXT DEFAULT '',
      schedule_date TEXT NOT NULL,
      time TEXT DEFAULT '',
      end_time TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `)
  // 添加新字段（如果不存在）
  try {
    db.run(`ALTER TABLE study_schedules ADD COLUMN time TEXT DEFAULT ''`)
  } catch (e) {}
  try {
    db.run(`ALTER TABLE study_schedules ADD COLUMN end_time TEXT DEFAULT ''`)
  } catch (e) {}
}

export const scheduleDB = {
  getAll(userId = 'default') {
    const results = db.exec(`SELECT * FROM study_schedules WHERE user_id = ? ORDER BY schedule_date ASC, created_at DESC`, [userId])
    if (results.length === 0) return []
    const columns = results[0].columns
    return results[0].values.map(row => {
      const obj = {}
      columns.forEach((col, i) => obj[col] = row[i])
      return obj
    })
  },

  getByDate(userId = 'default', date) {
    const results = db.exec(`SELECT * FROM study_schedules WHERE user_id = ? AND schedule_date = ? ORDER BY created_at DESC`, [userId, date])
    if (results.length === 0) return []
    const columns = results[0].columns
    return results[0].values.map(row => {
      const obj = {}
      columns.forEach((col, i) => obj[col] = row[i])
      return obj
    })
  },

  add(userId, text, scheduleDate, subject = '', time = '', endTime = '') {
    db.run(`INSERT INTO study_schedules (user_id, text, schedule_date, subject, time, end_time) VALUES (?, ?, ?, ?, ?, ?)`, [userId, text, scheduleDate, subject, time, endTime])
    saveDatabase()
    const result = db.exec('SELECT last_insert_rowid() as id')
    return result[0].values[0][0]
  },

  delete(userId, id) {
    db.run(`DELETE FROM study_schedules WHERE user_id = ? AND id = ?`, [userId, id])
    saveDatabase()
  },

  getToday(userId = 'default') {
    const today = new Date().toISOString().split('T')[0]
    return this.getByDate(userId, today)
  }
}

export default { initDatabase, saveDatabase }

// ============ PPT 模板表 ============
function initPptTemplatesTable() {
  db.run(`
    CREATE TABLE IF NOT EXISTS ppt_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      content TEXT NOT NULL,
      description TEXT DEFAULT '',
      is_preset INTEGER DEFAULT 0,
      subject TEXT DEFAULT '',
      usage_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `)
  
  // 初始化预设模板 - 学科相关模板
  const presetTemplates = [
    {
      name: '高等数学模板',
      content: `## 第1页：高等数学

- 课程名称
- 章节标题
- 日期

## 第2页：知识回顾

- 上节要点
- 相关概念
- 公式定理

## 第3页：引入概念

- 生活实例
- 问题背景
- 本节目标

## 第4页：核心内容

- 定义说明
- 定理证明
- 公式推导

## 第5页：例题精讲

- 题目展示
- 解题思路
- 详细解答

## 第6页：课堂练习

- 练习题1
- 练习题2
- 练习题3

## 第7页：重点总结

- 核心公式
- 解题技巧
- 易错提醒

## 第8页：课后作业`,
      description: '高等数学课程教学模板，包含极限、导数、积分等内容',
      is_preset: 1
    },
    {
      name: '线性代数模板',
      content: `## 第1页：线性代数

- 课程名称
- 章节标题
- 日期

## 第2页：知识框架

- 本章结构
- 核心概念
- 应用领域

## 第3页：基本概念

- 定义讲解
- 几何意义
- 性质分析

## 第4页：矩阵运算

- 矩阵乘法
- 逆矩阵
- 行列式

## 第5页：例题分析

- 典型题目
- 解题步骤
- 方法总结

## 第6页：特征值与特征向量

- 定义说明
- 计算方法
- 应用实例

## 第7页：课堂练习

- 计算题
- 证明题
- 应用题

## 第8页：知识总结`,
      description: '线性代数课程模板，包含矩阵、行列式、特征值等内容',
      is_preset: 1
    },
    {
      name: '概率论模板',
      content: `## 第1页：概率论

- 课程名称
- 章节标题
- 日期

## 第2页：问题引入

- 生活实例
- 概率起源
- 学习目标

## 第3页：基本概念

- 随机事件
- 样本空间
- 概率定义

## 第4页：概率公式

- 加法公式
- 乘法公式
- 条件概率

## 第5页：分布函数

- 离散分布
- 连续分布
- 常用分布

## 第6页：数学期望

- 期望定义
- 性质计算
- 应用实例

## 第7页：方差分析

- 方差概念
- 计算方法
- 实际应用

## 第8页：课堂小结`,
      description: '概率论课程模板，包含概率、分布、期望、方差等内容',
      is_preset: 1
    },
    {
      name: '大学物理模板',
      content: `## 第1页：大学物理

- 课程名称
- 章节标题
- 日期

## 第2页：物理背景

- 生活现象
- 科学问题
- 研究意义

## 第3页：基本原理

- 定律说明
- 适用条件
- 核心公式

## 第4页：公式推导

- 推导过程
- 关键步骤
- 结果分析

## 第5页：例题演示

- 题目条件
- 分析过程
- 结果验证

## 第6页：实验演示

- 实验原理
- 实验步骤
- 数据处理

## 第7页：知识应用

- 生活应用
- 工程实例
- 前沿科技

## 第8页：总结思考`,
      description: '大学物理课程模板，包含力学、热学、电磁学等内容',
      is_preset: 1
    },
    {
      name: '专业课模板',
      content: `## 第1页：专业课

- 课程名称
- 章节标题
- 专业背景

## 第2页：课程目标

- 知识目标
- 能力目标
- 素养目标

## 第3页：理论框架

- 核心理论
- 知识体系
- 发展脉络

## 第4页：重点讲解

- 重点内容
- 难点分析
- 实例说明

## 第5页：案例分析

- 案例背景
- 问题剖析
- 解决方案

## 第6页：实践应用

- 应用场景
- 操作要点
- 注意事项

## 第7页：课堂讨论

- 讨论主题
- 思考问题
- 互动交流

## 第8页：总结提升`,
      description: '专业课通用模板，适合各类专业课程教学',
      is_preset: 1
    },
    {
      name: '英语学习模板',
      content: `## 第1页：英语学习

- 课程主题
- 学习目标
- 日期

## 第2页：词汇学习

- 核心词汇
- 例句展示
- 用法讲解

## 第3页：语法要点

- 语法规则
- 结构分析
- 易错提示

## 第4页：阅读理解

- 文章背景
- 段落分析
- 主旨大意

## 第5页：听力训练

- 听前预测
- 听中注意
- 听后复述

## 第6页：口语表达

- 话题讨论
- 表达技巧
- 范例展示

## 第7页：写作指导

- 写作要点
- 范文分析
- 练习任务

## 第8页：学习总结`,
      description: '英语学习模板，包含词汇、语法、听说读写等内容',
      is_preset: 1
    },
    {
      name: '编程学习模板',
      content: `## 第1页：编程学习

- 课程主题
- 编程语言
- 日期

## 第2页：学习目标

- 知识目标
- 技能目标
- 项目目标

## 第3页：基本概念

- 核心概念
- 术语解释
- 基础语法

## 第4页：代码讲解

- 示例代码
- 代码分析
- 运行结果

## 第5页：算法分析

- 算法思路
- 复杂度分析
- 优化方法

## 第6页：实战练习

- 练习题目
- 实现思路
- 参考答案

## 第7页：常见错误

- 易错点
- 调试方法
- 最佳实践

## 第8页：总结与作业`,
      description: '编程学习模板，适合算法、数据结构、Python等课程',
      is_preset: 1
    },
    {
      name: '政治理论模板',
      content: `## 第1页：政治理论

- 课程名称
- 章节标题
- 日期

## 第2页：理论背景

- 历史背景
- 时代意义
- 学习目的

## 第3页：核心概念

- 基本概念
- 理论内涵
- 相互关系

## 第4页：主要观点

- 理论要点
- 核心论述
- 实践指导

## 第5页：案例分析

- 案例背景
- 问题分析
- 启示思考

## 第6页：时事联系

- 时事热点
- 理论应用
- 分析方法

## 第7页：讨论交流

- 讨论主题
- 思考问题
- 互动环节

## 第8页：总结提升`,
      description: '政治理论模板，适合马克思主义、近代史、思修等课程',
      is_preset: 1
    },
    {
      name: '知识梳理模板',
      content: `## 第1页：知识梳理

- 学科名称
- 章节主题
- 日期

## 第2页：知识框架

- 整体结构
- 章节关系
- 学习要点

## 第3页：重点回顾

- 核心概念
- 重要公式
- 关键定理

## 第4页：难点解析

- 难点分析
- 理解方法
- 突破技巧

## 第5页：典型例题

- 题目展示
- 解题思路
- 方法总结

## 第6页：易错警示

- 常见错误
- 正确理解
- 防范措施

## 第7页：练习巩固

- 选择题
- 填空题
- 解答题

## 第8页：学习反思`,
      description: '知识梳理模板，适合章节复习和期末复习使用',
      is_preset: 1
    },
    {
      name: '小组展示模板',
      content: `## 第1页：小组展示

- 课题名称
- 小组成员
- 指导教师

## 第2页：目录大纲

- 研究背景
- 研究内容
- 研究结论
- 小组分工

## 第3页：研究背景

- 选题原因
- 研究意义
- 国内外现状

## 第4页：研究内容

- 研究问题
- 研究方法
- 数据来源

## 第5页：研究结果

- 数据分析
- 结果展示
- 图表说明

## 第6页：结论与建议

- 主要结论
- 建议措施
- 未来展望

## 第7页：小组分工

- 成员贡献
- 任务分配
- 协作过程

## 第8页：谢谢聆听`,
      description: '小组展示模板，适合课程答辩和研究汇报',
      is_preset: 1
    },
    {
      name: '毕业答辩模板',
      content: `## 第1页：毕业答辩

- 论文题目
- 答辩人
- 指导教师
- 答辩日期

## 第2页：目录

- 研究背景
- 研究内容
- 研究方法
- 结论展望

## 第3页：研究背景

- 研究意义
- 国内外现状
- 研究问题

## 第4页：研究内容

- 主要内容
- 创新点
- 技术路线

## 第5页：研究方法

- 方法介绍
- 实验设计
- 数据收集

## 第6页：研究结果

- 数据分析
- 结果展示
- 结果验证

## 第7页：结论与展望

- 主要结论
- 研究局限
- 未来方向

## 第8页：致谢`,
      description: '毕业答辩专用模板',
      is_preset: 1
    },
    {
      name: '培训课件模板',
      content: `## 第1页：培训主题

- 培训标题
- 培训师
- 培训时间
- 培训对象

## 第2页：培训目标

- 知识目标
- 技能目标
- 态度目标

## 第3页：课程大纲

- 模块一
- 模块二
- 模块三

## 第4页：核心内容

- 要点1
- 要点2
- 要点3
- 要点4

## 第5页：案例分析

- 案例背景
- 问题分析
- 解决思路

## 第6页：实操练习

- 练习要求
- 注意事项
- 评分标准

## 第7页：总结回顾

- 关键要点
- 行动计划
- Q&A`,
      description: '企业内部培训课件模板',
      is_preset: 1
    }
  ]

  // 检查并插入预设模板（如果不存在则插入）
  presetTemplates.forEach(tpl => {
    const exists = db.exec(`SELECT COUNT(*) FROM ppt_templates WHERE name = ? AND is_preset = 1`, [tpl.name])
    if (exists[0].values[0][0] === 0) {
      db.run(`INSERT INTO ppt_templates (name, content, description, is_preset) VALUES (?, ?, ?, ?)`,
        [tpl.name, tpl.content, tpl.description, tpl.is_preset])
    }
  })
  saveDatabase()
}

export const pptTemplateDB = {
  getAll() {
    const results = db.exec('SELECT * FROM ppt_templates ORDER BY is_preset DESC, usage_count DESC, created_at DESC')
    if (results.length === 0) return []
    const columns = results[0].columns
    return results[0].values.map(row => {
      const obj = {}
      columns.forEach((col, i) => obj[col] = row[i])
      obj.is_preset = obj.is_preset === 1
      return obj
    })
  },

  getPresets() {
    const results = db.exec('SELECT * FROM ppt_templates WHERE is_preset = 1 ORDER BY id')
    if (results.length === 0) return []
    const columns = results[0].columns
    return results[0].values.map(row => {
      const obj = {}
      columns.forEach((col, i) => obj[col] = row[i])
      obj.is_preset = true
      return obj
    })
  },

  getUserTemplates() {
    const results = db.exec('SELECT * FROM ppt_templates WHERE is_preset = 0 ORDER BY usage_count DESC, created_at DESC')
    if (results.length === 0) return []
    const columns = results[0].columns
    return results[0].values.map(row => {
      const obj = {}
      columns.forEach((col, i) => obj[col] = row[i])
      obj.is_preset = false
      return obj
    })
  },

  add(name, content, description = '', subject = '') {
    db.run(`INSERT INTO ppt_templates (name, content, description, subject) VALUES (?, ?, ?, ?)`,
      [name, content, description, subject])
    const result = db.exec('SELECT last_insert_rowid() as id')
    saveDatabase()
    return result[0].values[0][0]
  },

  update(id, data) {
    const fields = []
    const params = []
    if (data.name !== undefined) { fields.push('name = ?'); params.push(data.name) }
    if (data.content !== undefined) { fields.push('content = ?'); params.push(data.content) }
    if (data.description !== undefined) { fields.push('description = ?'); params.push(data.description) }
    if (data.subject !== undefined) { fields.push('subject = ?'); params.push(data.subject) }
    if (data.usage_count !== undefined) { fields.push('usage_count = ?'); params.push(data.usage_count) }
    if (fields.length === 0) return false
    fields.push("updated_at = datetime('now', 'localtime')")
    params.push(id)
    db.run(`UPDATE ppt_templates SET ${fields.join(', ')} WHERE id = ? AND is_preset = 0`, params)
    saveDatabase()
    return true
  },

  incrementUsage(id) {
    db.run(`UPDATE ppt_templates SET usage_count = usage_count + 1, updated_at = datetime('now', 'localtime') WHERE id = ?`, [id])
    saveDatabase()
  },

  delete(id) {
    db.run('DELETE FROM ppt_templates WHERE id = ? AND is_preset = 0', [id])
    saveDatabase()
  }
}

// ============ AI 任务表 ============
function initAiTasksTable() {
  db.run(`
    CREATE TABLE IF NOT EXISTS ai_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'failed')),
      progress INTEGER DEFAULT 0,
      result TEXT DEFAULT '',
      error TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `)
}

export const aiTaskDB = {
  generateTaskId() {
    return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  },

  create(type, title, description = '') {
    const taskId = this.generateTaskId()
    db.run(`INSERT INTO ai_tasks (task_id, type, title, description, status) VALUES (?, ?, ?, ?, 'pending')`,
      [taskId, type, title, description])
    saveDatabase()
    return taskId
  },

  get(taskId) {
    const results = db.exec('SELECT * FROM ai_tasks WHERE task_id = ?', [taskId])
    if (results.length === 0 || results[0].values.length === 0) return null
    const columns = results[0].columns
    const obj = {}
    columns.forEach((col, i) => obj[col] = results[0].values[0][i])
    return obj
  },

  getAll(limit = 20) {
    const results = db.exec(`SELECT * FROM ai_tasks ORDER BY created_at DESC LIMIT ${limit}`)
    if (results.length === 0) return []
    const columns = results[0].columns
    return results[0].values.map(row => {
      const obj = {}
      columns.forEach((col, i) => obj[col] = row[i])
      return obj
    })
  },

  getActive() {
    const results = db.exec(`SELECT * FROM ai_tasks WHERE status IN ('pending', 'processing') ORDER BY created_at DESC`)
    if (results.length === 0) return []
    const columns = results[0].columns
    return results[0].values.map(row => {
      const obj = {}
      columns.forEach((col, i) => obj[col] = row[i])
      return obj
    })
  },

  getRecent(limit = 10) {
    const results = db.exec(`SELECT * FROM ai_tasks ORDER BY updated_at DESC LIMIT ${limit}`)
    if (results.length === 0) return []
    const columns = results[0].columns
    return results[0].values.map(row => {
      const obj = {}
      columns.forEach((col, i) => obj[col] = row[i])
      return obj
    })
  },

  updateStatus(taskId, status, progress = null, result = null, error = null) {
    let sql = `UPDATE ai_tasks SET status = ?, updated_at = datetime('now', 'localtime')`
    const params = [status]
    
    if (progress !== null) {
      sql += `, progress = ?`
      params.push(progress)
    }
    if (result !== null) {
      sql += `, result = ?`
      params.push(result)
    }
    if (error !== null) {
      sql += `, error = ?`
      params.push(error)
    }
    
    sql += ` WHERE task_id = ?`
    params.push(taskId)
    
    db.run(sql, params)
    saveDatabase()
  },

  delete(taskId) {
    db.run('DELETE FROM ai_tasks WHERE task_id = ?', [taskId])
    saveDatabase()
  },

  clearCompleted() {
    db.run(`DELETE FROM ai_tasks WHERE status IN ('completed', 'failed')`)
    saveDatabase()
  },

  getStats() {
    const results = db.exec(`
      SELECT
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        COUNT(*) as total
      FROM ai_tasks
    `)
    if (results.length === 0 || results[0].values.length === 0) {
      return { pending: 0, processing: 0, completed: 0, failed: 0, total: 0 }
    }
    return {
      pending: results[0].values[0][0] || 0,
      processing: results[0].values[0][1] || 0,
      completed: results[0].values[0][2] || 0,
      failed: results[0].values[0][3] || 0,
      total: results[0].values[0][4] || 0
    }
  }
}

// ============ 考试相关表 ============
function initExamsTable() {
  // 考试表
  db.run(`
    CREATE TABLE IF NOT EXISTS exams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exam_id TEXT UNIQUE NOT NULL,
      user_id TEXT DEFAULT 'default',
      subject TEXT NOT NULL,
      title TEXT NOT NULL,
      mode TEXT DEFAULT 'exam' CHECK(mode IN ('exam', 'practice')),
      time_limit INTEGER DEFAULT 60,
      enable_time_limit INTEGER DEFAULT 1,
      difficulty TEXT DEFAULT 'medium',
      knowledge_scope TEXT DEFAULT '',
      question_counts TEXT DEFAULT '{}',
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'generating', 'ready', 'in_progress', 'completed', 'failed')),
      questions TEXT DEFAULT '',
      answers TEXT DEFAULT '',
      analysis TEXT DEFAULT '',
      score INTEGER DEFAULT 0,
      total_score INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `)

  // 考试答题记录表
  db.run(`
    CREATE TABLE IF NOT EXISTS exam_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exam_id TEXT NOT NULL,
      question_index INTEGER NOT NULL,
      user_answer TEXT DEFAULT '',
      is_correct INTEGER DEFAULT 0,
      score INTEGER DEFAULT 0,
      answered_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (exam_id) REFERENCES exams(exam_id) ON DELETE CASCADE
    )
  `)
}

export const examDB = {
  generateExamId() {
    return 'exam_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  },

  create(data) {
    const examId = this.generateExamId()
    db.run(`
      INSERT INTO exams (exam_id, user_id, subject, title, mode, time_limit, enable_time_limit, difficulty, knowledge_scope, question_counts, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      examId,
      data.userId || 'default',
      data.subject,
      data.title || `${data.subject}阶段性测试`,
      data.mode || 'exam',
      data.timeLimit || 60,
      data.enableTimeLimit ? 1 : 0,
      data.difficulty || 'medium',
      data.knowledgeScope || '',
      JSON.stringify(data.questionCounts || {}),
      'generating'
    ])
    saveDatabase()
    return examId
  },

  get(examId) {
    const results = db.exec('SELECT * FROM exams WHERE exam_id = ?', [examId])
    if (results.length === 0 || results[0].values.length === 0) return null
    const columns = results[0].columns
    const obj = {}
    columns.forEach((col, i) => obj[col] = results[0].values[0][i])
    // 解析JSON字段
    try {
      obj.question_counts = JSON.parse(obj.question_counts || '{}')
      obj.questions = JSON.parse(obj.questions || '[]')
      obj.answers = JSON.parse(obj.answers || '{}')
      obj.analysis = JSON.parse(obj.analysis || '{}')
    } catch (e) {}
    return obj
  },

  getByUser(userId, limit = 20) {
    const results = db.exec(`
      SELECT * FROM exams WHERE user_id = ? ORDER BY created_at DESC LIMIT ${limit}
    `, [userId])
    if (results.length === 0) return []
    const columns = results[0].columns
    return results[0].values.map(row => {
      const obj = {}
      columns.forEach((col, i) => obj[col] = row[i])
      try {
        obj.question_counts = JSON.parse(obj.question_counts || '{}')
      } catch (e) {}
      return obj
    })
  },

  updateQuestions(examId, questions, answers, analysis) {
    db.run(`
      UPDATE exams SET 
        questions = ?, 
        answers = ?, 
        analysis = ?,
        status = 'ready',
        updated_at = datetime('now', 'localtime')
      WHERE exam_id = ?
    `, [JSON.stringify(questions), JSON.stringify(answers), JSON.stringify(analysis), examId])
    saveDatabase()
  },

  updateStatus(examId, status) {
    db.run(`
      UPDATE exams SET status = ?, updated_at = datetime('now', 'localtime') WHERE exam_id = ?
    `, [status, examId])
    saveDatabase()
  },

  submitAnswer(examId, questionIndex, userAnswer, isCorrect, score) {
    db.run(`
      INSERT INTO exam_answers (exam_id, question_index, user_answer, is_correct, score)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(exam_id, question_index) DO UPDATE SET
        user_answer = excluded.user_answer,
        is_correct = excluded.is_correct,
        score = excluded.score,
        answered_at = datetime('now', 'localtime')
    `, [examId, questionIndex, userAnswer, isCorrect ? 1 : 0, score])
    saveDatabase()
  },

  getAnswers(examId) {
    const results = db.exec('SELECT * FROM exam_answers WHERE exam_id = ? ORDER BY question_index', [examId])
    if (results.length === 0) return []
    const columns = results[0].columns
    return results[0].values.map(row => {
      const obj = {}
      columns.forEach((col, i) => obj[col] = row[i])
      return obj
    })
  },

  completeExam(examId, score, totalScore) {
    db.run(`
      UPDATE exams SET 
        status = 'completed',
        score = ?,
        total_score = ?,
        updated_at = datetime('now', 'localtime')
      WHERE exam_id = ?
    `, [score, totalScore, examId])
    saveDatabase()
  },

  delete(examId) {
    db.run('DELETE FROM exam_answers WHERE exam_id = ?', [examId])
    db.run('DELETE FROM exams WHERE exam_id = ?', [examId])
    saveDatabase()
  }
}
