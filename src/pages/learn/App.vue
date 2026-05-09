<template>
  <div class="learn-container p-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold flex items-center gap-3">
          <div class="avatar placeholder">
            <div class="bg-primary text-primary-content rounded-full w-12">
              <span class="text-xl font-bold"></span>
            </div>
          </div>
          学习资料库
        </h1>
        <p class="text-base-content/60 mt-2 flex items-center gap-2">
          <span class="badge badge-ghost">智能分类</span>
          按学科浏览视频、文档和PPT
        </p>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-ghost btn-sm" @click="openSubjectModal" title="管理学科">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          管理学科
        </button>
        <button class="btn btn-accent btn-sm" @click="startQuickTest" title="快速测试">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          快速测试
        </button>
        <button class="btn btn-error btn-sm" @click="goToErrorBook" title="错题本">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          错题本
        </button>
        <button class="btn btn-secondary" @click="openExamModal" title="生成阶段性测试">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          生成阶段性测试
        </button>
        <button class="btn btn-primary" @click="showUploadModal = true">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path d="M12 4v16m8-8H4"></path>
          </svg>
          上传资料
        </button>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="card bg-base-100 shadow-xl mb-6">
      <div class="card-body">
        <div class="flex flex-col md:flex-row gap-4">
          <!-- 学科筛选 -->
          <div class="flex-1">
            <label class="label">
              <span class="label-text font-medium">选择学科</span>
            </label>
            <select v-model="selectedSubject" class="select select-bordered w-full" @change="loadMaterials">
              <option value="all">全部学科</option>
              <option v-for="subject in subjects" :key="subject.name" :value="subject.name">{{ subject.displayName }}</option>
            </select>
          </div>
          
          <!-- 资料类型筛选 -->
          <div class="flex-1">
            <label class="label">
              <span class="label-text font-medium">资料类型</span>
            </label>
            <select v-model="selectedCategory" class="select select-bordered w-full" @change="loadMaterials">
              <option value="all">全部类型</option>
              <option value="video">视频</option>
              <option value="document">文档</option>
              <option value="ppt">PPT</option>
            </select>
          </div>

          <!-- 搜索框 -->
          <div class="flex-1">
            <label class="label">
              <span class="label-text font-medium">搜索资料</span>
            </label>
            <label class="input input-bordered flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="M21 21l-4.35-4.35"></path>
              </svg>
              <input v-model="searchQuery" type="text" placeholder="搜索资料标题..." class="grow" @input="filterMaterials" />
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- 学科标签快速筛选 -->
    <div class="flex flex-wrap gap-2 mb-6">
      <button 
        class="btn btn-sm"
        :class="selectedSubject === 'all' ? 'btn-primary' : 'btn-ghost'"
        @click="selectSubject('all')"
      >
        全部
      </button>
      <button 
        v-for="subject in subjects" 
        :key="subject.name"
        class="btn btn-sm"
        :class="selectedSubject === subject.name ? 'btn-primary' : 'btn-ghost'"
        @click="selectSubject(subject.name)"
      >
        {{ subject.displayName }}
      </button>
    </div>

    <!-- 统计信息 -->
    <div class="flex gap-4 mb-6">
      <div class="stat bg-base-100 rounded-lg shadow">
        <div class="stat-figure text-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </div>
        <div class="stat-title">视频</div>
        <div class="stat-value text-secondary">{{ stats.video }}</div>
      </div>
      <div class="stat bg-base-100 rounded-lg shadow">
        <div class="stat-figure text-accent">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
        </div>
        <div class="stat-title">文档</div>
        <div class="stat-value text-accent">{{ stats.document }}</div>
      </div>
      <div class="stat bg-base-100 rounded-lg shadow">
        <div class="stat-figure text-info">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
        </div>
        <div class="stat-title">PPT</div>
        <div class="stat-value text-info">{{ stats.ppt }}</div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <!-- 资料列表 -->
    <div v-else-if="filteredMaterials.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="material in filteredMaterials" :key="material.id" class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
        <figure class="h-40 bg-base-200 relative cursor-pointer" @click="openMaterial(material)">
          <!-- 视频封面 -->
          <div v-if="material.category === 'video'" class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-secondary/20 to-primary/20">
            <div class="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </div>
          </div>
          
          <!-- 文档封面 -->
          <div v-else-if="material.category === 'document'" class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent/20 to-primary/20">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-accent/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
          </div>
          
          <!-- PPT封面 -->
          <div v-else class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-info/20 to-primary/20">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-info/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </div>
          
          <!-- 难度标签 -->
          <div class="absolute top-2 right-2">
            <span class="badge badge-sm" :class="getDifficultyClass(material.difficulty)">
              {{ getDifficultyText(material.difficulty) }}
            </span>
          </div>
        </figure>
        
        <div class="card-body p-4">
          <h3 class="card-title text-sm line-clamp-2 cursor-pointer hover:text-primary" @click="openMaterial(material)">
            {{ material.title }}
          </h3>
          
          <div class="flex items-center gap-2 mt-2">
            <span class="badge badge-ghost badge-sm">{{ getSubjectDisplayName(material.subject) }}</span>
            <span class="badge badge-ghost badge-sm">{{ getCategoryText(material.category) }}</span>
          </div>
          
          <p v-if="material.description" class="text-xs text-base-content/60 mt-2 line-clamp-2">
            {{ material.description }}
          </p>
          
          <div class="card-actions justify-end mt-3">
            <button class="btn btn-sm btn-ghost" @click.stop="editMaterial(material)">编辑</button>
            <button class="btn btn-sm btn-primary" @click.stop="openMaterial(material)">
              {{ material.category === 'video' ? '播放' : '查看' }}
            </button>
            <button class="btn btn-sm btn-error btn-outline" @click.stop="confirmDelete(material)">删除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="card bg-base-100 shadow-xl">
      <div class="card-body items-center text-center py-16">
        <div class="w-24 h-24 rounded-full bg-base-300 mx-auto flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
        </div>
        <h3 class="text-xl font-medium mb-2">暂无学习资料</h3>
        <p class="text-base-content/60 mb-4">点击上方按钮上传学习资料</p>
        <button class="btn btn-primary" @click="showUploadModal = true">上传资料</button>
      </div>
    </div>

    <!-- 上传弹窗 -->
    <div v-if="showUploadModal" class="modal modal-open">
      <div class="modal-box max-w-2xl">
        <!-- 弹窗头部 -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="font-bold text-xl flex items-center gap-2">
            <span class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
              </svg>
            </span>
            {{ editingMaterial ? '编辑资料' : '上传学习资料' }}
          </h3>
          <button class="btn btn-ghost btn-sm btn-circle" @click="closeUploadModal">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- 左侧：基本信息 -->
          <div class="space-y-5">
            <!-- 资料标题 -->
            <div class="form-control">
              <label class="label py-1">
                <span class="label-text font-medium flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                  </svg>
                  资料标题
                </span>
                <span class="label-text-alt text-error">*</span>
              </label>
              <input v-model="uploadForm.title" type="text" placeholder="请输入资料标题" class="input input-bordered input-md w-full focus:border-primary" />
            </div>
            
            <!-- 资料简介 -->
            <div class="form-control">
              <label class="label py-1">
                <span class="label-text font-medium flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path d="M4 6h16M4 12h16M4 18h7"></path>
                  </svg>
                  资料简介
                </span>
              </label>
              <textarea v-model="uploadForm.description" placeholder="请输入资料简介（可选）" class="textarea textarea-bordered w-full h-24 resize-none focus:border-primary"></textarea>
            </div>
            
            <!-- 学科分类 -->
            <div class="form-control">
              <label class="label py-1">
                <span class="label-text font-medium flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                  </svg>
                  学科分类
                </span>
                <span class="label-text-alt text-error">*</span>
              </label>
              
              <!-- 学科选择 + 新建学科按钮 -->
              <div class="flex gap-2">
                <select v-model="uploadForm.subject" class="select select-bordered flex-1 focus:border-primary">
                  <option value="">选择学科</option>
                  <option v-for="subject in subjects" :key="subject.name" :value="subject.name">{{ subject.displayName }}</option>
                </select>
                <button class="btn btn-outline btn-primary btn-sm px-3" @click="showAddSubjectModal = true" title="新建学科">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path d="M12 4v16m8-8H4"></path>
                  </svg>
                </button>
              </div>
              
              <!-- 已选学科标签 -->
              <div v-if="uploadForm.subject" class="mt-2">
                <span class="badge badge-primary gap-2">
                  {{ getSubjectDisplayName(uploadForm.subject) }}
                  <button class="w-4 h-4 rounded-full hover:bg-white/30" @click="uploadForm.subject = ''">×</button>
                </span>
              </div>
            </div>
            
            <!-- 资料类型 -->
            <div class="form-control">
              <label class="label py-1">
                <span class="label-text font-medium flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                  </svg>
                  资料类型
                </span>
                <span class="label-text-alt text-error">*</span>
              </label>
              <div class="grid grid-cols-3 gap-2">
                <label v-for="type in [{value:'video',label:'视频',icon:'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z'},{value:'document',label:'文档',icon:'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'},{value:'ppt',label:'PPT',icon:'M8 13v-1m4 1v-3m4 3V8M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z'}]" 
                  :key="type.value"
                  class="cursor-pointer"
                  @click="uploadForm.category = type.value">
                  <input type="radio" class="hidden" :value="type.value" />
                  <div class="border-2 rounded-lg p-3 text-center transition-all"
                    :class="uploadForm.category === type.value ? 'border-primary bg-primary/5' : 'border-base-300 hover:border-primary/50'">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mx-auto mb-1" :class="uploadForm.category === type.value ? 'text-primary' : 'text-base-content/50'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" :d="type.icon"></path>
                    </svg>
                    <span class="text-sm font-medium" :class="uploadForm.category === type.value ? 'text-primary' : 'text-base-content/70'">{{ type.label }}</span>
                  </div>
                </label>
              </div>
            </div>
            
            <!-- 难易程度 -->
            <div class="form-control">
              <label class="label py-1">
                <span class="label-text font-medium flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                  难易程度
                </span>
              </label>
              <div class="flex gap-2">
                <label v-for="level in [{value:'easy',label:'简单',color:'success'},{value:'medium',label:'中等',color:'warning'},{value:'hard',label:'困难',color:'error'}]" 
                  :key="level.value" class="flex-1 cursor-pointer">
                  <input type="radio" class="hidden" :value="level.value" />
                  <div class="btn btn-sm w-full border-2"
                    :class="uploadForm.difficulty === level.value ? `btn-${level.color}` : 'btn-ghost'">
                    {{ level.label }}
                  </div>
                </label>
              </div>
            </div>
          </div>
          
          <!-- 右侧：文件上传 -->
          <div v-if="!editingMaterial" class="space-y-4">
            <div class="form-control">
              <label class="label py-1">
                <span class="label-text font-medium flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                  选择文件
                </span>
                <span class="label-text-alt text-error">*</span>
              </label>
              
              <!-- 文件上传区域 -->
              <div 
                class="border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer"
                :class="uploadForm.file ? 'border-primary bg-primary/5' : 'border-base-300 hover:border-primary/50 hover:bg-base-200/50'"
                @click="$refs.fileInput.click()"
                @dragover.prevent="dragOver = true"
                @dragleave.prevent="dragOver = false"
                @drop.prevent="handleFileDrop"
              >
                <input ref="fileInput" type="file" class="hidden" :accept="getFileAccept()" @change="handleFileSelect" />
                
                <div v-if="uploadForm.file" class="space-y-3">
                  <div class="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <p class="font-medium text-primary">{{ uploadForm.file.name }}</p>
                  <p class="text-xs text-base-content/50">{{ formatFileSize(uploadForm.file.size) }}</p>
                  <button class="btn btn-ghost btn-xs" @click.stop="uploadForm.file = null">重新选择</button>
                </div>
                
                <div v-else class="space-y-3">
                  <div class="w-16 h-16 rounded-full bg-base-300 mx-auto flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                  </div>
                  <p class="text-base-content/60">点击或拖拽文件到此处</p>
                </div>
              </div>
              
              <!-- 支持格式 -->
              <div class="mt-3 flex flex-wrap gap-2 justify-center">
                <span v-for="ext in getFileExtensions().split(',')" :key="ext" class="badge badge-ghost badge-sm">{{ ext.trim() }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 上传进度 -->
        <div v-if="uploading" class="mt-6">
          <div class="flex justify-between text-sm mb-1">
            <span>上传中...</span>
            <span class="text-primary">请稍候</span>
          </div>
          <progress class="progress progress-primary w-full"></progress>
        </div>
        
        <div class="modal-action mt-6">
          <button class="btn btn-ghost" @click="closeUploadModal">取消</button>
          <button class="btn btn-primary min-w-24" :disabled="!canUpload || uploading" @click="uploadMaterial">
            <span v-if="uploading" class="loading loading-spinner loading-sm"></span>
            {{ uploading ? '上传中...' : (editingMaterial ? '保存修改' : '开始上传') }}
          </button>
        </div>
      </div>
      <div class="modal-backdrop" @click="closeUploadModal"></div>
    </div>
    
    <!-- 新建学科弹窗（统一，层级最高） -->
    <div v-if="showAddSubjectModal" class="modal modal-open" style="z-index: 10001;">
      <div class="modal-box max-w-md">
        <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
          <span class="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
          </span>
          新建学科
        </h3>
        
        <!-- 成功提示 -->
        <div v-if="addSubjectSuccess" class="alert alert-success mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>学科添加成功！</span>
        </div>
        
        <!-- 错误提示 -->
        <div v-if="addSubjectError" class="alert alert-error mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{{ addSubjectError }}</span>
        </div>
        
        <div class="space-y-4">
          <div class="form-control">
            <label class="label"><span class="label-text font-medium">学科名称 *</span></label>
            <input v-model="addSubjectForm.displayName" type="text" placeholder="例如：高等数学" class="input input-bordered w-full focus:border-secondary" @input="autoGenerateName" />
          </div>
          
          <div class="form-control">
            <label class="label"><span class="label-text font-medium">学科标识 *</span></label>
            <input v-model="addSubjectForm.name" type="text" placeholder="英文小写，例如：math" class="input input-bordered w-full focus:border-secondary" />
            <label class="label">
              <span class="label-text-alt">用于系统内部识别的唯一标识（可自动生成）</span>
            </label>
          </div>

          <div class="form-control">
            <label class="label"><span class="label-text font-medium">识别关键词</span></label>
            <input v-model="addSubjectForm.keywords" type="text" placeholder="用逗号分隔关键词，如：微积分,极限,导数" class="input input-bordered w-full focus:border-secondary" />
            <label class="label">
              <span class="label-text-alt">自动识别时会匹配这些关键词，支持模糊搜索</span>
            </label>
          </div>
          
          <div class="form-control">
            <label class="label"><span class="label-text font-medium">选择颜色</span></label>
            <div class="flex flex-wrap gap-2">
              <button v-for="color in colorOptions" :key="color.value"
                class="w-8 h-8 rounded-full border-2 transition-all"
                :class="addSubjectForm.color === color.value ? 'border-gray-800 scale-110' : 'border-transparent hover:scale-105'"
                :style="{ backgroundColor: color.value }"
                @click="addSubjectForm.color = color.value"
                :title="color.label">
              </button>
            </div>
          </div>
        </div>
        
        <div class="modal-action">
          <button class="btn btn-ghost" @click="closeAddSubjectModal">取消</button>
          <button class="btn btn-secondary" :disabled="!addSubjectForm.name || !addSubjectForm.displayName || addingSubject" @click="addNewSubject">
            <span v-if="addingSubject" class="loading loading-spinner loading-sm"></span>
            {{ addingSubject ? '添加中...' : '确认添加' }}
          </button>
        </div>
      </div>
      <div class="modal-backdrop" @click="closeAddSubjectModal"></div>
    </div>

    <!-- 学科管理弹窗 -->
    <div v-if="showSubjectModal" class="modal modal-open">
      <div class="modal-box max-w-2xl">
        <h3 class="font-bold text-xl mb-4 flex items-center gap-2">
          <span class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
          </span>
          学科管理
        </h3>
        
        <!-- 现有学科列表 -->
        <div class="space-y-3 mb-6">
          <div v-for="subject in subjectsWithStats" :key="subject.name" class="flex items-center justify-between p-4 bg-base-200 rounded-xl">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center" :style="{ backgroundColor: subject.color + '20' }">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" :style="{ color: subject.color }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
              <div>
                <p class="font-medium">{{ subject.displayName }}</p>
                <p class="text-xs text-base-content/50">{{ subject.name }}</p>
                <p v-if="subject.keywords" class="text-xs text-base-content/30 mt-1">
                  关键词: {{ subject.keywords.split(',').slice(0, 5).join(', ') }}{{ subject.keywords.split(',').length > 5 ? '...' : '' }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="text-right">
                <p class="text-sm">
                  <span class="badge badge-ghost badge-sm">{{ subject.materialCount || 0 }} 个资料</span>
                </p>
              </div>
              <button 
                class="btn btn-error btn-outline btn-sm gap-1" 
                @click="confirmDeleteSubject(subject)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                删除
              </button>
            </div>
          </div>
          <div v-if="subjects.length === 0" class="text-center py-8 text-base-content/50">
            暂无学科，请添加
          </div>
        </div>
        
        <!-- 添加入口 -->
        <div class="border-t border-base-300 pt-4">
          <button class="btn btn-outline btn-primary w-full gap-2" @click="showAddSubjectModal = true">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path d="M12 4v16m8-8H4"></path>
            </svg>
            添加新学科
          </button>
        </div>
        
        <div class="modal-action">
          <button class="btn btn-ghost" @click="showSubjectModal = false">关闭</button>
        </div>
      </div>
      <div class="modal-backdrop" @click="showSubjectModal = false"></div>
    </div>
    
    <!-- 删除学科确认弹窗 -->
    <div v-if="showDeleteSubjectModal" class="modal modal-open">
      <div class="modal-box max-w-md">
        <div class="text-center mb-4">
          <div class="w-16 h-16 rounded-full bg-error/10 mx-auto flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <h3 class="font-bold text-xl text-error">删除学科</h3>
        </div>
        
        <!-- 有资料时显示警告 -->
        <div v-if="deletingSubjectInfo?.hasMaterials" class="alert alert-error mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <p class="font-medium">警告：此操作不可逆！</p>
            <p class="text-sm">该学科下有 <strong>{{ deletingSubjectInfo.materialCount }}</strong> 个资料，删除将一并清除所有资料。</p>
          </div>
        </div>
        
        <div class="alert alert-warning mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <p class="font-medium">请再次确认</p>
            <p class="text-sm">为防止误操作，请在下框输入学科名称 <strong>"{{ deletingSubject?.displayName }}"</strong> 以确认删除</p>
          </div>
        </div>
        
        <div class="form-control">
          <label class="label"><span class="label-text font-medium">输入学科名称确认</span></label>
          <input 
            v-model="deleteConfirmName" 
            type="text" 
            :placeholder="deletingSubject?.displayName" 
            class="input input-bordered input-error w-full"
          />
        </div>
        
        <div class="modal-action">
          <button class="btn btn-ghost" @click="closeDeleteSubjectModal">取消</button>
          <button 
            class="btn btn-error" 
            :disabled="deleteConfirmName !== deletingSubject?.name" 
            @click="forceDeleteSubject"
          >
            <span v-if="deleting" class="loading loading-spinner loading-sm"></span>
            确认删除
          </button>
        </div>
      </div>
      <div class="modal-backdrop" @click="closeDeleteSubjectModal"></div>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteModal" class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-lg">确认删除</h3>
        <p class="py-4">确定要删除资料「{{ deletingMaterial?.title }}」吗？此操作不可恢复。</p>
        <div class="modal-action">
          <button class="btn btn-ghost" @click="showDeleteModal = false">取消</button>
          <button class="btn btn-error" @click="deleteMaterial">确认删除</button>
        </div>
      </div>
      <div class="modal-backdrop" @click="showDeleteModal = false"></div>
    </div>

    <!-- 预览弹窗 -->
    <div v-if="showPreviewModal" class="modal modal-open">
      <div class="modal-box max-w-4xl">
        <h3 class="font-bold text-lg mb-4">{{ previewMaterial?.title }}</h3>
        
        <div v-if="previewMaterial?.category === 'video'" class="aspect-video bg-black rounded-lg flex items-center justify-center">
          <video v-if="previewMaterial.url" :src="apiBaseUrl + previewMaterial.url" controls class="max-w-full max-h-full"></video>
          <p v-else class="text-white">无法加载视频</p>
        </div>
        
        <div v-else class="bg-base-200 rounded-lg p-8 text-center">
          <p class="text-base-content/60">点击下方按钮在新窗口打开</p>
          <a v-if="previewMaterial?.url" :href="apiBaseUrl + previewMaterial.url" target="_blank" class="btn btn-primary mt-4">
            打开文件
          </a>
        </div>
        
        <div class="modal-action">
          <button class="btn btn-ghost" @click="showPreviewModal = false">关闭</button>
        </div>
      </div>
      <div class="modal-backdrop" @click="showPreviewModal = false"></div>
    </div>

    <!-- 阶段性测试设置弹窗 -->
    <div v-if="showExamModal" class="modal modal-open">
      <div class="modal-box max-w-2xl max-h-[90vh] flex flex-col bg-base-100">
        <!-- 标题区域 -->
        <div class="bg-base-200 -m-4 mb-4 p-4 rounded-t-lg">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-lg flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              生成阶段性测试
            </h3>
            <button class="btn btn-ghost btn-sm btn-circle" @click="closeExamModal">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- 设置表单 -->
        <div class="flex-1 overflow-y-auto space-y-4 pr-2">
          <!-- 生成方式选择 -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">生成方式</span>
            </label>
            <div class="flex gap-4">
              <label class="label cursor-pointer justify-start gap-2">
                <input type="radio" v-model="examForm.generateMode" value="bank" class="radio radio-primary" />
                <span class="label-text">从题库生成</span>
              </label>
              <label class="label cursor-pointer justify-start gap-2">
                <input type="radio" v-model="examForm.generateMode" value="ai" class="radio radio-primary" />
                <span class="label-text">AI智能生成</span>
              </label>
            </div>
            <label class="label">
              <span class="label-text-alt text-base-content/60">
                {{ examForm.generateMode === 'bank' ? '从本地题库中随机抽取题目，生成速度快' : '由AI根据设置生成新题目，题目更灵活' }}
              </span>
            </label>
          </div>

          <!-- 学科选择 -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">选择学科</span>
              <span class="label-text-alt text-error">*</span>
            </label>
            <select v-model="examForm.subject" class="select select-bordered w-full">
              <option value="">请选择学科</option>
              <option v-for="subject in subjects" :key="subject.name" :value="subject.name">
                {{ subject.displayName }}
              </option>
            </select>
          </div>

          <!-- 题库统计信息（仅题库模式显示） -->
          <div v-if="examForm.generateMode === 'bank' && questionBankStats.total > 0" class="alert alert-info alert-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              该学科题库共有 <strong>{{ questionBankStats.total }}</strong> 道题目
              <span v-if="questionBankStats.byType">（单选:{{ questionBankStats.byType.single || 0 }} 多选:{{ questionBankStats.byType.multiple || 0 }} 填空:{{ questionBankStats.byType.fill || 0 }} 判断:{{ questionBankStats.byType.judge || 0 }}）</span>
            </span>
          </div>

          <div v-if="examForm.generateMode === 'bank' && questionBankStats.total === 0 && examForm.subject" class="alert alert-warning alert-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>该学科暂无题库，请选择AI生成模式或先添加题目</span>
          </div>
          
          <!-- 时间限制 -->
          <div class="form-control">
            <label class="label cursor-pointer justify-start gap-4">
              <input type="checkbox" v-model="examForm.enableTimeLimit" class="checkbox checkbox-primary" />
              <span class="label-text font-medium">启用时间限制</span>
            </label>
          </div>
          
          <div v-if="examForm.enableTimeLimit" class="form-control pl-8">
            <label class="label"><span class="label-text">考试时长（分钟）</span></label>
            <input 
              v-model.number="examForm.timeLimit" 
              type="number" 
              min="10" 
              max="180" 
              class="input input-bordered w-32" 
            />
          </div>
          
          <!-- 考试模式 -->
          <div class="form-control">
            <label class="label"><span class="label-text font-medium">考试模式</span></label>
            <div class="flex gap-4">
              <label class="label cursor-pointer justify-start gap-2">
                <input type="radio" v-model="examForm.mode" value="exam" class="radio radio-primary" />
                <span class="label-text">考试模式</span>
              </label>
              <label class="label cursor-pointer justify-start gap-2">
                <input type="radio" v-model="examForm.mode" value="practice" class="radio radio-primary" />
                <span class="label-text">练习模式</span>
              </label>
            </div>
            <label class="label">
              <span class="label-text-alt text-base-content/60">
                {{ examForm.mode === 'exam' ? '提交后统一批改，生成解析文档' : '做一题给一题答案，即时反馈' }}
              </span>
            </label>
          </div>
          
          <!-- 题目数量设置 -->
          <div class="card bg-base-200">
            <div class="card-body p-4">
              <h4 class="font-medium mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                题目数量设置
              </h4>
              <div class="grid grid-cols-2 gap-4">
                <div class="form-control">
                  <label class="label"><span class="label-text">单选题</span></label>
                  <input v-model.number="examForm.questionCounts.single" type="number" min="0" max="50" class="input input-bordered input-sm" />
                </div>
                <div class="form-control">
                  <label class="label"><span class="label-text">多选题</span></label>
                  <input v-model.number="examForm.questionCounts.multiple" type="number" min="0" max="50" class="input input-bordered input-sm" />
                </div>
                <div class="form-control">
                  <label class="label"><span class="label-text">填空题</span></label>
                  <input v-model.number="examForm.questionCounts.fill" type="number" min="0" max="50" class="input input-bordered input-sm" />
                </div>
                <div class="form-control">
                  <label class="label"><span class="label-text">判断题</span></label>
                  <input v-model.number="examForm.questionCounts.judge" type="number" min="0" max="50" class="input input-bordered input-sm" />
                </div>
                <div class="form-control col-span-2">
                  <label class="label"><span class="label-text">综合应用题</span></label>
                  <input v-model.number="examForm.questionCounts.comprehensive" type="number" min="0" max="20" class="input input-bordered input-sm" />
                </div>
              </div>
              <div class="mt-3 text-sm text-base-content/60">
                总题数: <span class="font-bold text-primary">{{ totalQuestionCount }}</span> 题
              </div>
            </div>
          </div>
          
          <!-- 难度选择 -->
          <div class="form-control">
            <label class="label"><span class="label-text font-medium">难度设置</span></label>
            <select v-model="examForm.difficulty" class="select select-bordered w-full">
              <option value="easy">简单</option>
              <option value="medium">中等</option>
              <option value="hard">困难</option>
              <option value="mixed">混合难度</option>
            </select>
          </div>
          
          <!-- 知识点范围 -->
          <div class="form-control">
            <label class="label"><span class="label-text font-medium">知识点范围（可选）</span></label>
            <textarea 
              v-model="examForm.knowledgeScope" 
              class="textarea textarea-bordered h-20" 
              placeholder="输入要考察的知识点，用逗号分隔，如：微积分,导数,积分..."
            ></textarea>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="modal-action mt-4 pt-4 border-t border-base-300">
          <button class="btn btn-ghost" @click="closeExamModal">取消</button>
          <button 
            v-if="examForm.generateMode === 'bank'"
            class="btn btn-primary" 
            :disabled="!canGenerateExam || isGeneratingExam || questionBankStats.total === 0"
            @click="generateExamFromBank"
          >
            <span v-if="isGeneratingExam" class="loading loading-spinner loading-sm"></span>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            {{ isGeneratingExam ? '生成中...' : '从题库生成' }}
          </button>
          <button 
            v-else
            class="btn btn-primary" 
            :disabled="!canGenerateExam || isGeneratingExam"
            @click="generateExam"
          >
            <span v-if="isGeneratingExam" class="loading loading-spinner loading-sm"></span>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {{ isGeneratingExam ? 'AI生成中...' : 'AI智能生成' }}
          </button>
        </div>
      </div>
      <div class="modal-backdrop" @click="closeExamModal"></div>
    </div>

    <!-- AI 生成内容对话框 -->
    <div v-if="showGenerateModal" class="modal modal-open">
      <div class="modal-box max-w-4xl max-h-[80vh] flex flex-col bg-base-100">
        <!-- 标题区域 - 高对比度背景 -->
        <div class="bg-base-200 -m-4 mb-4 p-4 rounded-t-lg">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-lg flex items-center gap-3 flex-wrap">
              <span 
                class="badge badge-lg"
                :class="{
                  'badge-secondary': generateRequest?.type === 'ppt',
                  'badge-accent': generateRequest?.type === 'md',
                  'badge-info': generateRequest?.type === 'video'
                }"
              >
                {{ generateRequest?.type === 'ppt' ? 'PPT' : generateRequest?.type === 'md' ? 'Markdown' : '视频脚本' }}
              </span>
              <span class="text-primary-content font-semibold bg-primary px-3 py-1 rounded-lg">
                {{ generateRequest?.prompt || 'AI 生成内容' }}
              </span>
            </h3>
            <button class="btn btn-ghost btn-sm btn-circle" @click="showGenerateModal = false">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- 生成内容区域 -->
        <div class="flex-1 overflow-y-auto bg-base-200 rounded-lg p-4 mb-4">
          <div v-if="isGenerating" class="flex items-center justify-center h-32">
            <span class="loading loading-spinner loading-lg text-primary"></span>
            <span class="ml-3">正在生成内容...</span>
          </div>
          <div v-else-if="generatedContent" class="prose prose-sm max-w-none" v-html="generatedContent"></div>
          <div v-else class="text-center text-base-content/50 py-8">
            <p>点击下方按钮开始生成</p>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="modal-action">
          <button class="btn btn-ghost" @click="showGenerateModal = false">关闭</button>
          <button 
            v-if="!generatedContent" 
            class="btn btn-primary" 
            :disabled="isGenerating"
            @click="startGeneration"
          >
            <span v-if="isGenerating" class="loading loading-spinner loading-sm"></span>
            开始生成
          </button>
          <button 
            v-else 
            class="btn btn-success"
            @click="saveGeneratedContent"
          >
            保存到资料库
          </button>
        </div>
      </div>
      <div class="modal-backdrop" @click="showGenerateModal = false"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const apiBaseUrl = 'http://localhost:3001'

// 统计数据
const stats = ref({ video: 0, document: 0, ppt: 0 })
const subjects = ref([])
const loading = ref(false)

// 筛选条件
const selectedSubject = ref('all')
const selectedCategory = ref('all')
const searchQuery = ref('')

// 资料列表
const materials = ref([])
const filteredMaterials = ref([])

// 上传表单
const showUploadModal = ref(false)
const editingMaterial = ref(null)
const uploading = ref(false)
const uploadForm = ref({
  title: '',
  description: '',
  subject: '',
  category: '',
  difficulty: 'medium',
  file: null
})

// 学科管理
const showSubjectModal = ref(false)
const subjectsWithStats = ref([])

// 删除学科确认
const showDeleteSubjectModal = ref(false)
const deletingSubject = ref(null)
const deletingSubjectInfo = ref(null)
const deleteConfirmName = ref('')
const deleting = ref(false)

// 新建学科弹窗
const showAddSubjectModal = ref(false)
const addSubjectForm = ref({ name: '', displayName: '', keywords: '', color: '#1989fa' })
const addingSubject = ref(false)
const addSubjectSuccess = ref(false)
const addSubjectError = ref('')

const colorOptions = [
  { value: '#1989fa', label: '蓝色' },
  { value: '#07c160', label: '绿色' },
  { value: '#ff9800', label: '橙色' },
  { value: '#9c27b0', label: '紫色' },
  { value: '#e91e63', label: '粉色' },
  { value: '#00bcd4', label: '青色' },
  { value: '#4caf50', label: '深绿' },
  { value: '#f44336', label: '红色' },
  { value: '#795548', label: '棕色' },
  { value: '#607d8b', label: '灰蓝' }
]

// 删除
const showDeleteModal = ref(false)
const deletingMaterial = ref(null)

// 预览
const showPreviewModal = ref(false)
const previewMaterial = ref(null)

// AI 生成内容对话框
const showGenerateModal = ref(false)
const generateRequest = ref(null)
const generatedContent = ref('')
const isGenerating = ref(false)

// 阶段性测试弹窗
const showExamModal = ref(false)
const isGeneratingExam = ref(false)
const examForm = ref({
  generateMode: 'bank', // 'bank' 或 'ai'
  subject: '',
  enableTimeLimit: true,
  timeLimit: 60,
  mode: 'exam',
  questionCounts: {
    single: 10,
    multiple: 5,
    fill: 5,
    judge: 5,
    comprehensive: 2
  },
  difficulty: 'medium',
  knowledgeScope: ''
})

// 题库统计信息
const questionBankStats = ref({ total: 0, byType: {} })

// 监听学科变化，更新题库统计
watch(() => examForm.value.subject, async (newSubject) => {
  if (newSubject && examForm.value.generateMode === 'bank') {
    await loadQuestionBankStats(newSubject)
  } else {
    questionBankStats.value = { total: 0, byType: {} }
  }
})

// 监听生成方式变化
watch(() => examForm.value.generateMode, async (newMode) => {
  if (newMode === 'bank' && examForm.value.subject) {
    await loadQuestionBankStats(examForm.value.subject)
  }
})

// 加载题库统计
const loadQuestionBankStats = async (subject) => {
  try {
    const response = await fetch(`${apiBaseUrl}/api/question-bank/${subject}/stats`)
    const data = await response.json()
    if (data.success) {
      questionBankStats.value = data.data
    }
  } catch (error) {
    console.error('加载题库统计失败:', error)
    questionBankStats.value = { total: 0, byType: {} }
  }
}

// 计算总题数
const totalQuestionCount = computed(() => {
  const counts = examForm.value.questionCounts
  return counts.single + counts.multiple + counts.fill + counts.judge + counts.comprehensive
})

// 是否可以生成考试
const canGenerateExam = computed(() => {
  return examForm.value.subject && totalQuestionCount.value > 0
})

// 打开考试设置弹窗
const openExamModal = async () => {
  // 重置表单
  examForm.value = {
    generateMode: 'bank', // 默认从题库生成
    subject: selectedSubject.value !== 'all' ? selectedSubject.value : '',
    enableTimeLimit: true,
    timeLimit: 60,
    mode: 'exam',
    questionCounts: {
      single: 10,
      multiple: 5,
      fill: 5,
      judge: 5,
      comprehensive: 2
    },
    difficulty: 'medium',
    knowledgeScope: ''
  }
  questionBankStats.value = { total: 0, byType: {} }
  showExamModal.value = true

  // 如果已选学科，加载题库统计
  if (examForm.value.subject) {
    await loadQuestionBankStats(examForm.value.subject)
  }
}

// 关闭考试设置弹窗
const closeExamModal = () => {
  showExamModal.value = false
  isGeneratingExam.value = false
}

// 生成考试（AI模式）
const generateExam = async () => {
  if (!canGenerateExam.value) return

  isGeneratingExam.value = true
  try {
    const response = await fetch(`${apiBaseUrl}/api/exams/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'default',
        ...examForm.value
      })
    })

    const data = await response.json()
    if (data.success) {
      // 保存考试ID到本地存储，跳转到考试页面
      localStorage.setItem('current_exam', JSON.stringify({
        examId: data.data.examId,
        settings: examForm.value
      }))
      closeExamModal()
      // 跳转到考试页面
      router.push('/exam')
    } else {
      alert('生成考试失败: ' + (data.error || '未知错误'))
    }
  } catch (error) {
    console.error('生成考试失败:', error)
    alert('生成考试失败，请检查网络连接')
  } finally {
    isGeneratingExam.value = false
  }
}

// 从题库生成考试
const generateExamFromBank = async () => {
  if (!canGenerateExam.value) return

  isGeneratingExam.value = true
  try {
    const response = await fetch(`${apiBaseUrl}/api/exams/generate-from-bank`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'default',
        ...examForm.value
      })
    })

    const data = await response.json()
    if (data.success) {
      // 保存考试ID到本地存储，跳转到考试页面
      localStorage.setItem('current_exam', JSON.stringify({
        examId: data.data.examId,
        settings: examForm.value
      }))
      closeExamModal()
      // 跳转到考试页面
      router.push('/exam')
    } else {
      alert('生成考试失败: ' + (data.error || data.message || '未知错误'))
    }
  } catch (error) {
    console.error('从题库生成考试失败:', error)
    alert('生成考试失败，请检查网络连接')
  } finally {
    isGeneratingExam.value = false
  }
}

// 跳转到错题本
const goToErrorBook = () => {
  router.push('/error-book')
}

// 快速测试 - 直接使用默认设置生成测试
const startQuickTest = async () => {
  const quickSettings = {
    userId: 'default',
    generateMode: 'bank',
    subject: 'math',
    enableTimeLimit: true,
    timeLimit: 30,
    mode: 'practice',
    questionCounts: {
      single: 5,
      multiple: 3,
      fill: 2,
      judge: 2,
      comprehensive: 1
    },
    difficulty: 'medium',
    knowledgeScope: ''
  }

  try {
    const response = await fetch(`${apiBaseUrl}/api/exams/generate-from-bank`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quickSettings)
    })

    const data = await response.json()
    if (data.success) {
      localStorage.setItem('current_exam', JSON.stringify({
        examId: data.data.examId,
        settings: quickSettings
      }))
      router.push('/exam')
    } else {
      alert('快速测试启动失败: ' + (data.error || data.message || '未知错误'))
    }
  } catch (error) {
    console.error('快速测试启动失败:', error)
    alert('启动失败，请检查网络连接')
  }
}

// 拖拽状态
const dragOver = ref(false)

// 是否可以上传
const canUpload = computed(() => {
  if (editingMaterial.value) {
    return uploadForm.value.title && uploadForm.value.subject
  }
  // 允许不选择学科（后端会自动识别）
  return uploadForm.value.title && uploadForm.value.category && uploadForm.value.file
})

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

// 打开学科管理弹窗
const openSubjectModal = async () => {
  await loadSubjects()
  await loadSubjectsWithStats()
  showSubjectModal.value = true
}

// 加载学科统计（包含资料数量）
const loadSubjectsWithStats = async () => {
  try {
    const response = await fetch(`${apiBaseUrl}/api/learning/stats`)
    const data = await response.json()
    if (data.success) {
      const subjectStats = data.subjectStats || {}
      subjectsWithStats.value = subjects.value.map(s => ({
        ...s,
        materialCount: subjectStats[s.name] || 0
      }))
    }
  } catch (error) {
    // 如果获取失败，直接使用学科列表
    subjectsWithStats.value = subjects.value.map(s => ({ ...s, materialCount: 0 }))
  }
}

// 确认删除学科
const confirmDeleteSubject = async (subject) => {
  deletingSubject.value = subject
  deleteConfirmName.value = ''
  
  try {
    const response = await fetch(`${apiBaseUrl}/api/subjects/${subject.name}`, {
      method: 'DELETE'
    })
    const data = await response.json()
    if (data.success) {
      deletingSubjectInfo.value = {
        hasMaterials: data.hasMaterials,
        materialCount: data.materialCount,
        hasKnowledge: data.hasKnowledge
      }
    }
  } catch (error) {
    deletingSubjectInfo.value = { hasMaterials: false, materialCount: 0, hasKnowledge: false }
  }
  
  showDeleteSubjectModal.value = true
}

// 关闭删除确认弹窗
const closeDeleteSubjectModal = () => {
  showDeleteSubjectModal.value = false
  deletingSubject.value = null
  deletingSubjectInfo.value = null
  deleteConfirmName.value = ''
}

// 强制删除学科
const forceDeleteSubject = async () => {
  if (deleteConfirmName.value !== deletingSubject.value?.name) return
  
  deleting.value = true
  try {
    const response = await fetch(`${apiBaseUrl}/api/subjects/${deletingSubject.value.name}/force`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmName: deleteConfirmName.value })
    })
    const data = await response.json()
    if (data.success) {
      closeDeleteSubjectModal()
      loadSubjects()
      loadSubjectsWithStats()
      loadMaterials()
      loadStats()
    } else {
      console.error('删除失败:', data.error)
    }
  } catch (error) {
    console.error('删除学科失败:', error)
  } finally {
    deleting.value = false
  }
}

// 获取学科显示名称
const getSubjectDisplayName = (subjectName) => {
  const subject = subjects.value.find(s => s.name === subjectName)
  return subject ? subject.displayName : subjectName
}

// 加载统计数据
const loadStats = async () => {
  try {
    const response = await fetch(`${apiBaseUrl}/api/learning/stats`)
    const data = await response.json()
    if (data.success) {
      stats.value = data.stats
    }
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

// 加载资料列表
const loadMaterials = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (selectedCategory.value !== 'all') {
      params.append('category', selectedCategory.value)
    }
    if (selectedSubject.value !== 'all') {
      params.append('subject', selectedSubject.value)
    }
    
    const url = `${apiBaseUrl}/api/learning/materials${params.toString() ? '?' + params.toString() : ''}`
    const response = await fetch(url)
    const data = await response.json()
    
    if (data.success) {
      materials.value = data.data
      filterMaterials()
    }
  } catch (error) {
    console.error('加载资料失败:', error)
    materials.value = []
  } finally {
    loading.value = false
  }
}

// 筛选资料
const filterMaterials = () => {
  let result = [...materials.value]
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(m => 
      m.title.toLowerCase().includes(query) ||
      (m.description && m.description.toLowerCase().includes(query))
    )
  }
  
  filteredMaterials.value = result
}

// 选择学科
const selectSubject = (subject) => {
  selectedSubject.value = subject
  loadMaterials()
}

// 获取分类文字
const getCategoryText = (category) => {
  const map = { video: '视频', document: '文档', ppt: 'PPT' }
  return map[category] || category
}

// 获取难度文字和样式
const getDifficultyText = (difficulty) => {
  const map = { easy: '简单', medium: '中等', hard: '困难' }
  return map[difficulty] || difficulty
}

const getDifficultyClass = (difficulty) => {
  const map = { easy: 'badge-success', medium: 'badge-warning', hard: 'badge-error' }
  return map[difficulty] || 'badge-ghost'
}

// 获取文件接受类型
const getFileAccept = () => {
  if (uploadForm.value.category === 'video') return 'video/*'
  if (uploadForm.value.category === 'ppt') return '.ppt,.pptx'
  return '.pdf,.doc,.docx,.txt,.md'
}

// 获取文件扩展名显示
const getFileExtensions = () => {
  if (uploadForm.value.category === 'video') return '.mp4, .webm'
  if (uploadForm.value.category === 'ppt') return '.ppt, .pptx'
  return '.pdf, .doc, .docx, .txt, .md'
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// 处理文件选择
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    uploadForm.value.file = file
    if (!uploadForm.value.title) {
      uploadForm.value.title = file.name.replace(/\.[^/.]+$/, '')
    }
  }
}

// 处理文件拖拽
const handleFileDrop = (event) => {
  dragOver.value = false
  const file = event.dataTransfer.files[0]
  if (file) {
    uploadForm.value.file = file
    if (!uploadForm.value.title) {
      uploadForm.value.title = file.name.replace(/\.[^/.]+$/, '')
    }
  }
}

// 快速添加学科 - 已废弃，使用统一的新建学科弹窗
// 保留作为向后兼容，但实际使用 addNewSubject

// 打开新建学科弹窗
const openAddSubjectModal = () => {
  addSubjectForm.value = { name: '', displayName: '', keywords: '', color: '#1989fa' }
  addSubjectSuccess.value = false
  addSubjectError.value = ''
  showAddSubjectModal.value = true
}

// 自动生成学科标识
const autoGenerateName = () => {
  if (addSubjectForm.value.displayName) {
    // 将中文转换为拼音或英文
    const name = addSubjectForm.value.displayName
      .toLowerCase()
      .replace(/[\u4e00-\u9fa5]/g, (char) => {
        // 常用中文词汇映射
        const dict = {
          '高': 'high', '等': 'higher', '数': 'math', '学': 'study',
          '线': 'linear', '性': 'linear', '代': 'algebra', '数': 'number',
          '概': 'probability', '率': 'rate', '论': 'theory',
          '物': 'physics', '理': 'science', '大': 'university',
          '专': 'major', '业': 'professional', '课': 'course',
          '英': 'english', '语': 'language',
          '编': 'coding', '程': 'program', '程': 'tech',
          '政': 'politics', '治': 'governance',
          '知': 'knowledge', '识': 'knowledge',
          '小': 'group', '组': 'team', '展': 'presentation', '示': 'show',
          '毕': 'graduation', '业': 'thesis', '答': 'defense', '辩': 'debate',
          '培': 'training', '训': 'train', '课': 'course', '件': 'materials',
          '梳': 'organize', '理': 'review',
        }
        return dict[char] || char
      })
      .replace(/[^a-z0-9]/g, '_')  // 非字母数字替换为下划线
      .replace(/_+/g, '_')         // 多个下划线合并
      .replace(/^_|_$/g, '')       // 去除首尾下划线
      .substring(0, 20)            // 限制长度
    
    addSubjectForm.value.name = name || 'custom_subject'
  }
}

// 关闭新建学科弹窗
const closeAddSubjectModal = () => {
  showAddSubjectModal.value = false
  addSubjectForm.value = { name: '', displayName: '', keywords: '', color: '#1989fa' }
  addSubjectSuccess.value = false
  addSubjectError.value = ''
}

// 统一添加学科
const addNewSubject = async () => {
  if (!addSubjectForm.value.name || !addSubjectForm.value.displayName) return
  
  addingSubject.value = true
  addSubjectSuccess.value = false
  addSubjectError.value = ''
  
  try {
    const response = await fetch(`${apiBaseUrl}/api/subjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: addSubjectForm.value.name,
        displayName: addSubjectForm.value.displayName,
        keywords: addSubjectForm.value.keywords || `${addSubjectForm.value.displayName},${addSubjectForm.value.name}`,
        color: addSubjectForm.value.color,
        sortOrder: subjects.value.length
      })
    })
    const data = await response.json()
    
    if (data.success) {
      addSubjectSuccess.value = true
      // 刷新学科列表
      await loadSubjects()
      await loadSubjectsWithStats()
      
      // 如果是从上传弹窗打开的，自动选中新学科
      if (uploadForm.value.subject === '') {
        uploadForm.value.subject = addSubjectForm.value.name
      }
      
      // 3秒后自动关闭
      setTimeout(() => {
        if (showAddSubjectModal.value) {
          closeAddSubjectModal()
        }
      }, 1500)
    } else {
      addSubjectError.value = data.error || '添加失败'
    }
  } catch (error) {
    console.error('添加学科失败:', error)
    addSubjectError.value = '网络错误，请重试'
  } finally {
    addingSubject.value = false
  }
}

// 上传/编辑资料
const uploadMaterial = async () => {
  if (!canUpload.value) return
  
  uploading.value = true
  
  try {
    if (editingMaterial.value) {
      // 编辑模式
      const response = await fetch(`${apiBaseUrl}/api/learning/materials/${editingMaterial.value.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: uploadForm.value.title,
          description: uploadForm.value.description,
          subject: uploadForm.value.subject,
          difficulty: uploadForm.value.difficulty
        })
      })
      const data = await response.json()
      if (data.success) {
        closeUploadModal()
        loadMaterials()
        loadStats()
      }
    } else {
      // 上传模式
      const formData = new FormData()
      formData.append('file', uploadForm.value.file)
      formData.append('title', uploadForm.value.title)
      formData.append('description', uploadForm.value.description)
      formData.append('subject', uploadForm.value.subject)
      formData.append('category', uploadForm.value.category)
      formData.append('difficulty', uploadForm.value.difficulty)
      
      const response = await fetch(`${apiBaseUrl}/api/learning/materials`, {
        method: 'POST',
        body: formData
      })
      const data = await response.json()
      if (data.success) {
        closeUploadModal()
        loadMaterials()
        loadStats()
        // 刷新学科列表（可能有新学科）
        loadSubjects()
      }
    }
  } catch (error) {
    console.error('上传失败:', error)
  } finally {
    uploading.value = false
  }
}

// 添加学科 - 已废弃，使用 addNewSubject
// 为保持兼容保留空函数
const addSubject = async () => {
  // 已废弃，使用 showAddSubjectModal 和 addNewSubject
}

// 移除学科
const removeSubject = async (name) => {
  try {
    await fetch(`${apiBaseUrl}/api/subjects/${name}`, { method: 'DELETE' })
    loadSubjects()
  } catch (error) {
    console.error('移除学科失败:', error)
  }
}

// 编辑资料
const editMaterial = (material) => {
  editingMaterial.value = material
  uploadForm.value = {
    title: material.title,
    description: material.description || '',
    subject: material.subject,
    category: material.category,
    difficulty: material.difficulty,
    file: null
  }
  showUploadModal.value = true
}

// 关闭上传弹窗
const closeUploadModal = () => {
  showUploadModal.value = false
  editingMaterial.value = null
  showAddSubjectModal.value = false
  addSubjectForm.value = { name: '', displayName: '', keywords: '', color: '#1989fa' }
  uploadForm.value = {
    title: '',
    description: '',
    subject: '',
    category: '',
    difficulty: 'medium',
    file: null
  }
}

// 开始生成 AI 内容
const startGeneration = async () => {
  if (!generateRequest.value?.generator_prompt) return
  
  isGenerating.value = true
  
  try {
    // 获取 API 配置
    const savedSettings = localStorage.getItem('settings')
    let apiConfig = null
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      if (settings.api) {
        apiConfig = {
          provider: settings.api.provider || 'openai',
          endpoint: settings.api.endpoint || '',
          apiKey: settings.api.apiKey || '',
          model: settings.api.model || '',
          timeout: settings.api.timeout || 60,
          maxTokens: settings.api.maxTokens || 2000,
          temperature: settings.api.temperature || 0.7
        }
      }
    }
    
    if (!apiConfig?.apiKey) {
      generatedContent.value = '<p class="text-error">请先在设置中配置 API 密钥</p>'
      isGenerating.value = false
      return
    }
    
    // 调用 AI API 生成内容
    const response = await fetch(`${apiBaseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `请按照以下要求生成内容：${generateRequest.value.generator_prompt}`,
        history: [],
        apiConfig: apiConfig
      })
    })
    
    const data = await response.json()
    if (data.success) {
      // 简单格式化生成的文本
      generatedContent.value = data.data.content.replace(/\n/g, '<br>')
    } else {
      generatedContent.value = `<p class="text-error">生成失败: ${data.error}</p>`
    }
  } catch (error) {
    generatedContent.value = `<p class="text-error">生成失败: ${error.message}</p>`
  } finally {
    isGenerating.value = false
  }
}

// 保存生成的内容
const saveGeneratedContent = async () => {
  if (!generatedContent.value || !generateRequest.value) return
  
  const type = generateRequest.value.type
  const filename = `${generateRequest.value.prompt}.${type === 'md' ? 'md' : type === 'ppt' ? 'pptx' : 'txt'}`
  
  // 创建文件blob
  const content = generatedContent.value.replace(/<br>/g, '\n').replace(/<[^>]+>/g, '')
  const blob = new Blob([content], { type: 'text/plain' })
  
  // 准备上传表单
  uploadForm.value = {
    title: generateRequest.value.prompt,
    description: `由 AI 自动生成的 ${type === 'ppt' ? 'PPT' : type === 'md' ? 'Markdown' : '视频'} 内容`,
    subject: 'default',
    category: type === 'ppt' ? 'ppt' : 'document',
    difficulty: 'medium',
    file: new File([blob], filename, { type: 'text/plain' })
  }
  
  showGenerateModal.value = false
  showUploadModal.value = true
}

// 确认删除
const confirmDelete = (material) => {
  deletingMaterial.value = material
  showDeleteModal.value = true
}

// 删除资料
const deleteMaterial = async () => {
  if (!deletingMaterial.value) return
  
  try {
    await fetch(`${apiBaseUrl}/api/learning/materials/${deletingMaterial.value.id}`, {
      method: 'DELETE'
    })
    showDeleteModal.value = false
    deletingMaterial.value = null
    loadMaterials()
    loadStats()
  } catch (error) {
    console.error('删除失败:', error)
  }
}

// 打开/预览资料
const openMaterial = (material) => {
  previewMaterial.value = material
  
  // 如果是 md 文件，跳转到 markdown 页面
  if (material.url && material.url.toLowerCase().endsWith('.md')) {
    router.push({ 
      path: '/markdown', 
      query: { 
        path: material.url,
        title: material.title,
        materialId: material.id
      } 
    })
    return
  }
  
  // 如果是 ppt 文件，跳转到 ppt 阅览器页面
  if (material.url && material.url.toLowerCase().endsWith('.pptx')) {
    router.push({
      path: '/ppt-viewer',
      query: {
        path: material.url,
        title: material.title,
        materialId: material.id
      }
    })
    return
  }
  
  showPreviewModal.value = true
}

onMounted(() => {
  loadSubjects()
  loadStats()
  loadMaterials()
  
  // 检查是否有从对话页面发来的生成请求
  const savedRequest = localStorage.getItem('generate_request')
  if (savedRequest) {
    try {
      generateRequest.value = JSON.parse(savedRequest)
      showGenerateModal.value = true
      localStorage.removeItem('generate_request')
    } catch (e) {
      console.error('解析生成请求失败:', e)
    }
  }
})
</script>

<style scoped>
.learn-container {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.modal-backdrop {
  background: rgba(0, 0, 0, 0.5);
}
</style>
