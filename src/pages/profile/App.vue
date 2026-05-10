<template>
  <div class="profile-container h-full p-6 overflow-y-auto">
    <!-- 页面标题区域 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold flex items-center gap-3">
          <div class="avatar placeholder">
            <div class="bg-primary text-primary-content rounded-full w-12">

            </div>
          </div>
          个人学习面板
        </h1>
        <p class="text-base-content/60 mt-2 flex items-center gap-2">
          <span class="badge badge-ghost">智能分析</span>
          全面了解你的学习状况
        </p>
      </div>
      <div class="card bg-base-100 shadow">
        <div class="card-body py-3 px-5">
          <div class="stat">
            <div class="stat-title text-xs">面板更新时间</div>
            <div class="stat-value text-lg text-primary">{{ currentDate }}</div>
            <div class="stat-desc text-xs">数据实时同步</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计概览卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body py-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
            <div>
              <div class="text-2xl font-bold text-primary">{{ knowledgeCount }}</div>
              <div class="text-sm text-base-content/60">学习模块</div>
            </div>
          </div>
        </div>
      </div>
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body py-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <div>
              <div class="text-2xl font-bold text-secondary">{{ knowledgeProgress }}%</div>
              <div class="text-sm text-base-content/60">知识掌握度</div>
            </div>
          </div>
        </div>
      </div>
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body py-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <div>
              <div class="text-2xl font-bold text-accent">{{ avgEfficiency }}%</div>
              <div class="text-sm text-base-content/60">平均效率</div>
            </div>
          </div>
        </div>
      </div>
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body py-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <div class="text-2xl font-bold text-success">{{ goalCompletionRate }}%</div>
              <div class="text-sm text-base-content/60">目标完成</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 1. 知识基础 - 雷达图 -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <div class="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h2 class="card-title text-lg">知识基础</h2>
            <span class="badge badge-secondary badge-sm ml-auto">雷达图</span>
          </div>
          <p class="text-sm text-base-content/60 mb-2">各学科模块掌握程度</p>
          <div class="h-64">
            <v-chart class="w-full h-full" :option="radarOption" autoresize />
          </div>
          <div class="mt-4">
            <div class="flex justify-between text-xs text-base-content/60 mb-1">
              <span>综合掌握度</span>
              <span class="text-secondary font-medium">{{ knowledgeProgress }}%</span>
            </div>
            <progress class="progress progress-secondary w-full" :value="knowledgeProgress" max="100"></progress>
          </div>
        </div>
      </div>

      <!-- 2. 认知风格 - 条形图 -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <div class="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h2 class="card-title text-lg">认知风格</h2>
            <span class="badge badge-accent badge-sm ml-auto">条形图</span>
          </div>
          <p class="text-sm text-base-content/60 mb-2">学习方式偏好分析</p>
          <div class="h-64">
            <v-chart class="w-full h-full" :option="cognitiveStyleOption" autoresize />
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            <div class="badge badge-outline gap-1">
              <span class="w-2 h-2 rounded-full bg-purple-500"></span>动手操作
            </div>
            <div class="badge badge-outline gap-1">
              <span class="w-2 h-2 rounded-full bg-cyan-500"></span>视觉学习
            </div>
            <div class="badge badge-outline gap-1">
              <span class="w-2 h-2 rounded-full bg-amber-500"></span>听觉学习
            </div>
            <div class="badge badge-outline gap-1">
              <span class="w-2 h-2 rounded-full bg-pink-500"></span>归纳总结
            </div>
            <div class="badge badge-outline gap-1">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>社交学习
            </div>
          </div>
        </div>
      </div>

      <!-- 3. 易错点偏好 - 热力图 -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <div class="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 class="card-title text-lg">易错点偏好</h2>
            <span class="badge badge-error badge-sm ml-auto">热力图</span>
          </div>
          <p class="text-sm text-base-content/60 mb-2">知识点错误频率热力图</p>
          <div class="h-64">
            <v-chart class="w-full h-full" :option="heatmapOption" autoresize />
          </div>
          <div class="mt-4">
            <div class="alert alert-warning py-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span class="text-xs">{{ errorTip }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. 学习目标 - 圆环图 -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <div class="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <h2 class="card-title text-lg">学习目标</h2>
            <span class="badge badge-warning badge-sm ml-auto">圆环图</span>
          </div>
          <p class="text-sm text-base-content/60 mb-2">目标完成进度</p>
          <div class="h-64">
            <v-chart class="w-full h-full" :option="goalProgressOption" autoresize />
          </div>
          <div class="mt-4 space-y-2">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-success"></div>
              <span class="text-sm flex-1">已完成</span>
              <span class="badge badge-sm badge-success">{{ goalStats.completed }}</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-primary"></div>
              <span class="text-sm flex-1">进行中</span>
              <span class="badge badge-sm badge-primary">{{ goalStats.in_progress }}</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-base-300"></div>
              <span class="text-sm flex-1">未开始</span>
              <span class="badge badge-sm badge-ghost">{{ goalStats.pending }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 5. 兴趣方向 - 词云 -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <div class="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <h2 class="card-title text-lg">兴趣方向</h2>
            <span class="badge badge-info badge-sm ml-auto">词云</span>
          </div>
          <p class="text-sm text-base-content/60 mb-2">学习兴趣关键词</p>
          <div class="h-64">
            <v-chart class="w-full h-full" :option="interestOption" autoresize />
          </div>
          <div class="mt-4">
            <div class="chat chat-start">
              <div class="chat-bubble chat-bubble-primary">
                <p class="text-xs">{{ interestTip }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 6. 学习节奏/效率 - 折线图 -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <div class="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <h2 class="card-title text-lg">学习节奏/效率</h2>
            <span class="badge badge-success badge-sm ml-auto">折线图</span>
          </div>
          <p class="text-sm text-base-content/60 mb-2">学习效率趋势变化</p>
          <div class="h-64">
            <v-chart class="w-full h-full" :option="efficiencyOption" autoresize />
          </div>
          <div class="mt-4">
            <div class="join w-full">
              <button 
                class="join-item btn btn-sm" 
                :class="{ 'btn-active': timeRange === 'week' }"
                @click="fetchStudyRecords('week')"
              >本周</button>
              <button 
                class="join-item btn btn-sm" 
                :class="{ 'btn-active': timeRange === 'month' }"
                @click="fetchStudyRecords('month')"
              >本月</button>
              <button class="join-item btn btn-sm btn-disabled">本学期</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部提示 -->
    <div class="mt-6">
      <div class="alert">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-info shrink-0 w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
          <div class="text-sm font-medium">数据说明</div>
          <div class="text-xs text-base-content/60">所有数据将随着你的学习活动自动采集和更新。开始学习之旅，记录每一个成长瞬间！</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { RadarChart, BarChart, HeatmapChart, PieChart, ScatterChart, LineChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent, VisualMapComponent, GraphicComponent } from 'echarts/components'
import VChart from 'vue-echarts'

use([CanvasRenderer, RadarChart, BarChart, HeatmapChart, PieChart, ScatterChart, LineChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent, VisualMapComponent, GraphicComponent])

const API_BASE = 'http://localhost:3001/api'
const currentDate = new Date().toLocaleDateString('zh-CN')

// 数据状态
const subjects = ref([])
const knowledgeData = ref([])
const cognitiveStyleData = ref([])
const errorPointsData = ref([])
const goalStats = reactive({ completed: 0, in_progress: 0, pending: 0, total: 0 })
const interestsData = ref([])
const studyRecords = ref([])
const timeRange = ref('week')

// 计算属性
const knowledgeCount = computed(() => knowledgeData.value.length || 8)

const knowledgeProgress = computed(() => {
  if (!knowledgeData.value.length) return 0
  const sum = knowledgeData.value.reduce((acc, item) => acc + (item.score || 0), 0)
  return Math.round(sum / knowledgeData.value.length)
})

const avgEfficiency = computed(() => {
  if (!studyRecords.value.length) return 0
  const sum = studyRecords.value.reduce((acc, item) => acc + (item.efficiency || 0), 0)
  return Math.round(sum / studyRecords.value.length)
})

const goalCompletionRate = computed(() => {
  if (!goalStats.total) return 0
  return Math.round((goalStats.completed / goalStats.total) * 100)
})

const errorTip = computed(() => {
  const totalErrors = errorPointsData.value.reduce((acc, item) => acc + (item.error_count || 0), 0)
  return totalErrors === 0 ? '暂无错误数据，继续保持！' : `共记录${totalErrors}次错误，请针对性复习`
})

const interestTip = computed(() => {
  const hasInterests = interestsData.value.some(item => (item.weight || 0) > 0)
  return hasInterests ? '根据你的学习记录分析的兴趣分布' : '开始学习后，这里会展示你的兴趣分布哦！'
})

// 图表配置
const radarOption = computed(() => {
  // 使用从数据库获取的学科数据生成雷达图指标
  const radarIndicators = subjects.value.map(s => ({
    name: s.displayName,
    max: 100
  }))
  
  return {
    radar: {
      indicator: radarIndicators.length > 0 ? radarIndicators : [
        { name: '暂无学科', max: 100 }
      ],
      radius: '60%',
      splitNumber: 4,
      axisName: { color: '#666' }
    },
    series: [{
      type: 'radar',
      data: [{
        value: knowledgeData.value.map(item => item.score || 0),
        name: '掌握程度',
        areaStyle: { color: 'rgba(59, 130, 246, 0.3)' },
        lineStyle: { color: '#3b82f6', width: 2 },
        itemStyle: { color: '#3b82f6' }
      }]
    }]
  }
})

const cognitiveStyleOption = computed(() => ({
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  grid: { left: '3%', right: '8%', bottom: '3%', top: '3%', containLabel: true },
  xAxis: { type: 'value', max: 100, axisLine: { show: false }, axisTick: { show: false } },
  yAxis: {
    type: 'category',
    data: ['动手操作', '视觉学习', '听觉学习', '归纳总结', '社交学习'],
    axisLine: { show: false },
    axisTick: { show: false }
  },
  series: [{
    type: 'bar',
    data: cognitiveStyleData.value.map((item, i) => ({
      value: item.score || 0,
      itemStyle: { 
        color: ['#8b5cf6', '#06b6d4', '#f59e0b', '#ec4899', '#10b981'][i] || '#8b5cf6', 
        borderRadius: [0, 8, 8, 0] 
      }
    })),
    barWidth: '45%',
    label: { show: true, position: 'right', formatter: '{c}%', fontSize: 11 }
  }]
}))

const heatmapOption = computed(() => {
  const topics = ['函数', '方程', '几何', '概率', '算法', '证明']
  const qtypes = ['选择题', '填空题', '解答题']
  
  const data = []
  errorPointsData.value.forEach(item => {
    const xIdx = topics.indexOf(item.topic === 'function' ? '函数' : item.topic)
    const yIdx = qtypes.indexOf(item.question_type === 'choice' ? '选择题' : 
                               item.question_type === 'fill' ? '填空题' : '解答题')
    if (xIdx >= 0 && yIdx >= 0) {
      data.push([xIdx, yIdx, item.error_count || 0])
    }
  })
  
  return {
    tooltip: {
      position: 'top',
      formatter: (params) => {
        const level = params.data[2] === 0 ? '暂无数据' : params.data[2] < 3 ? '低' : params.data[2] < 6 ? '中' : '高'
        return `错误率: ${level}`
      }
    },
    grid: { left: '18%', right: '10%', top: '5%', bottom: '18%' },
    xAxis: {
      type: 'category',
      data: topics,
      axisLine: { show: false },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'category',
      data: qtypes,
      axisLine: { show: false },
      axisTick: { show: false }
    },
    visualMap: {
      min: 0,
      max: 10,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      inRange: { color: ['#e5e7eb', '#22c55e', '#eab308', '#ef4444'] }
    },
    series: [{
      type: 'heatmap',
      data: data.length > 0 ? data : [
        [0, 0, 0], [0, 1, 0], [0, 2, 0],
        [1, 0, 0], [1, 1, 0], [1, 2, 0],
        [2, 0, 0], [2, 1, 0], [2, 2, 0],
        [3, 0, 0], [3, 1, 0], [3, 2, 0],
        [4, 0, 0], [4, 1, 0], [4, 2, 0],
        [5, 0, 0], [5, 1, 0], [5, 2, 0]
      ],
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
    }]
  }
})

const goalProgressOption = computed(() => ({
  tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
  legend: { orient: 'vertical', right: '2%', top: 'center', textStyle: { fontSize: 11 } },
  series: [{
    type: 'pie',
    radius: ['35%', '60%'],
    center: ['40%', '50%'],
    avoidLabelOverlap: false,
    itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 3 },
    label: { show: false },
    emphasis: {
      label: { show: true, fontSize: 14, fontWeight: 'bold', formatter: '{b}\n{d}%' }
    },
    data: [
      { value: goalStats.completed || 0, name: '已完成', itemStyle: { color: '#22c55e' } },
      { value: goalStats.in_progress || 0, name: '进行中', itemStyle: { color: '#3b82f6' } },
      { value: goalStats.pending || 1, name: '未开始', itemStyle: { color: '#e5e7eb' } }
    ]
  }]
}))

const interestOption = computed(() => {
  const interestNames = {
    'programming': '编程', 'math': '数学', 'physics': '物理', 'music': '音乐',
    'reading': '阅读', 'science': '科学', 'art': '绘画', 'history': '历史',
    'biology': '生物', 'game_design': '游戏设计', 'ai': 'AI', 'astronomy': '天文'
  }
  
  const validData = interestsData.value.filter(item => (item.weight || 0) > 0)
  
  if (validData.length === 0) {
    return {
      tooltip: { trigger: 'item' },
      graphic: [{
        type: 'text',
        left: 'center',
        top: 'middle',
        style: {
          text: '开始学习后\n这里将展示你的兴趣',
          textAlign: 'center',
          fill: '#9ca3af',
          fontSize: 14
        }
      }],
      series: [{ type: 'scatter', symbolSize: 0, data: [] }],
      xAxis: { show: false },
      yAxis: { show: false }
    }
  }
  
  const colors = ['#f472b6', '#818cf8', '#34d399', '#fbbf24', '#60a5fa', '#a78bfa', '#fb923c', '#2dd4bf', '#f87171', '#4ade80', '#e879f9', '#38bdf8']
  
  return {
    tooltip: { trigger: 'item', formatter: (p) => p.data.name },
    series: [{
      type: 'scatter',
      symbolSize: (val, params) => 30 + (params.data.weight || 0),
      data: interestsData.value.map((d, i) => ({
        value: [20 + (i % 5) * 15, 20 + Math.floor(i / 5) * 20, d.weight || 0],
        name: interestNames[d.interest] || d.interest,
        weight: d.weight || 0,
        itemStyle: { color: colors[i % 12] }
      })),
      label: {
        show: true,
        formatter: (p) => p.data.name,
        fontSize: 12,
        color: '#fff'
      }
    }],
    xAxis: { show: false, min: 0, max: 100 },
    yAxis: { show: false, min: 0, max: 100 }
  }
})

const efficiencyOption = computed(() => {
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const efficiencyData = new Array(7).fill(0)
  const durationData = new Array(7).fill(0)
  
  studyRecords.value.forEach(record => {
    const date = new Date(record.record_date)
    let dayIdx = date.getDay()
    dayIdx = dayIdx === 0 ? 6 : dayIdx - 1
    if (dayIdx >= 0 && dayIdx < 7) {
      efficiencyData[dayIdx] = record.efficiency || 0
      durationData[dayIdx] = record.duration || 0
    }
  })
  
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['学习效率', '学习时长'], bottom: '0%', textStyle: { fontSize: 11 } },
    grid: { left: '3%', right: '4%', top: '5%', bottom: '18%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: days,
      axisLine: { show: false },
      axisTick: { show: false }
    },
    yAxis: [
      { type: 'value', name: '效率%', max: 100, axisLine: { show: false }, axisTick: { show: false } },
      { type: 'value', name: '时长(h)', max: 12, axisLine: { show: false }, axisTick: { show: false } }
    ],
    series: [
      {
        name: '学习效率',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        data: efficiencyData,
        areaStyle: { color: 'rgba(59, 130, 246, 0.15)' },
        lineStyle: { color: '#3b82f6', width: 3 },
        itemStyle: { color: '#3b82f6' }
      },
      {
        name: '学习时长',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        data: durationData,
        areaStyle: { color: 'rgba(16, 185, 129, 0.15)' },
        lineStyle: { color: '#10b981', width: 3 },
        itemStyle: { color: '#10b981' }
      }
    ]
  }
})

// API 请求函数
async function fetchSubjects() {
  try {
    const res = await fetch(`${API_BASE}/subjects`)
    const json = await res.json()
    if (json.success) {
      subjects.value = json.data || []
    }
  } catch (error) {
    console.error('获取学科列表失败:', error)
  }
}

async function fetchAllData() {
  try {
    const res = await fetch(`${API_BASE}/profile/data`)
    const json = await res.json()
    if (json.success) {
      knowledgeData.value = json.data.knowledge || []
      cognitiveStyleData.value = json.data.cognitiveStyle || []
      errorPointsData.value = json.data.errorPoints || []
      goalStats.completed = json.data.goalStats?.completed || 0
      goalStats.in_progress = json.data.goalStats?.in_progress || 0
      goalStats.pending = json.data.goalStats?.pending || 0
      goalStats.total = json.data.goalStats?.total || 0
      interestsData.value = json.data.interests || []
      studyRecords.value = json.data.studyRecords || []
    }
  } catch (error) {
    console.error('获取面板数据失败:', error)
  }
}

async function fetchStudyRecords(period = 'week') {
  timeRange.value = period
  try {
    const res = await fetch(`${API_BASE}/profile/study-records?period=${period}`)
    const json = await res.json()
    if (json.success) {
      studyRecords.value = json.data || []
    }
  } catch (error) {
    console.error('获取学习记录失败:', error)
  }
}

async function initProfile() {
  try {
    await fetchSubjects()
    await fetch(`${API_BASE}/profile/init`, { method: 'POST' })
    await fetchAllData()
  } catch (error) {
    console.error('初始化面板数据失败:', error)
  }
}

onMounted(() => {
  initProfile()
})
</script>

<style scoped>
.profile-container {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.card {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
