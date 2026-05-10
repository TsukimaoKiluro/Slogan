import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync, readFileSync, writeFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 题目库文件路径
const QUESTIONS_FILE = join(__dirname, '..', 'data', 'exam_questions.json')

// 缓存题目数据
let questionsCache = null
let lastModified = 0

/**
 * 加载题目库数据
 * @returns {Object} 题目库数据
 */
function loadQuestionsData() {
  try {
    if (!existsSync(QUESTIONS_FILE)) {
      console.log('⚠️ 题目库文件不存在，创建默认题目库')
      createDefaultQuestionsFile()
    }

    const stats = readFileSync(QUESTIONS_FILE)
    const data = JSON.parse(stats)
    questionsCache = data
    return data
  } catch (error) {
    console.error('❌ 加载题目库失败:', error)
    return null
  }
}

/**
 * 创建默认题目库文件
 */
function createDefaultQuestionsFile() {
  const defaultData = {
    description: "考试题目库 - 按学科分类存储，方便复用",
    version: "1.0.0",
    lastUpdated: new Date().toISOString().split('T')[0],
    subjects: {},
    comprehensive: {
      description: "综合应用题模板",
      templates: []
    }
  }
  writeFileSync(QUESTIONS_FILE, JSON.stringify(defaultData, null, 2), 'utf8')
}

/**
 * 保存题目库数据
 * @param {Object} data 题目库数据
 */
function saveQuestionsData(data) {
  try {
    data.lastUpdated = new Date().toISOString().split('T')[0]
    writeFileSync(QUESTIONS_FILE, JSON.stringify(data, null, 2), 'utf8')
    questionsCache = data
    return true
  } catch (error) {
    console.error('❌ 保存题目库失败:', error)
    return false
  }
}

/**
 * 获取题目库数据（带缓存）
 * @returns {Object} 题目库数据
 */
export function getQuestionsData() {
  if (!questionsCache) {
    return loadQuestionsData()
  }
  return questionsCache
}

/**
 * 获取指定学科的题目列表
 * @param {string} subject 学科标识
 * @returns {Array} 题目列表
 */
export function getQuestionsBySubject(subject) {
  const data = getQuestionsData()
  if (!data || !data.subjects || !data.subjects[subject]) {
    return []
  }
  return data.subjects[subject].questions || []
}

/**
 * 根据条件筛选题目
 * @param {string} subject 学科标识
 * @param {Object} filters 筛选条件
 * @param {string} filters.type 题目类型 (single/multiple/fill/judge/comprehensive)
 * @param {string} filters.difficulty 难度 (easy/medium/hard)
 * @param {Array} filters.knowledgePoints 知识点列表
 * @param {number} filters.limit 限制数量
 * @returns {Array} 筛选后的题目列表
 */
export function filterQuestions(subject, filters = {}) {
  let questions = getQuestionsBySubject(subject)

  if (!questions || questions.length === 0) {
    return []
  }

  // 按类型筛选
  if (filters.type) {
    questions = questions.filter(q => q.type === filters.type)
  }

  // 按难度筛选
  if (filters.difficulty) {
    questions = questions.filter(q => q.difficulty === filters.difficulty)
  }

  // 按知识点筛选
  if (filters.knowledgePoints && filters.knowledgePoints.length > 0) {
    questions = questions.filter(q => {
      if (!q.knowledgePoints) return false
      return filters.knowledgePoints.some(kp => q.knowledgePoints.includes(kp))
    })
  }

  // 限制数量
  if (filters.limit && filters.limit > 0) {
    // 随机打乱后取前limit个
    questions = shuffleArray(questions).slice(0, filters.limit)
  }

  return questions
}

/**
 * 生成考试题目
 * @param {string} subject 学科标识
 * @param {Object} questionCounts 题目数量配置
 * @param {string} difficulty 难度 (easy/medium/hard/mixed)
 * @param {string} knowledgeScope 知识点范围
 * @returns {Object} 生成的题目和相关信息
 */
export function generateExamQuestions(subject, questionCounts = {}, difficulty = 'medium', knowledgeScope = '') {
  const allQuestions = getQuestionsBySubject(subject)

  if (!allQuestions || allQuestions.length === 0) {
    return {
      success: false,
      message: `学科 "${subject}" 暂无题目，请使用AI生成或手动添加题目`,
      questions: [],
      totalScore: 0
    }
  }

  const result = []
  const usedIds = new Set()

  // 解析知识点范围
  const knowledgePoints = knowledgeScope ? knowledgeScope.split(/[,，]/).map(k => k.trim()).filter(k => k) : []

  // 各题型默认分值
  const defaultScores = {
    single: 5,
    multiple: 10,
    fill: 5,
    judge: 5,
    comprehensive: 20
  }

  // 按题型抽取题目
  const types = ['single', 'multiple', 'fill', 'judge', 'comprehensive']
  let totalScore = 0

  for (const type of types) {
    const count = questionCounts[type] || 0
    if (count <= 0) continue

    // 筛选该类型的题目
    let typeQuestions = allQuestions.filter(q => q.type === type)

    // 按难度筛选（如果不是mixed）
    if (difficulty !== 'mixed') {
      typeQuestions = typeQuestions.filter(q => q.difficulty === difficulty)
    }

    // 按知识点筛选
    if (knowledgePoints.length > 0) {
      const filtered = typeQuestions.filter(q => {
        if (!q.knowledgePoints) return false
        return knowledgePoints.some(kp => q.knowledgePoints.some(qkp => qkp.includes(kp)))
      })
      // 如果知识点筛选后数量不足，使用原列表
      if (filtered.length >= count) {
        typeQuestions = filtered
      }
    }

    // 排除已使用的题目
    typeQuestions = typeQuestions.filter(q => !usedIds.has(q.id))

    // 如果筛选后题目数量不足指定数量，尝试从其他难度补充（题库题目不足时）
    let selected = shuffleArray(typeQuestions).slice(0, count)
    if (selected.length < count && difficulty !== 'mixed') {
      // 从所有难度中补充（排除已选题目）
      const allTypeQuestions = allQuestions.filter(q => q.type === type && !usedIds.has(q.id))
      const additionalNeeded = count - selected.length
      const additional = shuffleArray(allTypeQuestions).slice(0, additionalNeeded)
      selected = [...selected, ...additional]
    }

    for (const q of selected) {
      usedIds.add(q.id)
      const score = q.score || defaultScores[type] || 5
      totalScore += score

      result.push({
        id: q.id,
        type: q.type,
        difficulty: q.difficulty,
        knowledgePoints: q.knowledgePoints || [],
        content: q.content,
        options: q.options || [],
        score: score
      })
    }
  }

  // 打乱题目顺序
  const shuffledQuestions = shuffleArray(result)

  // 检查是否生成了任何题目
  if (shuffledQuestions.length === 0) {
    return {
      success: false,
      message: `学科 "${subject}" 题库中没有足够的题目，请先添加题目或使用AI生成`,
      questions: [],
      totalScore: 0
    }
  }

  return {
    success: true,
    message: `成功生成 ${shuffledQuestions.length} 道题目，总分 ${totalScore} 分`,
    questions: shuffledQuestions,
    totalScore: totalScore,
    questionCounts: {
      single: shuffledQuestions.filter(q => q.type === 'single').length,
      multiple: shuffledQuestions.filter(q => q.type === 'multiple').length,
      fill: shuffledQuestions.filter(q => q.type === 'fill').length,
      judge: shuffledQuestions.filter(q => q.type === 'judge').length,
      comprehensive: shuffledQuestions.filter(q => q.type === 'comprehensive').length
    }
  }
}

/**
 * 获取题目答案和解析
 * @param {string} subject 学科标识
 * @param {Array} questionIds 题目ID列表
 * @returns {Object} 答案和解析
 */
export function getQuestionAnswers(subject, questionIds) {
  const questions = getQuestionsBySubject(subject)
  const result = {}

  for (const id of questionIds) {
    const q = questions.find(q => q.id === id)
    if (q) {
      result[id] = {
        answer: q.answer,
        analysis: q.analysis || '',
        score: q.score || 5
      }
    }
  }

  return result
}

/**
 * 添加新题目
 * @param {string} subject 学科标识
 * @param {Object} question 题目数据
 * @returns {Object} 添加结果
 */
export function addQuestion(subject, question) {
  const data = getQuestionsData()

  if (!data.subjects[subject]) {
    data.subjects[subject] = {
      name: subject,
      description: `${subject}阶段性测试题目`,
      questions: []
    }
  }

  // 生成唯一ID
  if (!question.id) {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 6)
    question.id = `${subject}_${timestamp}_${random}`
  }

  // 检查ID是否已存在
  const existingIndex = data.subjects[subject].questions.findIndex(q => q.id === question.id)
  if (existingIndex >= 0) {
    // 更新现有题目
    data.subjects[subject].questions[existingIndex] = question
  } else {
    // 添加新题目
    data.subjects[subject].questions.push(question)
  }

  const success = saveQuestionsData(data)
  return {
    success,
    id: question.id,
    message: success ? '题目保存成功' : '题目保存失败'
  }
}

/**
 * 删除题目
 * @param {string} subject 学科标识
 * @param {string} questionId 题目ID
 * @returns {Object} 删除结果
 */
export function deleteQuestion(subject, questionId) {
  const data = getQuestionsData()

  if (!data.subjects[subject]) {
    return { success: false, message: '学科不存在' }
  }

  const originalLength = data.subjects[subject].questions.length
  data.subjects[subject].questions = data.subjects[subject].questions.filter(q => q.id !== questionId)

  if (data.subjects[subject].questions.length === originalLength) {
    return { success: false, message: '题目不存在' }
  }

  const success = saveQuestionsData(data)
  return {
    success,
    message: success ? '题目删除成功' : '题目删除失败'
  }
}

/**
 * 获取所有学科列表
 * @returns {Array} 学科列表
 */
export function getSubjects() {
  const data = getQuestionsData()
  if (!data || !data.subjects) return []

  return Object.keys(data.subjects).map(key => ({
    id: key,
    name: data.subjects[key].name || key,
    description: data.subjects[key].description || '',
    questionCount: data.subjects[key].questions?.length || 0
  }))
}

/**
 * 获取学科统计信息
 * @param {string} subject 学科标识
 * @returns {Object} 统计信息
 */
export function getSubjectStats(subject) {
  const questions = getQuestionsBySubject(subject)

  const stats = {
    total: questions.length,
    byType: {},
    byDifficulty: {}
  }

  for (const q of questions) {
    // 按类型统计
    stats.byType[q.type] = (stats.byType[q.type] || 0) + 1
    // 按难度统计
    stats.byDifficulty[q.difficulty] = (stats.byDifficulty[q.difficulty] || 0) + 1
  }

  return stats
}

/**
 * 数组随机打乱（Fisher-Yates算法）
 * @param {Array} array 原数组
 * @returns {Array} 打乱后的新数组
 */
function shuffleArray(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// 初始化时加载题目库
loadQuestionsData()

export default {
  getQuestionsData,
  getQuestionsBySubject,
  filterQuestions,
  generateExamQuestions,
  getQuestionAnswers,
  addQuestion,
  deleteQuestion,
  getSubjects,
  getSubjectStats
}
