<template>
  <!-- Fish Terminal 风格 -->
  <div class="terminal-wrapper min-h-screen overflow-hidden bg-base-100">
    
    <div class="terminal-container h-screen flex">
      
      <!-- 左侧会话列表 - Oh My Posh 风格 -->
      <div class="sessions-sidebar flex flex-col" :class="sidebarCollapsed ? 'w-14' : 'w-60'">
        <!-- 侧边栏头部 -->
        <div class="sidebar-header px-3 py-2 border-b border-base-300/30 flex items-center justify-between">
          <transition name="fade">
            <span v-if="!sidebarCollapsed" class="text-xs font-medium text-base-content/50">
              sessions
            </span>
          </transition>
          <button 
            class="btn btn-ghost btn-xs text-base-content/30 hover:text-base-content/70 transition-colors p-1"
            @click="sidebarCollapsed = !sidebarCollapsed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 transition-transform" :class="sidebarCollapsed ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
        
        <!-- 会话列表 -->
        <div class="sessions-list flex-1 overflow-y-auto py-1">
          <transition-group name="list" tag="div">
            <div 
              v-for="session in sessions" 
              :key="session.sessionId"
              class="session-item px-3 py-1.5 cursor-pointer transition-all duration-150"
              :class="[
                sidebarCollapsed ? 'justify-center px-0' : '',
                session.sessionId === sessionId ? 'bg-base-300 border-l-2 border-primary' : 'hover:bg-base-300/50'
              ]"
              @click="switchSession(session.sessionId)"
            >
              <div class="flex items-center gap-2" :class="sidebarCollapsed ? 'justify-center' : ''">
                <span v-if="!sidebarCollapsed" class="text-xs w-4 text-right">
                  <span v-if="session.sessionId === sessionId" class="text-primary">❯</span>
                  <span v-else class="text-base-content/20">·</span>
                </span>
                <span v-else>
                  <span v-if="session.sessionId === sessionId" class="text-primary">❯</span>
                  <span v-else class="text-base-content/20">·</span>
                </span>
                <div v-if="!sidebarCollapsed" class="flex-1 min-w-0">
                  <div class="text-xs truncate" :class="session.sessionId === sessionId ? 'text-base-content' : 'text-base-content/50'">
                    {{ session.firstMessage || 'new session' }}
                  </div>
                  <div class="text-[10px] text-base-content/30 mt-0.5">
                    {{ session.lastTime || '' }}
                  </div>
                </div>
              </div>
            </div>
          </transition-group>
          
          <div v-if="sessions.length === 0" class="px-3 py-4 text-center">
            <transition name="fade">
              <div v-if="!sidebarCollapsed">
                <div class="text-base-content/30 text-xs">no sessions</div>
              </div>
              <div v-else class="text-base-content/20">·</div>
            </transition>
          </div>
        </div>
        
        <!-- 侧边栏底部 - Oh My Bash 版本信息 -->
        <div class="sidebar-footer px-3 py-2 border-t border-base-300/30">
          <transition name="fade">
            <div v-if="!sidebarCollapsed" class="text-[10px] text-base-content/30">
              <span class="text-warning">⚙</span> oh-my-bash
            </div>
            <div v-else class="text-center text-base-content/30 text-xs">⚙</div>
          </transition>
        </div>
      </div>

      <!-- 右侧主终端区域 -->
      <div class="main-terminal flex-1 flex flex-col">
        
        <!-- Fish 风格提示符栏 -->
        <div class="posh-prompt-bar px-4 py-2 text-sm font-medium border-b border-base-300/30">
          <div class="prompt-line flex items-center overflow-hidden">
            <!-- 第一段：用户@主机（纯黑） -->
            <div class="prompt-item prompt-user">user@localhost</div>
            <!-- 第二段：路径（电光蓝） -->
            <div class="prompt-item prompt-path">~</div>
            <!-- 第三段：分支（柠檬黄） -->
            <div class="prompt-item prompt-branch"> master</div>
            
            <!-- 时间分段 -->
            <span class="ml-auto text-base-content/40 text-xs">
              {{ currentTime }}
            </span>
          </div>
        </div>

        <!-- 终端内容区域 + 右侧可视化面板 -->
        <div class="flex flex-1 overflow-hidden">
          <!-- 左侧聊天区域 -->
          <div ref="terminalContent" class="terminal-content flex-1 overflow-y-auto p-4">
            <div class="max-w-5xl mx-auto">
            
            <!-- 欢迎信息 - Oh My Bash 风格 -->
            <div v-if="messages.length === 0 && !isTyping" class="space-y-2">
              <div class="text-base-content/40 text-xs mb-4">
                Last login: {{ lastLoginTime }} on ttys000
              </div>
              
              <div class="prompt-line flex items-center text-sm">
                <div class="prompt-item prompt-user">user@localhost</div>
                <div class="prompt-item prompt-path">~</div>
                <div class="prompt-item prompt-branch">❯</div>
              </div>
              
              <div class="text-base-content/40 text-sm ml-[calc(1.5rem+3px)] mt-2">
                <span class="badge badge-sm badge-primary badge-outline">UsamiRenko</span>
                <span class="text-base-content/30 mx-1">—</span>
                <span class="text-base-content/50">Terminal AI Assistant</span>
              </div>
              
              <div class="text-base-content/30 text-xs mt-6 ml-[calc(1.5rem+3px)] space-y-1">
                <div><span class="text-success">=</span> Type your message below to start</div>
                <div><span class="text-success">=</span> Use <span class="text-warning">↑↓</span> to navigate history</div>
                <div><span class="text-success">=</span> Press <span class="text-warning">Ctrl+L</span> to clear screen</div>
              </div>
            </div>

            <!-- 消息列表 -->
            <div v-for="(msg, index) in messages" :key="msg.id" class="message-block mb-4">
              <!-- 用户消息 - Oh My Bash 风格 -->
              <div v-if="msg.role === 'user'" class="user-message">
                <div class="flex items-start gap-2">
                  <div class="prompt-line flex items-center text-sm">
                    <div class="prompt-item prompt-user">user@localhost</div>
                    <div class="prompt-item prompt-path">~</div>
                    <div class="prompt-item prompt-branch">❯</div>
                  </div>
                </div>
                <div class="ml-0 mt-1">
                  <pre class="text-base-content text-sm whitespace-pre-wrap break-words font-mono ml-[calc(1.5rem+3px)]">{{ msg.content }}</pre>
                </div>
              </div>
              
              <!-- AI消息 - Oh My Bash 风格 -->
              <div v-else class="ai-message mt-3">
                <div class="flex items-start gap-2">
                  <div class="prompt-line flex items-center text-sm">
                    <div class="prompt-item prompt-ai">ai@UsamiRenko</div>
                    <div class="prompt-item prompt-ai-path">response</div>
                    <div class="prompt-item prompt-ai-branch">❯</div>
                  </div>
                </div>
                <div class="ml-0 mt-1">
                  <!-- 正在处理状态 -->
                  <div v-if="!msg.content" class="flex items-center gap-3 text-base-content/40 ml-[calc(1.5rem+3px)]">
                    <span class="loading loading-dots loading-xs"></span>
                    <span class="text-sm animate-pulse">thinking...</span>
                  </div>
                  <!-- 已收到内容 -->
                  <template v-else>
                    <div v-for="(block, idx) in parseMessage(msg.content)" :key="idx" class="ml-[calc(1.5rem+3px)]">
                      <!-- Action卡片 -->
                      <ActionCard 
                        v-if="block.type === 'action'"
                        :action="block.data"
                        @confirm="handleActionConfirm(block.data)"
                      />
                      <!-- Markdown内容 -->
                      <div 
                        v-else-if="block.type === 'content'" 
                        class="markdown-content"
                        v-html="block.html"
                      ></div>
                    </div>
                  </template>
                </div>
              </div>
            </div>

            <!-- 错误信息 -->
            <transition name="slide">
              <div v-if="errorMessage" class="error-banner text-sm px-4 py-2 text-error bg-error/10 rounded mt-3">
                <span class="mr-2">✗</span> {{ errorMessage }}
                <button class="ml-4 text-base-content/30 hover:text-base-content/70" @click="errorMessage = ''">×</button>
              </div>
            </transition>

            <!-- 当前输入行 - 跟随对话的终端输入 -->
            <div v-if="!isTyping" class="current-input-line mt-4">
              <div class="flex items-start gap-2">
                <!-- Oh My Bash 风格提示符 -->
                <div class="prompt-line flex items-center text-sm flex-shrink-0 mt-0.5">
                  <div class="prompt-item prompt-user">user@localhost</div>
                  <div class="prompt-item prompt-path">~</div>
                  <div class="prompt-item prompt-branch">❯</div>
                </div>
                
                <!-- 终端输入 - 带闪烁光标 -->
                <div class="flex-1 terminal-command-line">
                  <span class="typed-text">{{ inputText }}</span>
                  <span class="cursor-blink"></span>
                </div>
              </div>
            </div>

            <!-- AI 处理中状态 - 显示等待提示 -->
            <div v-else class="ai-thinking-line mt-4">
              <div class="flex items-center gap-3 text-base-content/50 text-sm">
                <div class="prompt-line flex items-center">
                  <div class="prompt-item prompt-ai">ai@UsamiRenko</div>
                  <div class="prompt-item prompt-ai-path">thinking</div>
                  <div class="prompt-item prompt-ai-branch">⋯</div>
                </div>
                <button
                  class="px-2 text-error/60 hover:text-error transition-colors text-sm"
                  @click="cancelRequest"
                >
                  ^C
                </button>
              </div>
            </div>

          </div>
        </div>

        <!-- 右侧可视化面板 - 文字画和阵列图 -->
        <div class="visual-panel w-[420px] border-l border-base-300/30 bg-base-200/20 flex flex-col">
            <!-- Logo 字符画区域 -->
            <div class="logo-ascii px-3 py-3 border-b border-base-300/30 bg-gradient-to-b from-base-200/50 to-transparent">
              <pre class="text-[8px] leading-[1.1] font-mono text-primary/80 whitespace-pre overflow-x-auto text-center select-none">    ██╗ ██╗███████╗██╗      ██████╗  ██████╗  █████╗ ███╗   ██╗           ██╗ 
   ██╔╝██╔╝██╔════╝██║     ██╔═══██╗██╔════╝ ██╔══██╗████╗  ██║    ██╗    ╚██╗
  ██╔╝██╔╝ ███████╗██║     ██║   ██║██║  ███╗███████║██╔██╗ ██║    ╚═╝     ██║
 ██╔╝ ╚██╗ ╚════██║██║     ██║   ██║██║   ██║██╔══██║██║╚██╗██║    ██╗     ██║
██╔╝   ╚██╗███████║███████╗╚██████╔╝╚██████╔╝██║  ██║██║ ╚████║    ╚═╝    ██╔╝
╚═╝     ╚═╝╚══════╝╚══════╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝           ╚═╝</pre>
            </div>

            <!-- 数字人展示区域 -->
            <div class="avatar-display border-b border-base-300/30 relative overflow-hidden">
              <div class="avatar-container relative w-full aspect-square bg-base-300/50">
                <!-- 扫描线效果 -->
                <div class="scanlines absolute inset-0 pointer-events-none z-10"></div>
                <!-- Canvas -->
                <canvas 
                  ref="avatarCanvas" 
                  class="avatar-canvas w-full h-full block"
                  :width="avatarType === 'image' ? avatarWidth : avatarWidth"
                  :height="avatarType === 'image' ? avatarHeight : avatarHeight"
                ></canvas>
              </div>
            </div>

            <!-- 番茄钟区域 -->
            <div class="pomodoro-section border-b border-base-300/30 flex-shrink-0">
              <div class="px-3 py-2 bg-base-200/30 border-b border-base-300/20">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-medium text-base-content/50 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    pomodoro
                  </span>
                  <div class="flex items-center gap-1">
                    <span class="text-[10px] text-base-content/40">{{ todayPomodoros }} done</span>
                    <button 
                      class="btn btn-ghost btn-xs text-base-content/30 hover:text-base-content/70 p-0.5"
                      @click="resetPomodoro"
                      title="重置"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="p-3">
                <!-- 当前任务显示 -->
                <div v-if="currentPomodoroTask" class="mb-3 p-2 bg-base-200/50 rounded text-xs truncate">
                  <span class="text-base-content/50">任务:</span>
                  <span class="text-base-content ml-1">{{ currentPomodoroTask }}</span>
                </div>
                
                <!-- 计时器圆环 -->
                <div class="flex items-center gap-3">
                  <div class="relative w-16 h-16 flex-shrink-0">
                    <svg class="w-16 h-16 transform -rotate-90">
                      <circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="3" fill="none" class="text-base-300" />
                      <circle 
                        cx="32" cy="32" r="28" 
                        stroke="currentColor" 
                        stroke-width="3" 
                        fill="none"
                        class="text-accent transition-all duration-1000"
                        :stroke-dasharray="176"
                        :stroke-dashoffset="176 - (176 * pomodoroProgress / 100)"
                        stroke-linecap="round"
                      />
                    </svg>
                    <div class="absolute inset-0 flex flex-col items-center justify-center">
                      <span class="text-sm font-bold">{{ formatPomodoroTime(pomodoroTimeLeft) }}</span>
                    </div>
                  </div>
                  
                  <div class="flex-1 min-w-0">
                    <div class="text-xs text-base-content/60 mb-1">{{ pomodoroPhase }}</div>
                    <div class="flex gap-1">
                      <button 
                        v-if="!pomodoroRunning" 
                        class="btn btn-primary btn-xs flex-1"
                        @click="startPomodoro"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        </svg>
                      </button>
                      <button 
                        v-else 
                        class="btn btn-warning btn-xs flex-1"
                        @click="pausePomodoro"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                
                <!-- 专注阶段指示器 -->
                <div class="flex gap-1 mt-3">
                  <div 
                    v-for="i in 4" 
                    :key="i"
                    class="flex-1 h-1 rounded-full transition-all duration-300"
                    :class="{
                      'bg-accent': i <= pomodoroPhaseCount,
                      'bg-base-300': i > pomodoroPhaseCount
                    }"
                  ></div>
                </div>
              </div>
            </div>

            <!-- 今日日程区域 -->
            <div class="schedule-section border-b border-base-300/30 flex-shrink-0">
              <div class="px-3 py-2 bg-base-200/30 border-b border-base-300/20">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-medium text-base-content/50 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    today schedule
                  </span>
                  <span class="text-[10px] text-base-content/40">{{ todaySchedules.length }} items</span>
                </div>
              </div>
              
              <div class="p-2 overflow-y-auto" style="max-height: min(120px, 20vh);">
                <div v-if="todaySchedules.length === 0" class="text-center py-3 text-xs text-base-content/30">
                  暂无今日日程
                </div>
                <div v-else class="space-y-1">
                  <div 
                    v-for="schedule in todaySchedules.slice(0, 5)" 
                    :key="schedule.id"
                    class="group flex items-center gap-2 py-1.5 px-2 rounded hover:bg-base-200/50 transition-colors text-xs"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-secondary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="flex-1 truncate">{{ schedule.text }}</span>
                    <button 
                      class="btn btn-ghost btn-xs p-0.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                      @click="startScheduleWithPomodoro(schedule)"
                      title="开始专注"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      </svg>
                    </button>
                  </div>
                  <div v-if="todaySchedules.length > 5" class="text-center text-[10px] text-base-content/40 pt-1">
                    +{{ todaySchedules.length - 5 }} more
                  </div>
                </div>
              </div>
            </div>

            <!-- 待办清单区域 -->
            <div class="todo-section border-b border-base-300/30 flex-shrink-0">
              <div class="px-3 py-2 bg-base-200/30 border-b border-base-300/20">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-medium text-base-content/50 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    todos
                  </span>
                  <span class="text-[10px] text-base-content/40">{{ pendingTodos.length }} pending</span>
                </div>
              </div>
              
              <div class="p-2 overflow-y-auto" style="max-height: min(120px, 20vh);">
                <div v-if="pendingTodos.length === 0" class="text-center py-3 text-xs text-base-content/30">
                  暂无待办事项
                </div>
                <div v-else class="space-y-1">
                  <div 
                    v-for="todo in pendingTodos.slice(0, 5)" 
                    :key="todo.id"
                    class="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-base-200/50 transition-colors text-xs group"
                  >
                    <input 
                      type="checkbox" 
                      class="checkbox checkbox-success checkbox-xs"
                      @change="completeTodo(todo.id)"
                    />
                    <span class="flex-1 truncate">{{ todo.text }}</span>
                    <button 
                      class="btn btn-ghost btn-xs p-0.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                      @click="startTodoWithPomodoro(todo)"
                      title="开始专注"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      </svg>
                    </button>
                  </div>
                  <div v-if="pendingTodos.length > 5" class="text-center text-[10px] text-base-content/40 pt-1">
                    +{{ pendingTodos.length - 5 }} more
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 可视化内容区域 - 固定在底部 -->
            <div class="visualization-section flex-1 min-h-0 flex flex-col border-t border-base-300/30">
              <div class="px-3 py-2 bg-base-200/30 border-b border-base-300/20">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-medium text-base-content/50">visualization</span>
                  <button 
                    class="btn btn-ghost btn-xs text-base-content/30 hover:text-base-content/70 p-1"
                    @click="clearVisualPanel"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div class="panel-content flex-1 overflow-y-auto p-3">
                <!-- 文字画区域 -->
                <div v-if="asciiArt" class="mb-4">
                  <div class="text-xs text-base-content/40 mb-2">ASCII Art</div>
                  <pre class="ascii-art text-xs font-mono text-primary whitespace-pre overflow-x-auto">{{ asciiArt }}</pre>
                </div>
                
                <!-- 阵列图区域 -->
                <div v-if="arrayDiagram" class="mb-4">
                  <div class="text-xs text-base-content/40 mb-2">Array Diagram</div>
                  <div class="array-diagram bg-base-300/30 rounded p-3">
                    <pre class="text-xs font-mono text-secondary whitespace-pre overflow-x-auto">{{ arrayDiagram }}</pre>
                  </div>
                </div>
                
                <!-- 空状态 -->
                <div v-if="!asciiArt && !arrayDiagram" class="flex flex-col items-center justify-center h-full text-base-content/30">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span class="text-xs">No visualization</span>
                  <span class="text-[10px] mt-1">Generated art will appear here</span>
                </div>
              </div>
            </div>
            

          </div>
        </div>

        <!-- 底部状态栏 -->
        <div class="terminal-status border-t border-base-300/30 bg-base-200/30 p-2">
          <div class="max-w-5xl mx-auto flex items-center justify-between text-xs text-base-content/30">
            <span>Oh My Bash · ↑↓ history · Ctrl+L clear · Ctrl+C cancel</span>
            <span v-if="sessionId" class="text-base-content/20">
              session: {{ sessionId.slice(-8) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, onMounted, onUnmounted, h, defineComponent } from 'vue'
import { marked } from 'marked'
import katex from 'katex'
import { useRouter } from 'vue-router'

// ActionCard 组件 - 终端风格
const ActionCard = defineComponent({
  name: 'ActionCard',
  props: {
    action: {
      type: Object,
      required: true
    }
  },
  emits: ['confirm'],
  setup(props, { emit }) {
    return () => h('div', { class: 'bg-neutral border border-neutral-600 rounded-lg p-3 mt-3 not-prose' }, [
      h('div', { class: 'flex items-center gap-3' }, [
        // 文件类型图标
        h('div', { class: 'flex items-center justify-center w-10 h-10 rounded-lg' },
          props.action.options[0] === 'ppt' 
            ? h('div', { class: 'text-secondary text-2xl' }, '📊')
            : props.action.options[0] === 'md'
            ? h('div', { class: 'text-accent text-2xl' }, '📝')
            : h('div', { class: 'text-info text-2xl' }, '🎬')
        ),
        // 标题和类型
        h('div', { class: 'flex-1 min-w-0' }, [
          h('div', { class: 'font-semibold text-sm text-neutral-content truncate' }, props.action.prompt),
          h('span', { class: 'badge badge-ghost badge-sm mt-1 text-neutral-content/60' },
            props.action.options[0] === 'ppt' ? 'PPT' :
            props.action.options[0] === 'md' ? 'Markdown' : 'Video'
          )
        ]),
        // 确认按钮 - 终端风格
        h('button', {
          class: 'btn btn-primary btn-sm gap-1',
          onClick: () => emit('confirm', props.action)
        }, [
          h('span', {}, '['),
          h('span', { class: 'text-success' }, 'y'),
          h('span', {}, '] generate')
        ])
      ])
    ])
  }
})

const router = useRouter()

// ============ Oh My Posh 风格新增功能 ============

// 帮助面板
const showHelp = ref(false)

// 侧边栏折叠
const sidebarCollapsed = ref(false)

// 可视化面板数据
const asciiArt = ref('')
const arrayDiagram = ref('')
const showAsciiPanel = ref(true)
const showArrayPanel = ref(true)

// 数字人相关数据
const avatarCanvas = ref(null)
const avatarFrames = ref([])
const currentAvatarFrame = ref(0)
const avatarName = ref('assistant_pixel')
const avatarWidth = ref(32)
const avatarHeight = ref(32)
const avatarColors = ref({})
const avatarType = ref('pixel') // 'pixel' 或 'image'
const avatarFilters = ref({})
const avatarImages = ref([]) // 预加载的图片
let avatarInterval = null

// ============ 番茄钟功能 ============
const pomodoroSettings = ref({
  workMinutes: 25,
  breakMinutes: 5,
  longBreakMinutes: 15
})
const pomodoroTimeLeft = ref(25 * 60)
const pomodoroRunning = ref(false)
const pomodoroPhase = ref('专注')
const pomodoroProgress = ref(100)
const todayPomodoros = ref(0)
const todayFocusMinutes = ref(0)
const currentPomodoroTask = ref('')
let pomodoroTimer = null
let pomodoroPhaseCount = 0

// ============ 日程和待办功能 ============
const todaySchedules = ref([])
const pendingTodos = ref([])
const API_BASE_URL = 'http://localhost:3001'

// 清除可视化面板
const clearVisualPanel = () => {
  asciiArt.value = ''
  arrayDiagram.value = ''
}

// ============ 番茄钟功能 ============

// 加载番茄钟设置
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

// 保存番茄钟统计
const savePomodoroStats = () => {
  const today = new Date().toDateString()
  localStorage.setItem('pomodoro_stats', JSON.stringify({
    date: today,
    count: todayPomodoros.value,
    minutes: todayFocusMinutes.value
  }))
}

// 格式化时间
const formatPomodoroTime = (seconds) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

// 开始番茄钟
const startPomodoro = () => {
  pomodoroRunning.value = true
  pomodoroTimer = setInterval(() => {
    pomodoroTimeLeft.value--
    const totalSeconds = pomodoroPhase.value === '专注' 
      ? pomodoroSettings.value.workMinutes * 60 
      : pomodoroPhase.value === '短休息'
        ? pomodoroSettings.value.breakMinutes * 60
        : pomodoroSettings.value.longBreakMinutes * 60
    pomodoroProgress.value = (pomodoroTimeLeft.value / totalSeconds) * 100
    
    if (pomodoroTimeLeft.value <= 0) {
      completePomodoroPhase()
    }
  }, 1000)
}

// 暂停番茄钟
const pausePomodoro = () => {
  pomodoroRunning.value = false
  if (pomodoroTimer) {
    clearInterval(pomodoroTimer)
    pomodoroTimer = null
  }
}

// 重置番茄钟
const resetPomodoro = () => {
  pausePomodoro()
  pomodoroTimeLeft.value = pomodoroSettings.value.workMinutes * 60
  pomodoroProgress.value = 100
  pomodoroPhase.value = '专注'
  currentPomodoroTask.value = ''
  pomodoroPhaseCount = 0
}

// 完成番茄钟阶段
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
    } else {
      pomodoroPhase.value = '短休息'
      pomodoroTimeLeft.value = pomodoroSettings.value.breakMinutes * 60
    }
  } else {
    pomodoroPhase.value = '专注'
    pomodoroTimeLeft.value = pomodoroSettings.value.workMinutes * 60
  }
  pomodoroProgress.value = 100
}

// 开始待办任务
const startTodoWithPomodoro = (todo) => {
  currentPomodoroTask.value = todo.text
  resetPomodoro()
  startPomodoro()
}

// 开始日程任务
const startScheduleWithPomodoro = (schedule) => {
  currentPomodoroTask.value = schedule.text
  resetPomodoro()
  startPomodoro()
}

// ============ 日程和待办功能 ============

// 加载今日日程
const loadTodaySchedules = async () => {
  try {
    const userId = 'default'
    const todayStr = new Date().toISOString().split('T')[0]
    const response = await fetch(`${API_BASE_URL}/api/study/schedules?userId=${userId}&date=${todayStr}`)
    const result = await response.json()
    if (result.success) {
      // 过滤出今日日程
      todaySchedules.value = (result.data || []).filter(s => s.schedule_date === todayStr)
    }
  } catch (error) {
    console.error('加载日程失败:', error)
    todaySchedules.value = []
  }
}

// 加载待办事项
const loadPendingTodos = async () => {
  try {
    const userId = 'default'
    const response = await fetch(`${API_BASE_URL}/api/study/todos?userId=${userId}`)
    const result = await response.json()
    if (result.success) {
      pendingTodos.value = (result.data || []).filter(t => !t.completed)
    }
  } catch (error) {
    console.error('加载待办失败:', error)
    pendingTodos.value = []
  }
}

// 完成待办
const completeTodo = async (todoId) => {
  try {
    const userId = 'default'
    const response = await fetch(`${API_BASE_URL}/api/study/todos/${todoId}/toggle?userId=${userId}`, {
      method: 'PUT'
    })
    if (response.ok) {
      pendingTodos.value = pendingTodos.value.filter(t => t.id !== todoId)
    }
  } catch (error) {
    console.error('完成待办失败:', error)
  }
}

// 设置文字画（供外部调用）
const setAsciiArt = (art) => {
  asciiArt.value = art
}

// 设置阵列图（供外部调用）
const setArrayDiagram = (diagram) => {
  arrayDiagram.value = diagram
}

// 加载数字人形象
const loadAvatar = async (avatarId = 'assistant_pixel') => {
  try {
    const response = await fetch(`http://localhost:3001/api/avatars/${avatarId}`)
    const result = await response.json()
    
    if (result.success && result.data) {
      const data = result.data
      avatarFrames.value = data.frames || []
      avatarColors.value = data.colors || {}
      avatarWidth.value = data.width || 32
      avatarHeight.value = data.height || 32
      avatarName.value = data.name || avatarId
      avatarType.value = data.type || 'pixel'
      avatarFilters.value = data.filters || {}
      currentAvatarFrame.value = 0
      
      // 预加载图片（如果是图片类型）
      if (avatarType.value === 'image' && data.frames) {
        await preloadAvatarImages(data.basePath, data.frames)
      }
      
      // 开始动画
      startAvatarAnimation(data.fps || 2)
    }
  } catch (error) {
    console.error('加载数字人形象失败:', error)
  }
}

// 预加载数字人图片帧
const preloadAvatarImages = async (basePath, frames) => {
  // 保持已加载的图片，避免重复加载
  const existingImages = avatarImages.value
  avatarImages.value = new Array(frames.length)
  
  const loadPromises = frames.map((frame, index) => {
    // 如果该位置已有加载完成的图片，复用它
    if (existingImages[index] && existingImages[index].complete) {
      avatarImages.value[index] = existingImages[index]
      return Promise.resolve()
    }
    
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        avatarImages.value[index] = img
        console.log(`[Avatar] 帧 ${index + 1}/${frames.length} 加载完成: ${frame.image}`)
        resolve()
      }
      img.onerror = () => {
        console.error(`[Avatar] 加载图片失败: ${frame.image}`)
        resolve()
      }
      // 使用 API 端点获取图片
      const imageUrl = `http://localhost:3001/api/avatars/${avatarName.value}/frame/${frame.image.split('/').pop()}`
      console.log(`[Avatar] 开始加载帧 ${index + 1}: ${imageUrl}`)
      img.src = imageUrl
    })
  })
  
  await Promise.all(loadPromises)
  console.log(`[Avatar] 所有 ${frames.length} 帧加载完成`)
}

// 双缓冲画布
let offscreenCanvas = null
let offscreenCtx = null

// 初始化离屏画布
const initOffscreenCanvas = (width, height) => {
  if (!offscreenCanvas) {
    offscreenCanvas = document.createElement('canvas')
    offscreenCtx = offscreenCanvas.getContext('2d')
  }
  offscreenCanvas.width = width
  offscreenCanvas.height = height
  offscreenCtx.imageSmoothingEnabled = false
}

// 绘制数字人帧
const drawAvatarFrame = () => {
  const canvas = avatarCanvas.value
  if (!canvas || avatarFrames.value.length === 0) return
  
  const ctx = canvas.getContext('2d')
  
  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  if (avatarType.value === 'image') {
    // 图片帧动画模式
    drawImageAvatarFrame(ctx, canvas)
  } else {
    // 像素画模式
    drawPixelAvatarFrame(ctx, canvas)
  }
}

// 绘制图片帧（带像素画滤镜）
const drawImageAvatarFrame = (ctx, canvas) => {
  const frame = avatarFrames.value[currentAvatarFrame.value]
  const img = avatarImages.value[currentAvatarFrame.value]
  
  if (!img || !frame) {
    // 如果当前帧未加载，尝试保持显示上一帧而不是黑屏
    return
  }
  
  const filters = avatarFilters.value
  const pixelSize = filters.pixelSize || 2
  
  // 初始化离屏画布
  initOffscreenCanvas(canvas.width, canvas.height)
  
  // 计算像素化后的尺寸
  const smallWidth = Math.ceil(canvas.width / pixelSize)
  const smallHeight = Math.ceil(canvas.height / pixelSize)
  
  // 创建缩小用的临时画布
  const smallCanvas = document.createElement('canvas')
  const smallCtx = smallCanvas.getContext('2d')
  smallCanvas.width = smallWidth
  smallCanvas.height = smallHeight
  smallCtx.imageSmoothingEnabled = false
  
  // 应用滤镜
  let filterString = ''
  if (filters.contrast) filterString += `contrast(${filters.contrast}) `
  if (filters.brightness) filterString += `brightness(${filters.brightness}) `
  if (filters.saturation) filterString += `saturate(${filters.saturation}) `
  smallCtx.filter = filterString
  
  // 在缩小画布上绘制图片
  smallCtx.drawImage(img, 0, 0, smallWidth, smallHeight)
  
  // 关闭主画布平滑处理
  ctx.imageSmoothingEnabled = false
  
  // 清空主画布并绘制像素化结果
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(smallCanvas, 0, 0, smallWidth, smallHeight, 0, 0, canvas.width, canvas.height)
}

// 绘制像素画帧
const drawPixelAvatarFrame = (ctx, canvas) => {
  const frame = avatarFrames.value[currentAvatarFrame.value]
  if (!frame || !frame.pixels) return
  
  // 计算每个像素的大小
  const pixelWidth = canvas.width / avatarWidth.value
  const pixelHeight = canvas.height / avatarHeight.value
  
  // 绘制像素
  frame.pixels.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const char = row[x]
      const color = avatarColors.value[char]
      if (color && color !== 'transparent') {
        ctx.fillStyle = color
        ctx.fillRect(x * pixelWidth, y * pixelHeight, pixelWidth, pixelHeight)
      }
    }
  })
}

// 开始数字人动画
const startAvatarAnimation = (fps) => {
  // 清除之前的定时器
  if (avatarInterval) {
    if (avatarType.value === 'image') {
      cancelAnimationFrame(avatarInterval)
    } else {
      clearInterval(avatarInterval)
    }
    avatarInterval = null
  }
  
  // 先显示第一帧
  drawAvatarFrame()
  
  if (avatarFrames.value.length <= 1) return
  
  // 如果是图片类型
  if (avatarType.value === 'image') {
    const frameInterval = 1000 / fps
    let lastFrameTime = performance.now()
    
    const animate = (currentTime) => {
      // 检查是否到达下一帧时间
      if (currentTime - lastFrameTime >= frameInterval) {
        const nextFrameIndex = (currentAvatarFrame.value + 1) % avatarFrames.value.length
        const nextImg = avatarImages.value[nextFrameIndex]
        
        // 下一帧加载完成才切换
        if (nextImg && nextImg.complete) {
          currentAvatarFrame.value = nextFrameIndex
          drawAvatarFrame()
          lastFrameTime = currentTime
          console.log(`[Avatar] 切换到帧 ${nextFrameIndex + 1}/${avatarFrames.value.length}`)
        } else {
          console.log(`[Avatar] 帧 ${nextFrameIndex + 1} 未加载完成，保持当前帧`)
        }
      }
      
      avatarInterval = requestAnimationFrame(animate)
    }
    
    avatarInterval = requestAnimationFrame(animate)
  } else {
    // 像素画模式
    avatarInterval = setInterval(() => {
      currentAvatarFrame.value = (currentAvatarFrame.value + 1) % avatarFrames.value.length
      drawAvatarFrame()
    }, 1000 / fps)
  }
}

// 停止动画
const stopAvatarAnimation = () => {
  if (avatarType.value === 'image' && avatarInterval) {
    cancelAnimationFrame(avatarInterval)
    avatarInterval = null
  } else if (avatarInterval) {
    clearInterval(avatarInterval)
    avatarInterval = null
  }
}

// 切换帧
const nextAvatarFrame = () => {
  if (avatarFrames.value.length > 0) {
    currentAvatarFrame.value = (currentAvatarFrame.value + 1) % avatarFrames.value.length
    drawAvatarFrame()
  }
}

const prevAvatarFrame = () => {
  if (avatarFrames.value.length > 0) {
    currentAvatarFrame.value = (currentAvatarFrame.value - 1 + avatarFrames.value.length) % avatarFrames.value.length
    drawAvatarFrame()
  }
}

// 切换动画播放/暂停
const toggleAvatarAnimation = () => {
  if (avatarInterval) {
    stopAvatarAnimation()
  } else {
    startAvatarAnimation(2)
  }
}

// 当前时间
const currentTime = ref('')
const lastLoginTime = ref('')
let timeInterval = null

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', { hour12: false })
  lastLoginTime.value = now.toLocaleString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false 
  })
}

// 命令历史
const commandHistory = ref([])
const historyIndex = ref(-1)

// 终端内容ref
const terminalContent = ref(null)
const commandInput = ref(null)

// 清屏
const clearScreen = () => {
  messages.value = []
  scrollToBottom()
}

// 处理键盘事件
const handleKeydown = (e) => {
  // Enter 发送
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
    return
  }
  
  // Ctrl+L 清屏
  if (e.key === 'l' && e.ctrlKey) {
    e.preventDefault()
    clearScreen()
    return
  }
  
  // Ctrl+C 取消
  if (e.key === 'c' && e.ctrlKey) {
    e.preventDefault()
    if (isTyping.value) {
      cancelRequest()
    } else {
      inputText.value = ''
    }
    return
  }
  
  // 上箭头 - 历史上一条
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (historyIndex.value < commandHistory.value.length - 1) {
      historyIndex.value++
      inputText.value = commandHistory.value[commandHistory.value.length - 1 - historyIndex.value]
    }
    return
  }
  
  // 下箭头 - 历史下一条
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (historyIndex.value > 0) {
      historyIndex.value--
      inputText.value = commandHistory.value[commandHistory.value.length - 1 - historyIndex.value]
    } else if (historyIndex.value === 0) {
      historyIndex.value = -1
      inputText.value = ''
    }
    return
  }
}

// 添加到历史
const addToHistory = (command) => {
  if (command.trim() && (commandHistory.value.length === 0 || commandHistory.value[commandHistory.value.length - 1] !== command)) {
    commandHistory.value.push(command)
    if (commandHistory.value.length > 50) {
      commandHistory.value.shift()
    }
  }
  historyIndex.value = -1
}

// 取消请求
const cancelRequest = () => {
  // 将在 fetchAIReply 中处理
  isTyping.value = false
  errorMessage.value = '请求已取消'
  setTimeout(() => { errorMessage.value = '' }, 2000)
}

// ============ Markdown & LaTeX 渲染 ============

// HTML 实体解码
const decodeHtmlEntities = (text) => {
  const entities = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' '
  }
  return text.replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, match => entities[match] || match)
}

// 配置 marked
marked.setOptions({
  breaks: true,
  gfm: true
})

// 渲染 LaTeX 公式
const renderLatex = (text) => {
  const processed = protectLatex(text)
  let html = marked.parse(processed.text)
  return restoreLatex(html, processed.formulas)
}

// 获取生成器设置（内容类型开关）
const getGeneratorSettings = () => {
  const savedSettings = localStorage.getItem('settings')
  if (savedSettings) {
    const settings = JSON.parse(savedSettings)
    if (settings.generator) {
      return {
        enablePpt: settings.generator.enablePpt !== false,
        enableMd: settings.generator.enableMd !== false,
        enableVideo: settings.generator.enableVideo !== false
      }
    }
  }
  return { enablePpt: true, enableMd: true, enableVideo: true }
}

// 检查内容类型是否启用
const isContentTypeEnabled = (type) => {
  const settings = getGeneratorSettings()
  if (type === 'ppt') return settings.enablePpt
  if (type === 'md') return settings.enableMd
  if (type === 'video') return settings.enableVideo
  return true
}

// 解析消息，拆分为内容和Action卡片
const parseMessage = (content) => {
  // 先解码 HTML 实体
  content = decodeHtmlEntities(content)
  
  const blocks = []
  const generatorSettings = getGeneratorSettings()
  
  // 更健壮的 ACTION 标记解析
  const actionRegex = /<!--ACTION:([\s\S]*?)-->/g
  let lastIndex = 0
  let match
  let actionCount = 0
  
  while ((match = actionRegex.exec(content)) !== null) {
    // 添加匹配之前的文本内容（仅当有 ACTION 前的文本时）
    const textBefore = content.slice(lastIndex, match.index).trim()
    if (textBefore) {
      // 如果是第一个 ACTION 之前的文本，显示它；否则不显示夹在中间的文本
      if (actionCount === 0) {
        blocks.push({ type: 'content', html: renderLatex(textBefore) })
      }
      // 中间的文本不显示（即夹在两个 ACTION 之间的文本被丢弃）
    }
    
    // 解析 ACTION JSON
    try {
      const action = JSON.parse(match[1])
      // 检查内容类型是否启用
      if (action.options && action.options.length > 0) {
        const type = action.options[0]
        if (!isContentTypeEnabled(type)) {
          // 类型未启用，跳过此Action
          lastIndex = match.index + match[0].length
          actionCount++
          continue
        }
      }
      blocks.push({ type: 'action', data: action })
      actionCount++
    } catch (e) {
      console.error('解析ACTION失败:', e)
      // 如果解析失败，也当作文本处理
      blocks.push({ type: 'content', html: match[0] })
    }
    
    lastIndex = match.index + match[0].length
  }
  
  // 添加最后剩余的文本内容（只在没有 ACTION 或只有一个 ACTION 时显示）
  const remainingText = content.slice(lastIndex).trim()
  if (remainingText) {
    // 如果只有一个或没有 ACTION，显示剩余文本
    if (actionCount <= 1) {
      blocks.push({ type: 'content', html: renderLatex(remainingText) })
    }
  }
  
  return blocks
}

// 保护 LaTeX 公式不被 Markdown 处理
const protectLatex = (text) => {
  const formulas = []
  
  // 保护块级公式 $$...$$
  text = text.replace(/\$\$[\s\S]*?\$\$/g, (match) => {
    formulas.push(match)
    return `{{LATEX:${formulas.length - 1}}}`
  })
  
  // 保护行内公式 $...$
  text = text.replace(/\$[^$\n]+?\$/g, (match) => {
    formulas.push(match)
    return `{{LATEX:${formulas.length - 1}}}`
  })
  
  return { text, formulas }
}

// 恢复被保护的 LaTeX 公式并渲染
const restoreLatex = (html, formulas) => {
  formulas.forEach((formula, index) => {
    const isBlock = formula.startsWith('$$')
    const formulaContent = formula.slice(isBlock ? 2 : 1, isBlock ? -2 : -1).trim()
    
    try {
      const rendered = katex.renderToString(formulaContent, {
        throwOnError: false,
        displayMode: isBlock
      })
      html = html.replace(`{{LATEX:${index}}}`, isBlock ? `<div class="katex-block">${rendered}</div>` : rendered)
    } catch (e) {
      html = html.replace(`{{LATEX:${index}}}`, isBlock ? `<div class="katex-block">${formula}</div>` : formula)
    }
  })
  return html
}

// 获取生成器配置
const getGeneratorConfig = () => {
  const savedSettings = localStorage.getItem('settings')
  if (savedSettings) {
    const settings = JSON.parse(savedSettings)
    if (settings.generator) {
      return {
        provider: settings.generator.provider || 'siliconflow',
        endpoint: settings.generator.endpoint || '',
        apiKey: settings.generator.apiKey || '',
        model: settings.generator.model || '',
        timeout: settings.generator.timeout || 120,
        maxTokens: settings.generator.maxTokens || 8192,
        temperature: settings.generator.temperature || 0.8
      }
    }
  }
  return null
}

// 处理 Action 确认
const handleActionConfirm = async (action) => {
  const type = action.options[0]
  const prompt = action.prompt
  const generatorPrompt = action.generator_prompt
  
  // 检查内容类型是否启用
  if (!isContentTypeEnabled(type)) {
    alert('该内容类型未在设置中启用')
    return
  }
  
  // 获取生成器配置
  const generatorConfig = getGeneratorConfig()
  if (!generatorConfig || !generatorConfig.apiKey) {
    // 如果没有配置，跳转到设置页面
    alert('请先在设置中配置内容生成API')
    router.push('/settings#section-generator')
    return
  }
  
  // 先创建任务
  let taskId = null
  const typeNames = { ppt: 'PPT 演示文稿', md: 'Markdown 笔记', video: '视频脚本' }
  try {
    const taskResponse = await fetch(`${API_BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        title: `${typeNames[type]}: ${prompt.slice(0, 20)}${prompt.length > 20 ? '...' : ''}`,
        description: `正在生成 ${typeNames[type]}`
      })
    })
    const taskData = await taskResponse.json()
    if (taskData.success) {
      taskId = taskData.taskId
      // 触发任务创建事件，通知 TaskFloatPanel
      window.dispatchEvent(new CustomEvent('task-created', { detail: { taskId } }))
    }
  } catch (e) {
    console.error('创建任务失败:', e)
  }
  
  // 显示正在生成的消息（带进度）
  const generatingMsgId = Date.now()
  const generatingMsg = {
    id: generatingMsgId,
    role: 'ai',
    content: `<div class="flex flex-col gap-2">
      <div class="flex items-center gap-2">
        <span class="loading loading-spinner loading-sm text-primary"></span>
        <span>正在生成 ${typeNames[type]}...</span>
      </div>
      <div id="progress-container-${generatingMsgId}" class="text-xs text-base-content/60">准备中...</div>
    </div>`,
    time: getTime()
  }
  messages.value.push(generatingMsg)
  scrollToBottom()
  
  // 轮询任务状态更新进度
  let pollInterval = null
  const startPolling = () => {
    pollInterval = setInterval(async () => {
      if (!taskId) return
      try {
        const res = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`)
        const data = await res.json()
        if (data.success) {
          const task = data.data
          const progressText = getProgressText(task.progress, task.status)
          const container = document.getElementById(`progress-container-${generatingMsgId}`)
          if (container) {
            container.innerHTML = `
              <div class="flex items-center gap-2">
                <div class="flex-1 h-1.5 bg-base-300 rounded-full overflow-hidden">
                  <div class="h-full bg-primary transition-all duration-300" style="width: ${task.progress}%"></div>
                </div>
                <span>${task.progress}%</span>
              </div>
              <div class="mt-1">${progressText}</div>
            `
          }
          
          // 如果任务完成或失败，停止轮询
          if (task.status === 'completed' || task.status === 'failed') {
            clearInterval(pollInterval)
          }
        }
      } catch (e) {
        console.error('轮询任务状态失败:', e)
      }
    }, 500)
  }
  
  const getProgressText = (progress, status) => {
    if (status === 'failed') return '生成失败'
    if (progress <= 10) return '正在初始化...'
    if (progress <= 30) return 'AI 正在生成内容...'
    if (progress <= 50) return '内容生成完成，准备处理...'
    if (progress <= 60) return '正在生成文件...'
    if (progress <= 80) return '正在保存文件...'
    if (progress <= 90) return '正在导入学习中心...'
    return '生成完成!'
  }
  
  startPolling()
  
  try {
    // 调用生成 API（后端统一处理 PPT/MD/视频生成）
    const response = await fetch(`${API_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: generatorPrompt || prompt,
        type,
        title: prompt,
        apiConfig: generatorConfig,
        taskId
      })
    })
    
    const data = await response.json()
    
    // 停止轮询
    if (pollInterval) {
      clearInterval(pollInterval)
    }
    
    if (data.success) {
      // 删除生成中的消息
      messages.value = messages.value.filter(m => m.id !== generatingMsgId)
      
      // 构建结果消息
      let resultContent = `<p class="text-success font-semibold">✓ 已成功生成 "${prompt}" 并导入学习中心！</p>`
      resultContent += `<p class="text-base-content/70 text-sm mt-2">文件类型：${typeNames[type]}</p>`
      
      if (data.data.slideCount) {
        resultContent += `<p class="text-base-content/60 text-sm mt-1">共 ${data.data.slideCount} 张幻灯片</p>`
      }
      
      // 添加预览和下载按钮
      if (data.data.filePath) {
        const fileId = data.data.id || Date.now()
        resultContent += `<div class="flex items-center gap-2 mt-3">`
        // 预览按钮
        resultContent += `<button onclick="window.open('${data.data.filePath}', '_blank')" class="btn btn-sm btn-primary gap-1">`
        resultContent += `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>`
        resultContent += `预览</button>`
        // 下载按钮
        resultContent += `<a href="${data.data.filePath}" download class="btn btn-sm btn-outline gap-1">`
        resultContent += `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>`
        resultContent += `下载</a>`
        // 学习中心跳转按钮
        if (data.data.id) {
          resultContent += `<button onclick="window.location.href='/learning-center?file=${data.data.id}'" class="btn btn-sm btn-secondary gap-1">`
          resultContent += `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>`
          resultContent += `学习中心</button>`
        }
        resultContent += `</div>`
      }
      
      resultContent += `<p class="text-base-content/40 text-xs mt-3">文件已保存至学习中心，可随时查看和管理</p>`
      
      // 添加生成结果
      const resultMsg = {
        id: Date.now(),
        role: 'ai',
        content: resultContent,
        time: getTime()
      }
      messages.value.push(resultMsg)
    } else {
      throw new Error(data.error || '生成失败')
    }
  } catch (error) {
    // 停止轮询
    if (pollInterval) {
      clearInterval(pollInterval)
    }
    
    // 删除生成中的消息
    messages.value = messages.value.filter(m => m.id !== generatingMsgId)
    
    // 添加错误消息
    const errorMsg = {
      id: Date.now(),
      role: 'ai',
      content: `<p class="text-error">✗ 生成失败：${error.message}</p>
        <p class="text-base-content/60 text-sm mt-2">请检查内容生成API配置是否正确</p>`,
      time: getTime()
    }
    messages.value.push(errorMsg)
  }
  
  scrollToBottom()
}

// 头像 - 从设置中获取用户头像，AI头像使用本地图片
// 消息数组
const messages = ref([])
const inputText = ref('')
const isTyping = ref(false)
const sessionId = ref(null)
const errorMessage = ref('')

// 会话列表（保留用于会话管理）
const sessions = ref([])

// 创建新会话
const createNewSession = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/new-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    const data = await response.json()
    if (data.success) {
      sessionId.value = data.sessionId
      messages.value = []
      loadSessions()
    }
  } catch (error) {
    console.error('创建会话失败:', error)
    sessionId.value = `local_${Date.now()}`
    messages.value = []
    const localSessions = JSON.parse(localStorage.getItem('chat_sessions') || '[]')
    localSessions.unshift({
      sessionId: sessionId.value,
      firstMessage: '新对话',
      lastTime: getTime(),
      messageCount: 0
    })
    sessions.value = localSessions
    localStorage.setItem('chat_sessions', JSON.stringify(localSessions))
  }
}

// 加载历史记录
const loadHistory = async (sid) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/history/${sid}`)
    const data = await response.json()
    if (data.success) {
      messages.value = data.data.map((msg, index) => ({
        id: Date.now() + index,
        role: msg.role === 'user' ? 'user' : 'ai',
        content: msg.content,
        time: msg.time || getTime()
      }))
      await scrollToBottom()
    } else {
      messages.value = []
    }
  } catch (error) {
    console.log('加载历史记录失败')
    messages.value = []
  }
}

// API 配置（从设置页面读取）
const getApiConfig = () => {
  const savedSettings = localStorage.getItem('settings')
  if (savedSettings) {
    const settings = JSON.parse(savedSettings)
    if (settings.api) {
      return {
        provider: settings.api.provider || 'openai',
        endpoint: settings.api.endpoint || '',
        apiKey: settings.api.apiKey || '',
        model: settings.api.model || '',
        timeout: settings.api.timeout || 60,
        maxTokens: settings.api.maxTokens || 1000,
        temperature: settings.api.temperature || 0.7
      }
    }
  }
  return null
}

// 获取当前选中的提示词
const getCurrentPrompt = () => {
  const savedSettings = localStorage.getItem('settings')
  if (savedSettings) {
    const settings = JSON.parse(savedSettings)
    if (settings.promptConfig) {
      const { activePrompt, userPrompts } = settings.promptConfig
      if (activePrompt && activePrompt.startsWith('user_')) {
        const userPrompt = (userPrompts || []).find(p => p.id === activePrompt)
        if (userPrompt) {
          return { activePrompt, customPrompt: userPrompt.content }
        }
      }
      return { activePrompt: activePrompt || 'preset_renko', customPrompt: null }
    }
  }
  return { activePrompt: 'preset_renko', customPrompt: null }
}

// 生成简短时间戳
const getTime = () => {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (terminalContent.value) {
    terminalContent.value.scrollTop = terminalContent.value.scrollHeight
  }
}

// 添加消息
const addMessage = (role, content) => {
  messages.value.push({
    id: Date.now() + Math.random(),
    role,
    content,
    time: getTime(),
  })
  scrollToBottom()
  loadSessions()
}

// 加载会话列表
const loadSessions = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/sessions`)
    const data = await response.json()
    if (data.success) {
      sessions.value = data.data
    }
  } catch (error) {
    // 离线模式，使用本地存储
    const localSessions = JSON.parse(localStorage.getItem('chat_sessions') || '[]')
    if (localSessions.length > 0) {
      sessions.value = localSessions
    }
  }
}

// 切换会话
const switchSession = async (sid) => {
  if (sid === sessionId.value) return
  sessionId.value = sid
  messages.value = []
  await loadHistory(sid)
}

// 调用 AI API 获取回复（流式）
const fetchAIReply = async (userMessage) => {
  isTyping.value = true
  errorMessage.value = ''
  scrollToBottom()

  try {
    // 获取 API 配置
    const apiConfig = getApiConfig()

    if (!apiConfig || !apiConfig.apiKey) {
      throw new Error('请先在设置中配置API密钥')
    }

    // 获取当前选中的提示词
    const { activePrompt, customPrompt } = getCurrentPrompt()

    // 创建 AI 消息占位
    const aiMsgId = Date.now()
    const aiMsg = {
      id: aiMsgId,
      role: 'ai',
      content: '',
      time: getTime()
    }
    messages.value.push(aiMsg)
    await scrollToBottom()

    // 使用流式 API
    const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sessionId.value,
        message: userMessage,
        history: messages.value.slice(0, -1).map(msg => ({
          role: msg.role === 'user' ? 'user' : 'ai',
          content: msg.content,
          time: msg.time
        })),
        apiConfig: apiConfig,
        promptId: activePrompt,
        customPrompt: customPrompt
      })
    })

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      
      // 处理 SSE 数据
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))

            if (data.type === 'chunk') {
              // 更新消息内容
              aiMsg.content += data.content
              // 触发响应式更新
              messages.value = [...messages.value]
              await scrollToBottom()
            } else if (data.type === 'done') {
              aiMsg.content = data.content
              aiMsg.time = data.time
              messages.value = [...messages.value]
            } else if (data.type === 'error') {
              throw new Error(data.error)
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
  } catch (error) {
    console.error('AI 回复失败:', error)
    errorMessage.value = `请求失败: ${error.message}`
    
    // 移除空消息或更新为错误回复
    const lastMsg = messages.value[messages.value.length - 1]
    if (lastMsg && lastMsg.role === 'ai' && !lastMsg.content) {
      messages.value.pop()
    }
    addMessage('ai', getSimulatedReply(userMessage))
  } finally {
    isTyping.value = false
  }
}

// 模拟回复（降级处理）
const getSimulatedReply = (userMessage) => {
  if (userMessage.includes('你好') || userMessage.includes('您好')) {
    return '你好！很高兴为你服务～'
  } else if (userMessage.includes('天气')) {
    return '抱歉，我暂时无法查询实时天气。你可以尝试描述你想要的功能。'
  } else if (userMessage.includes('谢谢')) {
    return '不客气！有任何问题随时问我 😊'
  } else {
    return `你说了："${userMessage}"。这是离线模式回复。请确保后端服务已启动 (npm run server)。`
  }
}

// 发送消息
const sendMessage = async () => {
  const text = inputText.value.trim()
  if (!text || isTyping.value) return

  // 添加到历史
  addToHistory(text)

  if (!sessionId.value) {
    await createNewSession()
  }

  addMessage('user', text)
  inputText.value = ''

  await fetchAIReply(text)
}

// 清空聊天记录
const clearMessages = () => {
  if (messages.value.length === 0) return
  messages.value = []
  loadSessions()
}

// 监听消息变化
watch(messages, () => scrollToBottom(), { deep: true })

// 加载提示符颜色设置
const loadPromptColors = () => {
  const savedSettings = localStorage.getItem('settings')
  if (savedSettings) {
    const settings = JSON.parse(savedSettings)
    if (settings.promptColors) {
      const root = document.documentElement
      root.style.setProperty('--prompt-color-1', settings.promptColors.color1 || '#7CD9FF')
      root.style.setProperty('--prompt-color-2', settings.promptColors.color2 || '#BDADFF')
      root.style.setProperty('--prompt-color-3', settings.promptColors.color3 || '#FF5991')
      root.style.setProperty('--prompt-text-color-1', settings.promptColors.textColor1 || '#1a1a2e')
      root.style.setProperty('--prompt-text-color-2', settings.promptColors.textColor2 || '#1a1a2e')
      root.style.setProperty('--prompt-text-color-3', settings.promptColors.textColor3 || '#ffffff')
    }
  }
}

// 组件挂载时初始化
onMounted(async () => {
  // 加载提示符颜色
  loadPromptColors()
  
  // 启动时间更新
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  
  // 点击终端区域聚焦输入框
  if (terminalContent.value) {
    terminalContent.value.addEventListener('click', () => {
      // 点击时聚焦到输入行
      const inputLine = document.querySelector('.current-input-line')
      if (inputLine) {
        inputLine.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    })
  }
  
  await loadSessions()
  
  const urlParams = new URLSearchParams(window.location.search)
  const urlSessionId = urlParams.get('session')
  
  if (urlSessionId) {
    sessionId.value = urlSessionId
    await loadHistory(urlSessionId)
  } else if (sessions.value.length > 0) {
    // 自动选择最后一轮对话
    const lastSession = sessions.value[0] // sessions 是反转后的，最新的在前面
    sessionId.value = lastSession.sessionId
    await loadHistory(lastSession.sessionId)
  } else {
    // 没有会话则新建
    await createNewSession()
  }
  
  // 加载数字人形象（默认使用文件夹结构的图片帧动画）
  await loadAvatar('assistant_character')
  
  // 加载番茄钟设置
  loadPomodoroSettings()
  
  // 加载日程和待办
  await loadTodaySchedules()
  await loadPendingTodos()
  
  // 监听设置变更
  window.addEventListener('study-settings-changed', handleStudySettingsChanged)
})

// 组件卸载时清理
onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
  // 停止数字人动画
  stopAvatarAnimation()
  // 停止番茄钟
  if (pomodoroTimer) {
    clearInterval(pomodoroTimer)
  }
  window.removeEventListener('study-settings-changed', handleStudySettingsChanged)
})

// 处理学习设置变更
const handleStudySettingsChanged = (e) => {
  if (e.detail) {
    pomodoroSettings.value = { ...pomodoroSettings.value, ...e.detail }
    if (!pomodoroRunning.value) {
      pomodoroTimeLeft.value = pomodoroSettings.value.workMinutes * 60
      pomodoroProgress.value = 100
    }
  }
}
</script>

<style scoped>
/* Fish Terminal 风格样式 - 适配 daisyUI */

/* 终端容器样式 */
.terminal-container {
  font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', 'Monaco', 'Inconsolata', 'Consolas', 'Source Code Pro', monospace;
  background: hsl(var(--b1));
  color: hsl(var(--bc));
}

/* 侧边栏 */
.sessions-sidebar {
  background: hsl(var(--b2));
  transition: width 0.2s ease;
}

/* 侧边栏头部 */
.sidebar-header {
  background: linear-gradient(180deg, hsl(var(--bc) / 0.03) 0%, transparent 100%);
}

/* 侧边栏底部 */
.sidebar-footer {
  background: linear-gradient(0deg, hsl(var(--bc) / 0.02) 0%, transparent 100%);
}

/* Fish 提示符栏 - Oh My Bash 风格 */
.posh-prompt-bar {
  background: linear-gradient(90deg, 
    hsl(var(--b2) / 0.8) 0%, 
    hsl(var(--b2) / 0.4) 50%,
    transparent 100%);
  border-bottom: 1px solid hsl(var(--bc) / 0.08);
  position: relative;
}

.posh-prompt-bar::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, 
    hsl(var(--p)) 0%, 
    hsl(var(--s)) 50%,
    hsl(var(--a)) 100%);
  opacity: 0.6;
}

.posh-prompt-bar .prompt-line {
  gap: 0;
}

.posh-prompt-bar .prompt-item {
  font-size: 12px;
  letter-spacing: 0.3px;
  box-shadow: 0 1px 2px hsl(var(--bc) / 0.1);
}

.posh-prompt-bar .prompt-user {
  background: linear-gradient(135deg, 
    hsl(var(--p) / 0.9) 0%, 
    hsl(var(--p) / 0.7) 100%);
  color: hsl(var(--pc));
}

.posh-prompt-bar .prompt-path {
  background: linear-gradient(135deg, 
    hsl(var(--s) / 0.85) 0%, 
    hsl(var(--s) / 0.65) 100%);
  color: hsl(var(--sc));
}

.posh-prompt-bar .prompt-branch {
  background: linear-gradient(135deg, 
    hsl(var(--a) / 0.8) 0%, 
    hsl(var(--a) / 0.6) 100%);
  color: hsl(var(--ac));
  padding-right: 12px;
}

/* 左侧会话列表滚动条 */
.sessions-list::-webkit-scrollbar {
  width: 4px;
}
.sessions-list::-webkit-scrollbar-track {
  background: transparent;
}
.sessions-list::-webkit-scrollbar-thumb {
  background: hsl(var(--bc) / 0.1);
  border-radius: 2px;
}
.sessions-list::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--bc) / 0.2);
}

/* 终端内容区域滚动条 */
.terminal-content::-webkit-scrollbar {
  width: 8px;
}
.terminal-content::-webkit-scrollbar-track {
  background: transparent;
}
.terminal-content::-webkit-scrollbar-thumb {
  background: hsl(var(--bc) / 0.1);
  border-radius: 4px;
}
.terminal-content::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--bc) / 0.2);
}

/* 终端输入框 */
.terminal-input input {
  caret-color: hsl(var(--p));
}

/* 消息样式 */
.message-block {
  font-size: 0.95rem;
  line-height: 1.5;
}

.user-message pre {
  font-family: inherit;
}

/* Markdown 内容样式 - Fish 终端风格 */
.markdown-content {
  font-size: 0.95rem;
  line-height: 1.6;
  color: hsl(var(--bc) / 0.9);
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4 {
  color: hsl(var(--bc));
  margin: 0.75rem 0 0.5rem 0;
  font-weight: 600;
  font-family: inherit;
}

.markdown-content h1 { 
  font-size: 1.25rem; 
  border-bottom: 1px solid hsl(var(--bc) / 0.1); 
  padding-bottom: 0.25rem;
}
.markdown-content h2 { font-size: 1.15rem; }
.markdown-content h3 { font-size: 1.05rem; }

.markdown-content p {
  margin: 0.5rem 0;
}

.markdown-content ul,
.markdown-content ol {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.markdown-content li {
  margin: 0.25rem 0;
}

.markdown-content li::marker {
  color: hsl(var(--bc) / 0.4);
}

.markdown-content code {
  background: hsl(var(--bc) / 0.1);
  color: hsl(var(--s));
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-family: inherit;
  font-size: 0.875em;
}

.markdown-content pre {
  background: hsl(var(--b3));
  border: 1px solid hsl(var(--bc) / 0.1);
  padding: 0.75rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 0.5rem 0;
}

.markdown-content pre code {
  background: none;
  padding: 0;
  color: hsl(var(--bc));
  border: none;
}

.markdown-content blockquote {
  border-left: 3px solid hsl(var(--bc) / 0.3);
  padding-left: 1rem;
  margin: 0.5rem 0;
  color: hsl(var(--bc) / 0.7);
  font-style: italic;
  background: hsl(var(--bc) / 0.02);
  padding: 0.5rem 1rem;
  border-radius: 0 0.25rem 0.25rem 0;
}

.markdown-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 0.5rem 0;
}

.markdown-content th,
.markdown-content td {
  border: 1px solid hsl(var(--bc) / 0.1);
  padding: 0.375rem 0.75rem;
  text-align: left;
}

.markdown-content th {
  background: hsl(var(--bc) / 0.05);
  font-weight: 600;
  color: hsl(var(--p));
}

.markdown-content tr:nth-child(even) {
  background: hsl(var(--bc) / 0.02);
}

.markdown-content a {
  color: hsl(var(--a));
  text-decoration: none;
  border-bottom: 1px dashed hsl(var(--a) / 0.5);
}

.markdown-content a:hover {
  color: hsl(var(--af));
  border-bottom-color: hsl(var(--af));
}

.markdown-content hr {
  border: none;
  border-top: 1px solid hsl(var(--bc) / 0.1);
  margin: 1rem 0;
}

/* KaTeX 块级公式 */
.markdown-content .katex-block {
  overflow-x: auto;
  padding: 0.5rem 0;
  text-align: center;
}

/* 打字指示器动画 */
@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* ========== Oh My Bash 三段箭头提示符样式 - 优化配色 ========== */
.prompt-line {
  display: flex;
  align-items: center;
  font-size: 13px;
}

/* 主体色块 - 圆角半圆设计，一层一层插入 */
.prompt-item {
  padding: 4px 8px 4px 18px;
  position: relative;
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 13px;
  height: 26px;
  border-radius: 0 13px 13px 0;
  margin-left: -10px;
  box-sizing: border-box;
}

/* 第一个item左边是直角，右边半圆 */
.prompt-item:first-child {
  border-radius: 13px 13px 13px 0;
  padding-left: 14px;
  margin-left: 0;
}

/* 第一段：user@localhost / ai@UsamiRenko */
.prompt-user, .prompt-ai {
  background: var(--prompt-color-1, #7CD9FF);
  color: var(--prompt-text-color-1, #1a1a2e);
  z-index: 3;
}

/* 第二段：路径 / response */
.prompt-path, .prompt-ai-path {
  background: var(--prompt-color-2, #BDADFF);
  color: var(--prompt-text-color-2, #1a1a2e);
  z-index: 2;
}

/* 第三段：❯ */
.prompt-branch, .prompt-ai-branch {
  background: var(--prompt-color-3, #FF5991);
  color: var(--prompt-text-color-3, #fff);
  z-index: 1;
}

/* ========== 终端输入行 ========== */
.terminal-command-line {
  display: flex;
  align-items: center;
  min-height: 22px;
  position: relative;
}

/* 终端输入行 - 模拟真实终端 */
.terminal-command-line {
  display: flex;
  align-items: center;
  min-height: 22px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 13px;
  cursor: text;
}

.typed-text {
  color: #e5e5e5;
  white-space: pre;
}

/* 闪烁光标 - 白框，跟随文字 */
.cursor-blink {
  display: inline-block;
  width: 8px;
  height: 16px;
  background: #fff;
  border: 1px solid #fff;
  animation: blink 1s step-end infinite;
  margin-left: 2px;
  vertical-align: middle;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* 当前输入行 */
.current-input-line {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 选中文字颜色 */
.terminal-container ::selection {
  background: hsl(var(--p) / 0.3);
  color: hsl(var(--pc));
}

/* Focus outline for accessibility */
button:focus-visible,
input:focus-visible {
  outline: 2px solid hsl(var(--p) / 0.5);
  outline-offset: 2px;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

.list-enter-active,
.list-leave-active {
  transition: all 0.2s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

/* ========== 右侧可视化面板样式 ========== */
.visual-panel {
  min-width: 380px;
  max-width: 480px;
}

.visual-panel .logo-ascii {
  background: linear-gradient(180deg, 
    hsl(var(--b2) / 0.6) 0%, 
    hsl(var(--b2) / 0.2) 100%);
}

.visual-panel .logo-ascii pre {
  text-shadow: 0 0 10px hsl(var(--p) / 0.3);
  letter-spacing: -0.5px;
}

/* 数字人展示区域 */
.visual-panel .avatar-display {
  background: linear-gradient(180deg, 
    hsl(var(--b2) / 0.3) 0%, 
    hsl(var(--b2) / 0.1) 100%);
}

.visual-panel .avatar-container {
  position: relative;
  overflow: hidden;
}

/* 扫描线效果 */
.visual-panel .scanlines {
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.3) 2px,
    rgba(0, 0, 0, 0.3) 4px
  );
  animation: scanlineMove 8s linear infinite;
}

@keyframes scanlineMove {
  0% { transform: translateY(0); }
  100% { transform: translateY(4px); }
}

.visual-panel .avatar-canvas {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
  width: 100% !important;
  height: 100% !important;
}

.visual-panel .panel-header {
  background: hsl(var(--b2) / 0.5);
}

.visual-panel .panel-content {
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--bc) / 0.2) transparent;
}

.visual-panel .panel-content::-webkit-scrollbar {
  width: 4px;
}

.visual-panel .panel-content::-webkit-scrollbar-track {
  background: transparent;
}

.visual-panel .panel-content::-webkit-scrollbar-thumb {
  background: hsl(var(--bc) / 0.2);
  border-radius: 2px;
}

.visual-panel .ascii-art {
  line-height: 1.2;
  color: hsl(var(--p));
}

.visual-panel .array-diagram {
  border: 1px solid hsl(var(--bc) / 0.1);
}

.visual-panel .array-diagram pre {
  line-height: 1.4;
  color: hsl(var(--s));
}

/* 番茄钟区域样式 */
.pomodoro-section {
  background: linear-gradient(180deg, 
    hsl(var(--b2) / 0.2) 0%, 
    transparent 100%);
}

.pomodoro-section .btn-xs {
  min-height: 1.5rem;
  height: 1.5rem;
  padding-left: 0.375rem;
  padding-right: 0.375rem;
}

/* 日程区域样式 */
.schedule-section {
  background: linear-gradient(180deg, 
    hsl(var(--b2) / 0.1) 0%, 
    transparent 100%);
}

.schedule-section .overflow-y-auto::-webkit-scrollbar,
.todo-section .overflow-y-auto::-webkit-scrollbar {
  width: 3px;
}

.schedule-section .overflow-y-auto::-webkit-scrollbar-thumb,
.todo-section .overflow-y-auto::-webkit-scrollbar-thumb {
  background: hsl(var(--bc) / 0.15);
  border-radius: 2px;
}

/* 待办区域样式 */
.todo-section {
  background: linear-gradient(180deg, 
    hsl(var(--b2) / 0.1) 0%, 
    transparent 100%);
}

.todo-section .checkbox-xs {
  width: 0.875rem;
  height: 0.875rem;
}

/* 响应式：小屏幕隐藏面板 */
@media (max-width: 1024px) {
  .visual-panel {
    display: none;
  }
}
</style>
