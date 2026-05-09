import express from 'express'
import multer from 'multer'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync, mkdirSync, unlinkSync } from 'fs'
import fsPromises from 'fs/promises'
import path from 'path'
import { initDatabase, db, sessionDB, messageDB, fileDB, profileDB, knowledgeDB, cognitiveStyleDB, errorPointDB, errorBookDB, goalDB, interestDB, studyRecordDB, learningMaterialDB, subjectDB, todoDB, scheduleDB, pptTemplateDB, aiTaskDB, examDB } from './database.js'
import { registerPptxPluginRoutes } from './plugins/pptxgen/index.js'
import { getPromptContent } from './plugins/prompts/index.js'
import * as examQuestionsDB from './examQuestionsDB.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// ============ 学科自动识别函数 ============
/**
 * 根据标题或内容自动识别学科
 * 从数据库获取学科信息进行模糊匹配
 * @param {string} text - 标题或内容
 * @returns {Promise<{subject: string, isNew: boolean}>} 学科名称及是否为新学科
 */
async function autoDetectSubject(text) {
  if (!text) return { subject: 'major', isNew: false }

  // 使用模糊搜索查找匹配的学科
  const matches = subjectDB.fuzzySearch(text)

  if (matches.length > 0) {
    // 返回匹配度最高的学科
    return { subject: matches[0].name, isNew: false }
  }

  // 没有匹配到，尝试从学科名称的拼音首字母或关键词生成新学科
  const newSubjectName = generateSubjectName(text)

  // 检查新学科是否已存在
  const existing = subjectDB.get(newSubjectName.name)
  if (existing) {
    return { subject: existing.name, isNew: false }
  }

  // 添加新学科
  try {
    subjectDB.add(
      newSubjectName.name,
      newSubjectName.displayName,
      'book',
      'primary',
      99,
      newSubjectName.name // 新学科的关键词就是自己的名称
    )
    // 同步初始化 knowledge_base
    knowledgeDB.init('default', newSubjectName.name)
    return { subject: newSubjectName.name, isNew: true }
  } catch (e) {
    console.error('自动创建学科失败:', e)
    // 返回默认学科
    return { subject: 'major', isNew: false }
  }
}

/**
 * 根据文本生成学科名称
 * @param {string} text - 文本
 * @returns {{name: string, displayName: string}}
 */
function generateSubjectName(text) {
  // 清理文本，只保留中文、英文和数字
  let cleaned = text.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(w => w.length >= 2)
    .slice(0, 3)

  if (cleaned.length === 0) {
    return { name: 'major', displayName: '专业课' }
  }

  // 生成显示名称（取前两个词）
  const displayName = cleaned.slice(0, 2).join('')

  // 生成英文标识（拼音首字母或英文单词）
  let name = ''
  for (const word of cleaned) {
    if (/[a-zA-Z]/.test(word)) {
      // 如果是英文，取前4个字符
      name = word.substring(0, 4).toLowerCase().replace(/\s/g, '')
      break
    } else if (/[\u4e00-\u9fa5]/.test(word)) {
      // 如果是中文，取单字拼音首字母（简化处理）
      // 这里用中文字符作为标识的一部分
      name += word.charAt(0)
    }
  }

  if (!name) {
    name = cleaned[0].substring(0, 10).toLowerCase()
  }

  // 清理名称，只保留字母和数字
  name = name.replace(/[^a-z0-9]/g, '').substring(0, 20)

  // 确保名称不为空
  if (!name) {
    name = 'subject_' + Date.now()
  }

  return { name, displayName }
}

// ============ 中间件 ============
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// ============ AI API 调用函数 ============
/**
 * 调用 AI API（支持流式）
 * @param {Array} messages - 消息数组
 * @param {Object} apiConfig - API 配置
 * @param {Object} options - 选项 { stream: boolean, onChunk: function }
 * @returns {Promise<string|void>}
 */
async function callAIApi(messages, apiConfig, options = {}) {
  const { stream = false, onChunk = null } = options
  
  const endpoint = apiConfig.endpoint || 
    (apiConfig.provider === 'siliconflow' ? 'https://api.siliconflow.cn/v1' :
     apiConfig.provider === 'dashscope' ? 'https://dashscope.aliyuncs.com/compatible-mode/v1' :
     apiConfig.provider === 'openai' ? 'https://api.openai.com/v1' :
     apiConfig.provider === 'claude' ? 'https://api.anthropic.com/v1' :
     apiConfig.provider === 'gemini' ? 'https://generativelanguage.googleapis.com/v1beta' : '')
  
  const model = apiConfig.model || 
    (apiConfig.provider === 'siliconflow' ? 'Qwen/Qwen2.5-7B-Instruct' :
     apiConfig.provider === 'dashscope' ? 'qwen-plus' :
     apiConfig.provider === 'openai' ? 'gpt-4' :
     apiConfig.provider === 'claude' ? 'claude-3-opus-20240229' :
     apiConfig.provider === 'gemini' ? 'gemini-pro' : 'gpt-4')
  
  const apiKey = apiConfig.apiKey
  const timeout = (apiConfig.timeout || 60) * 1000

  // 构建请求头和请求体
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  }
  
  let requestBody = {}
  let apiUrl = ''

  // 根据不同服务商构建请求
  if (apiConfig.provider === 'openai' || apiConfig.provider === 'siliconflow' || apiConfig.provider === 'dashscope' || apiConfig.provider === 'custom') {
    // OpenAI 兼容格式
    apiUrl = `${endpoint}/chat/completions`
    
    if (stream) {
      headers['Accept'] = 'text/event-stream'
    }
    
    requestBody = {
      model: model,
      messages: messages,
      stream: stream,
      temperature: apiConfig.temperature || 0.7,
      max_tokens: apiConfig.maxTokens || 4096
    }
  } else if (apiConfig.provider === 'claude') {
    // Claude 格式
    apiUrl = `${endpoint}/messages`
    headers['x-api-key'] = apiKey
    headers['anthropic-version'] = '2023-06-01'
    if (stream) {
      headers['anthropic-beta'] = 'interleaved-thinking-2025-05-14'
    }
    
    requestBody = {
      model: model,
      messages: messages.filter(m => m.role !== 'system'),
      system: messages.find(m => m.role === 'system')?.content || '',
      max_tokens: apiConfig.maxTokens || 4096,
      temperature: apiConfig.temperature || 0.7,
      ...(stream ? { stream: true } : {})
    }
  } else if (apiConfig.provider === 'gemini') {
    // Gemini 格式
    apiUrl = `${endpoint}/models/${model}:generateContent?key=${apiKey}`
    
    if (stream) {
      apiUrl = `${endpoint}/models/${model}:streamGenerateContent?key=${apiKey}`
    }
    
    const contents = messages.filter(m => m.role !== 'system').map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }))
    
    requestBody = {
      contents,
      ...(messages.find(m => m.role === 'system') && {
        systemInstruction: { parts: [{ text: messages.find(m => m.role === 'system').content }] }
      }),
      generationConfig: {
        temperature: apiConfig.temperature || 0.7,
        maxOutputTokens: apiConfig.maxTokens || 4096
      }
    }
  } else {
    // 默认使用 OpenAI 格式
    apiUrl = `${endpoint}/chat/completions`
    
    if (stream) {
      headers['Accept'] = 'text/event-stream'
    }
    
    requestBody = {
      model: model,
      messages: messages,
      stream: stream,
      temperature: apiConfig.temperature || 0.7,
      max_tokens: apiConfig.maxTokens || 4096
    }
  }

  // 发起请求
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API 请求失败: ${response.status} - ${errorText}`)
    }

    if (stream) {
      // 流式处理
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      if (apiConfig.provider === 'claude') {
        // Claude 流式响应格式
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue
              
              try {
                const parsed = JSON.parse(data)
                if (parsed.type === 'content_block_delta') {
                  const text = parsed.delta?.text || ''
                  fullContent += text
                  if (onChunk) onChunk(text)
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
      } else if (apiConfig.provider === 'gemini') {
        // Gemini 流式响应格式
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('{')) {
              try {
                const parsed = JSON.parse(line)
                const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || ''
                if (text) {
                  fullContent += text
                  if (onChunk) onChunk(text)
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
      } else {
        // OpenAI 兼容格式 (硅基流动、阿里云百炼等)
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue

              try {
                const parsed = JSON.parse(data)
                const delta = parsed.choices?.[0]?.delta?.content || ''
                if (delta) {
                  fullContent += delta
                  if (onChunk) onChunk(delta)
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
      }

      return fullContent
    } else {
      // 非流式处理
      const result = await response.json()
      
      if (apiConfig.provider === 'claude') {
        return result.content?.[0]?.text || ''
      } else if (apiConfig.provider === 'gemini') {
        return result.candidates?.[0]?.content?.parts?.[0]?.text || ''
      } else {
        return result.choices?.[0]?.message?.content || ''
      }
    }
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      throw new Error('请求超时')
    }
    throw error
  }
}

// 静态文件服务
const uploadsDir = join(__dirname, '..', 'uploads')
app.use('/uploads', express.static(uploadsDir))

// 数字人形象静态文件服务
const avatarsDir = join(__dirname, 'avatars')
app.use('/avatars', express.static(avatarsDir))

// ============ 文件上传配置 ============
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category = req.params.category || 'tmp'
    const dir = join(uploadsDir, category)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    cb(null, `${uniqueSuffix}${ext}`)
  }
})

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB限制
})

// ============ 会话 API ============

// 获取所有会话
app.get('/api/chat/sessions', (req, res) => {
  try {
    const sessions = sessionDB.getAll()
    res.json({ 
      success: true, 
      data: sessions.map(s => ({
        sessionId: s.session_id,
        firstMessage: s.first_message || '新对话',
        lastTime: s.last_time || '',
        messageCount: s.message_count
      }))
    })
  } catch (error) {
    console.error('获取会话列表失败:', error)
    res.status(500).json({ success: false, error: '获取会话列表失败' })
  }
})

// 新建会话
app.post('/api/chat/new-session', (req, res) => {
  try {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionDB.create(sessionId)
    res.json({ success: true, sessionId })
  } catch (error) {
    console.error('创建会话失败:', error)
    res.status(500).json({ success: false, error: '创建会话失败' })
  }
})

// 获取单个会话历史
app.get('/api/chat/history/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params
    const messages = messageDB.getBySession(sessionId)
    res.json({ 
      success: true, 
      data: messages.map(m => ({
        role: m.role,
        content: m.content,
        time: m.time
      }))
    })
  } catch (error) {
    console.error('获取历史记录失败:', error)
    res.status(500).json({ success: false, error: '获取历史记录失败' })
  }
})

// 删除会话
app.delete('/api/chat/session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params
    sessionDB.delete(sessionId)
    res.json({ success: true })
  } catch (error) {
    console.error('删除会话失败:', error)
    res.status(500).json({ success: false, error: '删除会话失败' })
  }
})

// 清空所有会话
app.delete('/api/chat/all-sessions', (req, res) => {
  try {
    sessionDB.clearAll()
    res.json({ success: true, message: '所有会话已清空' })
  } catch (error) {
    console.error('清空会话失败:', error)
    res.status(500).json({ success: false, error: '清空会话失败' })
  }
})

// ============ 聊天 API ============

// 发送消息
app.post('/api/chat', async (req, res) => {
  try {
    const { sessionId, message, history, apiConfig, promptId, customPrompt } = req.body

    if (!message) {
      return res.status(400).json({ success: false, error: '消息内容不能为空' })
    }

    // 确保会话存在
    let session = sessionDB.get(sessionId)
    if (!session) {
      sessionDB.create(sessionId)
    }

    // 保存用户消息
    messageDB.add(sessionId, 'user', message)
    
    // ============ AI 人设定义（从提示词模块获取） ============
    const SYSTEM_PROMPT = getPromptContent(promptId, customPrompt)

    // 保存历史消息（用于上下文）
    const messages = (history || []).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }))
    
    // 将人设作为系统消息插入到最前面
    messages.unshift({ role: 'system', content: SYSTEM_PROMPT })
    messages.push({ role: 'user', content: message })

    // 调用 AI API（传入前端配置）
    const AI_RESPONSE = await callAIApi(messages, apiConfig)

    // 保存 AI 消息
    messageDB.add(sessionId, 'ai', AI_RESPONSE)

    res.json({
      success: true,
      data: {
        role: 'ai',
        content: AI_RESPONSE,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      }
    })
  } catch (error) {
    console.error('Chat API Error:', error)
    res.status(500).json({ success: false, error: 'API请求失败: ' + error.message })
  }
})

// ============ 流式聊天 API ============
app.post('/api/chat/stream', async (req, res) => {
  const { sessionId, message, history, apiConfig, promptId, customPrompt } = req.body

  if (!message) {
    return res.status(400).json({ success: false, error: '消息内容不能为空' })
  }

  // 确保会话存在
  let session = sessionDB.get(sessionId)
  if (!session) {
    sessionDB.create(sessionId)
  }

  // 保存用户消息
  messageDB.add(sessionId, 'user', message)

  // ============ AI 人设定义 ============
  const SYSTEM_PROMPT = getPromptContent(promptId, customPrompt)

  // 保存历史消息
  const messages = (history || []).map(msg => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content
  }))

  messages.unshift({ role: 'system', content: SYSTEM_PROMPT })
  messages.push({ role: 'user', content: message })

  // 设置 SSE headers
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')

  let fullContent = ''

  try {
    await callAIApi(messages, apiConfig, {
      stream: true,
      onChunk: (chunk) => {
        fullContent += chunk
        res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`)
      }
    })

    // 保存 AI 消息
    messageDB.add(sessionId, 'ai', fullContent)

    // 发送完成信号
    res.write(`data: ${JSON.stringify({ 
      type: 'done', 
      content: fullContent,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    })}\n\n`)
    res.end()
  } catch (error) {
    console.error('Stream Chat Error:', error)
    res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`)
    res.end()
  }
})

// ============ 内容生成 API（用于生成PPT、MD笔记、视频脚本） ============
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, type, apiConfig, title, taskId } = req.body

    if (!prompt) {
      return res.status(400).json({ success: false, error: '生成提示不能为空' })
    }

    if (!apiConfig?.apiKey) {
      return res.status(400).json({ success: false, error: '请先在设置中配置内容生成API' })
    }

    // 如果提供了 taskId，更新任务状态
    const updateTask = (status, progress, result = null, error = null) => {
      if (taskId) {
        try {
          aiTaskDB.updateStatus(taskId, status, progress, result, error)
        } catch (e) {
          console.error('更新任务失败:', e)
        }
      }
    }

    // 更新任务状态为处理中
    updateTask('processing', 10)

    // 根据类型设置系统提示
    const systemPrompts = {
      ppt: `你是一个专业的PPT内容整理助手。请根据用户提供的需求，生成一份PPT的文本大纲内容。
要求：
1. 输出格式为PPT大纲，每页用"## 第X页：[标题]"开头
2. 每页包含标题和3-5个要点
3. 内容要专业、准确、有深度
4. 总共10-12页
5. 结尾可以添加"## 总结"页面
直接输出内容，不要额外说明。`,
      md: `你是一个专业的Markdown笔记整理助手。请根据用户提供的需求，生成一份结构化的Markdown笔记。
要求：
1. 使用标准Markdown格式
2. 包含标题、目录、各级标题
3. 适当使用LaTeX公式（用$$包裹）
4. 重点内容用**加粗**
5. 包含代码示例（如果适用）
6. 结尾要有总结和练习题
直接输出笔记内容，不要额外说明。`,
      video: `你是一个专业的视频脚本整理助手。请根据用户提供的需求，生成一份视频脚本。
要求：
1. 包含开场白、主体内容、结尾
2. 每个部分标注时间（如"[00:00-00:30] 开头介绍"）
3. 口语化表达，适合口头讲解
4. 适当使用比喻和例子
5. 结尾有总结和互动引导
直接输出脚本内容，不要额外说明。`
    }

    const systemPrompt = systemPrompts[type] || systemPrompts.md
    const typeNames = { ppt: 'PPT', md: 'Markdown笔记', video: '视频脚本' }

    // 调用 AI API
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ]

    updateTask('processing', 30)
    const content = await callAIApi(messages, apiConfig)
    const timestamp = Date.now()

    updateTask('processing', 50)

    // PPT 类型：生成真正的 PPT 文件
    if (type === 'ppt') {
      updateTask('processing', 60)
      const pptFilename = `${timestamp}_${(title || prompt).replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}.pptx`
      const pptDir = join(uploadsDir, 'ppt')
      if (!existsSync(pptDir)) {
        mkdirSync(pptDir, { recursive: true })
      }
      const pptPath = join(pptDir, pptFilename)

      // 使用 pptxgen 生成 PPT
      const { createPptFromMarkdown } = await import('./plugins/pptxgen/index.js')
      await createPptFromMarkdown(content, {
        title: title || prompt,
        author: 'AI PPT Generator',
        outputPath: pptPath
      })

      updateTask('processing', 80)

      // 保存到大纲文件（用于查看）
      const outlineFilename = `${timestamp}_outline.md`
      const outlinePath = join(pptDir, outlineFilename)
      await fsPromises.writeFile(outlinePath, content, 'utf-8')

      // 导入到学习中心 - 自动识别学科
      const { subject: detectedSubject, isNew: isNewSubject } = await autoDetectSubject(title || prompt)
      const materialId = learningMaterialDB.add(
        title || prompt,
        '由 AI 自动生成的 PPT 演示文稿',
        `/uploads/ppt/${pptFilename}`,
        pptFilename,
        'ppt',
        detectedSubject,
        'medium',
        0,
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      )

      // 更新任务完成
      updateTask('completed', 100, JSON.stringify({
        type: 'ppt',
        filePath: `/uploads/ppt/${pptFilename}`,
        slideCount: (content.match(/## 第\d+页/gi) || []).length
      }))

      res.json({
        success: true,
        data: {
          type: 'ppt',
          content,
          filename: pptFilename,
          filePath: `/uploads/ppt/${pptFilename}`,
          materialId,
          slideCount: (content.match(/## 第\d+页/gi) || []).length
        }
      })
      return
    }

    // MD / Video 类型：保存为 Markdown 文件
    updateTask('processing', 70)
    const categoryMap = { md: 'docs', video: 'docs' }
    const category = categoryMap[type] || 'docs'
    const filename = `${timestamp}.md`
    const targetDir = join(uploadsDir, category)
    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true })
    }
    const filePath = join(targetDir, filename)
    await fsPromises.writeFile(filePath, content, 'utf-8')
    const stats = await fsPromises.stat(filePath)

    updateTask('processing', 90)

    // 导入到学习中心 - 自动识别学科
    const { subject: detectedSubject, isNew: isNewSubject } = await autoDetectSubject(title || prompt)
    const materialId = learningMaterialDB.add(
      title || prompt,
      `由 AI 自动生成的 ${type === 'md' ? 'Markdown' : '视频'} 内容`,
      `/uploads/${category}/${filename}`,
      filename,
      type === 'md' ? 'document' : 'document',
      detectedSubject,
      'medium',
      stats.size,
      'text/markdown'
    )

    // 更新任务完成
    updateTask('completed', 100, JSON.stringify({
      type,
      filePath: `/uploads/${category}/${filename}`,
      size: stats.size
    }))

    res.json({
      success: true,
      data: {
        type,
        content,
        filename,
        filePath: `/uploads/${category}/${filename}`,
        category,
        size: stats.size,
        materialId
      }
    })
  } catch (error) {
    console.error('内容生成失败:', error)
    // 更新任务失败状态
    if (req.body.taskId) {
      try {
        aiTaskDB.updateStatus(req.body.taskId, 'failed', 0, null, error.message)
      } catch (e) {
        console.error('更新任务失败状态失败:', e)
      }
    }
    res.status(500).json({ success: false, error: '生成失败: ' + error.message })
  }
})

// ============ 文件上传 API ============

// 上传文件
app.post('/api/upload/:category', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: '没有上传文件' })
    }

    const { sessionId } = req.body
    const category = req.params.category || 'tmp'

    const fileRecord = fileDB.add(
      req.file.filename,
      req.file.originalname,
      req.file.mimetype,
      req.file.size,
      req.file.path,
      category,
      sessionId || null
    )

    res.json({
      success: true,
      data: {
        id: fileRecord.lastInsertRowid,
        filename: req.file.filename,
        originalName: req.file.originalname,
        url: `/uploads/${category}/${req.file.filename}`,
        size: req.file.size,
        mimeType: req.file.mimetype
      }
    })
  } catch (error) {
    console.error('上传文件失败:', error)
    res.status(500).json({ success: false, error: '上传文件失败' })
  }
})

// 获取会话的文件列表
app.get('/api/files/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params
    const files = fileDB.getBySession(sessionId)
    res.json({
      success: true,
      data: files.map(f => ({
        id: f.id,
        filename: f.filename,
        originalName: f.original_name,
        mimeType: f.mime_type,
        size: f.size,
        category: f.category,
        url: `/uploads/${f.category}/${f.filename}`,
        createdAt: f.created_at
      }))
    })
  } catch (error) {
    console.error('获取文件列表失败:', error)
    res.status(500).json({ success: false, error: '获取文件列表失败' })
  }
})

// 删除文件
app.delete('/api/file/:id', (req, res) => {
  try {
    const { id } = req.params
    const file = fileDB.get(id)
    
    if (file) {
      // 删除物理文件
      if (existsSync(file.path)) {
        unlinkSync(file.path)
      }
      // 删除数据库记录
      fileDB.delete(id)
    }
    
    res.json({ success: true })
  } catch (error) {
    console.error('删除文件失败:', error)
    res.status(500).json({ success: false, error: '删除文件失败' })
  }
})

// ============ AI API 调用 ============

// 根据服务商获取默认端点和模型
const getProviderConfig = (provider) => {
  const configs = {
    siliconflow: {
      endpoint: 'https://api.siliconflow.cn/v1/chat/completions',
      model: 'Qwen/Qwen2.5-7B-Instruct'
    },
    openai: {
      endpoint: 'https://api.openai.com/v1/chat/completions',
      model: 'gpt-4'
    },
    claude: {
      endpoint: 'https://api.anthropic.com/v1/chat/completions',
      model: 'claude-3-opus-20240229'
    },
    gemini: {
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      model: 'gemini-pro'
    }
  }
  return configs[provider] || configs.siliconflow
}

// ============ 系统信息 API ============

app.get('/api/system/info', (req, res) => {
  res.json({
    success: true,
    data: {
      storage: {
        tmp: '/uploads/tmp',
        docs: '/uploads/docs',
        videos: '/uploads/videos'
      },
      maxFileSize: '100MB',
      supportedFormats: {
        docs: ['.md', '.txt', '.pdf', '.doc', '.docx'],
        videos: ['.mp4', '.webm', '.mov', '.avi'],
        tmp: ['.*']
      }
    }
  })
})

// ============ 个人面板 API ============

const getUserId = (req) => req.query.userId || req.body?.userId || 'default'

// 初始化用户面板数据
app.post('/api/profile/init', (req, res) => {
  try {
    const userId = getUserId(req)
    profileDB.initAll(userId)
    res.json({ success: true, message: '面板数据初始化完成' })
  } catch (error) {
    console.error('初始化面板数据失败:', error)
    res.status(500).json({ success: false, error: '初始化失败' })
  }
})

// 获取所有面板数据
app.get('/api/profile/data', (req, res) => {
  try {
    const userId = getUserId(req)
    const data = profileDB.getAllData(userId)
    res.json({ success: true, data })
  } catch (error) {
    console.error('获取面板数据失败:', error)
    res.status(500).json({ success: false, error: '获取数据失败' })
  }
})

// 知识基础 API
app.get('/api/profile/knowledge', (req, res) => {
  try {
    const userId = getUserId(req)
    const data = knowledgeDB.getAll(userId)
    res.json({ success: true, data })
  } catch (error) {
    console.error('获取知识数据失败:', error)
    res.status(500).json({ success: false, error: '获取数据失败' })
  }
})

app.put('/api/profile/knowledge', (req, res) => {
  try {
    const userId = getUserId(req)
    const { scores } = req.body
    if (Array.isArray(scores)) {
      knowledgeDB.updateBatch(userId, scores)
    }
    res.json({ success: true, message: '知识数据已更新' })
  } catch (error) {
    console.error('更新知识数据失败:', error)
    res.status(500).json({ success: false, error: '更新失败' })
  }
})

// 认知风格 API
app.get('/api/profile/cognitive-style', (req, res) => {
  try {
    const userId = getUserId(req)
    const data = cognitiveStyleDB.getAll(userId)
    res.json({ success: true, data })
  } catch (error) {
    console.error('获取认知风格数据失败:', error)
    res.status(500).json({ success: false, error: '获取数据失败' })
  }
})

app.put('/api/profile/cognitive-style', (req, res) => {
  try {
    const userId = getUserId(req)
    const { scores } = req.body
    if (Array.isArray(scores)) {
      scores.forEach(item => {
        cognitiveStyleDB.updateScore(userId, item.style, item.score)
      })
    }
    res.json({ success: true, message: '认知风格数据已更新' })
  } catch (error) {
    console.error('更新认知风格数据失败:', error)
    res.status(500).json({ success: false, error: '更新失败' })
  }
})

// 易错点 API
app.get('/api/profile/error-points', (req, res) => {
  try {
    const userId = getUserId(req)
    const data = errorPointDB.getAll(userId)
    res.json({ success: true, data })
  } catch (error) {
    console.error('获取易错点数据失败:', error)
    res.status(500).json({ success: false, error: '获取数据失败' })
  }
})

app.post('/api/profile/error-points/record', (req, res) => {
  try {
    const userId = getUserId(req)
    const { topic, questionType } = req.body
    errorPointDB.recordError(userId, topic, questionType)
    res.json({ success: true, message: '错误已记录' })
  } catch (error) {
    console.error('记录错误失败:', error)
    res.status(500).json({ success: false, error: '记录失败' })
  }
})

app.put('/api/profile/error-points', (req, res) => {
  try {
    const userId = getUserId(req)
    const { data } = req.body
    if (Array.isArray(data)) {
      errorPointDB.updateBatch(userId, data)
    }
    res.json({ success: true, message: '易错点数据已更新' })
  } catch (error) {
    console.error('更新易错点数据失败:', error)
    res.status(500).json({ success: false, error: '更新失败' })
  }
})

// ============ 错题本 API ============

// 获取错题列表
app.get('/api/error-book', (req, res) => {
  try {
    const userId = getUserId(req)
    const { subject, questionType, masteryStatus } = req.query
    const data = errorBookDB.getAll(userId, { subject, questionType, masteryStatus })
    res.json({ success: true, data })
  } catch (error) {
    console.error('获取错题本失败:', error)
    res.status(500).json({ success: false, error: '获取错题本失败' })
  }
})

// 获取错题统计
app.get('/api/error-book/stats', (req, res) => {
  try {
    const userId = getUserId(req)
    const stats = errorBookDB.getStats(userId)
    res.json({ success: true, data: stats })
  } catch (error) {
    console.error('获取错题统计失败:', error)
    res.status(500).json({ success: false, error: '获取统计失败' })
  }
})

// 获取今日待复习错题
app.get('/api/error-book/today-review', (req, res) => {
  try {
    const userId = getUserId(req)
    const data = errorBookDB.getTodayReview(userId)
    res.json({ success: true, data })
  } catch (error) {
    console.error('获取今日复习失败:', error)
    res.status(500).json({ success: false, error: '获取失败' })
  }
})

// 获取单个错题
app.get('/api/error-book/:id', (req, res) => {
  try {
    const userId = getUserId(req)
    const { id } = req.params
    const data = errorBookDB.getById(parseInt(id), userId)
    if (!data) {
      return res.status(404).json({ success: false, error: '错题不存在' })
    }
    res.json({ success: true, data })
  } catch (error) {
    console.error('获取错题详情失败:', error)
    res.status(500).json({ success: false, error: '获取失败' })
  }
})

// 添加错题
app.post('/api/error-book', (req, res) => {
  try {
    const userId = getUserId(req)
    const result = errorBookDB.add({ ...req.body, userId })
    res.json({ success: true, data: result })
  } catch (error) {
    console.error('添加错题失败:', error)
    res.status(500).json({ success: false, error: '添加失败' })
  }
})

// 更新掌握状态
app.put('/api/error-book/:id/mastery', (req, res) => {
  try {
    const userId = getUserId(req)
    const { id } = req.params
    const { status } = req.body
    errorBookDB.updateMasteryStatus(parseInt(id), status, userId)
    res.json({ success: true, message: '状态已更新' })
  } catch (error) {
    console.error('更新掌握状态失败:', error)
    res.status(500).json({ success: false, error: '更新失败' })
  }
})

// 更新错误原因
app.put('/api/error-book/:id/error-reason', (req, res) => {
  try {
    const userId = getUserId(req)
    const { id } = req.params
    const { errorReason } = req.body
    errorBookDB.updateErrorReason(parseInt(id), errorReason, userId)
    res.json({ success: true, message: '错误原因已更新' })
  } catch (error) {
    console.error('更新错误原因失败:', error)
    res.status(500).json({ success: false, error: '更新失败' })
  }
})

// 删除错题
app.delete('/api/error-book/:id', (req, res) => {
  try {
    const userId = getUserId(req)
    const { id } = req.params
    errorBookDB.delete(parseInt(id), userId)
    res.json({ success: true, message: '已删除' })
  } catch (error) {
    console.error('删除错题失败:', error)
    res.status(500).json({ success: false, error: '删除失败' })
  }
})

// 从考试添加错题
app.post('/api/error-book/from-exam', (req, res) => {
  try {
    const userId = getUserId(req)
    const { examId, subject, wrongQuestions } = req.body
    const results = errorBookDB.addFromExam(userId, examId, subject, wrongQuestions)
    res.json({ success: true, data: results })
  } catch (error) {
    console.error('批量添加错题失败:', error)
    res.status(500).json({ success: false, error: '添加失败' })
  }
})

// 学习目标 API
app.get('/api/profile/goals', (req, res) => {
  try {
    const userId = getUserId(req)
    const data = goalDB.getAll(userId)
    const stats = goalDB.getStats(userId)
    res.json({ success: true, data, stats })
  } catch (error) {
    console.error('获取学习目标失败:', error)
    res.status(500).json({ success: false, error: '获取数据失败' })
  }
})

app.post('/api/profile/goals', (req, res) => {
  try {
    const userId = getUserId(req)
    const { title, description, deadline } = req.body
    const id = goalDB.add(userId, title, description, deadline)
    res.json({ success: true, id, message: '目标已添加' })
  } catch (error) {
    console.error('添加目标失败:', error)
    res.status(500).json({ success: false, error: '添加失败' })
  }
})

app.put('/api/profile/goals/:id', (req, res) => {
  try {
    const userId = getUserId(req)
    const { id } = req.params
    const { status } = req.body
    goalDB.updateStatus(userId, parseInt(id), status)
    res.json({ success: true, message: '目标状态已更新' })
  } catch (error) {
    console.error('更新目标失败:', error)
    res.status(500).json({ success: false, error: '更新失败' })
  }
})

app.delete('/api/profile/goals/:id', (req, res) => {
  try {
    const userId = getUserId(req)
    const { id } = req.params
    goalDB.delete(userId, parseInt(id))
    res.json({ success: true, message: '目标已删除' })
  } catch (error) {
    console.error('删除目标失败:', error)
    res.status(500).json({ success: false, error: '删除失败' })
  }
})

// 兴趣方向 API
app.get('/api/profile/interests', (req, res) => {
  try {
    const userId = getUserId(req)
    const data = interestDB.getAll(userId)
    res.json({ success: true, data })
  } catch (error) {
    console.error('获取兴趣数据失败:', error)
    res.status(500).json({ success: false, error: '获取数据失败' })
  }
})

app.put('/api/profile/interests', (req, res) => {
  try {
    const userId = getUserId(req)
    const { data } = req.body
    if (Array.isArray(data)) {
      interestDB.updateBatch(userId, data)
    }
    res.json({ success: true, message: '兴趣数据已更新' })
  } catch (error) {
    console.error('更新兴趣数据失败:', error)
    res.status(500).json({ success: false, error: '更新失败' })
  }
})

// 学习记录 API
app.get('/api/profile/study-records', (req, res) => {
  try {
    const userId = getUserId(req)
    const { period } = req.query
    let data
    if (period === 'month') {
      data = studyRecordDB.getByMonth(userId)
    } else {
      data = studyRecordDB.getByWeek(userId)
    }
    res.json({ success: true, data })
  } catch (error) {
    console.error('获取学习记录失败:', error)
    res.status(500).json({ success: false, error: '获取数据失败' })
  }
})

app.post('/api/profile/study-records', (req, res) => {
  try {
    const userId = getUserId(req)
    const { date, efficiency, duration } = req.body
    studyRecordDB.add(userId, date, efficiency, duration)
    res.json({ success: true, message: '学习记录已保存' })
  } catch (error) {
    console.error('保存学习记录失败:', error)
    res.status(500).json({ success: false, error: '保存失败' })
  }
})

// ============ 待办清单 API ============
app.get('/api/study/todos', (req, res) => {
  try {
    const userId = getUserId(req)
    const todos = todoDB.getAll(userId)
    const stats = todoDB.getStats(userId)
    res.json({ success: true, data: todos, stats })
  } catch (error) {
    console.error('获取待办失败:', error)
    res.status(500).json({ success: false, error: '获取待办失败' })
  }
})

app.post('/api/study/todos', (req, res) => {
  try {
    const userId = getUserId(req)
    const { text, subject, priority } = req.body
    if (!text) {
      return res.status(400).json({ success: false, error: '内容不能为空' })
    }
    const id = todoDB.add(userId, text, subject || '', priority || 'medium')
    res.json({ success: true, id, message: '待办已添加' })
  } catch (error) {
    console.error('添加待办失败:', error)
    res.status(500).json({ success: false, error: '添加失败' })
  }
})

app.put('/api/study/todos/:id/toggle', (req, res) => {
  try {
    const userId = getUserId(req)
    const { id } = req.params
    todoDB.toggle(userId, parseInt(id))
    res.json({ success: true, message: '状态已更新' })
  } catch (error) {
    console.error('更新待办失败:', error)
    res.status(500).json({ success: false, error: '更新失败' })
  }
})

app.delete('/api/study/todos/:id', (req, res) => {
  try {
    const userId = getUserId(req)
    const { id } = req.params
    todoDB.delete(userId, parseInt(id))
    res.json({ success: true, message: '待办已删除' })
  } catch (error) {
    console.error('删除待办失败:', error)
    res.status(500).json({ success: false, error: '删除失败' })
  }
})

// ============ 学习日程 API ============
app.get('/api/study/schedules', (req, res) => {
  try {
    const userId = getUserId(req)
    const schedules = scheduleDB.getAll(userId)
    res.json({ success: true, data: schedules })
  } catch (error) {
    console.error('获取日程失败:', error)
    res.status(500).json({ success: false, error: '获取日程失败' })
  }
})

app.post('/api/study/schedules', (req, res) => {
  try {
    const userId = getUserId(req)
    const { text, date, subject, time, endTime } = req.body
    if (!text || !date) {
      return res.status(400).json({ success: false, error: '内容和日期不能为空' })
    }
    const id = scheduleDB.add(userId, text, date, subject || '', time || '', endTime || '')
    res.json({ success: true, id, message: '日程已添加' })
  } catch (error) {
    console.error('添加日程失败:', error)
    res.status(500).json({ success: false, error: '添加失败' })
  }
})

app.delete('/api/study/schedules/:id', (req, res) => {
  try {
    const userId = getUserId(req)
    const { id } = req.params
    scheduleDB.delete(userId, parseInt(id))
    res.json({ success: true, message: '日程已删除' })
  } catch (error) {
    console.error('删除日程失败:', error)
    res.status(500).json({ success: false, error: '删除失败' })
  }
})

// ============ 日历统计 API ============
// 获取日历热力图数据（过去一年的统计数据）
app.get('/api/study/calendar', (req, res) => {
  try {
    const userId = getUserId(req)
    const { year } = req.query
    const targetYear = year || new Date().getFullYear().toString()
    
    // 获取该年度的统计数据
    const startDate = `${targetYear}-01-01`
    const endDate = `${targetYear}-12-31`
    
    // 获取待办完成情况（按日期统计）
    const todosResults = db.exec(`
      SELECT date(created_at) as date, COUNT(*) as total, SUM(completed) as completed
      FROM study_todos
      WHERE user_id = ? AND date(created_at) >= ? AND date(created_at) <= ?
      GROUP BY date(created_at)
    `, [userId, startDate, endDate])
    
    // 获取日程安排（按日期统计）
    const schedulesResults = db.exec(`
      SELECT schedule_date as date, COUNT(*) as count
      FROM study_schedules
      WHERE user_id = ? AND schedule_date >= ? AND schedule_date <= ?
      GROUP BY schedule_date
    `, [userId, startDate, endDate])
    
    // 合并数据
    const calendarData = {}
    
    // 处理待办数据
    if (todosResults.length > 0) {
      todosResults[0].values.forEach(row => {
        const date = row[0]
        if (!calendarData[date]) {
          calendarData[date] = { todos: 0, completed: 0, schedules: 0, focusMinutes: 0 }
        }
        calendarData[date].todos = row[1]
        calendarData[date].completed = row[2] || 0
      })
    }
    
    // 处理日程数据
    if (schedulesResults.length > 0) {
      schedulesResults[0].values.forEach(row => {
        const date = row[0]
        if (!calendarData[date]) {
          calendarData[date] = { todos: 0, completed: 0, schedules: 0, focusMinutes: 0 }
        }
        calendarData[date].schedules = row[1]
      })
    }
    
    // 转换为数组格式
    const data = Object.entries(calendarData).map(([date, stats]) => ({
      date,
      ...stats
    }))
    
    res.json({ success: true, data, year: targetYear })
  } catch (error) {
    console.error('获取日历统计失败:', error)
    res.status(500).json({ success: false, error: '获取日历统计失败' })
  }
})

// ============ 学习资料 API ============

// 获取所有学习资料
app.get('/api/learning/materials', (req, res) => {
  try {
    const { category, subject } = req.query
    let materials
    if (category || subject) {
      materials = learningMaterialDB.getByCategoryAndSubject(category, subject)
    } else {
      materials = learningMaterialDB.getAll()
    }
    res.json({
      success: true,
      data: materials.map(m => {
        // 文档存储在 docs 目录，修复路径映射
        // m.file_path 可能已经是完整路径（如 /uploads/docs/xxx.md）或相对路径（如 docs/xxx.md）
        let url = m.file_path
        if (!url.startsWith('/uploads/')) {
          // 如果不是完整路径，手动添加前缀
          const dir = m.category === 'document' ? 'docs' : (m.category === 'ppt' ? 'ppt' : 'videos')
          url = `/uploads/${dir}/${m.file_path}`
        }
        return {
          id: m.id,
          title: m.title,
          description: m.description,
          filePath: m.file_path,
          originalName: m.original_name,
          category: m.category,
          subject: m.subject,
          difficulty: m.difficulty,
          fileSize: m.file_size,
          mimeType: m.mime_type,
          url,
          createdAt: m.created_at
        }
      })
    })
  } catch (error) {
    console.error('获取学习资料失败:', error)
    res.status(500).json({ success: false, error: '获取学习资料失败' })
  }
})

// 获取资料统计
app.get('/api/learning/stats', (req, res) => {
  try {
    const stats = learningMaterialDB.getStats()
    const subjectStats = learningMaterialDB.getStatsBySubject()
    const subjects = learningMaterialDB.getSubjects()
    res.json({ success: true, stats, subjectStats, subjects })
  } catch (error) {
    console.error('获取统计失败:', error)
    res.status(500).json({ success: false, error: '获取统计失败' })
  }
})

// 上传学习资料
app.post('/api/learning/materials', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: '没有上传文件' })
    }

    let { title, description, category, subject, difficulty } = req.body
    
    if (!title || !category) {
      // 删除已上传的文件
      if (existsSync(req.file.path)) {
        unlinkSync(req.file.path)
      }
      return res.status(400).json({ success: false, error: '缺少必填字段' })
    }
    
    // 如果没有选择学科，自动识别
    if (!subject) {
      const result = await autoDetectSubject(title)
      subject = result.subject
    }

    // 分类目录映射
    const categoryMap = {
      video: 'videos',
      document: 'docs',
      ppt: 'ppt'
    }
    const dir = categoryMap[category] || 'docs'
    
    // 确保目标目录存在
    const targetDir = join(uploadsDir, dir)
    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true })
    }
    
    // 移动文件到正确的目录
    const targetPath = join(targetDir, req.file.filename)
    if (req.file.path !== targetPath && existsSync(req.file.path)) {
      // 复制文件到目标目录，然后删除原文件
      await fsPromises.copyFile(req.file.path, targetPath)
      unlinkSync(req.file.path)
    }

    const id = learningMaterialDB.add(
      title,
      description || '',
      req.file.filename,
      req.file.originalname,
      category,
      subject,
      difficulty || 'medium',
      req.file.size,
      req.file.mimetype
    )

    res.json({
      success: true,
      data: {
        id,
        title,
        description,
        filePath: req.file.filename,
        originalName: req.file.originalname,
        category,
        subject,
        difficulty: difficulty || 'medium',
        url: `/uploads/${dir}/${req.file.filename}`,
        fileSize: req.file.size
      }
    })
  } catch (error) {
    console.error('上传学习资料失败:', error)
    res.status(500).json({ success: false, error: '上传失败: ' + error.message })
  }
})

// 批量导入学习资料（通过 manifest.json 和文件）
app.post('/api/learning/import', upload.any(), async (req, res) => {
  try {
    // 查找 manifest.json 文件
    const manifestFile = req.files?.find(f => f.fieldname === 'manifest' || f.originalname === 'manifest.json')
    const manifestData = req.body?.manifest

    let manifest
    if (manifestFile) {
      // 从上传的文件读取 manifest
      const content = await fsPromises.readFile(manifestFile.path, 'utf-8')
      manifest = JSON.parse(content)
      // 删除临时文件
      unlinkSync(manifestFile.path)
    } else if (manifestData) {
      // 从请求体读取
      manifest = typeof manifestData === 'string' ? JSON.parse(manifestData) : manifestData
    } else {
      return res.status(400).json({ success: false, error: '缺少 manifest.json' })
    }

    if (!manifest.materials || !Array.isArray(manifest.materials)) {
      return res.status(400).json({ success: false, error: 'manifest.json 格式错误，缺少 materials 数组' })
    }

    const results = []
    const errors = []

    // 分类目录映射
    const categoryMap = {
      video: 'videos',
      document: 'docs',
      ppt: 'ppt'
    }

    for (const item of manifest.materials) {
      try {
        const { title, description, category, subject, difficulty, filename } = item

        if (!title || !category || !subject) {
          errors.push({ filename, error: '缺少必填字段' })
          continue
        }

        // 查找对应的文件
        let uploadedFile = req.files?.find(f => f.fieldname === 'files' && f.originalname === filename)
        let targetPath = null
        let fileSize = 0
        let mimeType = 'text/plain'

        if (uploadedFile) {
          const dir = categoryMap[category] || 'docs'
          const targetDir = join(uploadsDir, dir)
          if (!existsSync(targetDir)) {
            mkdirSync(targetDir, { recursive: true })
          }
          targetPath = join(targetDir, uploadedFile.filename)
          if (uploadedFile.path !== targetPath && existsSync(uploadedFile.path)) {
            await fsPromises.copyFile(uploadedFile.path, targetPath)
            unlinkSync(uploadedFile.path)
          }
          fileSize = uploadedFile.size
          mimeType = uploadedFile.mimetype
        } else if (category === 'document' && filename) {
          // 如果是文档但没有上传文件，尝试从 docs 目录查找
          const docPath = join(uploadsDir, 'docs', filename)
          if (existsSync(docPath)) {
            targetPath = filename
            const stat = await fsPromises.stat(docPath)
            fileSize = stat.size
          }
        }

        const id = learningMaterialDB.add(
          title,
          description || '',
          targetPath || filename || '',
          filename || '',
          category,
          subject,
          difficulty || 'medium',
          fileSize,
          mimeType
        )

        results.push({
          id,
          title,
          category,
          subject,
          url: targetPath ? `/uploads/${categoryMap[category] || 'docs'}/${targetPath.split(/[/\\]/).pop()}` : null
        })
      } catch (err) {
        errors.push({ item, error: err.message })
      }
    }

    // 清理临时文件
    req.files?.forEach(f => {
      if (existsSync(f.path) && f.fieldname !== 'manifest') {
        try { unlinkSync(f.path) } catch (e) {}
      }
    })

    res.json({
      success: true,
      data: {
        imported: results.length,
        failed: errors.length,
        results,
        errors
      }
    })
  } catch (error) {
    console.error('批量导入失败:', error)
    res.status(500).json({ success: false, error: '导入失败: ' + error.message })
  }
})

// 更新学习资料
app.put('/api/learning/materials/:id', (req, res) => {
  try {
    const { id } = req.params
    const { title, description, subject, difficulty } = req.body
    
    learningMaterialDB.update(parseInt(id), { title, description, subject, difficulty })
    res.json({ success: true, message: '资料已更新' })
  } catch (error) {
    console.error('更新学习资料失败:', error)
    res.status(500).json({ success: false, error: '更新失败' })
  }
})

// 删除学习资料
app.delete('/api/learning/materials/:id', (req, res) => {
  try {
    const { id } = req.params
    const material = learningMaterialDB.get(parseInt(id))
    
    if (material) {
      // 删除物理文件
      const categoryMap = {
        video: 'videos',
        document: 'docs',
        ppt: 'ppt'
      }
      const dir = categoryMap[material.category] || 'docs'
      const filePath = join(uploadsDir, dir, material.file_path)
      if (existsSync(filePath)) {
        unlinkSync(filePath)
      }
      // 删除数据库记录
      learningMaterialDB.delete(parseInt(id))
    }
    
    res.json({ success: true })
  } catch (error) {
    console.error('删除学习资料失败:', error)
    res.status(500).json({ success: false, error: '删除失败' })
  }
})

// ============ 学科管理 API ============

// 获取所有学科
app.get('/api/subjects', (req, res) => {
  try {
    const { enabled } = req.query
    const subjects = subjectDB.getAll(enabled !== 'false')
    res.json({
      success: true,
      data: subjects.map(s => ({
        name: s.name,
        displayName: s.display_name,
        keywords: s.keywords || '',
        icon: s.icon,
        color: s.color,
        sortOrder: s.sort_order,
        enabled: s.enabled === 1
      }))
    })
  } catch (error) {
    console.error('获取学科列表失败:', error)
    res.status(500).json({ success: false, error: '获取学科列表失败' })
  }
})

// 搜索学科（支持模糊搜索）
app.get('/api/subjects/search', (req, res) => {
  try {
    const { q } = req.query
    if (!q) {
      return res.json({ success: true, data: [] })
    }
    const matches = subjectDB.fuzzySearch(q)
    res.json({
      success: true,
      data: matches.map(s => ({
        name: s.name,
        displayName: s.display_name,
        keywords: s.keywords || '',
        matchScore: s.matchScore
      }))
    })
  } catch (error) {
    console.error('搜索学科失败:', error)
    res.status(500).json({ success: false, error: '搜索失败' })
  }
})

// 添加学科
app.post('/api/subjects', (req, res) => {
  try {
    const { name, displayName, keywords, icon, color, sortOrder } = req.body
    if (!name || !displayName) {
      return res.status(400).json({ success: false, error: '缺少必填字段' })
    }
    // 如果没有提供关键词，使用名称作为关键词
    const subjectKeywords = keywords || `${displayName},${name}`
    const success = subjectDB.add(name, displayName, icon, color, sortOrder || 0, subjectKeywords)
    if (success) {
      // 同步初始化knowledge_base中的该学科数据
      knowledgeDB.init('default', name)
      res.json({ success: true, message: '学科添加成功' })
    } else {
      res.status(400).json({ success: false, error: '学科已存在' })
    }
  } catch (error) {
    console.error('添加学科失败:', error)
    res.status(500).json({ success: false, error: '添加失败' })
  }
})

// 更新学科
app.put('/api/subjects/:name', (req, res) => {
  try {
    const { name } = req.params
    const { displayName, keywords, icon, color, sortOrder, enabled } = req.body
    subjectDB.update(name, {
      display_name: displayName,
      keywords,
      icon,
      color,
      sort_order: sortOrder,
      enabled
    })
    res.json({ success: true, message: '学科已更新' })
  } catch (error) {
    console.error('更新学科失败:', error)
    res.status(500).json({ success: false, error: '更新失败' })
  }
})

// 删除学科 - 检查关联资料
app.delete('/api/subjects/:name', (req, res) => {
  try {
    const { name } = req.params
    // 检查该学科下的资料数量
    const materials = learningMaterialDB.getBySubject(name)
    const materialCount = materials.length
    
    // 检查knowledge_base中的数据
    const knowledgeData = knowledgeDB.getAll('default')
    const hasKnowledge = knowledgeData.some(k => k.subject === name)
    
    res.json({ 
      success: true, 
      hasMaterials: materialCount > 0,
      materialCount,
      hasKnowledge,
      message: materialCount > 0 ? `该学科下有 ${materialCount} 个资料，删除将一并清除` : '确定要删除该学科吗？'
    })
  } catch (error) {
    console.error('检查学科失败:', error)
    res.status(500).json({ success: false, error: '检查失败' })
  }
})

// 强制删除学科及其所有关联数据
app.delete('/api/subjects/:name/force', (req, res) => {
  try {
    const { name } = req.params
    const { confirmName } = req.body
    
    // 安全验证：用户必须输入正确的学科名称
    if (confirmName !== name) {
      return res.status(400).json({ success: false, error: '学科名称验证失败' })
    }
    
    // 删除该学科下的所有资料
    const materials = learningMaterialDB.getBySubject(name)
    materials.forEach(material => {
      learningMaterialDB.delete(material.id)
    })
    
    // 删除knowledge_base中的该学科数据
    const knowledgeData = knowledgeDB.getAll('default')
    knowledgeData.forEach(k => {
      if (k.subject === name) {
        db.run('DELETE FROM knowledge_base WHERE user_id = ? AND subject = ?', ['default', name])
      }
    })
    
    // 删除学科本身
    subjectDB.delete(name)
    saveDatabase()
    
    res.json({ success: true, message: '学科及所有关联数据已删除' })
  } catch (error) {
    console.error('强制删除学科失败:', error)
    res.status(500).json({ success: false, error: '删除失败' })
  }
})

// ============ PPT 模板 API ============

// 获取所有模板
app.get('/api/ppt/templates', (req, res) => {
  try {
    const { type } = req.query
    let templates
    if (type === 'preset') {
      templates = pptTemplateDB.getPresets()
    } else if (type === 'user') {
      templates = pptTemplateDB.getUserTemplates()
    } else {
      templates = pptTemplateDB.getAll()
    }
    res.json({
      success: true,
      data: templates.map(t => ({
        id: t.id,
        name: t.name,
        content: t.content,
        description: t.description,
        isPreset: t.is_preset,
        subject: t.subject,
        usageCount: t.usage_count,
        createdAt: t.created_at
      }))
    })
  } catch (error) {
    console.error('获取模板失败:', error)
    res.status(500).json({ success: false, error: '获取模板失败' })
  }
})

// 添加模板
app.post('/api/ppt/templates', (req, res) => {
  try {
    const { name, content, description, subject } = req.body
    if (!name || !content) {
      return res.status(400).json({ success: false, error: '缺少必填字段' })
    }
    const id = pptTemplateDB.add(name, content, description || '', subject || '')
    res.json({ success: true, id, message: '模板已保存' })
  } catch (error) {
    console.error('保存模板失败:', error)
    res.status(500).json({ success: false, error: '保存失败' })
  }
})

// 更新模板
app.put('/api/ppt/templates/:id', (req, res) => {
  try {
    const { id } = req.params
    const { name, content, description, subject } = req.body
    pptTemplateDB.update(parseInt(id), { name, content, description, subject })
    res.json({ success: true, message: '模板已更新' })
  } catch (error) {
    console.error('更新模板失败:', error)
    res.status(500).json({ success: false, error: '更新失败' })
  }
})

// 删除模板（只能删除用户模板）
app.delete('/api/ppt/templates/:id', (req, res) => {
  try {
    const { id } = req.params
    pptTemplateDB.delete(parseInt(id))
    res.json({ success: true, message: '模板已删除' })
  } catch (error) {
    console.error('删除模板失败:', error)
    res.status(500).json({ success: false, error: '删除失败' })
  }
})

// 生成 PPT
app.post('/api/ppt/generate', async (req, res) => {
  try {
    const { title, subtitle, slides, theme, colorScheme, subject, saveToLearning } = req.body

    if (!title || !slides || slides.length === 0) {
      return res.status(400).json({ success: false, error: '缺少必要参数' })
    }

    // 生成 Markdown 内容
    let markdownContent = ''
    slides.forEach((slide, index) => {
      markdownContent += `## 第${index + 1}页：${slide.title}\n\n`
      if (slide.content && Array.isArray(slide.content)) {
        slide.content.forEach(point => {
          markdownContent += `- ${point}\n`
        })
      }
      markdownContent += '\n'
    })

    // 使用 pptxgenjs 生成 PPT
    const { createPptFromMarkdown } = await import('./plugins/pptxgen/index.js')
    
    const filename = `${Date.now()}_${title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}.pptx`
    const pptDir = join(uploadsDir, 'ppt')
    
    // 确保目录存在
    if (!existsSync(pptDir)) {
      mkdirSync(pptDir, { recursive: true })
    }
    
    const outputPath = join(pptDir, filename)

    const result = await createPptFromMarkdown(markdownContent, {
      title,
      author: 'AI PPT Generator',
      outputPath
    })

    const filePath = `/uploads/ppt/${filename}`
    
    // 保存到学习中心
    if (saveToLearning !== false) {
      learningMaterialDB.add(
        title,
        subtitle || '',
        filePath,
        filename,
        'ppt',
        subject || '通用',
        'medium',
        0,
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      )
    }

    res.json({
      success: true,
      data: {
        filename,
        filePath,
        slideCount: slides.length
      }
    })
  } catch (error) {
    console.error('PPT 生成失败:', error)
    res.status(500).json({ success: false, error: '生成失败: ' + error.message })
  }
})

// ============ AI 任务 API ============

// 创建任务
app.post('/api/tasks', (req, res) => {
  try {
    const { type, title, description } = req.body
    if (!type || !title) {
      return res.status(400).json({ success: false, error: '缺少必填字段' })
    }
    const taskId = aiTaskDB.create(type, title, description || '')
    res.json({ success: true, taskId, message: '任务已创建' })
  } catch (error) {
    console.error('创建任务失败:', error)
    res.status(500).json({ success: false, error: '创建失败' })
  }
})

// 获取任务状态
app.get('/api/tasks/:taskId', (req, res) => {
  try {
    const { taskId } = req.params
    const task = aiTaskDB.get(taskId)
    if (!task) {
      return res.status(404).json({ success: false, error: '任务不存在' })
    }
    res.json({
      success: true,
      data: {
        taskId: task.task_id,
        type: task.type,
        title: task.title,
        description: task.description,
        status: task.status,
        progress: task.progress,
        result: task.result,
        error: task.error,
        createdAt: task.created_at,
        updatedAt: task.updated_at
      }
    })
  } catch (error) {
    console.error('获取任务失败:', error)
    res.status(500).json({ success: false, error: '获取失败' })
  }
})

// 获取活跃任务
app.get('/api/tasks', (req, res) => {
  try {
    const { type, limit } = req.query
    let tasks
    if (type === 'active') {
      tasks = aiTaskDB.getActive()
    } else if (type === 'recent') {
      tasks = aiTaskDB.getRecent(parseInt(limit) || 10)
    } else {
      tasks = aiTaskDB.getAll(parseInt(limit) || 20)
    }
    res.json({
      success: true,
      data: tasks.map(t => ({
        taskId: t.task_id,
        type: t.type,
        title: t.title,
        description: t.description,
        status: t.status,
        progress: t.progress,
        result: t.result,
        error: t.error,
        createdAt: t.created_at,
        updatedAt: t.updated_at
      }))
    })
  } catch (error) {
    console.error('获取任务列表失败:', error)
    res.status(500).json({ success: false, error: '获取失败' })
  }
})

// 更新任务状态
app.put('/api/tasks/:taskId', (req, res) => {
  try {
    const { taskId } = req.params
    const { status, progress, result, error } = req.body
    aiTaskDB.updateStatus(taskId, status, progress, result, error)
    res.json({ success: true, message: '任务状态已更新' })
  } catch (error) {
    console.error('更新任务失败:', error)
    res.status(500).json({ success: false, error: '更新失败' })
  }
})

// 删除任务
app.delete('/api/tasks/:taskId', (req, res) => {
  try {
    const { taskId } = req.params
    aiTaskDB.delete(taskId)
    res.json({ success: true, message: '任务已删除' })
  } catch (error) {
    console.error('删除任务失败:', error)
    res.status(500).json({ success: false, error: '删除失败' })
  }
})

// 获取任务统计
app.get('/api/tasks/stats/all', (req, res) => {
  try {
    const stats = aiTaskDB.getStats()
    res.json({ success: true, data: stats })
  } catch (error) {
    console.error('获取统计失败:', error)
    res.status(500).json({ success: false, error: '获取失败' })
  }
})

// 清除已完成任务
app.delete('/api/tasks/completed', (req, res) => {
  try {
    aiTaskDB.clearCompleted()
    res.json({ success: true, message: '已完成任务已清除' })
  } catch (error) {
    console.error('清除任务失败:', error)
    res.status(500).json({ success: false, error: '清除失败' })
  }
})

// ============ 数字人形象 API ============

// 获取所有数字人形象列表（支持文件夹结构和单文件结构）
app.get('/api/avatars', async (req, res) => {
  try {
    const entries = await fsPromises.readdir(avatarsDir, { withFileTypes: true })
    const avatars = []
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        // 文件夹结构：检查是否有 animation.json
        const animationPath = join(avatarsDir, entry.name, 'animation.json')
        if (existsSync(animationPath)) {
          const content = await fsPromises.readFile(animationPath, 'utf-8')
          const data = JSON.parse(content)
          avatars.push({
            id: entry.name,
            name: data.name,
            description: data.description,
            fps: data.fps,
            width: data.width,
            height: data.height,
            frameCount: data.frames?.length || 0,
            type: 'image',
            filters: data.filters || {}
          })
        }
      } else if (entry.name.endsWith('.json')) {
        // 单文件结构（像素画）
        const filePath = join(avatarsDir, entry.name)
        const content = await fsPromises.readFile(filePath, 'utf-8')
        const data = JSON.parse(content)
        avatars.push({
          id: entry.name.replace('.json', ''),
          name: data.name,
          description: data.description,
          fps: data.fps,
          width: data.width,
          height: data.height,
          frameCount: data.frames?.length || 0,
          type: 'pixel'
        })
      }
    }
    
    res.json({ success: true, data: avatars })
  } catch (error) {
    console.error('获取数字人形象列表失败:', error)
    res.status(500).json({ success: false, error: '获取列表失败' })
  }
})

// 获取指定数字人形象数据
app.get('/api/avatars/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    // 先检查文件夹结构
    const folderPath = join(avatarsDir, id)
    const animationPath = join(folderPath, 'animation.json')
    const jsonPath = join(avatarsDir, `${id}.json`)
    
    let data
    let type = 'pixel'
    let basePath = ''
    
    if (existsSync(animationPath)) {
      // 文件夹结构（图片帧动画）
      const content = await fsPromises.readFile(animationPath, 'utf-8')
      data = JSON.parse(content)
      type = 'image'
      basePath = `/avatars/${id}/`
    } else if (existsSync(jsonPath)) {
      // 单文件结构（像素画）
      const content = await fsPromises.readFile(jsonPath, 'utf-8')
      data = JSON.parse(content)
    } else {
      return res.status(404).json({ success: false, error: '数字人形象不存在' })
    }
    
    res.json({ 
      success: true, 
      data: {
        ...data,
        type,
        basePath
      }
    })
  } catch (error) {
    console.error('获取数字人形象失败:', error)
    res.status(500).json({ success: false, error: '获取失败' })
  }
})

// 获取数字人图片帧
app.get('/api/avatars/:id/frame/:frameName', async (req, res) => {
  try {
    const { id, frameName } = req.params
    const folderPath = join(avatarsDir, id, 'frames')
    const framePath = join(folderPath, frameName)
    
    if (!existsSync(framePath)) {
      return res.status(404).json({ success: false, error: '帧图片不存在' })
    }
    
    res.sendFile(framePath)
  } catch (error) {
    console.error('获取帧图片失败:', error)
    res.status(500).json({ success: false, error: '获取帧图片失败' })
  }
})

// 保存数字人形象（单文件结构）
app.post('/api/avatars/:id', async (req, res) => {
  try {
    const { id } = req.params
    const avatarData = req.body
    
    const filePath = join(avatarsDir, `${id}.json`)
    await fsPromises.writeFile(filePath, JSON.stringify(avatarData, null, 2), 'utf-8')
    
    res.json({ success: true, message: '数字人形象已保存' })
  } catch (error) {
    console.error('保存数字人形象失败:', error)
    res.status(500).json({ success: false, error: '保存失败' })
  }
})

// 创建新的数字人（文件夹结构）
app.post('/api/avatars/:id/create', async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, width, height, fps } = req.body
    
    const folderPath = join(avatarsDir, id)
    const framesPath = join(folderPath, 'frames')
    
    // 创建文件夹
    if (!existsSync(folderPath)) {
      await fsPromises.mkdir(folderPath, { recursive: true })
    }
    if (!existsSync(framesPath)) {
      await fsPromises.mkdir(framesPath, { recursive: true })
    }
    
    // 创建 animation.json
    const animationData = {
      name: name || id,
      description: description || '照片帧动画数字人',
      fps: fps || 2,
      width: width || 256,
      height: height || 256,
      pixelSize: 4,
      frames: [],
      filters: {
        pixelate: true,
        pixelSize: 4,
        contrast: 1.2,
        brightness: 1.1,
        saturation: 0.9,
        scanlines: true,
        crt: true
      }
    }
    
    const animationPath = join(folderPath, 'animation.json')
    await fsPromises.writeFile(animationPath, JSON.stringify(animationData, null, 2), 'utf-8')
    
    res.json({ success: true, message: '数字人形象已创建', data: animationData })
  } catch (error) {
    console.error('创建数字人形象失败:', error)
    res.status(500).json({ success: false, error: '创建失败' })
  }
})

// ============ Markdown 文件 API ============

// 读取 Markdown 文件
app.get('/api/markdown/file', async (req, res) => {
  try {
    const { path: filePath } = req.query
    if (!filePath) {
      return res.status(400).json({ success: false, error: '缺少文件路径' })
    }

    console.log('【后端】读取文件请求路径:', filePath)
    console.log('【后端】uploadsDir:', uploadsDir)
    console.log('【后端】__dirname:', __dirname)
    
    // 处理路径：移除 /uploads/ 前缀，转为实际文件路径
    let actualPath = filePath
    if (filePath.startsWith('/uploads/')) {
      actualPath = join(uploadsDir, filePath.replace('/uploads/', ''))
    } else if (filePath.startsWith('/')) {
      actualPath = join(__dirname, '..', filePath)
    } else {
      actualPath = join(uploadsDir, filePath)
    }
    
    console.log('【后端】实际文件路径:', actualPath)
    console.log('【后端】文件是否存在:', existsSync(actualPath))

    // 安全检查：确保文件在 uploads 目录内
    const normalizedUploadsDir = join(__dirname, '..', 'uploads')
    if (!actualPath.startsWith(normalizedUploadsDir)) {
      return res.status(403).json({ success: false, error: '路径访问被拒绝' })
    }

    if (!existsSync(actualPath)) {
      return res.status(404).json({ success: false, error: '文件不存在: ' + actualPath })
    }

    const content = await fsPromises.readFile(actualPath, 'utf-8')
    res.json({ success: true, content })
  } catch (error) {
    console.error('读取文件失败:', error)
    res.status(500).json({ success: false, error: '文件读取失败: ' + error.message })
  }
})

// 保存 Markdown 文件
app.post('/api/markdown/save', async (req, res) => {
  try {
    const { fileName, content, originalFileName, materialId, newTitle } = req.body
    if (!fileName || content === undefined) {
      return res.status(400).json({ success: false, error: '缺少文件名或内容' })
    }

    console.log('保存文件请求:', { fileName, originalFileName, materialId, newTitle, contentLength: content?.length })
    
    const docsDir = join(uploadsDir, 'docs')

    // 确保目录存在
    if (!existsSync(docsDir)) {
      mkdirSync(docsDir, { recursive: true })
    }

    // 确定最终文件名
    let finalFileName = fileName.endsWith('.md') ? fileName : fileName + '.md'
    const filePath = join(docsDir, finalFileName)
    
    console.log('保存路径:', filePath)

    // 如果是重命名（新建文档时），需要删除原文件
    if (originalFileName && originalFileName !== finalFileName) {
      const originalPath = join(docsDir, originalFileName)
      if (existsSync(originalPath)) {
        await fsPromises.unlink(originalPath)
      }
    }

    // 写入文件
    await fsPromises.writeFile(filePath, content, 'utf-8')
    
    console.log('文件保存成功:', finalFileName)

    // 如果是学习资料，同时更新标题
    let title = newTitle || finalFileName.replace('.md', '')
    if (materialId && newTitle) {
      learningMaterialDB.update(parseInt(materialId), { title: newTitle })
      title = newTitle
    }

    res.json({ 
      success: true, 
      message: '文件已保存',
      fileName: finalFileName,
      title: title,
      url: `/uploads/docs/${finalFileName}`
    })
  } catch (error) {
    console.error('保存文件失败:', error)
    res.status(500).json({ success: false, error: '文件保存失败: ' + error.message })
  }
})

// ============ PPT 文件 API ============

// 获取 PPT 文件（返回二进制流）
app.get('/api/ppt/file', async (req, res) => {
  try {
    const { file } = req.query
    if (!file) {
      return res.status(400).json({ success: false, error: '缺少文件名' })
    }

    // 清理文件名，防止路径遍历
    const cleanFileName = file.replace(/[^a-zA-Z0-9\u4e00-\u9fa5._-]/g, '')
    const filePath = join(uploadsDir, 'ppt', cleanFileName)

    console.log('【PPT阅读器】请求文件:', filePath)

    // 安全检查：确保文件在 uploads/ppt 目录内
    const normalizedPptDir = join(uploadsDir, 'ppt')
    if (!filePath.startsWith(normalizedPptDir)) {
      return res.status(403).json({ success: false, error: '路径访问被拒绝' })
    }

    if (!existsSync(filePath)) {
      return res.status(404).json({ success: false, error: '文件不存在' })
    }

    // 设置响应头，返回二进制文件
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation')
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(cleanFileName)}"`)
    
    // 流式传输文件
    const fileStream = await fsPromises.readFile(filePath)
    res.send(fileStream)
  } catch (error) {
    console.error('读取PPT文件失败:', error)
    res.status(500).json({ success: false, error: '文件读取失败: ' + error.message })
  }
})

// 获取 PPT 列表
app.get('/api/ppt/list', async (req, res) => {
  try {
    const pptDir = join(uploadsDir, 'ppt')
    
    if (!existsSync(pptDir)) {
      return res.json({ success: true, data: [] })
    }

    const files = await fsPromises.readdir(pptDir)
    const pptFiles = files.filter(f => f.endsWith('.pptx'))
    
    const fileList = await Promise.all(pptFiles.map(async (fileName) => {
      const filePath = join(pptDir, fileName)
      const stats = await fsPromises.stat(filePath)
      return {
        name: fileName,
        displayName: fileName.replace('.pptx', ''),
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        url: `/uploads/ppt/${fileName}`
      }
    }))

    res.json({ success: true, data: fileList })
  } catch (error) {
    console.error('获取PPT列表失败:', error)
    res.status(500).json({ success: false, error: '获取列表失败' })
  }
})

// ============ 考试生成 API ============

// 生成阶段性测试
app.post('/api/exams/generate', async (req, res) => {
  try {
    const { userId, subject, enableTimeLimit, timeLimit, mode, questionCounts, difficulty, knowledgeScope } = req.body
    
    if (!subject) {
      return res.status(400).json({ success: false, error: '请选择学科' })
    }
    
    const totalQuestions = Object.values(questionCounts || {}).reduce((a, b) => a + b, 0)
    if (totalQuestions === 0) {
      return res.status(400).json({ success: false, error: '请至少设置一道题目' })
    }
    
    // 创建考试记录
    const examId = examDB.create({
      userId,
      subject,
      enableTimeLimit,
      timeLimit,
      mode,
      questionCounts,
      difficulty,
      knowledgeScope
    })
    
    // 异步生成题目（这里简化处理，实际应该调用AI服务）
    // 在实际应用中，这里应该启动一个后台任务来生成题目
    setTimeout(async () => {
      try {
        // 模拟生成题目
        const questions = generateMockQuestions(subject, questionCounts, difficulty, knowledgeScope)
        const answers = {}
        const analysis = {}
        
        questions.forEach((q, index) => {
          answers[index] = q.answer
          analysis[index] = q.analysis
          delete q.answer
          delete q.analysis
        })
        
        examDB.updateQuestions(examId, questions, answers, analysis)
      } catch (error) {
        console.error('生成题目失败:', error)
        examDB.updateStatus(examId, 'failed')
      }
    }, 1000)
    
    res.json({ success: true, data: { examId, status: 'generating' } })
  } catch (error) {
    console.error('生成考试失败:', error)
    res.status(500).json({ success: false, error: '生成考试失败' })
  }
})

// 获取考试信息
app.get('/api/exams/:examId', (req, res) => {
  try {
    const { examId } = req.params
    const exam = examDB.get(examId)
    
    if (!exam) {
      return res.status(404).json({ success: false, error: '考试不存在' })
    }
    
    res.json({ success: true, data: exam })
  } catch (error) {
    console.error('获取考试失败:', error)
    res.status(500).json({ success: false, error: '获取考试失败' })
  }
})

// 获取用户的考试列表
app.get('/api/exams', (req, res) => {
  try {
    const { userId } = req.query
    const exams = examDB.getByUser(userId || 'default', 50)
    res.json({ success: true, data: exams })
  } catch (error) {
    console.error('获取考试列表失败:', error)
    res.status(500).json({ success: false, error: '获取考试列表失败' })
  }
})

// 提交答案
app.post('/api/exams/:examId/answer', (req, res) => {
  try {
    const { examId } = req.params
    const { questionIndex, userAnswer } = req.body
    
    const exam = examDB.get(examId)
    if (!exam) {
      return res.status(404).json({ success: false, error: '考试不存在' })
    }
    
    // 获取正确答案
    const correctAnswer = exam.answers[questionIndex]
    const question = exam.questions[questionIndex]
    
    // 判断是否正确
    const isCorrect = checkAnswer(userAnswer, correctAnswer, question?.type)
    const score = isCorrect ? (question.score || 10) : 0
    
    examDB.submitAnswer(examId, questionIndex, userAnswer, isCorrect, score)
    
    res.json({ 
      success: true, 
      data: { 
        isCorrect, 
        score,
        correctAnswer: exam.mode === 'practice' ? correctAnswer : undefined,
        analysis: exam.mode === 'practice' ? exam.analysis[questionIndex] : undefined
      } 
    })
  } catch (error) {
    console.error('提交答案失败:', error)
    res.status(500).json({ success: false, error: '提交答案失败' })
  }
})

// 答案比较辅助函数
function checkAnswer(userAnswer, correctAnswer, questionType) {
  // 判断题处理
  if (questionType === 'judge') {
    const userBool = userAnswer === true || userAnswer === 'true' || userAnswer === 'T'
    const correctBool = correctAnswer === true || correctAnswer === 'true' || correctAnswer === 'T'
    return userBool === correctBool
  }
  
  // 多选题处理
  if (questionType === 'multiple') {
    if (!Array.isArray(userAnswer) || !Array.isArray(correctAnswer)) return false
    const sortedUser = [...userAnswer].sort().join(',')
    const sortedCorrect = [...correctAnswer].sort().join(',')
    return sortedUser === sortedCorrect
  }
  
  // 填空题处理（忽略前后空格）
  if (questionType === 'fill') {
    if (typeof userAnswer === 'string' && typeof correctAnswer === 'string') {
      return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
    }
  }
  
  // 默认字符串比较（忽略大小写）
  if (typeof userAnswer === 'string' && typeof correctAnswer === 'string') {
    return userAnswer.toLowerCase() === correctAnswer.toLowerCase()
  }
  
  // 严格比较
  return userAnswer === correctAnswer
}

// 完成考试
app.post('/api/exams/:examId/complete', (req, res) => {
  try {
    const { examId } = req.params
    const userId = getUserId(req)
    const exam = examDB.get(examId)

    if (!exam) {
      return res.status(404).json({ success: false, error: '考试不存在' })
    }

    // 计算总分
    const answers = examDB.getAnswers(examId)
    const totalScore = answers.reduce((sum, a) => sum + a.score, 0)
    const maxScore = exam.questions.reduce((sum, q) => sum + (q.score || 10), 0)

    examDB.completeExam(examId, totalScore, maxScore)

    // 自动将错题添加到错题本
    try {
      const wrongQuestions = []
      exam.questions.forEach((q, index) => {
        const answer = answers.find(a => a.question_index === index)
        if (answer && !answer.is_correct) {
          wrongQuestions.push({
            questionId: q.id || `q_${index}`,
            type: q.type,
            content: q.content,
            options: q.options,
            correctAnswer: exam.answers ? exam.answers[index] : q.answer,
            userAnswer: answer.user_answer,
            analysis: exam.analysis ? exam.analysis[index] : q.analysis,
            knowledgePoints: q.knowledgePoints || [],
            score: answer.score,
            fullScore: q.score || 10
          })
        }
      })

      if (wrongQuestions.length > 0) {
        errorBookDB.addFromExam(userId, examId, exam.subject, wrongQuestions)
        console.log(`已将 ${wrongQuestions.length} 道错题添加到错题本`)
      }
    } catch (err) {
      console.error('添加错题到错题本失败:', err)
      // 不影响考试完成的主流程
    }

    res.json({
      success: true,
      data: {
        score: totalScore,
        totalScore: maxScore,
        answers: exam.answers,
        analysis: exam.analysis
      }
    })
  } catch (error) {
    console.error('完成考试失败:', error)
    res.status(500).json({ success: false, error: '完成考试失败' })
  }
})

// 删除考试
app.delete('/api/exams/:examId', (req, res) => {
  try {
    const { examId } = req.params
    examDB.delete(examId)
    res.json({ success: true })
  } catch (error) {
    console.error('删除考试失败:', error)
    res.status(500).json({ success: false, error: '删除考试失败' })
  }
})

// ============ 题目库 API ============

// 获取题目库学科列表
app.get('/api/question-bank/subjects', (req, res) => {
  try {
    const subjects = examQuestionsDB.getSubjects()
    res.json({ success: true, data: subjects })
  } catch (error) {
    console.error('获取题目库学科列表失败:', error)
    res.status(500).json({ success: false, error: '获取学科列表失败' })
  }
})

// 获取指定学科的题目列表
app.get('/api/question-bank/:subject/questions', (req, res) => {
  try {
    const { subject } = req.params
    const { type, difficulty, limit } = req.query

    const questions = examQuestionsDB.filterQuestions(subject, {
      type,
      difficulty,
      limit: limit ? parseInt(limit) : undefined
    })

    res.json({ success: true, data: questions })
  } catch (error) {
    console.error('获取题目列表失败:', error)
    res.status(500).json({ success: false, error: '获取题目列表失败' })
  }
})

// 获取学科统计信息
app.get('/api/question-bank/:subject/stats', (req, res) => {
  try {
    const { subject } = req.params
    const stats = examQuestionsDB.getSubjectStats(subject)
    res.json({ success: true, data: stats })
  } catch (error) {
    console.error('获取学科统计失败:', error)
    res.status(500).json({ success: false, error: '获取统计信息失败' })
  }
})

// 添加新题目
app.post('/api/question-bank/:subject/questions', (req, res) => {
  try {
    const { subject } = req.params
    const question = req.body

    if (!question.content) {
      return res.status(400).json({ success: false, error: '题目内容不能为空' })
    }

    const result = examQuestionsDB.addQuestion(subject, question)
    res.json(result)
  } catch (error) {
    console.error('添加题目失败:', error)
    res.status(500).json({ success: false, error: '添加题目失败' })
  }
})

// 更新题目
app.put('/api/question-bank/:subject/questions/:questionId', (req, res) => {
  try {
    const { subject, questionId } = req.params
    const question = req.body
    question.id = questionId

    const result = examQuestionsDB.addQuestion(subject, question)
    res.json(result)
  } catch (error) {
    console.error('更新题目失败:', error)
    res.status(500).json({ success: false, error: '更新题目失败' })
  }
})

// 删除题目
app.delete('/api/question-bank/:subject/questions/:questionId', (req, res) => {
  try {
    const { subject, questionId } = req.params
    const result = examQuestionsDB.deleteQuestion(subject, questionId)
    res.json(result)
  } catch (error) {
    console.error('删除题目失败:', error)
    res.status(500).json({ success: false, error: '删除题目失败' })
  }
})

// 从题目库生成考试（替代AI生成）
app.post('/api/exams/generate-from-bank', async (req, res) => {
  try {
    const { userId, subject, enableTimeLimit, timeLimit, mode, questionCounts, difficulty, knowledgeScope } = req.body

    if (!subject) {
      return res.status(400).json({ success: false, error: '请选择学科' })
    }

    const totalQuestions = Object.values(questionCounts || {}).reduce((a, b) => a + b, 0)
    if (totalQuestions === 0) {
      return res.status(400).json({ success: false, error: '请至少设置一道题目' })
    }

    // 从题目库生成题目
    const generated = examQuestionsDB.generateExamQuestions(subject, questionCounts, difficulty, knowledgeScope)

    if (!generated.success) {
      return res.status(400).json({ success: false, error: generated.message })
    }

    // 创建考试记录
    const examId = examDB.create({
      userId,
      subject,
      enableTimeLimit,
      timeLimit,
      mode,
      questionCounts,
      difficulty,
      knowledgeScope,
      title: `${subject}阶段性测试（题库）`
    })

    // 获取答案和解析
    const questionIds = generated.questions.map(q => q.id)
    const answers = examQuestionsDB.getQuestionAnswers(subject, questionIds)

    // 更新考试题目和答案
    examDB.updateQuestions(examId, generated.questions, answers, {})

    res.json({
      success: true,
      data: {
        examId,
        status: 'ready',
        message: generated.message
      }
    })
  } catch (error) {
    console.error('从题库生成考试失败:', error)
    res.status(500).json({ success: false, error: '生成考试失败' })
  }
})

// 模拟生成题目（实际应用中应该调用AI服务）
function generateMockQuestions(subject, counts, difficulty, knowledgeScope) {
  const questions = []
  let index = 0
  
  const difficultyText = { easy: '简单', medium: '中等', hard: '困难', mixed: '混合' }[difficulty] || '中等'
  const subjectNames = {
    math: '高等数学',
    linear_algebra: '线性代数',
    probability: '概率论',
    physics: '大学物理',
    major: '专业课',
    english: '英语',
    programming: '编程',
    politics: '政治'
  }
  const subjectName = subjectNames[subject] || subject
  
  // 单选题
  for (let i = 0; i < (counts.single || 0); i++) {
    questions.push({
      type: 'single',
      index: index++,
      score: 5,
      question: `${subjectName}单选题 ${i + 1}（${difficultyText}）：这是一道测试用的单选题`,
      options: ['选项A', '选项B', '选项C', '选项D'],
      answer: 'A',
      analysis: `这是${subjectName}单选题${i + 1}的详细解析。正确答案是A。`
    })
  }
  
  // 多选题
  for (let i = 0; i < (counts.multiple || 0); i++) {
    questions.push({
      type: 'multiple',
      index: index++,
      score: 10,
      question: `${subjectName}多选题 ${i + 1}（${difficultyText}）：这是一道测试用的多选题`,
      options: ['选项A', '选项B', '选项C', '选项D'],
      answer: 'AB',
      analysis: `这是${subjectName}多选题${i + 1}的详细解析。正确答案是AB。`
    })
  }
  
  // 填空题
  for (let i = 0; i < (counts.fill || 0); i++) {
    questions.push({
      type: 'fill',
      index: index++,
      score: 5,
      question: `${subjectName}填空题 ${i + 1}（${difficultyText}）：这是一道测试用的____题`,
      answer: '填空',
      analysis: `这是${subjectName}填空题${i + 1}的详细解析。正确答案是"填空"。`
    })
  }
  
  // 判断题
  for (let i = 0; i < (counts.judge || 0); i++) {
    questions.push({
      type: 'judge',
      index: index++,
      score: 5,
      question: `${subjectName}判断题 ${i + 1}（${difficultyText}）：这是一道测试用的判断题`,
      options: ['正确', '错误'],
      answer: '正确',
      analysis: `这是${subjectName}判断题${i + 1}的详细解析。正确答案是正确。`
    })
  }
  
  // 综合应用题
  for (let i = 0; i < (counts.comprehensive || 0); i++) {
    questions.push({
      type: 'comprehensive',
      index: index++,
      score: 20,
      question: `${subjectName}综合应用题 ${i + 1}（${difficultyText}）：这是一道测试用的综合应用题，请详细解答。`,
      answer: '综合应用题答案示例',
      analysis: `这是${subjectName}综合应用题${i + 1}的详细解析。`
    })
  }
  
  return questions
}

// ============ 启动服务器 ============

async function startServer() {
  try {
    // 初始化数据库
    await initDatabase()
    
    // 注册插件路由
    registerPptxPluginRoutes(app)
    
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════╗
║          🚀 AI Chat Server 已启动                   ║
╠═══════════════════════════════════════════════════╣
║  服务器地址: http://localhost:${PORT}                  ║
║  数据库路径: server/data/chat.db                  ║
║  上传目录:   server/uploads                       ║
╠═══════════════════════════════════════════════════╣
║  聊天 API:                                        ║
║  • POST   /api/chat          - 发送消息            ║
║  • GET    /api/chat/history  - 获取历史            ║
║  • POST   /api/chat/new-session - 新建会话         ║
║  • DELETE /api/chat/session  - 删除会话            ║
╠═══════════════════════════════════════════════════╣
║  文件 API:                                        ║
║  • POST   /api/upload/:category - 上传文件         ║
║  • GET    /api/files/:sessionId - 获取文件列表      ║
║  • DELETE /api/file/:id      - 删除文件            ║
╠═══════════════════════════════════════════════════╣
║  个人面板 API:                                    ║
║  • POST   /api/profile/init  - 初始化面板数据      ║
║  • GET    /api/profile/data  - 获取所有面板数据     ║
║  • GET    /api/profile/knowledge - 知识基础        ║
║  • PUT    /api/profile/knowledge - 更新知识分数    ║
║  • GET    /api/profile/cognitive-style - 认知风格  ║
║  • PUT    /api/profile/cognitive-style - 更新     ║
║  • GET    /api/profile/error-points - 易错点       ║
║  • POST   /api/profile/error-points/record - 记录 ║
║  • GET    /api/profile/goals - 学习目标            ║
║  • POST   /api/profile/goals - 添加目标            ║
║  • PUT    /api/profile/goals/:id - 更新目标状态     ║
║  • GET    /api/profile/interests - 兴趣方向         ║
║  • PUT    /api/profile/interests - 更新兴趣        ║
║  • GET    /api/profile/study-records - 学习记录    ║
║  • POST   /api/profile/study-records - 添加记录   ║
╠═══════════════════════════════════════════════════╣
║  学习资料 API:                                     ║
║  • GET    /api/learning/materials - 获取资料列表   ║
║  • GET    /api/learning/stats - 获取统计数据       ║
║  • POST   /api/learning/materials - 上传资料       ║
║  • PUT    /api/learning/materials/:id - 更新资料   ║
║  • DELETE /api/learning/materials/:id - 删除资料   ║
╠═══════════════════════════════════════════════════╣
║  学科管理 API:                                     ║
║  • GET    /api/subjects - 获取学科列表              ║
║  • POST   /api/subjects - 添加学科                 ║
║  • PUT    /api/subjects/:name - 更新学科           ║
║  • DELETE /api/subjects/:name - 删除学科           ║
╠═══════════════════════════════════════════════════╣
║  Markdown API:                                     ║
║  • GET    /api/markdown/file - 读取md文件          ║
║  • POST   /api/markdown/save - 保存md文件          ║
╚═══════════════════════════════════════════════════╝
      `)
    })
  } catch (error) {
    console.error('启动服务器失败:', error)
    process.exit(1)
  }
}

startServer()
