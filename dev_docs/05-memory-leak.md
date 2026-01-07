# 05. 内存泄漏修复 - 资源管理优化

**问题严重程度**: 🟠 高危  
**修复优先级**: 短期修复（1-2周）  
**依赖后端**: 否

---

## 问题概述

项目中存在多处内存泄漏风险，包括DOM未正确清理、事件监听器未移除、定时器未清除等，可能导致长时间运行后应用性能下降甚至崩溃。

---

## 涉及文件路径

```
d:\06_program_code\zibuyu_blog\src\content\DialogLogin.vue
d:\06_program_code\zibuyu_blog\src\content\DialogRegister.vue
d:\06_program_code\zibuyu_blog\src\components\AiEnglishSpokenCoach.vue
d:\06_program_code\zibuyu_blog\src\components\AiEnglishCommonAssistant.vue
d:\06_program_code\zibuyu_blog\src\content\ResetPassword.vue
d:\06_program_code\zibuyu_blog\src\content\Article.vue
d:\06_program_code\zibuyu_blog\src\content\Home.vue
d:\06_program_code\zibuyu_blog\src\stores\aiEnglish_demo.js
```

---

## 风险评估

- **风险等级**: 中
- **潜在影响**:
  - 应用性能下降
  - 浏览器内存占用过高
  - 用户体验变差

---

## 修复方案

### 步骤 1: 创建资源清理工具

创建文件: `src/utils/resourceManager.js`

```javascript
export class ResourceManager {
  constructor() {
    this.cleanupFns = new Set()
  }
  
  addCleanup(fn) {
    this.cleanupFns.add(fn)
    return () => this.cleanupFns.delete(fn)
  }
  
  cleanup() {
    this.cleanupFns.forEach(fn => {
      try {
        fn()
      } catch (e) {
        console.error('Cleanup error:', e)
      }
    })
    this.cleanupFns.clear()
  }
}

export function createResourceTracker() {
  const cleanupFns = []
  
  return {
    track(cleanupFn) {
      cleanupFns.push(cleanupFn)
      return () => {
        const idx = cleanupFns.indexOf(cleanupFn)
        if (idx > -1) cleanupFns.splice(idx, 1)
      }
    },
    cleanup() {
      cleanupFns.forEach(fn => {
        try {
          fn()
        } catch (e) {
          console.error('Cleanup error:', e)
        }
      })
      cleanupFns.length = 0
    }
  }
}
```

### 步骤 2: 更新DialogLogin.vue

```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { ResourceManager } from '@/utils/resourceManager'

const resourceManager = new ResourceManager()

const handleKeydown = (event) => {
  if (event.key === 'Enter') {
    handleLogin()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  resourceManager.addCleanup(() => {
    document.removeEventListener('keydown', handleKeydown)
  })
})

onUnmounted(() => {
  resourceManager.cleanup()
})
</script>
```

### 步骤 3: 更新AiEnglishSpokenCoach.vue

```vue
<script setup>
import { ref, onMounted, onUnmounted, onBeforeUnmount } from 'vue'

const isLoading = ref(false)
let abortController = null

const stopGenerating = () => {
  if (abortController) {
    abortController.abort()
    abortController = null
  }
  isLoading.value = false
}

const handleSend = async () => {
  abortController = new AbortController()
  try {
    isLoading.value = true
    // ... 处理逻辑
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Request failed:', error)
    }
  } finally {
    isLoading.value = false
  }
}

onUnmounted(() => {
  stopGenerating()
})
</script>
```

### 步骤 4: 更新DialogRegister.vue

```vue
<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'

const formRef = ref(null)
const dialogVisible = ref(false)
let cleanupFns = []

const handleKeydown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleRegister()
  }
}

const setupEventListeners = () => {
  document.addEventListener('keydown', handleKeydown)
  cleanupFns.push(() => {
    document.removeEventListener('keydown', handleKeydown)
  })
}

const cleanup = () => {
  cleanupFns.forEach(fn => fn())
  cleanupFns = []
}

watch(dialogVisible, (newVal) => {
  if (newVal) {
    setupEventListeners()
  } else {
    cleanup()
  }
})

onUnmounted(() => {
  cleanup()
})
</script>
```

### 步骤 5: 使用Vue的onBeforeUnmount

```javascript
import { onBeforeUnmount, onMounted, ref } from 'vue'

const timer = ref(null)
const eventListeners = []

onMounted(() => {
  // 设置定时器
  timer.value = setInterval(() => {
    // 定时任务
  }, 1000)
  
  // 添加事件监听
  window.addEventListener('resize', handleResize)
  eventListeners.push(() => {
    window.removeEventListener('resize', handleResize)
  })
})

onBeforeUnmount(() => {
  // 清除定时器
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
  
  // 移除所有事件监听
  eventListeners.forEach(fn => fn())
  eventListeners.length = 0
})
```

---

## 重要补充说明

### 1. 事件监听器清理模式

```javascript
function useEventListener(target, event, handler) {
  let attached = true
  
  target.addEventListener(event, handler)
  
  return () => {
    if (attached) {
      target.removeEventListener(event, handler)
      attached = false
    }
  }
}
```

### 2. 定时器统一管理

```javascript
class TimerManager {
  constructor() {
    this.timers = new Set()
  }
  
  addTimer(fn, delay) {
    const id = setInterval(fn, delay)
    this.timers.add(id)
    return id
  }
  
  addTimeout(fn, delay) {
    const id = setTimeout(fn, delay)
    this.timers.add(id)
    return id
  }
  
  removeTimer(id) {
    clearInterval(id)
    clearTimeout(id)
    this.timers.delete(id)
  }
  
  clearAll() {
    this.timers.forEach(id => {
      clearInterval(id)
      clearTimeout(id)
    })
    this.timers.clear()
  }
}
```

### 3. Vue组件卸载检测

```javascript
import { onMounted, onUnmounted, getCurrentInstance } from 'vue'

export function useCleanup() {
  const instance = getCurrentInstance()
  const cleanupFns = []
  
  onUnmounted(() => {
    cleanupFns.forEach(fn => fn())
  })
  
  return {
    addCleanup(fn) {
      cleanupFns.push(fn)
    }
  }
}
```

### 4. 第三方库资源清理

```javascript
import { onUnmounted } from 'vue'
import { Editor } from '@tiptap/vue-3'

onUnmounted(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})
```

---

## 核查流程

### 1. 代码审查

- [ ] 检查所有组件的onUnmounted钩子
- [ ] 确认所有定时器已清除
- [ ] 验证所有事件监听器已移除
- [ ] 检查第三方库的清理逻辑

### 2. 内存分析

- [ ] 使用Chrome DevTools Memory面板
- [ ] 进行堆快照对比
- [ ] 检查Detached DOM树

### 3. 长时间运行测试

- [ ] 运行应用24小时以上
- [ ] 监控内存增长趋势
- [ ] 检查是否存在内存泄漏

---

## 预期收益

- ✅ 消除内存泄漏
- ✅ 提升应用稳定性
- ✅ 改善用户体验

---

## 相关文档

- [架构说明与职责划分](./overview.md) - 前后端分离架构说明
- [README汇总](../README.md) - 所有优化文档索引
- [修复检查清单](./checklist.md) - 验收标准

---

**文档版本**: 1.0  
**创建日期**: 2026-01-07  
**最后更新**: 2026-01-07
