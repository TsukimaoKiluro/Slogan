/**
 * 公共常量映射
 * 供所有页面复用，避免多处重复定义
 */

// 题型名称映射
export const QUESTION_TYPE_MAP = {
  single: '单选题',
  multiple: '多选题',
  fill: '填空题',
  judge: '判断题',
  comprehensive: '综合应用题'
}

// 题型反向映射（中文到英文）
export const QUESTION_TYPE_REVERSE = {
  '单选题': 'single',
  '多选题': 'multiple',
  '填空题': 'fill',
  '判断题': 'judge',
  '综合应用题': 'comprehensive'
}

// 难度文字映射
export const DIFFICULTY_TEXT_MAP = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
  mixed: '混合'
}

// 难度颜色映射（daisyUI badge class）
export const DIFFICULTY_CLASS_MAP = {
  easy: 'badge-success',
  medium: 'badge-warning',
  hard: 'badge-error',
  mixed: 'badge-ghost'
}

// 学科基础信息映射
export const SUBJECT_INFO_MAP = {
  math: { name: '高等数学', color: 'badge-primary', keywords: '高等数学,微积分,极限,导数,积分' },
  linear_algebra: { name: '线性代数', color: 'badge-secondary', keywords: '矩阵,行列式,向量,特征值' },
  probability: { name: '概率论', color: 'badge-accent', keywords: '概率,随机,期望,方差,分布' },
  physics: { name: '大学物理', color: 'badge-info', keywords: '力学,热学,电磁学,光学' },
  major: { name: '专业课', color: 'badge-ghost', keywords: '专业课,专业,课程' },
  english: { name: '英语', color: 'badge-success', keywords: '词汇,语法,阅读,听力,写作' },
  programming: { name: '编程', color: 'badge-warning', keywords: '算法,数据结构,python,java' },
  politics: { name: '政治', color: 'badge-error', keywords: '马克思主义,近代史,思修' }
}

// 掌握状态映射
export const MASTERY_STATUS_MAP = {
  unmastered: '待掌握',
  mastering: '掌握中',
  mastered: '已掌握'
}

export const MASTERY_STATUS_CLASS_MAP = {
  unmastered: 'badge-error',
  mastering: 'badge-warning',
  mastered: 'badge-success'
}

// 错误原因映射
export const ERROR_REASON_OPTIONS = [
  { value: '概念不清', label: '概念不清' },
  { value: '计算错误', label: '计算错误' },
  { value: '审题失误', label: '审题失误' },
  { value: '思路错误', label: '思路错误' },
  { value: '粗心大意', label: '粗心大意' },
  { value: '完全不会', label: '完全不会' },
  { value: '其他', label: '其他' }
]

// API 基础 URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

/**
 * 获取题型中文名称
 * @param {string} type 题型英文标识
 * @returns {string} 中文名称
 */
export function getQuestionTypeName(type) {
  return QUESTION_TYPE_MAP[type] || type
}

/**
 * 获取学科显示名称
 * @param {string} subjectKey 学科标识
 * @returns {string} 显示名称
 */
export function getSubjectDisplayName(subjectKey) {
  return SUBJECT_INFO_MAP[subjectKey]?.name || subjectKey
}

/**
 * 获取难度中文名称
 * @param {string} difficulty 难度标识
 * @returns {string} 中文名称
 */
export function getDifficultyText(difficulty) {
  return DIFFICULTY_TEXT_MAP[difficulty] || difficulty
}

/**
 * 获取难度对应的 CSS class
 * @param {string} difficulty 难度标识
 * @returns {string} daisyUI badge class
 */
export function getDifficultyClass(difficulty) {
  return DIFFICULTY_CLASS_MAP[difficulty] || 'badge-ghost'
}

/**
 * 获取学科颜色 class
 * @param {string} subjectKey 学科标识
 * @returns {string} daisyUI badge class
 */
export function getSubjectColorClass(subjectKey) {
  return SUBJECT_INFO_MAP[subjectKey]?.color || 'badge-ghost'
}

/**
 * 获取掌握状态中文名称
 * @param {string} status 状态标识
 * @returns {string} 中文名称
 */
export function getMasteryStatusName(status) {
  return MASTERY_STATUS_MAP[status] || status
}

/**
 * 获取掌握状态 CSS class
 * @param {string} status 状态标识
 * @returns {string} daisyUI badge class
 */
export function getMasteryStatusClass(status) {
  return MASTERY_STATUS_CLASS_MAP[status] || 'badge-ghost'
}
