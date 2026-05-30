<template>
  <div class="exam-container h-full bg-base-200">
    <!-- 主要内容区 -->
    <div class="container mx-auto p-4">
      <!-- 加载中 -->
      <div v-if="loading" class="flex justify-center items-center min-h-[60vh]">
        <div class="loading loading-spinner loading-lg text-primary"></div>
      </div>

      <!-- 错误提示 -->
      <div v-else-if="error" class="alert alert-error max-w-2xl mx-auto mt-8">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="flex flex-col">
          <span class="font-medium">{{ error }}</span>
          <span v-if="errorDetail" class="text-sm opacity-80">{{ errorDetail }}</span>
        </div>
        <button class="btn btn-sm btn-ghost ml-auto" @click="goBack">返回学习中心</button>
      </div>

      <!-- 考试完成结果页 -->
      <div v-else-if="isCompleted" class="max-w-3xl mx-auto">
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body text-center">
            <div class="mb-4">
              <div class="inline-flex items-center justify-center w-24 h-24 rounded-full" :class="scoreClass">
                <span class="text-4xl font-bold">{{ score }}</span>
              </div>
            </div>
            <h2 class="text-2xl font-bold mb-2">考试完成！</h2>
            <p class="text-lg text-base-content/70 mb-4">
              得分: <span class="font-bold text-primary">{{ score }}</span> / {{ totalScore }}
            </p>
            <div class="stats shadow mb-6">
              <div class="stat">
                <div class="stat-title">正确题数</div>
                <div class="stat-value text-success">{{ correctCount }}</div>
              </div>
              <div class="stat">
                <div class="stat-title">错误题数</div>
                <div class="stat-value text-error">{{ wrongCount }}</div>
              </div>
              <div class="stat">
                <div class="stat-title">正确率</div>
                <div class="stat-value">{{ accuracy }}%</div>
              </div>
            </div>
            <div class="flex justify-center gap-4">
              <button class="btn btn-primary" @click="reviewExam">查看解析</button>
              <button class="btn btn-ghost" @click="goBack">返回学习中心</button>
            </div>
          </div>
        </div>

        <!-- 解析区域 -->
        <div v-if="showReview" class="mt-6 space-y-4">
          <h3 class="text-xl font-bold">答案解析</h3>
          <div v-for="(question, index) in questions" :key="index" class="card bg-base-100 shadow">
            <div class="card-body">
              <div class="flex items-start gap-3">
                <span class="badge" :class="getAnswerStatusClass(index)">{{ index + 1 }}</span>
                <div class="flex-1">
                  <p class="font-medium mb-2" v-html="renderContent(question.content)"></p>
                  <div class="text-sm space-y-1">
                    <p>
                      <span class="text-base-content/60">你的答案:</span>
                      <span :class="isCorrect(index) ? 'text-success' : 'text-error'">
                        {{ formatAnswer(userAnswers[index]) }}
                      </span>
                    </p>
                    <p>
                      <span class="text-base-content/60">正确答案:</span>
                      <span class="text-success">{{ formatAnswer(getCorrectAnswer(index)) }}</span>
                    </p>
                    <div v-if="getAnalysis(index)" class="mt-2 p-3 bg-base-200 rounded-lg">
                      <p class="text-base-content/60 text-xs mb-1">解析:</p>
                      <p v-html="renderContent(getAnalysis(index))"></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 考试进行页面 -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- 左侧题目区 -->
        <div class="lg:col-span-3 space-y-6">
          <div v-for="(question, index) in questions" :key="index" :id="`question-${index}`" class="card bg-base-100 shadow-lg">
            <div class="card-body">
              <!-- 题目标题 -->
              <div class="flex items-start gap-3 mb-4">
                <span class="badge badge-primary badge-lg">{{ index + 1 }}</span>
                <div class="flex-1">
                  <span class="badge badge-sm badge-ghost mr-2">{{ getTypeText(question.type) }}</span>
                  <span class="badge badge-sm" :class="getDifficultyClass(question.difficulty)">{{ getDifficultyText(question.difficulty) }}</span>
                  <p class="text-lg mt-2" v-html="renderContent(question.content)"></p>
                </div>
              </div>

              <!-- 单选题 -->
              <div v-if="question.type === 'single'" class="space-y-2">
                <label v-for="(option, optIndex) in question.options" :key="optIndex" class="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-base-200 transition-colors" :class="{ 'bg-primary/10 border border-primary': userAnswers[index] === option.charAt(0) }">
                  <input type="radio" :name="`q-${index}`" :value="option.charAt(0)" v-model="userAnswers[index]" class="radio radio-primary" @change="answerQuestion(index)">
                  <span v-html="renderContent(option)"></span>
                </label>
              </div>

              <!-- 多选题 -->
              <div v-else-if="question.type === 'multiple'" class="space-y-2">
                <label v-for="(option, optIndex) in question.options" :key="optIndex" class="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-base-200 transition-colors" :class="{ 'bg-primary/10 border border-primary': userAnswers[index]?.includes(option.charAt(0)) }">
                  <input type="checkbox" :value="option.charAt(0)" v-model="userAnswers[index]" class="checkbox checkbox-primary" @change="answerQuestion(index)">
                  <span v-html="renderContent(option)"></span>
                </label>
              </div>

              <!-- 填空题 -->
              <div v-else-if="question.type === 'fill'" class="space-y-2">
                <input type="text" v-model="userAnswers[index]" class="input input-bordered w-full" placeholder="请输入答案" @blur="answerQuestion(index)">
              </div>

              <!-- 判断题 -->
              <div v-else-if="question.type === 'judge'" class="flex gap-4">
                <label class="flex items-center gap-2 p-3 rounded-lg cursor-pointer hover:bg-base-200" :class="{ 'bg-success/10 border border-success': userAnswers[index] === true }">
                  <input type="radio" :name="`q-${index}`" :value="true" v-model="userAnswers[index]" class="radio radio-success" @change="answerQuestion(index)">
                  <span>正确</span>
                </label>
                <label class="flex items-center gap-2 p-3 rounded-lg cursor-pointer hover:bg-base-200" :class="{ 'bg-error/10 border border-error': userAnswers[index] === false }">
                  <input type="radio" :name="`q-${index}`" :value="false" v-model="userAnswers[index]" class="radio radio-error" @change="answerQuestion(index)">
                  <span>错误</span>
                </label>
              </div>

              <!-- 综合应用题 -->
              <div v-else-if="question.type === 'comprehensive'" class="space-y-4">
                <div v-if="question.subQuestions" class="space-y-2 ml-4">
                  <p v-for="(sub, subIndex) in question.subQuestions" :key="subIndex" class="text-base-content/80">{{ sub }}</p>
                </div>
                <textarea v-model="userAnswers[index]" class="textarea textarea-bordered w-full h-32" placeholder="请在此输入你的答案..." @blur="answerQuestion(index)"></textarea>
              </div>

              <!-- 练习模式：即时反馈 -->
              <div v-if="isPracticeMode && answeredStatus[index]" class="mt-4 p-4 rounded-lg" :class="isCorrect(index) ? 'bg-success/10 border border-success' : 'bg-error/10 border border-error'">
                <div class="flex items-center gap-2 mb-2">
                  <svg v-if="isCorrect(index)" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-success" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-error" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                  <span :class="isCorrect(index) ? 'text-success font-bold' : 'text-error font-bold'">
                    {{ isCorrect(index) ? '回答正确！' : '回答错误' }}
                  </span>
                </div>
                <p class="text-sm">
                  <span class="text-base-content/60">正确答案:</span>
                  <span class="text-success font-medium">{{ formatAnswer(getCorrectAnswer(index)) }}</span>
                </p>
                <div v-if="getAnalysis(index)" class="mt-2 text-sm">
                  <span class="text-base-content/60">解析:</span>
                  <p class="mt-1" v-html="renderContent(getAnalysis(index))"></p>
                </div>
              </div>
            </div>
          </div>

          <!-- 提交按钮 -->
          <div class="flex justify-center py-6">
            <button class="btn btn-primary btn-lg" @click="submitExam" :disabled="submitting">
              <span v-if="submitting" class="loading loading-spinner loading-sm"></span>
              {{ submitting ? '提交中...' : '提交试卷' }}
            </button>
          </div>
        </div>

        <!-- 右侧答题卡 -->
        <div class="lg:col-span-1">
          <div class="card bg-base-100 shadow-lg sticky top-24">
            <div class="card-body">
              <h3 class="font-bold text-lg mb-4">答题卡</h3>
              <div class="grid grid-cols-5 gap-2">
                <button v-for="(_, index) in questions" :key="index" @click="scrollToQuestion(index)" class="btn btn-sm" :class="{
                  'btn-primary': userAnswers[index] !== undefined && userAnswers[index] !== '' && userAnswers[index] !== null && (!Array.isArray(userAnswers[index]) || userAnswers[index].length > 0),
                  'btn-outline': !userAnswers[index] || (Array.isArray(userAnswers[index]) && userAnswers[index].length === 0)
                }">
                  {{ index + 1 }}
                </button>
              </div>
              <div class="divider"></div>
              <div class="text-sm text-base-content/60">
                <p>已答: <span class="text-primary font-bold">{{ answeredCount }}</span> / {{ questions.length }}</p>
                <p>未答: <span class="text-error font-bold">{{ questions.length - answeredCount }}</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import katex from 'katex'

const router = useRouter()
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

// 考试数据
const examId = ref('')
const examData = ref(null)
const questions = ref([])
const answers = ref({})
const analysis = ref({})
const userAnswers = ref([])
const answeredStatus = ref([])

// 状态
const loading = ref(true)
const error = ref('')
const errorDetail = ref('')
const submitting = ref(false)
const isCompleted = ref(false)
const showReview = ref(false)

// 倒计时
const remainingTime = ref(0)
const timer = ref(null)

// 成绩
const score = ref(0)
const totalScore = ref(0)
const correctCount = ref(0)
const wrongCount = ref(0)

// 计算属性
const examTitle = computed(() => examData.value?.title || '阶段性测试')
const subjectName = computed(() => {
  const subjectMap = {
    math: '高等数学',
    linear_algebra: '线性代数',
    probability: '概率论',
    physics: '大学物理',
    major: '专业课',
    english: '英语',
    programming: '编程',
    politics: '政治'
  }
  return subjectMap[examData.value?.subject] || examData.value?.subject || ''
})

const isPracticeMode = computed(() => examData.value?.mode === 'practice')

const modeText = computed(() => isPracticeMode.value ? '练习模式' : '考试模式')

const modeBadgeClass = computed(() => isPracticeMode.value ? 'badge-secondary' : 'badge-primary')

const timeDisplay = computed(() => {
  const minutes = Math.floor(remainingTime.value / 60)
  const seconds = remainingTime.value % 60
  return { minutes, seconds }
})

const timeWarning = computed(() => remainingTime.value < 300) // 少于5分钟警告

const answeredCount = computed(() => {
  return userAnswers.value.filter((ans, index) => {
    if (questions.value[index]?.type === 'multiple') {
      return Array.isArray(ans) && ans.length > 0
    }
    return ans !== undefined && ans !== '' && ans !== null
  }).length
})

const accuracy = computed(() => {
  if (questions.value.length === 0) return 0
  return Math.round((correctCount.value / questions.value.length) * 100)
})

const scoreClass = computed(() => {
  const rate = score.value / totalScore.value
  if (rate >= 0.9) return 'bg-success text-success-content'
  if (rate >= 0.6) return 'bg-warning text-warning-content'
  return 'bg-error text-error-content'
})

// 方法
const loadExam = async () => {
  try {
    // 从localStorage获取考试ID
    const examInfo = localStorage.getItem('current_exam')
    if (!examInfo) {
      error.value = '没有找到考试信息'
      errorDetail.value = '请在学习中心重新生成试卷'
      loading.value = false
      return
    }

    const { examId: id, settings } = JSON.parse(examInfo)
    examId.value = id

    // 获取考试数据
    const response = await fetch(`${apiBaseUrl}/api/exams/${id}`)

    // 处理404错误
    if (response.status === 404) {
      error.value = '试卷不存在或已过期'
      errorDetail.value = '请在学习中心重新生成试卷'
      loading.value = false
      // 清除过期的考试信息
      localStorage.removeItem('current_exam')
      return
    }

    const data = await response.json()

    if (!data.success) {
      error.value = data.error || '加载考试失败'
      errorDetail.value = data.message || ''
      loading.value = false
      return
    }

    examData.value = data.data
    questions.value = data.data.questions || []
    answers.value = data.data.answers || {}
    analysis.value = data.data.analysis || {}

    // 检查考试状态
    const examStatus = data.data.status
    if (examStatus === 'generating' || examStatus === 'pending') {
      error.value = '试卷正在生成中'
      errorDetail.value = '请稍候再试，或返回学习中心确认生成状态'
      loading.value = false
      return
    }

    if (examStatus === 'failed') {
      error.value = '试卷生成失败'
      errorDetail.value = '请返回学习中心重新生成试卷'
      localStorage.removeItem('current_exam')
      loading.value = false
      return
    }

    // 检查题目是否为空
    if (questions.value.length === 0) {
      error.value = '试卷题目为空'
      errorDetail.value = '题库中可能没有足够的题目，请尝试其他学科或使用AI生成'
      loading.value = false
      return
    }

    // 初始化用户答案数组
    userAnswers.value = new Array(questions.value.length).fill(undefined)
    answeredStatus.value = new Array(questions.value.length).fill(false)

    // 设置倒计时
    if (examData.value.enable_time_limit && examData.value.time_limit) {
      remainingTime.value = examData.value.time_limit * 60
      startTimer()
    }

    loading.value = false
  } catch (err) {
    console.error('加载考试失败:', err)
    error.value = '加载考试失败，请检查网络连接'
    errorDetail.value = err.message || ''
    loading.value = false
  }
}

const startTimer = () => {
  timer.value = setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--
    } else {
      // 时间到，自动提交
      clearInterval(timer.value)
      submitExam()
    }
  }, 1000)
}

const answerQuestion = async (index) => {
  if (!isPracticeMode.value) return

  const question = questions.value[index]
  const userAnswer = userAnswers.value[index]

  // 检查是否已回答完整
  if (question.type === 'multiple') {
    if (!Array.isArray(userAnswer) || userAnswer.length === 0) return
  } else if (userAnswer === undefined || userAnswer === '' || userAnswer === null) {
    return
  }

  // 标记为已回答
  answeredStatus.value[index] = true

  // 提交答案获取反馈
  try {
    const response = await fetch(`${apiBaseUrl}/api/exams/${examId.value}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionIndex: index,
        userAnswer: userAnswer
      })
    })

    const data = await response.json()
    if (data.success) {
      // 更新答案解析（以数字索引存储）
      if (data.data.analysis) {
        analysis.value[index] = data.data.analysis
      }
    }
  } catch (err) {
    console.error('提交答案失败:', err)
  }
}

const submitExam = async () => {
  if (submitting.value) return

  // 确认提交
  const unanswered = questions.value.length - answeredCount.value
  if (unanswered > 0) {
    const confirmed = confirm(`还有 ${unanswered} 道题未作答，确定要提交吗？`)
    if (!confirmed) return
  }

  submitting.value = true

  try {
    // 提交所有答案
    for (let i = 0; i < questions.value.length; i++) {
      if (!answeredStatus.value[i] && userAnswers.value[i] !== undefined) {
        await fetch(`${apiBaseUrl}/api/exams/${examId.value}/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionIndex: i,
            userAnswer: userAnswers.value[i]
          })
        })
      }
    }

    // 完成考试
    const response = await fetch(`${apiBaseUrl}/api/exams/${examId.value}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })

    const data = await response.json()

    if (data.success) {
      score.value = data.data.score
      totalScore.value = data.data.totalScore

      // 计算正确/错误数量
      let correct = 0
      let wrong = 0
      questions.value.forEach((q, index) => {
        if (isCorrect(index)) correct++
        else wrong++
      })
      correctCount.value = correct
      wrongCount.value = wrong

      isCompleted.value = true

      // 清除定时器
      if (timer.value) {
        clearInterval(timer.value)
      }

      // 清除当前考试
      localStorage.removeItem('current_exam')
    } else {
      alert('提交失败: ' + (data.error || '未知错误'))
    }
  } catch (err) {
    console.error('提交考试失败:', err)
    alert('提交失败，请检查网络连接')
  } finally {
    submitting.value = false
  }
}

const isCorrect = (index) => {
  const question = questions.value[index]
  const userAnswer = userAnswers.value[index]
  // answers 后端以数字索引存储: { "0": "B", "1": "A", ... }
  const correctAnswer = answers.value[index]

  if (correctAnswer === undefined) return false

  if (question.type === 'multiple') {
    if (!Array.isArray(userAnswer)) return false
    const sortedUser = [...userAnswer].sort().join(',')
    const sortedCorrect = [...(Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer])].sort().join(',')
    return sortedUser === sortedCorrect
  }

  return String(userAnswer).toLowerCase() === String(correctAnswer).toLowerCase()
}

const getCorrectAnswer = (index) => {
  // answers 以数字索引存储，直接用 index 取值
  return answers.value[index]
}

const getAnalysis = (index) => {
  // analysis 以数字索引存储
  return analysis.value[index] || ''
}

const getAnswerStatusClass = (index) => {
  return isCorrect(index) ? 'badge-success' : 'badge-error'
}

const formatAnswer = (answer) => {
  if (answer === undefined || answer === null) return '未作答'
  if (typeof answer === 'boolean') return answer ? '正确' : '错误'
  if (Array.isArray(answer)) return answer.join(', ')
  return String(answer)
}

const getTypeText = (type) => {
  const typeMap = {
    single: '单选题',
    multiple: '多选题',
    fill: '填空题',
    judge: '判断题',
    comprehensive: '综合应用题'
  }
  return typeMap[type] || type
}

const getDifficultyClass = (difficulty) => {
  const classMap = {
    easy: 'badge-success',
    medium: 'badge-warning',
    hard: 'badge-error'
  }
  return classMap[difficulty] || 'badge-ghost'
}

const getDifficultyText = (difficulty) => {
  const textMap = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return textMap[difficulty] || difficulty
}

const scrollToQuestion = (index) => {
  const element = document.getElementById(`question-${index}`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

const reviewExam = () => {
  showReview.value = true
  // 加载所有答案
  questions.value.forEach((q, index) => {
    if (!userAnswers.value[index]) {
      userAnswers.value[index] = ''
    }
  })
}

const goBack = () => {
  router.push('/learn')
}

const renderContent = (content) => {
  if (!content) return ''
  // 渲染LaTeX公式
  return content.replace(/\$\$(.+?)\$\$/g, (match, latex) => {
    try {
      return katex.renderToString(latex, { throwOnError: false })
    } catch {
      return match
    }
  }).replace(/\$(.+?)\$/g, (match, latex) => {
    try {
      return katex.renderToString(latex, { throwOnError: false })
    } catch {
      return match
    }
  })
}

// 生命周期
onMounted(() => {
  loadExam()
})

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})
</script>

<style scoped>
.countdown {
  font-variant-numeric: tabular-nums;
}
</style>
