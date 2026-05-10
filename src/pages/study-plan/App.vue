<template>
  <div class="h-full bg-base-100 px-4">
    <!-- 沉浸模式 -->
    <div v-if="immersiveMode" class="h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5">
      <div class="text-center">
        <div v-if="currentTask" class="mb-8">
          <div class="badge badge-lg badge-primary gap-2 mb-2">
            <span v-if="currentTask.subject" class="badge badge-accent badge-sm">{{ getSubjectDisplay(currentTask.subject) }}</span>
            {{ currentTask.subject || '通用' }}
          </div>
          <h2 class="text-2xl font-bold mt-2">{{ currentTask.text }}</h2>
        </div>
        <div v-else class="mb-8">
          <div class="badge badge-lg badge-ghost mb-2">暂无任务</div>
          <h2 class="text-2xl font-bold mt-2 opacity-60">选择一个任务开始专注</h2>
        </div>
        
        <div class="relative inline-flex items-center justify-center w-64 h-64 mb-8">
          <svg class="w-64 h-64 transform -rotate-90">
            <circle cx="128" cy="128" r="120" stroke="currentColor" stroke-width="12" fill="none" class="text-base-300" />
            <circle 
              cx="128" cy="128" r="120" 
              stroke="currentColor" 
              stroke-width="12" 
              fill="none"
              class="text-accent transition-all duration-1000"
              :stroke-dasharray="754"
              :stroke-dashoffset="754 - (754 * pomodoroProgress / 100)"
              stroke-linecap="round"
            />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-6xl font-bold">{{ formatTime(pomodoroTimeLeft) }}</span>
            <span class="text-lg opacity-60">{{ pomodoroPhase }}</span>
          </div>
        </div>

        <div class="flex gap-4 justify-center mb-8">
          <button v-if="!pomodoroRunning" class="btn btn-primary btn-circle btn-xl shadow-lg" @click="startPomodoro">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            </svg>
          </button>
          <button v-else class="btn btn-warning btn-circle btn-xl shadow-lg" @click="pausePomodoro">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button class="btn btn-ghost btn-circle btn-xl shadow" @click="resetPomodoro">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        <div class="flex gap-8 justify-center text-center">
          <div class="stat bg-base-200/80 rounded-xl p-4 shadow">
            <div class="stat-value text-3xl text-primary">{{ todayPomodoros }}</div>
            <div class="stat-title text-sm opacity-60">今日完成</div>
          </div>
          <div class="stat bg-base-200/80 rounded-xl p-4 shadow">
            <div class="stat-value text-3xl text-accent">{{ formatMinutes(todayFocusMinutes) }}</div>
            <div class="stat-title text-sm opacity-60">专注时长</div>
          </div>
        </div>

        <button class="btn btn-outline btn-sm mt-8 gap-2" @click="toggleImmersive">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          退出沉浸模式
        </button>
      </div>
    </div>

    <!-- 正常模式 -->
    <div v-else class="p-4">
      <!-- 页面标题 -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <div class="avatar placeholder">
            <div class="bg-primary/10 text-primary rounded-full w-12 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div>
            <h1 class="text-2xl font-bold">学习计划</h1>
            <p class="text-base-content/60 text-sm flex items-center gap-2 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              规划时间，专注学习
            </p>
          </div>
        </div>
        
        <!-- 视图切换标签 -->
        <div class="tabs tabs-boxed bg-base-200">
          <a class="tab gap-1" :class="{ 'tab-active': currentView === 'dashboard' }" @click="currentView = 'dashboard'">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
            </svg>
            概览
          </a>
          <a class="tab gap-1" :class="{ 'tab-active': currentView === 'calendar' }" @click="currentView = 'calendar'">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            日历
          </a>
          <a class="tab gap-1" :class="{ 'tab-active': currentView === 'timeline' }" @click="currentView = 'timeline'">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            时间线
          </a>
        </div>
        
        <div class="card bg-base-100 shadow border-t-2 border-t-primary">
          <div class="card-body py-2 px-4">
            <div class="stat py-0 px-1">
              <div class="stat-title text-xs opacity-60">今日专注</div>
              <div class="stat-value text-lg text-primary">{{ todayPomodoros }} 个</div>
              <div class="stat-desc text-xs">{{ formatMinutes(todayFocusMinutes) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 仪表盘视图（三列布局） -->
      <div v-if="currentView === 'dashboard'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 待办清单卡片 -->
        <div class="card bg-base-100 shadow-xl border-t-4 border-t-primary">
          <div class="card-body">
            <div class="flex items-center gap-2 mb-4">
              <div class="avatar placeholder">
                <div class="bg-primary/10 text-primary rounded-full w-8 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
              </div>
              <h2 class="card-title text-base">待办清单</h2>
              <div class="badge badge-primary badge-outline badge-sm ml-auto">{{ todoStats.pending }}</div>
            </div>

            <!-- 待办完成率图表 -->
            <div class="flex items-center gap-4 mb-4 p-3 bg-base-200/50 rounded-lg">
              <div class="relative w-16 h-16">
                <svg class="w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="5" fill="none" class="text-base-300" />
                  <circle 
                    cx="32" cy="32" r="28" 
                    stroke="currentColor" 
                    stroke-width="5" 
                    fill="none"
                    class="text-success transition-all duration-500"
                    :stroke-dasharray="176"
                    :stroke-dashoffset="176 - (176 * todoCompletionRate / 100)"
                    stroke-linecap="round"
                  />
                </svg>
                <div class="absolute inset-0 flex items-center justify-center">
                  <span class="text-sm font-bold text-success">{{ todoCompletionRate }}%</span>
                </div>
              </div>
              <div class="flex-1">
                <div class="text-xs text-base-content/60 mb-1">完成进度</div>
                <div class="flex justify-between text-sm">
                  <span class="text-success">已完成 {{ todoStats.completed }}</span>
                  <span class="text-base-content/60">/ {{ todoStats.total }}</span>
                </div>
                <div class="w-full bg-base-300 rounded-full h-2 mt-2">
                  <div 
                    class="bg-success h-2 rounded-full transition-all duration-500"
                    :style="{ width: todoCompletionRate + '%' }"
                  ></div>
                </div>
              </div>
            </div>

            <!-- 学科分布迷你图表 -->
            <div v-if="subjectDistribution.length > 0" class="mb-4">
              <div class="text-xs text-base-content/60 mb-2">学科分布</div>
              <div class="flex gap-1 h-8">
                <div 
                  v-for="(item, index) in subjectDistribution" 
                  :key="index"
                  class="flex-1 rounded-sm relative group cursor-pointer"
                  :style="{ backgroundColor: subjectColors[index % subjectColors.length] }"
                  :title="item.name + ': ' + item.count"
                >
                  <div class="absolute -top-6 left-1/2 -translate-x-1/2 bg-base-100 shadow px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {{ item.name }}: {{ item.count }}
                  </div>
                </div>
              </div>
            </div>

            <button class="btn btn-primary btn-sm w-full gap-2" @click="goToAddTodo">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              添加待办
            </button>

            <div v-if="filteredTodos.length === 0" class="text-center py-6">
              <div class="badge badge-ghost badge-lg">暂无待办事项</div>
            </div>

            <ul class="menu p-0 mt-2">
              <li v-for="todo in filteredTodos" :key="todo.id">
                <div class="flex items-center gap-2 py-2" :class="{ 'opacity-50': todo.completed }">
                  <input 
                    type="checkbox" 
                    class="checkbox checkbox-success checkbox-sm"
                    :checked="todo.completed"
                    @change="toggleTodo(todo.id)"
                  />
                  <span class="flex-1 text-sm truncate" :class="{ 'line-through decoration-success': todo.completed }">{{ todo.text }}</span>
                  <span v-if="todo.subject" class="badge badge-outline badge-xs">{{ getSubjectDisplay(todo.subject) }}</span>
                  <button 
                    v-if="!todo.completed"
                    class="btn btn-ghost btn-xs text-primary"
                    @click="startTaskWithPomodoro(todo)"
                    title="开始专注"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <button class="btn btn-ghost btn-xs text-error" @click="deleteTodo(todo.id)">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- 学习日程卡片 -->
        <div class="card bg-base-100 shadow-xl border-t-4 border-t-secondary">
          <div class="card-body">
            <div class="flex items-center gap-2 mb-4">
              <div class="avatar placeholder">
                <div class="bg-secondary/10 text-secondary rounded-full w-8 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h2 class="card-title text-base">学习日程</h2>
              <div class="badge badge-secondary badge-outline badge-sm ml-auto">{{ todaySchedules.length + futureSchedules.length }}</div>
            </div>

            <!-- 本周日历热力图 -->
            <div class="mb-4 p-3 bg-base-200/50 rounded-lg">
              <div class="text-xs text-base-content/60 mb-2">本周日程</div>
              <div class="flex justify-between">
                <div 
                  v-for="(day, index) in weekDays" 
                  :key="index"
                  class="flex flex-col items-center"
                >
                  <span class="text-xs text-base-content/50 mb-1">{{ day.label }}</span>
                  <div 
                    class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all"
                    :class="{
                      'bg-secondary text-secondary-content': day.count > 0,
                      'bg-base-300 text-base-content/40': day.count === 0
                    }"
                  >
                    {{ day.count }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 日程类型分布 -->
            <div class="mb-4">
              <div class="text-xs text-base-content/60 mb-2">日程统计</div>
              <div class="grid grid-cols-3 gap-2">
                <div class="bg-base-200/50 rounded-lg p-2 text-center">
                  <div class="text-lg font-bold text-secondary">{{ todaySchedules.length }}</div>
                  <div class="text-xs text-base-content/60">今日</div>
                </div>
                <div class="bg-base-200/50 rounded-lg p-2 text-center">
                  <div class="text-lg font-bold text-accent">{{ futureSchedules.length }}</div>
                  <div class="text-xs text-base-content/60">未来</div>
                </div>
                <div class="bg-base-200/50 rounded-lg p-2 text-center">
                  <div class="text-lg font-bold text-info">{{ schedules.length }}</div>
                  <div class="text-xs text-base-content/60">总计</div>
                </div>
              </div>
            </div>

            <button class="btn btn-secondary btn-sm w-full gap-2" @click="goToAddSchedule">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              添加日程
            </button>

            <!-- 今日日程 -->
            <div class="text-sm font-medium mt-4 mb-2 flex items-center gap-2">
              <span class="badge badge-secondary badge-sm">今日</span>
              <span class="text-xs text-base-content/60">{{ todayStr }}</span>
            </div>
            <div v-if="todaySchedules.length === 0" class="text-center py-2">
              <div class="badge badge-ghost badge-sm">今天没有日程</div>
            </div>
            <div class="space-y-1">
              <div 
                v-for="schedule in todaySchedules" 
                :key="schedule.id"
                class="flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-base-200/50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-secondary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="flex-1 text-sm truncate">{{ schedule.text }}</span>
                <span v-if="schedule.subject" class="badge badge-outline badge-xs">{{ getSubjectDisplay(schedule.subject) }}</span>
                <button class="btn btn-ghost btn-xs text-error" @click="deleteSchedule(schedule.id)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- 未来日程 -->
            <div class="text-sm font-medium mt-4 mb-2 flex items-center gap-2">
              <span class="badge badge-ghost badge-sm">未来</span>
            </div>
            <div v-if="futureSchedules.length === 0" class="text-center py-2">
              <div class="badge badge-ghost badge-sm">暂无未来日程</div>
            </div>
            <div class="space-y-1">
              <div 
                v-for="schedule in futureSchedules" 
                :key="schedule.id"
                class="flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-base-200/50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-base-content/40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span class="text-xs text-base-content/50 w-20 shrink-0">{{ schedule.schedule_date }}</span>
                <span class="flex-1 text-sm truncate">{{ schedule.text }}</span>
                <button class="btn btn-ghost btn-xs text-error" @click="deleteSchedule(schedule.id)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 番茄钟卡片 -->
        <div class="card bg-base-100 shadow-xl border-t-4 border-t-accent">
          <div class="card-body">
            <div class="flex items-center gap-2 mb-4">
              <div class="avatar placeholder">
                <div class="bg-accent/10 text-accent rounded-full w-8 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h2 class="card-title text-base">番茄钟</h2>
            </div>

            <!-- 当前任务 -->
            <div v-if="currentTask" class="mb-4 p-2 bg-base-200/50 rounded-lg">
              <div class="badge badge-primary gap-1 mb-1">
                <span v-if="currentTask.subject" class="badge badge-accent badge-xs">{{ getSubjectDisplay(currentTask.subject) }}</span>
                {{ currentTask.subject || '通用' }}
              </div>
              <p class="text-sm truncate">{{ currentTask.text }}</p>
            </div>
            <div v-else class="mb-4 text-center">
              <div class="badge badge-ghost">未选择任务</div>
              <p class="text-xs mt-1 opacity-60">从待办列表选择一个任务</p>
            </div>

            <!-- 计时器 -->
            <div class="relative inline-flex items-center justify-center w-40 h-40 mx-auto mb-4">
              <svg class="w-40 h-40 transform -rotate-90">
                <circle cx="80" cy="80" r="72" stroke="currentColor" stroke-width="6" fill="none" class="text-base-300" />
                <circle 
                  cx="80" cy="80" r="72" 
                  stroke="currentColor" 
                  stroke-width="6" 
                  fill="none"
                  class="text-accent transition-all duration-1000"
                  :stroke-dasharray="452"
                  :stroke-dashoffset="452 - (452 * pomodoroProgress / 100)"
                  stroke-linecap="round"
                />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-3xl font-bold">{{ formatTime(pomodoroTimeLeft) }}</span>
                <span class="text-xs opacity-60">{{ pomodoroPhase }}</span>
              </div>
            </div>

            <!-- 控制按钮 -->
            <div class="flex gap-2 justify-center mb-4">
              <button v-if="!pomodoroRunning" class="btn btn-primary btn-sm gap-1" @click="startPomodoro">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                </svg>
                开始
              </button>
              <button v-else class="btn btn-warning btn-sm gap-1" @click="pausePomodoro">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                暂停
              </button>
              <button class="btn btn-ghost btn-sm" @click="resetPomodoro">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            <!-- 设置 -->
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-base-content/60">工作时长</span>
                <span class="badge badge-ghost badge-sm">{{ pomodoroSettings.workMinutes }} 分钟</span>
              </div>
              <input 
                type="range" 
                v-model="pomodoroSettings.workMinutes" 
                min="15" max="60" step="5"
                class="range range-primary range-xs"
                @change="savePomodoroSettings"
              />
            </div>

            <!-- 统计 -->
            <div class="stats stats-horizontal bg-base-200/50 shadow-none mt-4 w-full">
              <div class="stat py-2 px-3">
                <div class="stat-title text-xs opacity-60">今日</div>
                <div class="stat-value text-xl text-primary">{{ todayPomodoros }}</div>
              </div>
              <div class="stat py-2 px-3">
                <div class="stat-title text-xs opacity-60">时长</div>
                <div class="stat-value text-xl text-accent">{{ formatMinutes(todayFocusMinutes) }}</div>
              </div>
            </div>

            <!-- 本周专注趋势 -->
            <div class="mt-4">
              <div class="text-xs text-base-content/60 mb-2">本周专注趋势</div>
              <div class="flex items-end gap-1 h-12">
                <div 
                  v-for="(day, index) in weekFocusData" 
                  :key="index"
                  class="flex-1 flex flex-col items-center"
                >
                  <div 
                    class="w-full rounded-t transition-all duration-300 min-h-[4px]"
                    :style="{ 
                      height: Math.max(4, (day.minutes / maxWeekMinutes * 48)) + 'px',
                      backgroundColor: day.isToday ? '#8B5CF6' : '#A78BFA'
                    }"
                    :title="day.label + ': ' + day.minutes + '分钟'"
                  ></div>
                  <span class="text-xs mt-1" :class="day.isToday ? 'font-bold text-primary' : 'text-base-content/50'">{{ day.label }}</span>
                </div>
              </div>
            </div>

            <!-- 专注阶段指示 -->
            <div class="mt-4">
              <div class="text-xs text-base-content/60 mb-2">专注阶段</div>
              <div class="flex gap-1">
                <div 
                  v-for="i in 4" 
                  :key="i"
                  class="flex-1 h-2 rounded-full transition-all duration-300"
                  :class="{
                    'bg-accent': i <= pomodoroPhaseCount,
                    'bg-base-300': i > pomodoroPhaseCount
                  }"
                  :title="'阶段 ' + i"
                ></div>
              </div>
              <div class="flex justify-between text-xs text-base-content/40 mt-1">
                <span>专注</span>
                <span>休息</span>
              </div>
            </div>

            <button class="btn btn-outline btn-sm w-full mt-4 gap-2" @click="toggleImmersive">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              沉浸模式
            </button>
          </div>
        </div>
      </div>

      <!-- 日历视图 -->
      <div v-if="currentView === 'calendar'" class="space-y-6">
        <!-- 年度日历热力图 -->
        <div class="card bg-base-100 shadow-xl border-t-4 border-t-secondary">
          <div class="card-body">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <div class="avatar placeholder">
                  <div class="bg-secondary/10 text-secondary rounded-full w-8 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <h2 class="card-title text-lg">{{ currentYear }} 年学习日历</h2>
              </div>
              <div class="join">
                <button class="btn btn-ghost btn-sm join-item" @click="changeYear(-1)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button class="btn btn-ghost btn-sm join-item">{{ currentYear }}</button>
                <button class="btn btn-ghost btn-sm join-item" @click="changeYear(1)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            
            <!-- 热力图 -->
            <div class="overflow-x-auto">
              <div class="min-w-[800px]">
                <!-- 月份标签 -->
                <div class="flex text-xs text-base-content/60 mb-2 ml-8">
                  <div v-for="(month, index) in calendarMonths" :key="index" class="flex-1 text-center">
                    {{ month }}
                  </div>
                </div>
                
                <!-- 周标签 + 日期网格 -->
                <div class="flex">
                  <!-- 周标签 -->
                  <div class="flex flex-col justify-around mr-2 text-xs text-base-content/60">
                    <div class="h-3">周一</div>
                    <div class="h-3">周三</div>
                    <div class="h-3">周五</div>
                  </div>
                  
                  <!-- 日期格子 -->
                  <div class="flex-1">
                    <div class="flex flex-wrap gap-1">
                      <div 
                        v-for="(day, index) in calendarGrid" 
                        :key="index"
                        class="w-4 h-4 lg:w-5 lg:h-5 rounded cursor-pointer transition-all hover:ring-2 hover:ring-primary/50"
                        :class="getDayClass(day)"
                        :title="day.date ? `${day.date}: ${getDayTitle(day)}` : ''"
                      ></div>
                    </div>
                  </div>
                </div>
                
                <!-- 图例 -->
                <div class="flex items-center gap-2 mt-4 text-xs text-base-content/60">
                  <span>少</span>
                  <div class="w-4 h-4 lg:w-5 lg:h-5 rounded bg-base-200"></div>
                  <div class="w-4 h-4 lg:w-5 lg:h-5 rounded bg-success/30"></div>
                  <div class="w-4 h-4 lg:w-5 lg:h-5 rounded bg-success/60"></div>
                  <div class="w-4 h-4 lg:w-5 lg:h-5 rounded bg-success"></div>
                  <span>多</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 月度统计卡片 -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="card bg-base-100 shadow border-t-4 border-t-primary">
            <div class="card-body py-4">
              <div class="flex items-center gap-3">
                <div class="avatar placeholder">
                  <div class="bg-primary/10 text-primary rounded-full w-10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-primary">{{ monthlyStats.completedTodos }}</div>
                  <div class="text-xs text-base-content/60">本月完成</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="card bg-base-100 shadow border-t-4 border-t-secondary">
            <div class="card-body py-4">
              <div class="flex items-center gap-3">
                <div class="avatar placeholder">
                  <div class="bg-secondary/10 text-secondary rounded-full w-10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-secondary">{{ monthlyStats.totalSchedules }}</div>
                  <div class="text-xs text-base-content/60">本月日程</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="card bg-base-100 shadow border-t-4 border-t-accent">
            <div class="card-body py-4">
              <div class="flex items-center gap-3">
                <div class="avatar placeholder">
                  <div class="bg-accent/10 text-accent rounded-full w-10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-accent">{{ formatMinutes(monthlyStats.focusMinutes) }}</div>
                  <div class="text-xs text-base-content/60">专注时长</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="card bg-base-100 shadow border-t-4 border-t-info">
            <div class="card-body py-4">
              <div class="flex items-center gap-3">
                <div class="avatar placeholder">
                  <div class="bg-info/10 text-info rounded-full w-10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-info">{{ monthlyStats.activeDays }}</div>
                  <div class="text-xs text-base-content/60">活跃天数</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 时间线视图（甘特图） -->
      <div v-if="currentView === 'timeline'" class="space-y-6">
        <div class="card bg-base-100 shadow-xl border-t-4 border-t-primary">
          <div class="card-body">
            <div class="flex items-center gap-2 mb-4">
              <div class="avatar placeholder">
                <div class="bg-primary/10 text-primary rounded-full w-8 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                </div>
              </div>
              <h2 class="card-title text-lg">学习时间线</h2>
            </div>
            
            <!-- 时间轴 -->
            <div class="relative">
              <!-- 今日标记线 -->
              <div class="absolute top-0 bottom-0 w-0.5 bg-primary z-10" :style="{ left: todayPosition + '%' }">
                <div class="one-line absolute -top-6 left-1/2 -translate-x-1/2 badge badge-primary badge-sm">今天</div>
              </div>
              
              <!-- 时间轴主体 -->
              <div class="pl-8">
                <!-- 时间刻度 -->
                <div class="flex justify-between mb-4 text-xs text-base-content/60 border-b border-base-200 pb-2">
                  <div v-for="(month, index) in timelineMonths" :key="index" class="text-center" :style="{ width: '100px' }">
                    {{ month }}
                  </div>
                </div>
                
                <!-- 日程甘特条 -->
                <div class="space-y-2">
                  <div 
                    v-for="(item, index) in timelineItems" 
                    :key="index"
                    class="relative h-10 flex items-center"
                  >
                    <!-- 学科标签 -->
                    <div class="w-32 text-sm truncate pr-2 flex-shrink-0">
                      <span class="badge badge-ghost badge-sm">{{ getSubjectDisplay(item.subject) || '通用' }}</span>
                    </div>
                    
                    <!-- 甘特条 -->
                    <div class="flex-1 relative h-6 bg-base-200 rounded">
                      <div 
                        class="absolute h-full rounded px-2 text-xs text-white flex items-center truncate"
                        :class="getSubjectBarClass(item.subject)"
                        :style="{ 
                          left: getBarLeft(item) + '%', 
                          width: getBarWidth(item) + '%' 
                        }"
                        :title="item.text"
                      >
                        {{ item.text }}
                      </div>
                    </div>
                  </div>
                  
                  <!-- 空状态 -->
                  <div v-if="timelineItems.length === 0" class="text-center py-8">
                    <div class="w-16 h-16 rounded-full bg-base-200 mx-auto flex items-center justify-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p class="text-sm text-base-content/50">暂无日程安排</p>
                    <button class="btn btn-primary btn-sm mt-4" @click="goToAddSchedule">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                      添加日程
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 待办流程图 -->
        <div class="card bg-base-100 shadow-xl border-t-4 border-t-secondary">
          <div class="card-body">
            <div class="flex items-center gap-2 mb-4">
              <div class="avatar placeholder">
                <div class="bg-secondary/10 text-secondary rounded-full w-8 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
              </div>
              <h2 class="card-title text-lg">待办流程</h2>
            </div>
            
            <!-- 流程节点 -->
            <div class="flex items-center justify-between overflow-x-auto pb-4">
              <!-- 待处理 -->
              <div class="flex flex-col items-center min-w-[120px]">
                <div class="w-20 h-20 rounded-full bg-warning/20 flex items-center justify-center border-2 border-warning">
                  <span class="text-2xl font-bold text-warning">{{ todoStats.pending }}</span>
                </div>
                <div class="text-sm mt-2 font-medium">待处理</div>
                <div class="text-xs text-base-content/60">待办</div>
              </div>
              
              <!-- 连接线 -->
              <div class="flex-1 mx-2">
                <div class="h-0.5 bg-gradient-to-r from-warning to-info"></div>
              </div>
              
              <!-- 进行中 -->
              <div class="flex flex-col items-center min-w-[120px]">
                <div class="w-20 h-20 rounded-full bg-info/20 flex items-center justify-center border-2 border-info">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="text-sm mt-2 font-medium">进行中</div>
                <div class="text-xs text-base-content/60">专注</div>
              </div>
              
              <!-- 连接线 -->
              <div class="flex-1 mx-2">
                <div class="h-0.5 bg-gradient-to-r from-info to-success"></div>
              </div>
              
              <!-- 已完成 -->
              <div class="flex flex-col items-center min-w-[120px]">
                <div class="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center border-2 border-success">
                  <span class="text-2xl font-bold text-success">{{ todoStats.completed }}</span>
                </div>
                <div class="text-sm mt-2 font-medium">已完成</div>
                <div class="text-xs text-base-content/60">任务</div>
              </div>
            </div>
            
            <!-- 完成率 -->
            <div class="mt-4 p-4 bg-base-200 rounded-lg">
              <div class="flex justify-between text-sm mb-2">
                <span class="text-base-content/60">整体完成率</span>
                <span class="font-bold text-success">{{ todoCompletionRate }}%</span>
              </div>
              <div class="w-full bg-base-300 rounded-full h-3">
                <div 
                  class="bg-gradient-to-r from-info via-primary to-success h-3 rounded-full transition-all duration-500"
                  :style="{ width: todoCompletionRate + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast 提示 -->
    <div v-if="showToast" class="toast toast-top toast-center z-50">
      <div class="alert" :class="toastType === 'success' ? 'alert-success' : 'alert-error'">
        <span>{{ toastMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const API_BASE_URL = 'http://localhost:3001'

const goToAddTodo = () => {
  router.push('/add-item?type=todo')
}

const goToAddSchedule = () => {
  router.push('/add-item?type=schedule')
}

// 状态
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

// 视图切换
const currentView = ref('dashboard')
const currentYear = ref(new Date().getFullYear())
const calendarData = ref({})
const calendarMonths = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

const showToastMessage = (message, type = 'success') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 2000)
}

// 沉浸模式
const immersiveMode = ref(false)
const toggleImmersive = () => {
  immersiveMode.value = !immersiveMode.value
  if (immersiveMode.value) {
    document.documentElement.requestFullscreen?.()
  } else {
    document.exitFullscreen?.()
  }
}

// 学科列表
const subjects = ref([])

const loadSubjects = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/subjects`)
    const data = await response.json()
    if (data.success) {
      subjects.value = data.data
    }
  } catch (error) {
    console.error('加载学科失败:', error)
  }
}

const getSubjectDisplay = (name) => {
  const subject = subjects.value.find(s => s.name === name)
  return subject ? subject.displayName : name
}

// 待办清单
const todos = ref([])
const todoStats = ref({ completed: 0, pending: 0, total: 0 })

const loadTodos = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/study/todos`)
    const data = await response.json()
    if (data.success) {
      todos.value = data.data.map(t => ({
        id: t.id,
        text: t.text,
        subject: t.subject,
        completed: t.completed
      }))
      todoStats.value = data.stats
    }
  } catch (error) {
    console.error('加载待办失败:', error)
  }
}

const toggleTodo = async (id) => {
  try {
    await fetch(`${API_BASE_URL}/api/study/todos/${id}/toggle`, { method: 'PUT' })
    await loadTodos()
  } catch (error) {
    console.error('更新待办失败:', error)
  }
}

const deleteTodo = async (id) => {
  try {
    await fetch(`${API_BASE_URL}/api/study/todos/${id}`, { method: 'DELETE' })
    await loadTodos()
    showToastMessage('已删除', 'success')
  } catch (error) {
    console.error('删除待办失败:', error)
  }
}

const filteredTodos = computed(() => {
  return todos.value
})

// 待办完成率
const todoCompletionRate = computed(() => {
  if (todoStats.value.total === 0) return 0
  return Math.round((todoStats.value.completed / todoStats.value.total) * 100)
})

// 学科分布
const subjectColors = ['#8B5CF6', '#06B6D4', '#F59E0B', '#10B981', '#EF4444', '#EC4899']
const subjectDistribution = computed(() => {
  const dist = {}
  todos.value.forEach(todo => {
    const key = todo.subject || '通用'
    dist[key] = (dist[key] || 0) + 1
  })
  return Object.entries(dist).map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
})

// 本周日期数据
const weekDays = computed(() => {
  const days = []
  const today = new Date()
  const dayNames = ['日', '一', '二', '三', '四', '五', '六']
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const count = schedules.value.filter(s => s.schedule_date === dateStr).length
    
    days.push({
      label: dayNames[date.getDay()],
      date: dateStr,
      count: count,
      isToday: i === 0
    })
  }
  return days
})

// 本周专注数据
const weekFocusData = computed(() => {
  const days = []
  const today = new Date()
  const dayNames = ['日', '一', '二', '三', '四', '五', '六']
  const savedStats = localStorage.getItem('weekly_pomodoro_stats')
  const weeklyData = savedStats ? JSON.parse(savedStats) : {}
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const minutes = weeklyData[dateStr] || 0
    
    days.push({
      label: dayNames[date.getDay()],
      date: dateStr,
      minutes: minutes,
      isToday: i === 0
    })
  }
  return days
})

const maxWeekMinutes = computed(() => {
  const max = Math.max(...weekFocusData.value.map(d => d.minutes))
  return max > 0 ? max : 60
})

// 加载日历数据
const loadCalendarData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/study/calendar?year=${currentYear.value}`)
    const data = await response.json()
    if (data.success) {
      const calendarMap = {}
      data.data.forEach(item => {
        calendarMap[item.date] = item
      })
      calendarData.value = calendarMap
    }
  } catch (error) {
    console.error('加载日历数据失败:', error)
  }
}

// 切换年份
const changeYear = (delta) => {
  currentYear.value += delta
  loadCalendarData()
}

// 生成日历网格
const calendarGrid = computed(() => {
  const grid = []
  const firstDay = new Date(currentYear.value, 0, 1)
  const startWeekday = firstDay.getDay() || 7 // 转换为周一开始
  
  // 填充空白
  for (let i = 1; i < startWeekday; i++) {
    grid.push({ date: null, level: 0 })
  }
  
  // 填充全年日期
  const totalDays = new Date(currentYear.value, 11, 31).getDate()
  const monthDays = []
  for (let month = 0; month < 12; month++) {
    monthDays.push(new Date(currentYear.value, month + 1, 0).getDate())
  }
  
  for (let day = 1; day <= totalDays; day++) {
    const month = new Date(currentYear.value, 0, day).getMonth()
    const dateStr = `${currentYear.value}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const dayData = calendarData.value[dateStr]
    const level = getActivityLevel(dayData)
    const isToday = dateStr === todayStr
    
    grid.push({ date: dateStr, level, isToday, ...dayData })
  }
  
  return grid
})

// 获取活动等级
const getActivityLevel = (data) => {
  if (!data) return 0
  const score = (data.completed || 0) + (data.schedules || 0) * 0.5 + (data.focusMinutes || 0) / 30
  if (score >= 5) return 4
  if (score >= 3) return 3
  if (score >= 2) return 2
  if (score >= 1) return 1
  return 0
}

// 获取日期格子样式
const getDayClass = (day) => {
  if (!day.date) return ''
  const classes = ['bg-base-200', 'bg-success/20', 'bg-success/40', 'bg-success/60', 'bg-success']
  return classes[day.level] + (day.isToday ? ' ring-4 ring-error ring-offset-1' : '')
}

// 获取日期悬停提示
const getDayTitle = (day) => {
  if (!day.data) return '无活动'
  const parts = []
  if (day.completed) parts.push(`完成${day.completed}个待办`)
  if (day.schedules) parts.push(`${day.schedules}个日程`)
  if (day.focusMinutes) parts.push(`${day.focusMinutes}分钟专注`)
  return parts.join('，') || '无活动'
}

// 月度统计
const monthlyStats = computed(() => {
  const currentMonth = new Date().getMonth() + 1
  const currentMonthStr = `${currentYear.value}-${String(currentMonth).padStart(2, '0')}`
  const monthData = Object.entries(calendarData.value)
    .filter(([date]) => date.startsWith(currentMonthStr))
    .map(([_, data]) => data)
  
  return {
    completedTodos: monthData.reduce((sum, d) => sum + (d.completed || 0), 0),
    totalSchedules: monthData.reduce((sum, d) => sum + (d.schedules || 0), 0),
    focusMinutes: monthData.reduce((sum, d) => sum + (d.focusMinutes || 0), 0),
    activeDays: monthData.filter(d => d.completed > 0 || d.schedules > 0 || d.focusMinutes > 0).length
  }
})

// 时间线相关
const timelineMonths = computed(() => {
  const months = []
  const today = new Date()
  const startMonth = new Date(today.getFullYear(), today.getMonth() - 2, 1)
  for (let i = 0; i < 5; i++) {
    const date = new Date(startMonth.getFullYear(), startMonth.getMonth() + i, 1)
    months.push(`${date.getMonth() + 1}月`)
  }
  return months
})

const timelineItems = computed(() => {
  return schedules.value.map(s => ({
    id: s.id,
    text: s.text,
    subject: s.subject,
    date: s.schedule_date
  }))
})

const todayPosition = computed(() => {
  const today = new Date()
  const startDate = new Date(timelineMonths.value.length > 0 ? 
    new Date(today.getFullYear(), today.getMonth() - 2, 1) : today)
  const endDate = new Date(startDate)
  endDate.setMonth(endDate.getMonth() + 5)
  
  const totalDays = (endDate - startDate) / (1000 * 60 * 60 * 24)
  const daysSinceStart = (today - startDate) / (1000 * 60 * 60 * 24)
  
  return Math.max(0, Math.min(100, (daysSinceStart / totalDays) * 100))
})

const getBarLeft = (item) => {
  const today = new Date()
  const itemDate = new Date(item.date)
  const startDate = new Date(timelineMonths.value.length > 0 ?
    new Date(today.getFullYear(), today.getMonth() - 2, 1) : today)
  const endDate = new Date(startDate)
  endDate.setMonth(endDate.getMonth() + 5)
  
  const totalDays = (endDate - startDate) / (1000 * 60 * 60 * 24)
  const daysSinceStart = (itemDate - startDate) / (1000 * 60 * 60 * 24)
  
  return Math.max(0, Math.min(95, (daysSinceStart / totalDays) * 100))
}

const getBarWidth = () => 3 // 固定宽度表示单日

const getSubjectBarClass = (subject) => {
  const subjectIndex = subjects.value.findIndex(s => s.name === subject)
  const colors = ['bg-primary', 'bg-secondary', 'bg-accent', 'bg-info', 'bg-success', 'bg-warning']
  return colors[subjectIndex % colors.length] || 'bg-primary'
}

// 学习日程
const schedules = ref([])

const loadSchedules = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/study/schedules`)
    const data = await response.json()
    if (data.success) {
      schedules.value = data.data.map(s => ({
        id: s.id,
        text: s.text,
        subject: s.subject,
        schedule_date: s.schedule_date
      }))
    }
  } catch (error) {
    console.error('加载日程失败:', error)
  }
}

const deleteSchedule = async (id) => {
  try {
    await fetch(`${API_BASE_URL}/api/study/schedules/${id}`, { method: 'DELETE' })
    await loadSchedules()
    showToastMessage('已删除', 'success')
  } catch (error) {
    console.error('删除日程失败:', error)
  }
}

const todayStr = new Date().toISOString().split('T')[0]

const todaySchedules = computed(() => {
  return schedules.value.filter(s => s.schedule_date === todayStr)
})

const futureSchedules = computed(() => {
  return schedules.value
    .filter(s => s.schedule_date > todayStr)
    .sort((a, b) => a.schedule_date.localeCompare(b.schedule_date))
})

// 番茄钟
const pomodoroSettings = ref({
  workMinutes: 25,
  breakMinutes: 5,
  longBreakMinutes: 15,
  autoStartNext: false
})
const pomodoroTimeLeft = ref(25 * 60)
const pomodoroRunning = ref(false)
const pomodoroPhase = ref('专注')
const pomodoroProgress = ref(100)
let pomodoroTimer = null
let pomodoroPhaseCount = 0

const currentTask = ref(null)

const todayPomodoros = ref(0)
const todayFocusMinutes = ref(0)

const loadPomodoroSettings = () => {
  const savedSettings = localStorage.getItem('settings')
  if (savedSettings) {
    const settings = JSON.parse(savedSettings)
    if (settings.study) {
      pomodoroSettings.value = { ...pomodoroSettings.value, ...settings.study }
    }
  }
  pomodoroTimeLeft.value = pomodoroSettings.value.workMinutes * 60
  
  const today = new Date().toDateString()
  const savedStats = localStorage.getItem('pomodoro_stats')
  if (savedStats) {
    const stats = JSON.parse(savedStats)
    if (stats.date === today) {
      todayPomodoros.value = stats.count
      todayFocusMinutes.value = stats.minutes
    }
  }
}

const handleStudySettingsChanged = (e) => {
  if (e.detail) {
    pomodoroSettings.value = { ...pomodoroSettings.value, ...e.detail }
    if (!pomodoroRunning.value) {
      pomodoroTimeLeft.value = pomodoroSettings.value.workMinutes * 60
      pomodoroProgress.value = 100
    }
  }
}

const savePomodoroSettings = () => {
  const savedSettings = localStorage.getItem('settings')
  const settings = savedSettings ? JSON.parse(savedSettings) : {}
  settings.study = { ...pomodoroSettings.value }
  localStorage.setItem('settings', JSON.stringify(settings))
  
  if (!pomodoroRunning.value) {
    pomodoroTimeLeft.value = pomodoroSettings.value.workMinutes * 60
    pomodoroProgress.value = 100
  }
}

const savePomodoroStats = () => {
  const today = new Date().toDateString()
  const todayStr = new Date().toISOString().split('T')[0]
  localStorage.setItem('pomodoro_stats', JSON.stringify({
    date: today,
    count: todayPomodoros.value,
    minutes: todayFocusMinutes.value
  }))
  
  // 保存每周数据
  const savedStats = localStorage.getItem('weekly_pomodoro_stats')
  const weeklyData = savedStats ? JSON.parse(savedStats) : {}
  weeklyData[todayStr] = todayFocusMinutes.value
  
  // 清理7天前的数据
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0]
  Object.keys(weeklyData).forEach(key => {
    if (key < sevenDaysAgoStr) delete weeklyData[key]
  })
  
  localStorage.setItem('weekly_pomodoro_stats', JSON.stringify(weeklyData))
}

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const formatMinutes = (minutes) => {
  if (minutes >= 60) {
    return `${Math.floor(minutes / 60)}h${minutes % 60}m`
  }
  return `${minutes}m`
}

const startPomodoro = () => {
  pomodoroRunning.value = true
  pomodoroTimer = setInterval(() => {
    pomodoroTimeLeft.value--
    pomodoroProgress.value = (pomodoroTimeLeft.value / (pomodoroSettings.value.workMinutes * 60)) * 100
    
    if (pomodoroTimeLeft.value <= 0) {
      completePomodoroPhase()
    }
  }, 1000)
}

const pausePomodoro = () => {
  pomodoroRunning.value = false
  if (pomodoroTimer) {
    clearInterval(pomodoroTimer)
    pomodoroTimer = null
  }
}

const resetPomodoro = () => {
  pausePomodoro()
  pomodoroTimeLeft.value = pomodoroSettings.value.workMinutes * 60
  pomodoroProgress.value = 100
  pomodoroPhase.value = '专注'
}

const completePomodoroPhase = () => {
  pausePomodoro()
  
  if (pomodoroPhase.value === '专注') {
    todayPomodoros.value++
    todayFocusMinutes.value += pomodoroSettings.value.workMinutes
    savePomodoroStats()
    
    pomodoroPhaseCount++
    if (pomodoroPhaseCount >= 4) {
      pomodoroPhase.value = '长休息'
      pomodoroTimeLeft.value = pomodoroSettings.value.longBreakMinutes * 60
      pomodoroPhaseCount = 0
      showToastMessage('完成4个番茄钟！休息一下吧', 'success')
    } else {
      pomodoroPhase.value = '短休息'
      pomodoroTimeLeft.value = pomodoroSettings.value.breakMinutes * 60
      showToastMessage('休息一下吧！', 'success')
    }
  } else {
    pomodoroPhase.value = '专注'
    pomodoroTimeLeft.value = pomodoroSettings.value.workMinutes * 60
    showToastMessage('休息结束，开始专注！', 'success')
  }
  pomodoroProgress.value = 100
}

const startTaskWithPomodoro = (todo) => {
  currentTask.value = todo
  resetPomodoro()
  showToastMessage(`开始任务: ${todo.text}`, 'success')
}

onMounted(async () => {
  await loadSubjects()
  await loadTodos()
  await loadSchedules()
  await loadCalendarData()
  loadPomodoroSettings()
  
  window.addEventListener('study-settings-changed', handleStudySettingsChanged)
})

onUnmounted(() => {
  if (pomodoroTimer) {
    clearInterval(pomodoroTimer)
  }
  if (immersiveMode.value) {
    document.exitFullscreen?.()
  }
  window.removeEventListener('study-settings-changed', handleStudySettingsChanged)
})
</script>

