<template>
  <div class="error-book-container h-full bg-base-200">
    <!-- 统计卡片 -->
    <div class="container mx-auto p-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="card bg-base-100 shadow">
          <div class="card-body p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-base-content/60">总错题数</p>
                <p class="text-3xl font-bold text-primary">{{ stats.total }}</p>
              </div>
              <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div class="card bg-base-100 shadow">
          <div class="card-body p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-base-content/60">待掌握</p>
                <p class="text-3xl font-bold text-error">{{ stats.byStatus?.unmastered || 0 }}</p>
              </div>
              <div class="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div class="card bg-base-100 shadow">
          <div class="card-body p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-base-content/60">掌握中</p>
                <p class="text-3xl font-bold text-warning">{{ stats.byStatus?.mastering || 0 }}</p>
              </div>
              <div class="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div class="card bg-base-100 shadow">
          <div class="card-body p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-base-content/60">已掌握</p>
                <p class="text-3xl font-bold text-success">{{ stats.byStatus?.mastered || 0 }}</p>
              </div>
              <div class="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 筛选栏 -->
      <div class="card bg-base-100 shadow mb-6">
        <div class="card-body p-4">
          <div class="flex flex-wrap gap-4 items-center">
            <div class="form-control">
              <label class="label">
                <span class="label-text">学科</span>
              </label>
              <select v-model="filters.subject" class="select select-bordered select-sm" @change="loadErrors">
                <option value="">全部</option>
                <option v-for="subject in subjects" :key="subject.name" :value="subject.name">
                  {{ subject.displayName }}
                </option>
              </select>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">题型</span>
              </label>
              <select v-model="filters.questionType" class="select select-bordered select-sm" @change="loadErrors">
                <option value="">全部</option>
                <option value="single">单选题</option>
                <option value="multiple">多选题</option>
                <option value="fill">填空题</option>
                <option value="judge">判断题</option>
                <option value="comprehensive">综合应用题</option>
              </select>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">掌握状态</span>
              </label>
              <select v-model="filters.masteryStatus" class="select select-bordered select-sm" @change="loadErrors">
                <option value="">全部</option>
                <option value="unmastered">待掌握</option>
                <option value="mastering">掌握中</option>
                <option value="mastered">已掌握</option>
              </select>
            </div>

            <div class="flex-1"></div>

            <button class="btn btn-ghost btn-sm" @click="resetFilters">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              重置筛选
            </button>
          </div>
        </div>
      </div>

      <!-- 错题列表 -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="loading loading-spinner loading-lg text-primary"></div>
      </div>

      <div v-else-if="errors.length === 0" class="card bg-base-100 shadow">
        <div class="card-body text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-base-content/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="text-lg font-medium">暂无错题</h3>
          <p class="text-base-content/60 mt-2">完成考试后，做错的题目会自动添加到错题本</p>
        </div>
      </div>

      <div v-else class="space-y-4">
        <div v-for="error in errors" :key="error.id" class="card bg-base-100 shadow hover:shadow-lg transition-shadow">
          <div class="card-body p-4">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <!-- 头部信息 -->
                <div class="flex items-center gap-2 mb-2">
                  <span class="badge badge-sm" :class="getSubjectColor(error.subject)">{{ getSubjectName(error.subject) }}</span>
                  <span class="badge badge-sm badge-ghost">{{ getQuestionTypeName(error.question_type) }}</span>
                  <span class="badge badge-sm" :class="getMasteryStatusClass(error.mastery_status)">{{ getMasteryStatusName(error.mastery_status) }}</span>
                  <span v-if="error.next_review_at && new Date(error.next_review_at) <= new Date()" class="badge badge-sm badge-error">待复习</span>
                </div>

                <!-- 题目内容 -->
                <div class="font-medium mb-3" v-html="renderContent(error.question_content)"></div>

                <!-- 选项（选择题） -->
                <div v-if="error.options && error.options.length > 0" class="space-y-1 mb-3 ml-4">
                  <div v-for="(opt, idx) in error.options" :key="idx" class="text-sm" :class="getOptionClass(opt, error)">
                    {{ opt }}
                  </div>
                </div>

                <!-- 答案对比 -->
                <div class="flex gap-4 text-sm mb-3">
                  <div class="text-error">
                    <span class="font-medium">你的答案：</span>
                    <span>{{ error.user_answer || '未作答' }}</span>
                  </div>
                  <div class="text-success">
                    <span class="font-medium">正确答案：</span>
                    <span>{{ error.correct_answer }}</span>
                  </div>
                  <div class="text-base-content/60">
                    <span class="font-medium">得分：</span>
                    <span>{{ error.score }}/{{ error.full_score }}</span>
                  </div>
                </div>

                <!-- 知识点 -->
                <div v-if="error.knowledge_points && error.knowledge_points.length > 0" class="flex flex-wrap gap-1 mb-3">
                  <span v-for="kp in error.knowledge_points" :key="kp" class="badge badge-ghost badge-xs">{{ kp }}</span>
                </div>

                <!-- 错误原因 -->
                <div v-if="error.error_reason" class="alert alert-sm alert-warning mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span class="text-sm">{{ error.error_reason }}</span>
                </div>

                <!-- 解析 -->
                <div v-if="showAnalysis[error.id] && error.analysis" class="alert alert-sm alert-info mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="text-sm" v-html="renderContent(error.analysis)"></span>
                </div>

                <!-- 操作按钮 -->
                <div class="flex items-center gap-2">
                  <button class="btn btn-xs btn-ghost" @click="toggleAnalysis(error.id)">
                    {{ showAnalysis[error.id] ? '隐藏解析' : '查看解析' }}
                  </button>
                  <button class="btn btn-xs btn-ghost" @click="openErrorReasonModal(error)">
                    {{ error.error_reason ? '修改原因' : '标记原因' }}
                  </button>
                  <div class="dropdown dropdown-end">
                    <label tabindex="0" class="btn btn-xs btn-ghost">更新状态</label>
                    <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32">
                      <li><a @click="updateMasteryStatus(error.id, 'unmastered')">待掌握</a></li>
                      <li><a @click="updateMasteryStatus(error.id, 'mastering')">掌握中</a></li>
                      <li><a @click="updateMasteryStatus(error.id, 'mastered')">已掌握</a></li>
                    </ul>
                  </div>
                  <button class="btn btn-xs btn-ghost text-error" @click="deleteError(error.id)">
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 错误原因弹窗 -->
    <div v-if="showReasonModal" class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">标记错误原因</h3>
        <div class="form-control">
          <label class="label">
            <span class="label-text">错误原因</span>
          </label>
          <select v-model="errorReasonForm.reason" class="select select-bordered w-full mb-2">
            <option value="">选择原因</option>
            <option value="概念不清">概念不清</option>
            <option value="计算错误">计算错误</option>
            <option value="审题失误">审题失误</option>
            <option value="思路错误">思路错误</option>
            <option value="粗心大意">粗心大意</option>
            <option value="完全不会">完全不会</option>
            <option value="其他">其他</option>
          </select>
          <textarea v-if="errorReasonForm.reason === '其他'" v-model="errorReasonForm.customReason" class="textarea textarea-bordered" placeholder="请输入具体原因..."></textarea>
        </div>
        <div class="modal-action">
          <button class="btn btn-ghost" @click="closeReasonModal">取消</button>
          <button class="btn btn-primary" @click="saveErrorReason">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

// 状态
const loading = ref(false)
const errors = ref([])
const stats = ref({ total: 0, byStatus: {} })
const subjects = ref([])
const showAnalysis = ref({})

// 筛选条件
const filters = ref({
  subject: '',
  questionType: '',
  masteryStatus: ''
})

// 错误原因弹窗
const showReasonModal = ref(false)
const currentError = ref(null)
const errorReasonForm = ref({
  reason: '',
  customReason: ''
})

// 加载错题列表
const loadErrors = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (filters.value.subject) params.append('subject', filters.value.subject)
    if (filters.value.questionType) params.append('questionType', filters.value.questionType)
    if (filters.value.masteryStatus) params.append('masteryStatus', filters.value.masteryStatus)

    const response = await fetch(`${apiBaseUrl}/api/error-book?${params}`)
    const data = await response.json()
    if (data.success) {
      errors.value = data.data
    }
  } catch (error) {
    console.error('加载错题失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载统计
const loadStats = async () => {
  try {
    const response = await fetch(`${apiBaseUrl}/api/error-book/stats`)
    const data = await response.json()
    if (data.success) {
      stats.value = data.data
    }
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

// 加载学科列表
const loadSubjects = async () => {
  try {
    const response = await fetch(`${apiBaseUrl}/api/subjects`)
    const data = await response.json()
    if (data.success) {
      subjects.value = data.data
    }
  } catch (error) {
    console.error('加载学科失败:', error)
  }
}

// 重置筛选
const resetFilters = () => {
  filters.value = {
    subject: '',
    questionType: '',
    masteryStatus: ''
  }
  loadErrors()
}

// 更新掌握状态
const updateMasteryStatus = async (id, status) => {
  try {
    const response = await fetch(`${apiBaseUrl}/api/error-book/${id}/mastery`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    if (response.ok) {
      loadErrors()
      loadStats()
    }
  } catch (error) {
    console.error('更新状态失败:', error)
  }
}

// 删除错题
const deleteError = async (id) => {
  if (!confirm('确定要删除这道错题吗？')) return
  try {
    const response = await fetch(`${apiBaseUrl}/api/error-book/${id}`, {
      method: 'DELETE'
    })
    if (response.ok) {
      loadErrors()
      loadStats()
    }
  } catch (error) {
    console.error('删除失败:', error)
  }
}

// 打开错误原因弹窗
const openErrorReasonModal = (error) => {
  currentError.value = error
  errorReasonForm.value = {
    reason: error.error_reason || '',
    customReason: ''
  }
  showReasonModal.value = true
}

// 关闭错误原因弹窗
const closeReasonModal = () => {
  showReasonModal.value = false
  currentError.value = null
}

// 保存错误原因
const saveErrorReason = async () => {
  if (!currentError.value) return
  const reason = errorReasonForm.value.reason === '其他'
    ? errorReasonForm.value.customReason
    : errorReasonForm.value.reason

  try {
    const response = await fetch(`${apiBaseUrl}/api/error-book/${currentError.value.id}/error-reason`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ errorReason: reason })
    })
    if (response.ok) {
      loadErrors()
      closeReasonModal()
    }
  } catch (error) {
    console.error('保存失败:', error)
  }
}

// 切换解析显示
const toggleAnalysis = (id) => {
  showAnalysis.value[id] = !showAnalysis.value[id]
}

// 开始今日复习
const startReview = () => {
  if (stats.value.todayReview === 0) {
    alert('今日没有待复习的错题')
    return
  }
  filters.value.masteryStatus = ''
  loadErrors()
  // 滚动到列表
  window.scrollTo({ top: 400, behavior: 'smooth' })
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 渲染内容（简单处理LaTeX）
const renderContent = (content) => {
  if (!content) return ''
  // 简单处理，实际项目中可以使用KaTeX
  return content.replace(/\$\$(.*?)\$\$/g, '<span class="font-mono bg-base-300 px-1 rounded">$1</span>')
                .replace(/\$(.*?)\$/g, '<span class="font-mono bg-base-300 px-1 rounded">$1</span>')
}

// 获取学科名称
const getSubjectName = (name) => {
  const subject = subjects.value.find(s => s.name === name)
  return subject ? subject.displayName : name
}

// 获取学科颜色
const getSubjectColor = (name) => {
  const colors = {
    'math': 'badge-primary',
    'linear_algebra': 'badge-secondary',
    'probability': 'badge-accent',
    'physics': 'badge-info',
    'english': 'badge-success',
    'programming': 'badge-warning'
  }
  return colors[name] || 'badge-ghost'
}

// 获取题型名称
const getQuestionTypeName = (type) => {
  const names = {
    'single': '单选题',
    'multiple': '多选题',
    'fill': '填空题',
    'judge': '判断题',
    'comprehensive': '综合应用题'
  }
  return names[type] || type
}

// 获取掌握状态名称
const getMasteryStatusName = (status) => {
  const names = {
    'unmastered': '待掌握',
    'mastering': '掌握中',
    'mastered': '已掌握'
  }
  return names[status] || status
}

// 获取掌握状态样式
const getMasteryStatusClass = (status) => {
  const classes = {
    'unmastered': 'badge-error',
    'mastering': 'badge-warning',
    'mastered': 'badge-success'
  }
  return classes[status] || 'badge-ghost'
}

// 获取选项样式
const getOptionClass = (opt, error) => {
  const optLetter = opt.charAt(0)
  const isCorrect = error.correct_answer.includes(optLetter)
  const isUserWrong = error.user_answer && error.user_answer.includes(optLetter) && !isCorrect

  if (isCorrect) return 'text-success font-medium'
  if (isUserWrong) return 'text-error line-through'
  return ''
}

onMounted(() => {
  loadErrors()
  loadStats()
  loadSubjects()
})
</script>

<style scoped>
.error-book-container {
  padding-bottom: 2rem;
}
</style>