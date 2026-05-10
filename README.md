# Slogan - AI 智能体学习辅助应用

**沉浸式 AI 学习助手，让学习更高效、更智能**

功能特性 | 技术栈 | 快速开始 | 功能模块 | API 文档 | 版本历史

---

## 项目简介

**Slogan** 是一个基于人工智能技术的沉浸式学习辅助应用，旨在为大学生提供个性化的学习支持。项目采用现代化的单页面应用设计，集成了 AI 对话、智能题库、学习分析、PPT 生成等多种学习工具，帮助用户全面提升学习效率和质量。

### 核心亮点

- **AI 智能对话** - 支持多轮对话、流式输出、拍照搜题
- **学习画像分析** - 知识基础、认知风格、易错点等多维度分析
- **智能题库系统** - 支持 AI 生成和题库抽题两种模式
- **PPT 自动生成** - 12 套学科专用模板，一键生成专业演示文稿
- **错题本管理** - 智能复习提醒，掌握状态追踪
- **学习数据统计** - 学习时长、效率、进度全方位追踪

---

## 功能特性

### 1. AI 智能助手

- **智能对话**：支持流式输出的多轮对话，体验流畅
- **内容生成**：AI 自动识别并生成以下内容：
  - **PPT 演示文稿** - 自动生成真正的 PPT 文件
  - **Markdown 笔记** - 结构化的笔记，支持 LaTeX 公式
  - **视频脚本** - 带时间轴的视频脚本
- **Action 卡片**：AI 回复中的生成卡片，点击"生成"按钮可一键生成对应内容
- **自动导入**：生成的内容自动导入学习中心

### 2. 学习中心

- 按学科分类管理学习资料
- 知识点关联与检索
- 学习进度追踪
- 支持选择生成方式：题库生成 / AI 生成

### 3. 个人学习面板

多维度学习数据分析与可视化：

| 指标模块 | 图表类型 | 说明 |
|---------|---------|------|
| 知识基础 | 雷达图 | 展示多学科/知识模块的掌握程度 |
| 认知风格 | 条形图 | 分析学习方式偏好 |
| 易错点偏好 | 热力图 | 识别薄弱知识点 |
| 学习目标 | 圆环图 | 追踪目标完成进度 |
| 兴趣方向 | 词云 | 展示学习兴趣分布 |
| 学习节奏/效率 | 折线图 | 分析时间序列学习表现 |

### 4. Markdown 编辑器

- 实时预览
- LaTeX 公式支持
- 代码高亮
- 丰富的编辑功能

### 5. PPT 工具套件

#### PPT 生成器

- **12 套学科专用模板**：高等数学、线性代数、概率论、大学物理、专业课、英语、编程、政治、知识梳理、小组展示、毕业答辩、培训课件
- **6 种学科主题风格**：学术蓝调、数学紫韵、物理绿光、英伦金风、编程深空、政治红韵
- **用户模板管理**：可保存、删除自定义模板
- **实时预览**：边编辑边预览效果
- **一键生成**：自动保存到 `uploads/ppt/` 目录并同步到学习中心

#### PPT 阅览器

- 幻灯片导航（上一页/下一页、跳转指定页）
- 缩放控制（放大/缩小/适应屏幕）
- 全屏模式（F11）
- 缩略图预览
- 键盘快捷键（左右方向键翻页，+-缩放，Home/End 跳转首尾）
- 文件下载
- 使用 JSZip 自动解析 PPTX 文件结构

### 6. 考试与题库系统

#### 题目库管理

- 使用 JSON 文件存储（`data/exam_questions.json`）
- 支持题型：单选题、多选题、填空题、判断题、综合应用题
- 支持 LaTeX 公式、知识点标签、难度分级
- 预置学科：高等数学、线性代数、概率论、大学物理

#### 阶段性测试

- **两种生成方式**：
  - 从题库生成：速度快，题目可复用
  - AI 智能生成：题目灵活，可定制性强
- **两种模式**：
  - 考试模式：提交后统一批改
  - 练习模式：做一题给一题答案，即时反馈
- **功能特性**：
  - 倒计时功能，自动提交
  - 答题卡导航
  - 成绩统计与答案解析

### 7. 错题本管理

- 交卷后自动整理错题
- 包含：题目内容、选项、正确答案、用户答案、解析、知识点
- 掌握状态管理：待掌握、掌握中、已掌握
- 错误原因标记：概念不清、计算错误、审题失误等
- 智能复习提醒，根据掌握状态自动安排复习时间
- 错题筛选：按学科、题型、掌握状态筛选

### 8. 工作进度追踪面板

- 悬浮在页面左下角的抽拉式气泡面板
- 收缩状态显示圆环进度条
- 展开状态显示详细任务列表
- 与后端 AI 任务 API 实时同步

### 9. 工具中心

聚合多种学习工具的入口页面。

---

## 技术栈

| 类别 | 技术 |
|------|------|
| **前端框架** | Vue 3 + Vite |
| **UI 组件** | daisyUI 5 + Tailwind CSS |
| **后端框架** | Node.js + Express |
| **数据库** | SQLite (better-sqlite3) |
| **PPT 生成** | PptxGenJS |
| **图表可视化** | ECharts |
| **文件解析** | JSZip |

---

## 快速开始

### 环境要求

- Node.js >= 16.x
- npm >= 8.x

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/yourusername/slogan.git
cd slogan

# 安装依赖
npm install
```

### 启动开发服务器

```bash
# 启动后端服务（终端1）
npm run server

# 启动前端开发服务器（终端2）
npm run dev
```

### 访问应用

- **前端应用**：http://localhost:5173
- **后端 API**：http://localhost:3001
- **个人面板**：http://localhost:5173/profile
- **考试测试**：http://localhost:5173/exam

### 生产构建

```bash
# 构建前端
npm run build

# 预览构建结果
npm run preview
```

---

## 项目结构

```
slogan/
|-- src/                      # 前端源代码
|   |-- components/          # Vue 组件
|   |-- views/               # 页面视图
|   |-- router/              # 路由配置
|   |-- store/               # 状态管理
|   |-- assets/              # 静态资源
|-- server/                   # 后端服务器
|   |-- index.js             # Express 主入口
|   |-- database.js          # 数据库操作
|   |-- routes/              # API 路由
|-- data/                     # 数据文件
|   |-- chat.db              # SQLite 数据库
|   |-- exam_questions.json  # 题目库
|-- uploads/                  # 上传文件目录
|   |-- ppt/                 # PPT 文件
|   |-- docs/                # 文档文件
|   |-- images/              # 图片文件
|-- doc/                      # 项目文档
|-- public/                   # 公共资源
|-- README.md                # 项目说明
```

---

## 数据库结构

系统使用 SQLite 数据库，主要包含以下数据表：

| 表名 | 说明 |
|------|------|
| `user_config` | 用户配置 |
| `sessions` | 聊天会话 |
| `messages` | 聊天消息 |
| `files` | 文件管理 |
| `knowledge_base` | 知识基础 |
| `cognitive_style` | 认知风格 |
| `error_points` | 易错点记录 |
| `study_goals` | 学习目标 |
| `interests` | 兴趣方向 |
| `study_records` | 学习记录 |
| `learning_materials` | 学习资料 |
| `subjects` | 学科管理 |
| `study_todos` | 待办事项 |
| `study_schedules` | 学习计划 |
| `exams` | 考试记录 |
| `exam_answers` | 考试答案 |
| `error_book` | 错题本 |
| `ppt_templates` | PPT 模板 |
| `ai_tasks` | AI 任务 |

### 默认学科

系统预置了 8 个默认学科：

| 标识 | 名称 | 关键词示例 |
|------|------|-----------|
| `math` | 高等数学 | 高等数学,微积分,极限,导数,积分 |
| `linear_algebra` | 线性代数 | 矩阵,行列式,向量,特征值 |
| `probability` | 概率论 | 概率,随机,期望,方差,分布 |
| `physics` | 大学物理 | 力学,热学,电磁学,光学 |
| `major` | 专业课 | 专业课,专业,课程 |
| `english` | 英语 | 词汇,语法,阅读,听力,写作 |
| `programming` | 编程 | 算法,数据结构,python,java |
| `politics` | 政治 | 马克思主义,近代史,思修 |

---

## API 文档

### Base URL

```
http://localhost:3001/api
```

### 主要 API 端点

#### 聊天 API

| 方法 | 路径 | 说明 |
|-----|------|------|
| POST | `/api/chat` | 发送消息 |
| GET | `/api/chat/history` | 获取会话历史 |
| POST | `/api/chat/new-session` | 新建会话 |
| DELETE | `/api/chat/session` | 删除会话 |

#### 文件上传 API

| 方法 | 路径 | 说明 |
|-----|------|------|
| POST | `/api/upload/:category` | 上传文件 |
| GET | `/api/files/:sessionId` | 获取文件列表 |
| DELETE | `/api/file/:id` | 删除文件 |

#### 个人面板 API

| 方法 | 路径 | 说明 |
|-----|------|------|
| POST | `/api/profile/init` | 初始化面板数据 |
| GET | `/api/profile/data` | 获取所有面板数据 |
| GET | `/api/profile/knowledge` | 获取知识基础 |
| PUT | `/api/profile/knowledge` | 更新知识基础 |
| GET | `/api/profile/cognitive-style` | 获取认知风格 |
| GET | `/api/profile/error-points` | 获取易错点 |
| GET | `/api/profile/goals` | 获取学习目标 |
| GET | `/api/profile/interests` | 获取兴趣方向 |
| GET | `/api/profile/study-records` | 获取学习记录 |

#### 学习资料 API

| 方法 | 路径 | 说明 |
|-----|------|------|
| GET | `/api/learning/materials` | 获取资料列表 |
| POST | `/api/learning/materials` | 上传资料 |
| PUT | `/api/learning/materials/:id` | 更新资料 |
| DELETE | `/api/learning/materials/:id` | 删除资料 |
| GET | `/api/learning/stats` | 获取统计数据 |

#### 学科管理 API

| 方法 | 路径 | 说明 |
|-----|------|------|
| GET | `/api/subjects` | 获取学科列表 |
| GET | `/api/subjects/search` | 搜索学科 |
| POST | `/api/subjects` | 添加学科 |
| PUT | `/api/subjects/:name` | 更新学科 |
| DELETE | `/api/subjects/:name` | 删除学科 |

#### 考试管理 API

| 方法 | 路径 | 说明 |
|-----|------|------|
| POST | `/api/exams/generate` | 生成阶段性测试 |
| POST | `/api/exams/generate-from-bank` | 从题库生成测试 |
| GET | `/api/exams` | 获取考试列表 |
| GET | `/api/exams/:examId` | 获取考试信息 |
| POST | `/api/exams/:examId/answer` | 提交答案 |
| POST | `/api/exams/:examId/complete` | 完成考试 |
| DELETE | `/api/exams/:examId` | 删除考试 |

#### 错题本 API

| 方法 | 路径 | 说明 |
|-----|------|------|
| GET | `/api/error-book` | 获取错题列表 |
| GET | `/api/error-book/stats` | 获取统计 |
| GET | `/api/error-book/today-review` | 今日待复习 |
| POST | `/api/error-book` | 添加错题 |
| POST | `/api/error-book/from-exam` | 从考试批量添加 |
| PUT | `/api/error-book/:id/mastery` | 更新掌握状态 |
| DELETE | `/api/error-book/:id` | 删除错题 |

#### 题目库 API

| 方法 | 路径 | 说明 |
|-----|------|------|
| GET | `/api/question-bank/subjects` | 获取学科列表 |
| GET | `/api/question-bank/:subject/questions` | 获取题目列表 |
| POST | `/api/question-bank/:subject/questions` | 添加题目 |
| PUT | `/api/question-bank/:subject/questions/:id` | 更新题目 |
| DELETE | `/api/question-bank/:subject/questions/:id` | 删除题目 |

#### PPT 模板 API

| 方法 | 路径 | 说明 |
|-----|------|------|
| GET | `/api/ppt/templates` | 获取所有模板 |
| POST | `/api/ppt/templates` | 添加模板 |
| PUT | `/api/ppt/templates/:id` | 更新模板 |
| DELETE | `/api/ppt/templates/:id` | 删除模板 |

#### AI 任务 API

| 方法 | 路径 | 说明 |
|-----|------|------|
| POST | `/api/tasks` | 创建任务 |
| GET | `/api/tasks` | 获取任务列表 |
| GET | `/api/tasks/:taskId` | 获取任务状态 |
| PUT | `/api/tasks/:taskId` | 更新任务状态 |
| DELETE | `/api/tasks/:taskId` | 删除任务 |

---

## 题目库格式

题目库使用 JSON 文件存储（`data/exam_questions.json`），支持以下题型：

### 单选题 (single)

```json
{
  "id": "math_001",
  "type": "single",
  "difficulty": "medium",
  "knowledgePoints": ["极限", "连续性"],
  "content": "题目内容（支持 LaTeX: $x^2$）",
  "options": ["A. 选项1", "B. 选项2", "C. 选项3", "D. 选项4"],
  "answer": "C",
  "score": 5,
  "analysis": "答案解析"
}
```

### 多选题 (multiple)

```json
{
  "id": "math_005",
  "type": "multiple",
  "difficulty": "hard",
  "knowledgePoints": ["多元函数", "偏导数"],
  "content": "多选题内容",
  "options": ["A. 选项1", "B. 选项2", "C. 选项3", "D. 选项4"],
  "answer": ["A", "B", "C"],
  "score": 10,
  "analysis": "解析"
}
```

### 填空题 (fill)

```json
{
  "id": "math_003",
  "type": "fill",
  "difficulty": "easy",
  "knowledgePoints": ["积分"],
  "content": "$\\int_0^1 x^2 dx = $ ______",
  "answer": "\\frac{1}{3}",
  "score": 5,
  "analysis": "解析"
}
```

### 判断题 (judge)

```json
{
  "id": "math_004",
  "type": "judge",
  "difficulty": "medium",
  "knowledgePoints": ["级数", "收敛性"],
  "content": "若级数收敛，则通项趋于0",
  "answer": true,
  "score": 5,
  "analysis": "解析"
}
```

### 综合应用题 (comprehensive)

```json
{
  "id": "comp_001",
  "type": "comprehensive",
  "difficulty": "hard",
  "knowledgePoints": ["综合应用"],
  "content": "题目描述",
  "subQuestions": ["（1）...", "（2）...", "（3）..."],
  "referenceAnswer": "参考答案要点",
  "score": 20,
  "analysis": "解析"
}
```

---

## 配置说明

### AI 配置

在项目根目录创建 `config.json` 配置文件（参考 `config.example.json`）：

```json
{
  "ai": {
    "provider": "openai",
    "apiKey": "your-api-key",
    "model": "gpt-3.5-turbo",
    "baseURL": "https://api.openai.com/v1"
  }
}
```

### 学科自动识别

系统支持根据内容自动识别学科：

1. **匹配优先级**：
   - 完全匹配（display_name 或 name）：100分
   - 包含匹配（标题包含学科名）：80分
   - 关键词匹配：60-90分

2. **自动创建**：未匹配到时自动创建新学科

---

## 版本历史

### v1.0.8 - 错题本功能

- 新增错题本功能，用户交卷后自动整理错题
- 错题本数据库存储（`error_book` 表）
- 支持掌握状态管理：待掌握、掌握中、已掌握
- 支持错误原因标记
- 智能复习提醒
- 错题筛选和统计

### v1.0.7 - 题目库与考试功能

- 新增题目库管理功能
- 支持从题库生成考试
- 预置高等数学、线性代数、概率论、大学物理等学科题目
- 新增考试测试页面（`/exam`）
- 支持多种题型和两种模式（考试/练习）

### v1.0.6 - 阶段性测试功能

- 新增阶段性测试生成功能
- 支持考试设置：时间限制、科目、题数、难度
- 支持考试模式和练习模式

### v1.0.5 - PPT 学科模板

- PPT 编辑器预设 12 套学科相关模板
- 新增 6 种学科主题风格
- 配色方案增加红色系、金色系

### v1.0.4 - PPT 阅览器

- 新增 PPT 阅览器页面（`/ppt-viewer`）
- 使用 JSZip 解析 PPTX 文件
- 支持幻灯片导航、缩放、全屏模式

### v1.0.3 - 学科智能识别

- 学科支持识别关键词配置
- 新增学科模糊搜索功能
- AI 自动识别学科

### v1.0.2 - 工具中心与任务管理

- 新增工具中心页面（`/tools`）
- 新增 PPT 编辑器（`/ppt-editor`）
- 新增 PPT 模板管理功能
- 新增 AI 任务进度追踪面板

### v1.0.1 - 学科管理功能

- 新增 subjects 表和学科管理 API
- 学习中心支持动态学科列表
- 个人中心知识雷达图动态化
- 8 个默认学科预置数据

---

## 贡献指南

欢迎贡献代码、提出问题或改进建议！

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

### 开发规范

- 遵循 Vue 3 组合式 API 最佳实践
- 使用 ESLint 进行代码检查
- 提交信息遵循 Conventional Commits 规范

---

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

## 致谢

感谢所有为这个项目做出贡献的开发者和用户！

---

## 联系方式

- 作者：TsukimaoKiluro
- 项目主页：https://github.com/TsukimaoKiluro/Slogan

---

**如果这个项目对您有帮助，请给它一个星标！**

---


**享受学习的乐趣！**
