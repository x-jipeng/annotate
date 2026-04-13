# CAMBOT ANNOTATE

球赛视频高光标注系统 — Next.js 14 + Tailwind CSS + TypeScript

---

## 快速启动

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 打开浏览器
open http://localhost:3000
```

---

## 功能清单

| 功能 | 说明 |
|------|------|
| 本地视频 | 拖拽或点击上传，支持 MP4 / MOV / WebM / AVI |
| 在线视频 | 输入 HTTP/HTTPS 直链（需 CORS 可访问） |
| 时间码 | `HH:MM:SS:FF` 格式，30fps |
| 逐帧预览 | `←` / `→` 按帧步进 |
| 时间轴 | Canvas 渲染，Ctrl+滚轮缩放，鼠标滚轮平移 |
| 缩略帧 | 时间轴顶部自动抽帧展示 |
| 高光区块 | 标注前后各 1 秒共 3 秒高亮色块 |
| 5 种运动 | 篮球 / 足球 / 网球 / 棒球 / 羽毛球 |
| 自定义标签 | 任意输入事件名称 |
| 入出点 | `I` / `O` 键打点，时间轴可视化 |
| 编辑标注 | 列表内双击编辑事件名称 |
| 筛选 | 按运动类型过滤列表 |
| 导出 JSON | 全部或按运动类型导出 |

---

## 键盘快捷键

| 按键 | 功能 |
|------|------|
| `Space` | 播放 / 暂停 |
| `←` | 上一帧 |
| `→` | 下一帧 |
| `Shift + ←` | 后退 5 秒 |
| `Shift + →` | 前进 5 秒 |
| `I` | 打入点 |
| `O` | 打出点 |
| `Ctrl + E` | 打开导出面板 |
| `Esc` | 关闭弹窗 / 清除入出点 |

---

## 导出格式

```json
[
  {
    "sport": "basketball",
    "event": "扣篮",
    "time": "00:00:18-00:00:21",
    "timestamp_start": 18.0,
    "timestamp_end": 21.0,
    "source": "manual"
  }
]
```

文件名：`annotations_{sport}_{timestamp}.json`

---

## 项目结构

```
src/
├── app/
│   ├── layout.tsx          # HTML 根布局，字体注入
│   ├── page.tsx            # 主页面，所有 hook 集成
│   └── globals.css         # 全局样式，CSS 变量，滚动条
├── components/
│   ├── VideoPlayer.tsx     # 视频播放器，拖拽上传，URL 加载
│   ├── Timeline.tsx        # Canvas 时间轴，缩略帧，标注可视化
│   ├── TagPanel.tsx        # 运动标签面板 + 自定义标签
│   ├── AnnotationList.tsx  # 标注列表，筛选，编辑，删除
│   └── ExportModal.tsx     # 导出弹窗，范围选择
├── hooks/
│   ├── useVideoControl.ts  # 视频状态管理，RAF 时间更新
│   ├── useAnnotations.ts   # 标注增删改查，JSON 导出
│   └── useTimeline.ts      # 时间轴缩放，滚动，拖拽逻辑
├── types/
│   └── annotation.ts       # 所有 TypeScript 类型定义
├── constants/
│   └── sports.ts           # 运动配置，标签，颜色，帧率常量
└── utils/
    └── time.ts             # 时间格式化工具函数
```

---

## 配色系统

| 变量 | 颜色 | 用途 |
|------|------|------|
| `--bg-primary` | `#04070f` | 页面背景 |
| `--bg-secondary` | `#080e1c` | 面板背景 |
| `--cyan` | `#00d4f5` | 主强调色 |
| `--orange` | `#ff6b35` | 次强调色 |
| 篮球 | `#ff7043` | 标注色块 |
| 足球 | `#66bb6a` | 标注色块 |
| 网球 | `#29b6f6` | 标注色块 |
| 棒球 | `#ce93d8` | 标注色块 |
| 羽毛球 | `#ffd54f` | 标注色块 |
