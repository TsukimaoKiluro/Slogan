<template>
  <div class="settings-container h-full p-6 overflow-y-auto" :data-theme="appearanceForm.theme === 'auto' ? '' : appearanceForm.theme">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold">设置</h1>
      
      <!-- 栏目选择器 -->
      <div class="dropdown dropdown-end">
        <label tabindex="0" class="btn btn-outline btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
          选择栏目
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 9l6 6 6-6"></path>
          </svg>
        </label>
        <ul tabindex="0" class="dropdown-content z-50 menu p-2 shadow-lg bg-base-100 rounded-box w-52">
          <li><a @click="scrollToSection('profile')">用户信息</a></li>
          <li><a @click="scrollToSection('api')">智能对话API</a></li>
          <li><a @click="scrollToSection('generator')">内容生成API</a></li>
          <li><a @click="scrollToSection('exam')">考试生成API</a></li>
          <li><a @click="scrollToSection('study')">学习计划</a></li>
          <li><a @click="scrollToSection('appearance')">外观设置</a></li>
          <li><a @click="scrollToSection('notification')">通知设置</a></li>
        </ul>
      </div>
    </div>

    <!-- 设置内容区域 -->
    <div class="max-w-4xl mx-auto space-y-6">
      
      <!-- 用户信息 -->
      <div id="section-profile" class="card bg-base-100 shadow-xl scroll-mt-20">
        <div class="card-body">
          <div class="flex items-center gap-2 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <h2 class="card-title text-xl">用户信息</h2>
          </div>

          <!-- 头像预览 -->
          <div class="flex items-center gap-6 mb-6">
            <div class="avatar">
              <div class="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img :src="userForm.avatar || 'https://img.daisyui.com/images/profile/demo/gordon@192.webp'" />
              </div>
            </div>
            <div>
              <label class="btn btn-primary btn-sm">
                <input type="file" accept="image/*" class="hidden" @change="handleAvatarChange" />
                更换头像
              </label>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label"><span class="label-text">用户名</span></label>
              <label class="input input-bordered flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <input v-model="userForm.username" type="text" placeholder="请输入用户名" class="grow" />
              </label>
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text">邮箱</span></label>
              <label class="input input-bordered flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <input v-model="userForm.email" type="email" placeholder="请输入邮箱" class="grow" />
              </label>
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text">昵称</span></label>
              <label class="input input-bordered flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
                <input v-model="userForm.nickname" type="text" placeholder="请输入昵称" class="grow" />
              </label>
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text">电话</span></label>
              <label class="input input-bordered flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <input v-model="userForm.phone" type="tel" placeholder="请输入电话号码" class="grow" />
              </label>
            </div>
          </div>

          <div class="form-control mt-4">
            <label class="label"><span class="label-text">个人简介</span></label>
            <textarea v-model="userForm.bio" class="textarea textarea-bordered h-24" placeholder="介绍一下自己..."></textarea>
          </div>

          <div class="card-actions justify-end mt-6">
            <button class="btn btn-ghost" @click="resetUserForm">重置</button>
            <button class="btn btn-primary" @click="saveUserInfo">保存</button>
          </div>
        </div>
      </div>

      <!-- 学习计划设置 -->
      <div id="section-study" class="card bg-base-100 shadow-xl scroll-mt-20">
        <div class="card-body">
          <div class="flex items-center gap-2 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h2 class="card-title text-xl">学习计划</h2>
          </div>
          <p class="text-sm text-base-content/60 mb-4">配置番茄钟和待办清单等学习功能的相关设置。</p>

          <!-- 番茄钟设置 -->
          <div class="space-y-4">
            <div class="form-control">
              <label class="label"><span class="label-text">工作时长（分钟）</span></label>
              <input v-model.number="studyForm.workMinutes" type="number" min="15" max="60" step="5" class="input input-bordered" />
              <label class="label"><span class="label-text-alt text-base-content/60">专注工作时长，建议 25-50 分钟</span></label>
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text">短休息时长（分钟）</span></label>
              <input v-model.number="studyForm.breakMinutes" type="number" min="3" max="15" step="1" class="input input-bordered" />
              <label class="label"><span class="label-text-alt text-base-content/60">工作之间的休息时长，建议 5 分钟左右</span></label>
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text">长休息时长（分钟）</span></label>
              <input v-model.number="studyForm.longBreakMinutes" type="number" min="10" max="30" step="5" class="input input-bordered" />
              <label class="label"><span class="label-text-alt text-base-content/60">完成 4 个番茄钟后的休息时长</span></label>
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text">自动开始下一个番茄钟</span></label>
              <label class="cursor-pointer label justify-start gap-4">
                <input type="checkbox" v-model="studyForm.autoStartNext" class="toggle toggle-primary" />
                <span class="label-text">休息结束后自动开始新的专注时段</span>
              </label>
            </div>
          </div>

          <div class="card-actions justify-end mt-6">
            <button class="btn btn-ghost" @click="resetStudyForm">重置</button>
            <button class="btn btn-primary" @click="saveStudyConfig">保存</button>
          </div>
        </div>
      </div>

      <!-- 智能对话API配置 -->
      <div id="section-api" class="card bg-base-100 shadow-xl scroll-mt-20">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <h2 class="card-title text-xl">智能对话API</h2>
            </div>
            <span class="badge badge-outline badge-sm">对话助手</span>
          </div>
          <p class="text-sm text-base-content/60 mb-4">配置智能对话助手（如GPT、Claude等）的API连接，未来将支持接入更多智能体。</p>

          <div class="form-control">
            <label class="label"><span class="label-text">API 服务商</span></label>
            <select v-model="apiForm.provider" class="select select-bordered">
              <option value="siliconflow">硅基流动（国内推荐）</option>
              <option value="dashscope">阿里云百炼（DashScope）</option>
              <option value="coze">Coze扣子平台</option>
              <option value="openai">OpenAI</option>
              <option value="claude">Claude (Anthropic)</option>
              <option value="gemini">Google Gemini</option>
              <option value="custom">自定义</option>
            </select>
          </div>

          <div class="form-control mt-4">
            <label class="label">
              <span class="label-text">API 端点</span>
              <span class="label-text-alt text-error" v-if="apiForm.provider === 'custom'">必填</span>
            </label>
            <label class="input input-bordered flex items-center gap-2" :class="{ 'input-disabled': apiForm.provider !== 'custom' }">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
              <input v-model="apiForm.endpoint" type="text" :placeholder="getEndpointPlaceholder()" class="grow" :disabled="apiForm.provider !== 'custom'" />
            </label>
            <label class="label" v-if="apiForm.provider !== 'custom'">
              <span class="label-text-alt text-base-content/60">使用默认端点</span>
            </label>
          </div>

          <div class="form-control mt-4">
            <label class="label"><span class="label-text">API 密钥</span></label>
            <label class="input input-bordered flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
              </svg>
              <input v-model="apiForm.apiKey" :type="showApiKey ? 'text' : 'password'" placeholder="sk-xxxxxxxxxxxxxxxx" class="grow" />
              <button type="button" class="btn btn-ghost btn-sm btn-square" @click="showApiKey = !showApiKey">
                <svg v-if="!showApiKey" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </button>
            </label>
          </div>

          <div class="form-control mt-4">
            <label class="label">
              <span class="label-text">模型</span>
              <button class="btn btn-xs btn-ghost gap-1" @click="syncApiModels" :disabled="loadingApiModels">
                <span v-if="loadingApiModels" class="loading loading-spinner loading-xs"></span>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 4v6h-6M1 20v-6h6"></path>
                  <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"></path>
                </svg>
                同步模型
              </button>
            </label>
            <div class="dropdown w-full">
              <label tabindex="0" class="input input-bordered flex items-center gap-2 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
                <span class="grow">{{ getSelectedModelName(apiForm.model, apiModels) || '请选择模型' }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 9l6 6 6-6"></path>
                </svg>
              </label>
              <ul tabindex="0" class="dropdown-content z-50 menu p-2 shadow-lg bg-base-100 rounded-box w-full max-h-64 overflow-y-auto">
                <li v-for="model in apiModels" :key="model.id">
                  <a @click="selectApiModel(model.id)" :class="{ 'active': apiForm.model === model.id }">
                    <div class="flex flex-col">
                      <span class="font-medium">{{ model.name }}</span>
                      <span class="text-xs opacity-60">{{ model.desc }}</span>
                    </div>
                  </a>
                </li>
              </ul>
            </div>
            <!-- 自定义模型输入 -->
            <div v-if="showApiCustomModel" class="mt-2">
              <input v-model="apiForm.model" type="text" :placeholder="getModelPlaceholder()" class="input input-bordered input-sm w-full" />
            </div>
          </div>

          <!-- 高级设置 -->
          <div class="collapse collapse-arrow bg-base-200 mt-6">
            <input type="checkbox" v-model="showAdvanced" />
            <div class="collapse-title font-medium">高级设置</div>
            <div class="collapse-content">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div class="form-control">
                  <label class="label"><span class="label-text">请求超时(秒)</span></label>
                  <input v-model.number="apiForm.timeout" type="number" min="10" max="300" class="input input-bordered" />
                </div>
                <div class="form-control">
                  <label class="label"><span class="label-text">最大回复长度</span></label>
                  <input v-model.number="apiForm.maxTokens" type="number" min="100" max="32000" class="input input-bordered" />
                </div>
                <div class="form-control">
                  <label class="label"><span class="label-text">Temperature</span></label>
                  <input v-model.number="apiForm.temperature" type="number" min="0" max="2" step="0.1" class="input input-bordered" />
                  <label class="label"><span class="label-text-alt text-base-content/60">控制随机性，0更稳定，2更有创意</span></label>
                </div>
              </div>
            </div>
          </div>

          <!-- AI角色提示词设置 -->
          <div class="collapse collapse-arrow bg-base-200 mt-4">
            <input type="checkbox" v-model="showPrompts" />
            <div class="collapse-title font-medium flex items-center gap-2">
              <span>AI角色提示词</span>
              <span class="badge badge-accent badge-sm">{{ getActivePromptName() }}</span>
            </div>
            <div class="collapse-content">
              <!-- Tab切换：预设 / 用户 -->
              <div class="tabs tabs-boxed mb-4">
                <a class="tab" :class="{ 'tab-active': promptTab === 'preset' }" @click="promptTab = 'preset'">
                  预设提示词
                </a>
                <a class="tab" :class="{ 'tab-active': promptTab === 'user' }" @click="promptTab = 'user'">
                  用户提示词
                  <span class="badge badge-ghost badge-sm ml-1">{{ userPrompts.length }}</span>
                </a>
              </div>

              <!-- 预设提示词 -->
              <div v-if="promptTab === 'preset'" class="space-y-3">
                <div v-for="preset in presetPrompts" :key="preset.id" class="bg-base-100 rounded-lg p-3">
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <span class="badge badge-primary badge-sm">{{ preset.category }}</span>
                      <h3 class="font-medium text-sm">{{ preset.name }}</h3>
                    </div>
                    <label class="cursor-pointer label justify-end gap-2 py-0">
                      <input type="radio" name="preset_prompt" :value="preset.id" v-model="activePrompt" class="radio radio-primary radio-sm" />
                    </label>
                  </div>
                  <p class="text-xs text-base-content/60 line-clamp-2">{{ preset.description }}</p>
                  <details class="mt-2">
                    <summary class="text-xs cursor-pointer text-primary">查看完整提示词</summary>
                    <pre class="bg-base-200 p-2 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap font-mono mt-2 max-h-48">{{ preset.content }}</pre>
                  </details>
                </div>
              </div>

              <!-- 用户提示词 -->
              <div v-if="promptTab === 'user'">
                <div class="flex justify-end mb-3">
                  <button class="btn btn-accent btn-sm gap-1" @click="openPromptModal()">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    新建
                  </button>
                </div>

                <div v-if="userPrompts.length === 0" class="text-center py-6 text-base-content/50">
                  <p class="text-sm">暂无自定义提示词</p>
                </div>

                <div v-else class="space-y-2">
                  <div v-for="prompt in userPrompts" :key="prompt.id" class="bg-base-100 rounded-lg p-3">
                    <div class="flex items-center justify-between mb-1">
                      <div class="flex items-center gap-2">
                        <h3 class="font-medium text-sm">{{ prompt.name }}</h3>
                        <span v-if="activePrompt === prompt.id" class="badge badge-success badge-xs">使用中</span>
                      </div>
                      <div class="flex items-center gap-1">
                        <label class="cursor-pointer label justify-end gap-2 py-0">
                          <input type="radio" name="user_prompt" :value="prompt.id" v-model="activePrompt" class="radio radio-accent radio-sm" />
                        </label>
                        <button class="btn btn-ghost btn-xs" @click="openPromptModal(prompt)">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </button>
                        <button class="btn btn-ghost btn-xs text-error" @click="deletePrompt(prompt.id)">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p class="text-xs text-base-content/60 line-clamp-1">{{ prompt.description || '暂无描述' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="form-control mt-6">
            <button class="btn btn-outline btn-primary" @click="testApiConnection" :disabled="testing">
              <span v-if="testing" class="loading loading-spinner loading-sm"></span>
              {{ testing ? '测试中...' : '测试连接' }}
            </button>
          </div>

          <div v-if="testResult" class="alert mt-4" :class="testResult.type">
            <span>{{ testResult.message }}</span>
          </div>

          <div class="card-actions justify-end mt-6">
            <button class="btn btn-ghost" @click="resetApiForm">重置</button>
            <button class="btn btn-primary" @click="saveApiConfig">保存</button>
          </div>
        </div>
      </div>

      <!-- 提示词编辑模态框 -->
      <dialog id="prompt_modal" class="modal">
        <div class="modal-box max-w-3xl">
          <form method="dialog">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 class="font-bold text-lg mb-4">{{ editingPrompt ? '编辑提示词' : '新建提示词' }}</h3>
          
          <div class="space-y-4">
            <div class="form-control">
              <label class="label"><span class="label-text">提示词名称</span></label>
              <input v-model="promptForm.name" type="text" class="input input-bordered" placeholder="给提示词起个名字" />
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text">简短描述</span></label>
              <input v-model="promptForm.description" type="text" class="input input-bordered" placeholder="描述这个提示词的用途" />
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text">提示词内容 (支持Markdown)</span></label>
              <div class="tabs tabs-boxed tabs-sm mb-2">
                <a class="tab" :class="{ 'tab-active': promptEditorTab === 'edit' }" @click="promptEditorTab = 'edit'">编辑</a>
                <a class="tab" :class="{ 'tab-active': promptEditorTab === 'preview' }" @click="promptEditorTab = 'preview'">预览</a>
              </div>
              
              <div v-if="promptEditorTab === 'edit'" class="bg-base-200 rounded-lg overflow-hidden">
                <div class="p-2 border-b border-base-300 flex gap-1 flex-wrap">
                  <button type="button" class="btn btn-ghost btn-xs" @click="insertPromptMarkdown('**', '**')">加粗</button>
                  <button type="button" class="btn btn-ghost btn-xs italic" @click="insertPromptMarkdown('*', '*')">斜体</button>
                  <button type="button" class="btn btn-ghost btn-xs" @click="insertPromptMarkdown('## ', '')">标题</button>
                  <button type="button" class="btn btn-ghost btn-xs" @click="insertPromptMarkdown('- ', '')">列表</button>
                  <button type="button" class="btn btn-ghost btn-xs" @click="insertPromptMarkdown('```\n', '\n```')">代码块</button>
                  <button type="button" class="btn btn-ghost btn-xs" @click="insertPromptMarkdown('`', '`')">行内代码</button>
                </div>
                <textarea 
                  ref="promptEditorRef"
                  v-model="promptForm.content" 
                  class="textarea textarea-bordered w-full h-64 font-mono text-sm resize-none" 
                  placeholder="输入提示词内容...

例如：
# 角色设定
你是一个专业的XXX...

## 能力
- 能力1
- 能力2..."
                ></textarea>
              </div>
              
              <div v-else class="bg-base-200 rounded-lg p-4 h-64 overflow-y-auto prose prose-sm max-w-none">
                <div v-if="promptForm.content" v-html="renderPromptMarkdown(promptForm.content)"></div>
                <div v-else class="text-base-content/50">暂无内容</div>
              </div>
            </div>
          </div>

          <div class="modal-action">
            <form method="dialog">
              <button class="btn btn-ghost">取消</button>
            </form>
            <button class="btn btn-accent" @click="savePrompt">{{ editingPrompt ? '保存修改' : '创建' }}</button>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      <!-- 内容生成API配置 -->
      <div id="section-generator" class="card bg-base-100 shadow-xl scroll-mt-20">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <h2 class="card-title text-xl">内容生成API</h2>
            </div>
            <span class="badge badge-secondary badge-outline badge-sm">PPT/文档/视频脚本</span>
          </div>
          <p class="text-sm text-base-content/60 mb-4">配置用于生成 PPT、Markdown 笔记、视频脚本等内容素材的 API。AI 对话中可一键生成并导入学习中心。</p>

          <div class="form-control">
            <label class="label"><span class="label-text">API 服务商</span></label>
            <select v-model="generatorForm.provider" class="select select-bordered">
              <option value="siliconflow">硅基流动（国内推荐）</option>
              <option value="dashscope">阿里云百炼（DashScope）</option>
              <option value="coze">Coze扣子平台</option>
              <option value="openai">OpenAI</option>
              <option value="claude">Claude (Anthropic)</option>
              <option value="gemini">Google Gemini</option>
              <option value="custom">自定义</option>
            </select>
          </div>

          <div class="form-control mt-4">
            <label class="label">
              <span class="label-text">API 端点</span>
              <span class="label-text-alt text-error" v-if="generatorForm.provider === 'custom'">必填</span>
            </label>
            <label class="input input-bordered flex items-center gap-2" :class="{ 'input-disabled': generatorForm.provider !== 'custom' }">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
              <input v-model="generatorForm.endpoint" type="text" :placeholder="getGeneratorEndpointPlaceholder()" class="grow" :disabled="generatorForm.provider !== 'custom'" />
            </label>
          </div>

          <div class="form-control mt-4">
            <label class="label"><span class="label-text">API 密钥</span></label>
            <label class="input input-bordered flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
              </svg>
              <input v-model="generatorForm.apiKey" :type="showGeneratorApiKey ? 'text' : 'password'" placeholder="sk-xxxxxxxxxxxxxxxx" class="grow" />
              <button type="button" class="btn btn-ghost btn-sm btn-square" @click="showGeneratorApiKey = !showGeneratorApiKey">
                <svg v-if="!showGeneratorApiKey" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </button>
            </label>
          </div>

          <div class="form-control mt-4">
            <label class="label">
              <span class="label-text">模型</span>
              <button class="btn btn-xs btn-ghost gap-1" @click="syncGeneratorModels" :disabled="loadingGeneratorModels">
                <span v-if="loadingGeneratorModels" class="loading loading-spinner loading-xs"></span>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 4v6h-6M1 20v-6h6"></path>
                  <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"></path>
                </svg>
                同步模型
              </button>
            </label>
            <div class="dropdown w-full">
              <label tabindex="0" class="input input-bordered flex items-center gap-2 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
                <span class="grow">{{ getSelectedModelName(generatorForm.model, generatorModels) || '请选择模型' }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 9l6 6 6-6"></path>
                </svg>
              </label>
              <ul tabindex="0" class="dropdown-content z-50 menu p-2 shadow-lg bg-base-100 rounded-box w-full max-h-64 overflow-y-auto">
                <li v-for="model in generatorModels" :key="model.id">
                  <a @click="selectGeneratorModel(model.id)" :class="{ 'active': generatorForm.model === model.id }">
                    <div class="flex flex-col">
                      <span class="font-medium">{{ model.name }}</span>
                      <span class="text-xs opacity-60">{{ model.desc }}</span>
                    </div>
                  </a>
                </li>
              </ul>
            </div>
            <!-- 自定义模型输入 -->
            <div v-if="showGeneratorCustomModel" class="mt-2">
              <input v-model="generatorForm.model" type="text" :placeholder="getGeneratorModelPlaceholder()" class="input input-bordered input-sm w-full" />
            </div>
          </div>

          <!-- 内容类型开关 -->
          <div class="collapse collapse-arrow bg-base-200 mt-6">
            <input type="checkbox" v-model="showGeneratorTypes" />
            <div class="collapse-title font-medium">内容生成开关</div>
            <div class="collapse-content">
              <p class="text-sm text-base-content/60 mb-4">选择需要启用的内容生成类型，对话中只会出现已启用的生成选项。</p>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div class="bg-base-100 rounded-lg p-4">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="text-2xl">📊</span>
                      <div>
                        <h4 class="font-medium">PPT 演示文稿</h4>
                        <p class="text-xs text-base-content/60">生成演示文稿</p>
                      </div>
                    </div>
                    <input type="checkbox" v-model="generatorForm.enablePpt" class="toggle toggle-success toggle-sm" />
                  </div>
                </div>
                <div class="bg-base-100 rounded-lg p-4">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="text-2xl">📝</span>
                      <div>
                        <h4 class="font-medium">Markdown 笔记</h4>
                        <p class="text-xs text-base-content/60">生成学习笔记</p>
                      </div>
                    </div>
                    <input type="checkbox" v-model="generatorForm.enableMd" class="toggle toggle-success toggle-sm" />
                  </div>
                </div>
                <div class="bg-base-100 rounded-lg p-4">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="text-2xl">🎬</span>
                      <div>
                        <h4 class="font-medium">视频脚本</h4>
                        <p class="text-xs text-base-content/60">生成视频文案</p>
                      </div>
                    </div>
                    <input type="checkbox" v-model="generatorForm.enableVideo" class="toggle toggle-success toggle-sm" />
                  </div>
                </div>
              </div>
              <div v-if="!generatorForm.enablePpt && !generatorForm.enableMd && !generatorForm.enableVideo" class="alert alert-warning mt-4 py-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <span class="text-sm">至少需要启用一种内容生成类型</span>
              </div>
            </div>
          </div>

          <!-- 高级设置 -->
          <div class="collapse collapse-arrow bg-base-200 mt-4">
            <input type="checkbox" v-model="showGeneratorAdvanced" />
            <div class="collapse-title font-medium">高级设置</div>
            <div class="collapse-content">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div class="form-control">
                  <label class="label"><span class="label-text">请求超时(秒)</span></label>
                  <input v-model.number="generatorForm.timeout" type="number" min="10" max="600" class="input input-bordered" />
                </div>
                <div class="form-control">
                  <label class="label"><span class="label-text">最大回复长度</span></label>
                  <input v-model.number="generatorForm.maxTokens" type="number" min="100" max="64000" class="input input-bordered" />
                </div>
                <div class="form-control">
                  <label class="label"><span class="label-text">Temperature</span></label>
                  <input v-model.number="generatorForm.temperature" type="number" min="0" max="2" step="0.1" class="input input-bordered" />
                </div>
              </div>
            </div>
          </div>

          <div class="form-control mt-6">
            <button class="btn btn-outline btn-secondary" @click="testGeneratorConnection" :disabled="testingGenerator">
              <span v-if="testingGenerator" class="loading loading-spinner loading-sm"></span>
              {{ testingGenerator ? '测试中...' : '测试连接' }}
            </button>
          </div>

          <div v-if="testGeneratorResult" class="alert mt-4" :class="testGeneratorResult.type">
            <span>{{ testGeneratorResult.message }}</span>
          </div>

          <div class="card-actions justify-end mt-6">
            <button class="btn btn-ghost" @click="resetGeneratorForm">重置</button>
            <button class="btn btn-secondary" @click="saveGeneratorConfig">保存</button>
          </div>
        </div>
      </div>

      <!-- 考试生成API配置 -->
      <div id="section-exam" class="card bg-base-100 shadow-xl scroll-mt-20">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <h2 class="card-title text-xl">考试生成API</h2>
            </div>
            <span class="badge badge-accent badge-outline badge-sm">阶段性测试</span>
          </div>
          <p class="text-sm text-base-content/60 mb-4">配置用于生成阶段性测试题目的AI API。可以独立设置，也可以使用与内容生成相同的API配置。</p>

          <div class="form-control">
            <label class="label cursor-pointer justify-start gap-4">
              <input type="checkbox" v-model="examForm.useGeneratorConfig" class="checkbox checkbox-primary" />
              <span class="label-text font-medium">使用内容生成API配置</span>
            </label>
            <label class="label">
              <span class="label-text-alt text-base-content/60">启用后将使用内容生成API的配置，下方设置将失效</span>
            </label>
          </div>

          <div v-if="!examForm.useGeneratorConfig" class="space-y-4 mt-4">
            <div class="form-control">
              <label class="label"><span class="label-text">API 服务商</span></label>
              <select v-model="examForm.provider" class="select select-bordered">
                <option value="siliconflow">硅基流动（国内推荐）</option>
                <option value="dashscope">阿里云百炼（DashScope）</option>
                <option value="coze">Coze扣子平台</option>
                <option value="openai">OpenAI</option>
                <option value="claude">Claude (Anthropic)</option>
                <option value="gemini">Google Gemini</option>
                <option value="custom">自定义</option>
              </select>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">API 端点</span>
                <span class="label-text-alt text-error" v-if="examForm.provider === 'custom'">必填</span>
              </label>
              <label class="input input-bordered flex items-center gap-2" :class="{ 'input-disabled': examForm.provider !== 'custom' }">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
                <input v-model="examForm.endpoint" type="text" :placeholder="getExamEndpointPlaceholder()" class="grow" :disabled="examForm.provider !== 'custom'" />
              </label>
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text">API 密钥</span></label>
              <label class="input input-bordered flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                </svg>
                <input v-model="examForm.apiKey" :type="showExamApiKey ? 'text' : 'password'" placeholder="sk-xxxxxxxxxxxxxxxx" class="grow" />
                <button type="button" class="btn btn-ghost btn-sm btn-square" @click="showExamApiKey = !showExamApiKey">
                  <svg v-if="!showExamApiKey" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                </button>
              </label>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">模型</span>
                <button class="btn btn-xs btn-ghost gap-1" @click="syncExamModels" :disabled="loadingExamModels">
                  <span v-if="loadingExamModels" class="loading loading-spinner loading-xs"></span>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 4v6h-6M1 20v-6h6"></path>
                    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"></path>
                  </svg>
                  同步模型
                </button>
              </label>
              <div class="dropdown w-full">
                <label tabindex="0" class="input input-bordered flex items-center gap-2 cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5"></path>
                    <path d="M2 12l10 5 10-5"></path>
                  </svg>
                  <span class="grow">{{ getSelectedModelName(examForm.model, examModels) || '请选择模型' }}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 9l6 6 6-6"></path>
                  </svg>
                </label>
                <ul tabindex="0" class="dropdown-content z-50 menu p-2 shadow-lg bg-base-100 rounded-box w-full max-h-64 overflow-y-auto">
                  <li v-for="model in examModels" :key="model.id">
                    <a @click="selectExamModel(model.id)" :class="{ 'active': examForm.model === model.id }">
                      <div class="flex flex-col">
                        <span class="font-medium">{{ model.name }}</span>
                        <span class="text-xs opacity-60">{{ model.desc }}</span>
                      </div>
                    </a>
                  </li>
                </ul>
              </div>
              <!-- 自定义模型输入 -->
              <div v-if="showExamCustomModel" class="mt-2">
                <input v-model="examForm.model" type="text" :placeholder="getExamModelPlaceholder()" class="input input-bordered input-sm w-full" />
              </div>
            </div>

            <!-- 高级设置 -->
            <div class="collapse collapse-arrow bg-base-200 mt-4">
              <input type="checkbox" v-model="showExamAdvanced" />
              <div class="collapse-title font-medium">高级设置</div>
              <div class="collapse-content">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div class="form-control">
                    <label class="label"><span class="label-text">请求超时(秒)</span></label>
                    <input v-model.number="examForm.timeout" type="number" min="10" max="600" class="input input-bordered" />
                  </div>
                  <div class="form-control">
                    <label class="label"><span class="label-text">最大回复长度</span></label>
                    <input v-model.number="examForm.maxTokens" type="number" min="100" max="64000" class="input input-bordered" />
                  </div>
                  <div class="form-control">
                    <label class="label"><span class="label-text">Temperature</span></label>
                    <input v-model.number="examForm.temperature" type="number" min="0" max="2" step="0.1" class="input input-bordered" />
                    <label class="label"><span class="label-text-alt text-base-content/60">控制题目多样性，0更稳定，2更多样</span></label>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-control mt-6">
              <button class="btn btn-outline btn-accent" @click="testExamConnection" :disabled="testingExam">
                <span v-if="testingExam" class="loading loading-spinner loading-sm"></span>
                {{ testingExam ? '测试中...' : '测试连接' }}
              </button>
            </div>

            <div v-if="testExamResult" class="alert mt-4" :class="testExamResult.type">
              <span>{{ testExamResult.message }}</span>
            </div>
          </div>

          <div class="card-actions justify-end mt-6">
            <button class="btn btn-ghost" @click="resetExamForm">重置</button>
            <button class="btn btn-accent" @click="saveExamConfig">保存</button>
          </div>
        </div>
      </div>

      <!-- 外观设置 -->
      <div id="section-appearance" class="card bg-base-100 shadow-xl scroll-mt-20">
        <div class="card-body">
          <div class="flex items-center gap-2 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"></circle>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
            </svg>
            <h2 class="card-title text-xl">外观设置</h2>
          </div>

          <div class="form-control">
            <label class="label"><span class="label-text">主题配色</span></label>
            <div class="grid grid-cols-3 md:grid-cols-5 gap-2">
              <button 
                v-for="theme in daisyThemes" 
                :key="theme.value"
                class="btn btn-sm"
                :class="appearanceForm.theme === theme.value ? 'btn-active' : 'btn-ghost'"
                @click="setTheme(theme.value)"
              >
                {{ theme.label }}
              </button>
            </div>
          </div>

          <div class="form-control mt-4">
            <label class="label"><span class="label-text">字体大小</span></label>
            <input type="range" min="12" max="20" v-model.number="appearanceForm.fontSize" class="range range-primary" />
            <div class="w-full flex justify-between text-xs px-2 mt-1">
              <span>小</span>
              <span>当前: {{ appearanceForm.fontSize }}px</span>
              <span>大</span>
            </div>
          </div>

          <!-- 终端提示符颜色设置 -->
          <div class="divider my-6">终端提示符颜色</div>
          
          <div class="bg-base-200 rounded-lg p-4">
            <!-- 预览 -->
            <div class="mb-4">
              <label class="label"><span class="label-text">预览</span></label>
              <div class="flex items-center gap-2 p-3 bg-neutral rounded-lg">
                <div class="flex items-center text-sm" style="font-family: 'JetBrains Mono', monospace;">
                  <div class="px-3 py-1.5 font-semibold" :style="{ background: promptColorForm.color1, color: promptColorForm.textColor1, borderRadius: '13px 13px 13px 0', paddingLeft: '14px', paddingRight: '8px', height: '26px', display: 'flex', alignItems: 'center' }">user@localhost</div>
                  <div class="px-3 py-1.5 font-semibold" :style="{ background: promptColorForm.color2, color: promptColorForm.textColor2, borderRadius: '0 13px 13px 0', marginLeft: '-10px', paddingLeft: '18px', paddingRight: '8px', height: '26px', display: 'flex', alignItems: 'center', zIndex: 2 }">~</div>
                  <div class="px-3 py-1.5 font-semibold" :style="{ background: promptColorForm.color3, color: promptColorForm.textColor3, borderRadius: '0 13px 13px 0', marginLeft: '-10px', paddingLeft: '18px', paddingRight: '8px', height: '26px', display: 'flex', alignItems: 'center', zIndex: 1 }">❯</div>
                </div>
              </div>
            </div>

            <!-- 背景颜色选择器 -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">第一段背景</span>
                  <span class="text-xs font-mono">{{ promptColorForm.color1 }}</span>
                </label>
                <div class="flex items-center gap-2">
                  <input 
                    type="color" 
                    v-model="promptColorForm.color1" 
                    class="w-12 h-10 rounded cursor-pointer border-0"
                  />
                  <input 
                    type="text" 
                    v-model="promptColorForm.color1" 
                    class="input input-sm input-bordered flex-1 font-mono"
                    maxlength="7"
                  />
                </div>
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">第二段背景</span>
                  <span class="text-xs font-mono">{{ promptColorForm.color2 }}</span>
                </label>
                <div class="flex items-center gap-2">
                  <input 
                    type="color" 
                    v-model="promptColorForm.color2" 
                    class="w-12 h-10 rounded cursor-pointer border-0"
                  />
                  <input 
                    type="text" 
                    v-model="promptColorForm.color2" 
                    class="input input-sm input-bordered flex-1 font-mono"
                    maxlength="7"
                  />
                </div>
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">第三段背景</span>
                  <span class="text-xs font-mono">{{ promptColorForm.color3 }}</span>
                </label>
                <div class="flex items-center gap-2">
                  <input 
                    type="color" 
                    v-model="promptColorForm.color3" 
                    class="w-12 h-10 rounded cursor-pointer border-0"
                  />
                  <input 
                    type="text" 
                    v-model="promptColorForm.color3" 
                    class="input input-sm input-bordered flex-1 font-mono"
                    maxlength="7"
                  />
                </div>
              </div>
            </div>

            <!-- 字体颜色选择器 -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">第一段文字</span>
                  <span class="text-xs font-mono">{{ promptColorForm.textColor1 }}</span>
                </label>
                <div class="flex items-center gap-2">
                  <input 
                    type="color" 
                    v-model="promptColorForm.textColor1" 
                    class="w-12 h-10 rounded cursor-pointer border-0"
                  />
                  <input 
                    type="text" 
                    v-model="promptColorForm.textColor1" 
                    class="input input-sm input-bordered flex-1 font-mono"
                    maxlength="7"
                  />
                </div>
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">第二段文字</span>
                  <span class="text-xs font-mono">{{ promptColorForm.textColor2 }}</span>
                </label>
                <div class="flex items-center gap-2">
                  <input 
                    type="color" 
                    v-model="promptColorForm.textColor2" 
                    class="w-12 h-10 rounded cursor-pointer border-0"
                  />
                  <input 
                    type="text" 
                    v-model="promptColorForm.textColor2" 
                    class="input input-sm input-bordered flex-1 font-mono"
                    maxlength="7"
                  />
                </div>
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">第三段文字</span>
                  <span class="text-xs font-mono">{{ promptColorForm.textColor3 }}</span>
                </label>
                <div class="flex items-center gap-2">
                  <input 
                    type="color" 
                    v-model="promptColorForm.textColor3" 
                    class="w-12 h-10 rounded cursor-pointer border-0"
                  />
                  <input 
                    type="text" 
                    v-model="promptColorForm.textColor3" 
                    class="input input-sm input-bordered flex-1 font-mono"
                    maxlength="7"
                  />
                </div>
              </div>
            </div>

            <div class="mt-4 text-xs text-base-content/60">
              <p>设置终端中 Oh My Bash 风格三段式提示符的背景色和文字颜色。修改后将在下次打开对话页面时生效。</p>
            </div>
          </div>

          <div class="card-actions justify-end mt-6">
            <button class="btn btn-ghost" @click="resetAppearanceForm">重置</button>
            <button class="btn btn-primary" @click="saveAppearanceConfig">保存</button>
          </div>
        </div>
      </div>

      <!-- 通知设置 -->
      <div id="section-notification" class="card bg-base-100 shadow-xl scroll-mt-20">
        <div class="card-body">
          <div class="flex items-center gap-2 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <h2 class="card-title text-xl">通知设置</h2>
          </div>

          <div class="space-y-4">
            <div class="form-control">
              <label class="cursor-pointer label justify-start gap-4">
                <input type="checkbox" v-model="notificationForm.emailNotify" class="toggle toggle-primary" />
                <span class="label-text">邮件通知</span>
              </label>
            </div>

            <div class="form-control">
              <label class="cursor-pointer label justify-start gap-4">
                <input type="checkbox" v-model="notificationForm.pushNotify" class="toggle toggle-primary" />
                <span class="label-text">推送通知</span>
              </label>
            </div>

            <div class="form-control">
              <label class="cursor-pointer label justify-start gap-4">
                <input type="checkbox" v-model="notificationForm.soundNotify" class="toggle toggle-primary" />
                <span class="label-text">声音提示</span>
              </label>
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text">免打扰时段</span></label>
              <div class="flex items-center gap-2">
                <input type="time" v-model="notificationForm.quietHoursStart" class="input input-bordered" />
                <span>至</span>
                <input type="time" v-model="notificationForm.quietHoursEnd" class="input input-bordered" />
              </div>
            </div>
          </div>

          <div class="card-actions justify-end mt-6">
            <button class="btn btn-ghost" @click="resetNotificationForm">重置</button>
            <button class="btn btn-primary" @click="saveNotificationConfig">保存</button>
          </div>
        </div>
      </div>

    </div>

    <!-- 成功提示 -->
    <div v-if="showToast" class="toast toast-top toast-center">
      <div class="alert alert-success">
        <span>{{ toastMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick, computed } from 'vue'

const showApiKey = ref(false)
const showAdvanced = ref(false)
const showPrompts = ref(false)
const testing = ref(false)
const testResult = ref(null)
const showGeneratorApiKey = ref(false)
const showGeneratorAdvanced = ref(false)
const showGeneratorTypes = ref(false)
const testingGenerator = ref(false)
const testGeneratorResult = ref(null)
const showExamApiKey = ref(false)
const showExamAdvanced = ref(false)
const testingExam = ref(false)
const testExamResult = ref(null)
const showToast = ref(false)
const toastMessage = ref('')

// 代理商模型列表
const apiModels = ref([])
const generatorModels = ref([])
const examModels = ref([])
const loadingApiModels = ref(false)
const loadingGeneratorModels = ref(false)
const loadingExamModels = ref(false)

// 各服务商支持的模型列表（基于2024-2025年真实可用的模型）
const providerModels = {
  siliconflow: [
    { id: 'Qwen/Qwen2.5-7B-Instruct', name: 'Qwen2.5-7B (推荐)', desc: '通义千问7B，性价比高，适合日常对话' },
    { id: 'Qwen/Qwen2.5-14B-Instruct', name: 'Qwen2.5-14B', desc: '通义千问14B，更强推理能力' },
    { id: 'Qwen/Qwen2.5-72B-Instruct', name: 'Qwen2.5-72B', desc: '通义千问72B，顶尖性能' },
    { id: 'THUDM/glm-4-9b-chat', name: 'GLM-4-9B', desc: '智谱ChatGLM4 9B' },
    { id: 'deepseek-ai/DeepSeek-V2.5', name: 'DeepSeek V2.5', desc: '深度求索最新模型' },
    { id: 'deepseek-ai/DeepSeek-R1', name: 'DeepSeek R1', desc: '深度求索推理模型，数学代码能力强' },
    { id: 'meta-llama/Meta-Llama-3.1-8B-Instruct', name: 'Llama 3.1 8B', desc: 'Meta开源模型' },
    { id: 'mistralai/Mistral-7B-Instruct-v0.2', name: 'Mistral 7B', desc: '欧洲开源模型' },
    { id: 'custom', name: '自定义模型...', desc: '手动输入模型名称' }
  ],
  dashscope: [
    { id: 'qwen-plus', name: 'qwen-plus (推荐)', desc: '通义千问Plus，性价比优' },
    { id: 'qwen-turbo', name: 'qwen-turbo', desc: '通义千问Turbo，快速响应' },
    { id: 'qwen-max', name: 'qwen-max', desc: '通义千问Max，最强性能' },
    { id: 'qwen-long', name: 'qwen-long', desc: '长文本处理，支持100万字' },
    { id: 'qwen-coder-plus', name: 'qwen-coder-plus', desc: '代码专用模型' },
    { id: 'qwen2.5-72b-instruct', name: 'qwen2.5-72b-instruct', desc: '开源模型72B' },
    { id: 'custom', name: '自定义模型...', desc: '手动输入模型名称' }
  ],
  coze: [
    { id: 'custom', name: 'Bot ID (需填写)', desc: '在Coze平台创建Bot后的ID' }
  ],
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o (推荐)', desc: '最新全能模型，支持视觉' },
    { id: 'gpt-4o-mini', name: 'GPT-4o-mini', desc: '轻量快速版' },
    { id: 'gpt-4-turbo', name: 'GPT-4-Turbo', desc: '高性能版，支持视觉' },
    { id: 'gpt-4', name: 'GPT-4', desc: '经典版本' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5-Turbo', desc: '轻量快速' },
    { id: 'custom', name: '自定义模型...', desc: '手动输入模型名称' }
  ],
  claude: [
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet (推荐)', desc: '最新强推理模型' },
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', desc: '轻量快速版' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', desc: '顶级性能' },
    { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', desc: '均衡之选' },
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', desc: '轻量版' },
    { id: 'custom', name: '自定义模型...', desc: '手动输入模型名称' }
  ],
  gemini: [
    { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash (推荐)', desc: '最新快速模型' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', desc: '快速响应，支持长上下文' },
    { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash-8B', desc: '超轻量版' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', desc: '高性能版，百万token上下文' },
    { id: 'gemini-pro', name: 'Gemini Pro', desc: '标准版' },
    { id: 'custom', name: '自定义模型...', desc: '手动输入模型名称' }
  ],
  custom: [
    { id: 'custom', name: '自定义模型...', desc: '请在下方手动输入模型名称' }
  ]
}

// 同步API模型列表
const syncApiModels = async () => {
  loadingApiModels.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    apiModels.value = providerModels[apiForm.provider] || providerModels.custom
    // 如果当前模型不在列表中，清空
    if (apiForm.model && !apiModels.value.find(m => m.id === apiForm.model)) {
      // 保留用户之前的自定义输入
    } else if (apiForm.model === '' || !apiModels.value.find(m => m.id === apiForm.model)) {
      apiForm.model = apiModels.value[0]?.id || ''
    }
  } finally {
    loadingApiModels.value = false
  }
}

// 同步内容生成模型列表
const syncGeneratorModels = async () => {
  loadingGeneratorModels.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    generatorModels.value = providerModels[generatorForm.provider] || providerModels.custom
    if (generatorForm.model === '' || !generatorModels.value.find(m => m.id === generatorForm.model)) {
      generatorForm.model = generatorModels.value[0]?.id || ''
    }
  } finally {
    loadingGeneratorModels.value = false
  }
}

// 同步考试生成模型列表
const syncExamModels = async () => {
  loadingExamModels.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    examModels.value = providerModels[examForm.provider] || providerModels.custom
    if (examForm.model === '' || !examModels.value.find(m => m.id === examForm.model)) {
      examForm.model = examModels.value[0]?.id || ''
    }
  } finally {
    loadingExamModels.value = false
  }
}

// 判断是否显示自定义模型输入框
const showApiCustomModel = computed(() => apiForm.model === 'custom' || !apiModels.value.find(m => m.id === apiForm.model))
const showGeneratorCustomModel = computed(() => generatorForm.model === 'custom' || !generatorModels.value.find(m => m.id === generatorForm.model))
const showExamCustomModel = computed(() => examForm.model === 'custom' || !examModels.value.find(m => m.id === examForm.model))

// 提示词相关
const promptTab = ref('user')
const promptEditorTab = ref('edit')
const promptEditorRef = ref(null)
const editingPrompt = ref(null)
const activePrompt = ref('')

const promptForm = reactive({
  name: '',
  description: '',
  content: ''
})

// 预设提示词（用户不可编辑）
const presetPrompts = ref([
  {
    id: 'preset_renko',
    name: '宇佐见莲子',
    category: '学习助手',
    description: '社团里的"行走图书馆"，好奇心旺盛、喜欢用科学/神秘学解释一切，擅长PPT整理、Markdown笔记整理、视频脚本整理。',
    content: `# 角色：社团里的"行走图书馆" · Usami Renko（宇佐见莲子）风专业教授

## 1. 身份设定
你是大学里某个专业（用户可指定，默认"跨学科科学"）的资深研究者——但你不坐办公室，你更喜欢窝在社团活动室、咖啡厅或天台。
你的名字是 **Usami Renko（宇佐见莲子）**，朋友们都叫你 **Renko** 或者 **莲子**。
你有着教授的扎实学识和学术风度，但说话方式完全不像讲课，更像是一个**对知识充满热情、乐于分享的社团前辈/同学**。

## 2. 核心能力
- 能用**朋友聊天的口吻**把复杂概念讲清楚
- 喜欢**打奇怪的比喻**，但比喻背后道理是对的
- 会主动抛出有趣的问题鼓励思考
- 鼓励**一起推导**而不是直接给答案

## 3. 内置工作流
- **PPT 整理**：输出文字版大纲
- **Markdown 笔记整理**：输出结构化笔记
- **视频脚本整理**：输出视频脚本

## 4. 教学风格
- 口语化、亲切，不用"同学们"
- 知识准确但不压迫
- 适度中二/浪漫表达

## 5. 行为约束
- 不编造理论、数据、文献
- 不代替完成作业/考试，但可讲解思路
- 如果不确定，就说"我们一起验证一下"`
  },
  {
    id: 'preset_tutor',
    name: '在线家教',
    category: '教育辅导',
    description: '耐心的在线家教，擅长因材施教，循序渐进地讲解知识点。',
    content: `# 角色：专业的在线家教

## 1. 身份设定
你是一位经验丰富的在线家教老师，擅长用通俗易懂的方式讲解复杂的知识点。

## 2. 教学原则
- **循序渐进**：从基础开始，逐步深入
- **因材施教**：根据学生水平调整讲解深度
- **启发式教学**：引导思考而不是直接给答案
- **耐心鼓励**：遇到困难时给予正向反馈

## 3. 讲解方式
- 使用生活中的类比解释抽象概念
- 适当使用图表和示例
- 每讲解一个知识点后确认理解情况
- 及时纠正错误但方式温和

## 4. 互动方式
- 主动询问学生是否有疑问
- 根据学生反馈调整讲解速度
- 鼓励学生提问和表达想法`
  },
  {
    id: 'preset_code',
    name: '编程导师',
    category: '技术开发',
    description: '专业的编程导师，精通多种编程语言和框架，擅长代码review和优化建议。',
    content: `# 角色：专业的编程导师

## 1. 身份设定
你是一位经验丰富的全栈开发者，精通多种编程语言、框架和开发工具。你既是技术专家，也是良师益友。

## 2. 核心能力
- 代码编写、重构与优化
- Bug定位与解决方案
- 架构设计与最佳实践
- 技术选型建议

## 3. 指导风格
- **代码优先**：用代码说话，展示而非空谈
- **最佳实践**：推广业界认可的设计模式和编码规范
- **授人以渔**：解释原理，让学习者理解"为什么"
- **适度引导**：提供思路而非完整答案，鼓励思考

## 4. 反馈方式
- 指出代码优点，保持正向鼓励
- 明确指出问题并给出改进建议
- 提供可运行的代码示例
- 解释每一步改动的原因`
  }
])

// 用户提示词（存储在localStorage）
const userPrompts = ref([])

const renderPromptMarkdown = (text) => {
  if (!text) return ''
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="bg-base-300 px-1 rounded text-sm">$1</code>')
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-neutral text-neutral-content p-3 rounded-lg overflow-x-auto my-2"><code>$1</code></pre>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
    .split('\n\n')
    .map(para => {
      if (para.startsWith('<h') || para.startsWith('<pre') || para.startsWith('<li')) {
        return para
      }
      return `<p class="my-1">${para.replace(/\n/g, '<br>')}</p>`
    })
    .join('')
  
  html = html.replace(/(<li>[\s\S]*?<\/li>)+/g, '<ul class="list-disc list-inside my-2 space-y-1">$&</ul>')
  return html
}

const insertPromptMarkdown = (before, after) => {
  const textarea = promptEditorRef.value
  if (textarea) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = promptForm.content
    const selected = text.substring(start, end)
    promptForm.content = text.substring(0, start) + before + selected + after + text.substring(end)
    nextTick(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, end + before.length)
    })
  }
}

const openPromptModal = (prompt = null) => {
  if (prompt) {
    editingPrompt.value = prompt
    promptForm.name = prompt.name
    promptForm.description = prompt.description || ''
    promptForm.content = prompt.content
  } else {
    editingPrompt.value = null
    promptForm.name = ''
    promptForm.description = ''
    promptForm.content = ''
  }
  promptEditorTab.value = 'edit'
  document.getElementById('prompt_modal').showModal()
}

const savePrompt = () => {
  if (!promptForm.name.trim()) {
    showNotification('请输入提示词名称', 'error')
    return
  }
  if (!promptForm.content.trim()) {
    showNotification('请输入提示词内容', 'error')
    return
  }

  if (editingPrompt.value) {
    const index = userPrompts.value.findIndex(p => p.id === editingPrompt.value.id)
    if (index !== -1) {
      userPrompts.value[index] = {
        ...userPrompts.value[index],
        name: promptForm.name,
        description: promptForm.description,
        content: promptForm.content,
        updatedAt: new Date().toISOString()
      }
    }
    showNotification('提示词已更新')
  } else {
    const newPrompt = {
      id: `user_${Date.now()}`,
      name: promptForm.name,
      description: promptForm.description,
      content: promptForm.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    userPrompts.value.push(newPrompt)
    showNotification('提示词已创建')
  }
  
  savePromptConfig()
  document.getElementById('prompt_modal').close()
}

const deletePrompt = (id) => {
  if (confirm('确定要删除这个提示词吗？')) {
    userPrompts.value = userPrompts.value.filter(p => p.id !== id)
    if (activePrompt.value === id) {
      activePrompt.value = presetPrompts.value[0].id
    }
    savePromptConfig()
    showNotification('提示词已删除')
  }
}

const savePromptConfig = () => {
  const settings = JSON.parse(localStorage.getItem('settings') || '{}')
  settings.promptConfig = {
    activePrompt: activePrompt.value,
    userPrompts: userPrompts.value
  }
  localStorage.setItem('settings', JSON.stringify(settings))
  // 通知其他组件
  window.dispatchEvent(new CustomEvent('prompts-changed', { detail: { activePrompt: activePrompt.value } }))
  // 通知生成器配置更新
  window.dispatchEvent(new CustomEvent('generator-settings-changed'))
}

const resetPromptForm = () => {
  const settings = JSON.parse(localStorage.getItem('settings') || '{}')
  if (settings.promptConfig) {
    activePrompt.value = settings.promptConfig.activePrompt || presetPrompts.value[0].id
    userPrompts.value = settings.promptConfig.userPrompts || []
  }
}

// DaisyUI 主题列表
const daisyThemes = [
  { value: 'light', label: '浅色' },
  { value: 'dark', label: '深色' },
  { value: 'darkpink', label: '深粉' },
  { value: 'cupcake', label: 'Cupcake' },
  { value: 'bumblebee', label: 'Bumblebee' },
  { value: 'emerald', label: 'Emerald' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'synthwave', label: 'Synthwave' },
  { value: 'retro', label: 'Retro' },
  { value: 'cyberpunk', label: 'Cyberpunk' },
  { value: 'valentine', label: 'Valentine' },
  { value: 'garden', label: 'Garden' },
  { value: 'forest', label: 'Forest' },
  { value: 'aqua', label: 'Aqua' },
  { value: 'lofi', label: 'Lofi' },
  { value: 'pastel', label: 'Pastel' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'wireframe', label: 'Wireframe' },
  { value: 'black', label: 'Black' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'dracula', label: 'Dracula' },
  { value: 'cmyk', label: 'CMYK' },
  { value: 'autumn', label: 'Autumn' },
  { value: 'business', label: 'Business' },
  { value: 'acid', label: 'Acid' },
  { value: 'lemonade', label: 'Lemonade' },
  { value: 'night', label: 'Night' },
  { value: 'coffee', label: 'Coffee' },
  { value: 'winter', label: 'Winter' },
  { value: 'dim', label: 'Dim' },
  { value: 'nord', label: 'Nord' },
  { value: 'sunset', label: 'Sunset' },
]

const userForm = reactive({
  username: '',
  email: '',
  nickname: '',
  phone: '',
  bio: '',
  avatar: ''
})

const apiForm = reactive({
  provider: 'siliconflow',
  endpoint: '',
  apiKey: '',
  model: '',
  timeout: 60,
  maxTokens: 4096,
  temperature: 1
})

const generatorForm = reactive({
  provider: 'siliconflow',
  endpoint: '',
  apiKey: '',
  model: '',
  timeout: 120,
  maxTokens: 8192,
  temperature: 0.8,
  enablePpt: true,
  enableMd: true,
  enableVideo: true
})

const appearanceForm = reactive({
  theme: 'light',
  fontSize: 14
})

// 终端提示符颜色设置
const promptColorForm = reactive({
  color1: '#7CD9FF',
  color2: '#BDADFF',
  color3: '#FF5991',
  textColor1: '#1a1a2e',
  textColor2: '#1a1a2e',
  textColor3: '#ffffff'
})

const notificationForm = reactive({
  emailNotify: true,
  pushNotify: true,
  soundNotify: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00'
})

const studyForm = reactive({
  workMinutes: 25,
  breakMinutes: 5,
  longBreakMinutes: 15,
  autoStartNext: false
})

// 考试生成API配置
const examForm = reactive({
  useGeneratorConfig: true,
  provider: 'siliconflow',
  endpoint: '',
  apiKey: '',
  model: '',
  timeout: 120,
  maxTokens: 8192,
  temperature: 0.7
})

const defaultEndpoints = {
  siliconflow: 'https://api.siliconflow.cn/v1',
  dashscope: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  coze: 'https://api.coze.cn/v1',
  openai: 'https://api.openai.com/v1',
  claude: 'https://api.anthropic.com/v1',
  gemini: 'https://generativelanguage.googleapis.com/v1beta',
  custom: ''
}

const defaultModels = {
  siliconflow: 'Qwen/Qwen2.5-7B-Instruct',
  dashscope: 'qwen-plus',
  coze: 'Bot ID（需填写你的Bot ID）',
  openai: 'gpt-4o',
  claude: 'claude-3-5-sonnet-20241022',
  gemini: 'gemini-2.0-flash-exp',
  custom: ''
}

const getEndpointPlaceholder = () => {
  return apiForm.provider === 'custom' ? 'https://your-api-endpoint.com/v1' : defaultEndpoints[apiForm.provider]
}

const getModelPlaceholder = () => defaultModels[apiForm.provider]

const getGeneratorEndpointPlaceholder = () => {
  return generatorForm.provider === 'custom' ? 'https://your-api-endpoint.com/v1' : defaultEndpoints[generatorForm.provider]
}

const getGeneratorModelPlaceholder = () => defaultModels[generatorForm.provider]

const getExamEndpointPlaceholder = () => {
  return examForm.provider === 'custom' ? 'https://your-api-endpoint.com/v1' : defaultEndpoints[examForm.provider]
}

const getExamModelPlaceholder = () => defaultModels[examForm.provider]

// 获取选中的模型名称
const getSelectedModelName = (modelId, modelsList) => {
  if (!modelId) return ''
  const model = modelsList.find(m => m.id === modelId)
  return model ? model.name : modelId
}

// 选择API模型
const selectApiModel = (modelId) => {
  if (modelId !== 'custom') {
    apiForm.model = modelId
  } else {
    apiForm.model = ''
  }
}

// 选择内容生成模型
const selectGeneratorModel = (modelId) => {
  if (modelId !== 'custom') {
    generatorForm.model = modelId
  } else {
    generatorForm.model = ''
  }
}

// 选择考试生成模型
const selectExamModel = (modelId) => {
  if (modelId !== 'custom') {
    examForm.model = modelId
  } else {
    examForm.model = ''
  }
}

const getActivePromptName = () => {
  if (activePrompt.value.startsWith('user_')) {
    const userPrompt = userPrompts.value.find(p => p.id === activePrompt.value)
    return userPrompt ? userPrompt.name : '未选择'
  }
  const preset = presetPrompts.value.find(p => p.id === activePrompt.value)
  return preset ? preset.name : '宇佐见莲子'
}

const scrollToSection = (sectionId) => {
  const element = document.getElementById(`section-${sectionId}`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// 设置DaisyUI主题
const setTheme = (theme) => {
  appearanceForm.theme = theme
  document.documentElement.setAttribute('data-theme', theme)
}

// 应用所有设置到页面
const applySettings = () => {
  // 应用主题
  if (appearanceForm.theme) {
    document.documentElement.setAttribute('data-theme', appearanceForm.theme)
  }
  // 应用字体大小
  if (appearanceForm.fontSize) {
    document.documentElement.style.fontSize = appearanceForm.fontSize + 'px'
  }
}

const loadSavedData = () => {
  const savedSettings = localStorage.getItem('settings')
  if (savedSettings) {
    const settings = JSON.parse(savedSettings)
    if (settings.user) Object.assign(userForm, settings.user)
    if (settings.api) Object.assign(apiForm, settings.api)
    if (settings.generator) Object.assign(generatorForm, settings.generator)
    if (settings.exam) Object.assign(examForm, settings.exam)
    if (settings.study) Object.assign(studyForm, settings.study)
    if (settings.appearance) Object.assign(appearanceForm, settings.appearance)
    if (settings.notification) Object.assign(notificationForm, settings.notification)
    if (settings.promptConfig) {
      activePrompt.value = settings.promptConfig.activePrompt || presetPrompts.value[0].id
      userPrompts.value = settings.promptConfig.userPrompts || []
    } else {
      activePrompt.value = presetPrompts.value[0].id
    }
    // 加载提示符颜色
    if (settings.promptColors) {
      promptColorForm.color1 = settings.promptColors.color1 || '#7CD9FF'
      promptColorForm.color2 = settings.promptColors.color2 || '#BDADFF'
      promptColorForm.color3 = settings.promptColors.color3 || '#FF5991'
      promptColorForm.textColor1 = settings.promptColors.textColor1 || '#1a1a2e'
      promptColorForm.textColor2 = settings.promptColors.textColor2 || '#1a1a2e'
      promptColorForm.textColor3 = settings.promptColors.textColor3 || '#ffffff'
    }
  } else {
    activePrompt.value = presetPrompts.value[0].id
  }
  
  // 应用保存的主题
  if (appearanceForm.theme && appearanceForm.theme !== 'auto') {
    document.documentElement.setAttribute('data-theme', appearanceForm.theme)
  }
  
  // 应用字体大小
  if (appearanceForm.fontSize) {
    document.documentElement.style.fontSize = appearanceForm.fontSize + 'px'
  }
}

const saveAllSettings = () => {
  const settings = {
    user: { ...userForm },
    api: { ...apiForm },
    generator: { ...generatorForm },
    exam: { ...examForm },
    study: { ...studyForm },
    appearance: { ...appearanceForm },
    notification: { ...notificationForm }
  }
  localStorage.setItem('settings', JSON.stringify(settings))
  // 保存后立即应用设置
  applySettings()
}

const saveUserInfo = () => {
  saveAllSettings()
  showNotification('用户信息已保存')
  // 触发事件通知 Navbar 更新
  window.dispatchEvent(new CustomEvent('settings-changed'))
}

const resetUserForm = () => {
  const saved = localStorage.getItem('settings')
  if (saved) {
    const settings = JSON.parse(saved)
    if (settings.user) Object.assign(userForm, settings.user)
  }
}

const saveApiConfig = () => {
  saveAllSettings()
  showNotification('API配置已保存')
}

const resetApiForm = () => {
  const saved = localStorage.getItem('settings')
  if (saved) {
    const settings = JSON.parse(saved)
    if (settings.api) Object.assign(apiForm, settings.api)
  }
  testResult.value = null
}

const saveGeneratorConfig = () => {
  saveAllSettings()
  showNotification('内容生成API配置已保存')
}

const resetGeneratorForm = () => {
  const saved = localStorage.getItem('settings')
  if (saved) {
    const settings = JSON.parse(saved)
    if (settings.generator) Object.assign(generatorForm, settings.generator)
  }
  testGeneratorResult.value = null
}

const saveExamConfig = () => {
  saveAllSettings()
  showNotification('考试生成API配置已保存')
}

const resetExamForm = () => {
  const saved = localStorage.getItem('settings')
  if (saved) {
    const settings = JSON.parse(saved)
    if (settings.exam) Object.assign(examForm, settings.exam)
  }
  testExamResult.value = null
}

const testExamConnection = async () => {
  testingExam.value = true
  testExamResult.value = null
  try {
    if (examForm.useGeneratorConfig) {
      testExamResult.value = { type: 'alert-info', message: 'ℹ 当前使用内容生成API配置，无需单独测试。' }
      return
    }

    if (!examForm.apiKey) {
      testExamResult.value = { type: 'alert-warning', message: '⚠ 请输入API密钥后再测试。' }
      return
    }

    // 调用后端测试 API
    const response = await fetch('http://localhost:3001/api/test-api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiConfig: {
          provider: examForm.provider,
          endpoint: examForm.endpoint,
          apiKey: examForm.apiKey,
          model: examForm.model,
          timeout: examForm.timeout,
          maxTokens: examForm.maxTokens,
          temperature: examForm.temperature
        }
      })
    })

    const data = await response.json()
    
    if (data.success) {
      testExamResult.value = { 
        type: 'alert-success', 
        message: `✓ API连接成功！模型：${data.model}，响应：${data.response}` 
      }
    } else {
      testExamResult.value = { type: 'alert-error', message: '✗ ' + data.error }
    }
  } catch (error) {
    testExamResult.value = { type: 'alert-error', message: '✗ API连接失败：' + error.message }
  } finally {
    testingExam.value = false
  }
}

const saveAppearanceConfig = () => {
  // 保存提示符颜色
  const settings = JSON.parse(localStorage.getItem('settings') || '{}')
  settings.promptColors = {
    color1: promptColorForm.color1,
    color2: promptColorForm.color2,
    color3: promptColorForm.color3,
    textColor1: promptColorForm.textColor1,
    textColor2: promptColorForm.textColor2,
    textColor3: promptColorForm.textColor3
  }
  localStorage.setItem('settings', JSON.stringify(settings))
  
  saveAllSettings()
  showNotification('外观设置已保存')
}

const resetAppearanceForm = () => {
  const saved = localStorage.getItem('settings')
  if (saved) {
    const settings = JSON.parse(saved)
    if (settings.appearance) Object.assign(appearanceForm, settings.appearance)
    if (settings.promptColors) {
      promptColorForm.color1 = settings.promptColors.color1 || '#7CD9FF'
      promptColorForm.color2 = settings.promptColors.color2 || '#BDADFF'
      promptColorForm.color3 = settings.promptColors.color3 || '#FF5991'
      promptColorForm.textColor1 = settings.promptColors.textColor1 || '#1a1a2e'
      promptColorForm.textColor2 = settings.promptColors.textColor2 || '#1a1a2e'
      promptColorForm.textColor3 = settings.promptColors.textColor3 || '#ffffff'
    }
  }
}

const saveNotificationConfig = () => {
  saveAllSettings()
  showNotification('通知设置已保存')
}

const resetNotificationForm = () => {
  const saved = localStorage.getItem('settings')
  if (saved) {
    const settings = JSON.parse(saved)
    if (settings.notification) Object.assign(notificationForm, settings.notification)
  }
}

const saveStudyConfig = () => {
  saveAllSettings()
  // 通知学习计划页面更新设置
  window.dispatchEvent(new CustomEvent('study-settings-changed', { detail: studyForm }))
  showNotification('学习计划设置已保存')
}

const resetStudyForm = () => {
  const saved = localStorage.getItem('settings')
  if (saved) {
    const settings = JSON.parse(saved)
    if (settings.study) Object.assign(studyForm, settings.study)
  }
}

const handleAvatarChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => { userForm.avatar = e.target.result }
    reader.readAsDataURL(file)
  }
}

const testApiConnection = async () => {
  testing.value = true
  testResult.value = null
  try {
    if (!apiForm.apiKey) {
      testResult.value = { type: 'alert-warning', message: '⚠ 请输入API密钥后再测试。' }
      return
    }

    // 调用后端测试 API
    const response = await fetch('http://localhost:3001/api/test-api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiConfig: {
          provider: apiForm.provider,
          endpoint: apiForm.endpoint,
          apiKey: apiForm.apiKey,
          model: apiForm.model,
          timeout: apiForm.timeout,
          maxTokens: apiForm.maxTokens,
          temperature: apiForm.temperature
        }
      })
    })

    const data = await response.json()
    
    if (data.success) {
      testResult.value = { 
        type: 'alert-success', 
        message: `✓ API连接成功！模型：${data.model}，响应：${data.response}` 
      }
    } else {
      testResult.value = { type: 'alert-error', message: '✗ ' + data.error }
    }
  } catch (error) {
    testResult.value = { type: 'alert-error', message: '✗ API连接失败：' + error.message }
  } finally {
    testing.value = false
  }
}

const testGeneratorConnection = async () => {
  testingGenerator.value = true
  testGeneratorResult.value = null
  try {
    if (!generatorForm.apiKey) {
      testGeneratorResult.value = { type: 'alert-warning', message: '⚠ 请输入API密钥后再测试。' }
      return
    }

    // 调用后端测试 API
    const response = await fetch('http://localhost:3001/api/test-api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiConfig: {
          provider: generatorForm.provider,
          endpoint: generatorForm.endpoint,
          apiKey: generatorForm.apiKey,
          model: generatorForm.model,
          timeout: generatorForm.timeout,
          maxTokens: generatorForm.maxTokens,
          temperature: generatorForm.temperature
        }
      })
    })

    const data = await response.json()
    
    if (data.success) {
      testGeneratorResult.value = { 
        type: 'alert-success', 
        message: `✓ API连接成功！模型：${data.model}，响应：${data.response}` 
      }
    } else {
      testGeneratorResult.value = { type: 'alert-error', message: '✗ ' + data.error }
    }
  } catch (error) {
    testGeneratorResult.value = { type: 'alert-error', message: '✗ API连接失败：' + error.message }
  } finally {
    testingGenerator.value = false
  }
}

const showNotification = (message, type = 'success') => {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 2000)
}

const handleProviderChange = () => {
  if (apiForm.provider !== 'custom') apiForm.endpoint = defaultEndpoints[apiForm.provider]
  syncApiModels()
}

const handleGeneratorProviderChange = () => {
  if (generatorForm.provider !== 'custom') generatorForm.endpoint = defaultEndpoints[generatorForm.provider]
  syncGeneratorModels()
}

const handleExamProviderChange = () => {
  if (examForm.provider !== 'custom') examForm.endpoint = defaultEndpoints[examForm.provider]
  syncExamModels()
}

watch(() => apiForm.provider, handleProviderChange)
watch(() => generatorForm.provider, handleGeneratorProviderChange)
watch(() => examForm.provider, handleExamProviderChange)

onMounted(() => {
  loadSavedData()
  if (apiForm.provider !== 'custom') apiForm.endpoint = defaultEndpoints[apiForm.provider]
  if (generatorForm.provider !== 'custom') generatorForm.endpoint = defaultEndpoints[generatorForm.provider]
  // 初始化模型列表
  syncApiModels()
  syncGeneratorModels()
  syncExamModels()
})
</script>

<style scoped>
.settings-container {
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

/* DaisyUI 输入框样式优化 */
.input {
  border: 1px solid oklch(var(--bc) / 0.2);
}
</style>
