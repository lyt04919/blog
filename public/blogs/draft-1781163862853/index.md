![](/blogs/draft-1781163862853/e8eaed1e69c6804f.jpeg)
# 企鹅
## 企鹅
### 企鹅
在编辑器的右上角增加一个“进入禅模式”的快捷按钮。
开启时：隐藏右侧边栏 (WriteSidebar) 和顶部的操作栏 (WriteActions)。编辑器 (WriteEditor) 自动居中并适度变宽，页面背景和边框弱化，让您完全聚焦于文字。
退出时：只需按 Esc 键或点击悬浮的退出按钮即可恢复原状。
2. 分栏实时预览 (Split-Screen Preview)
目标：边写边看效果，无需在编辑与预览页面间来回跳转。
改动：
在全局状态 useWriteStore 中新增 isSplitMode 标识。
在顶部操作栏 (WriteActions) 的“全屏预览”旁边增加一个“分栏预览” Toggle 按钮。
开启时：页面自动展开为极宽模式。左半侧保留 WriteEditor，右半侧复用现有的 markdown 渲染组件实时显示最终排版。
编辑器与预览区域将保持布局和谐，适合在大屏幕（如外接显示器或全屏下）使用。
3. 数据统计小组件 (Stats Widget)
目标：提供字数与阅读时间的实时反馈，增强创作爽感。
改动：
编写一个新的 StatsWidget 组件。
实时监听 form.md 内容的变化，通过正则表达式计算真实的中英文字数，并按 300字/分钟 估算预计阅读时间。
将该组件以毛玻璃（Glassmorphism）的视觉风格，悬浮固定在编辑器 (WriteEditor) 的右下角。在编辑器的右上角增加一个“进入禅模式”的快捷按钮。 开启时：隐藏右侧边栏 (WriteSidebar) 和顶部的操作栏 (WriteActions)。编辑器 (WriteEditor) 自动居中并适度变宽，页面背景和边框弱化，让您完全聚焦于文字。 退出时：只需按 Esc 键或点击悬浮的退出按钮即可恢复原状。 2. 分栏实时预览 (Split-Screen Preview) 目标：边写边看效果，无需在编辑与预览页面间来回跳转。 改动： 在全局状态 useWriteStore 中新增 isSplitMode 标识。 在顶部操作栏 (WriteActions) 的“全屏预览”旁边增加一个“分栏预览” Toggle 按钮。 开启时：页面自动展开为极宽模式。左半侧保留 WriteEditor，右半侧复用现有的 markdown 渲染组件实时显示最终排版。 编辑器与预览区域将保持布局和谐，适合在大屏幕（如外接显示器或全屏下）使用。 3. 数据统计小组件 (Stats Widget) 目标：提供字数与阅读时间的实时反馈，增强创作爽感。 改动： 编写一个新的 StatsWidget 组件。 实时监听 form.md 内容的变化，通过正则表达式计算真实的中英文字数，并按 300字/分钟 估算预计阅读时间。 将该组件以毛玻璃（Glassmorphism）的视觉风格，悬浮固定在编辑器 (WriteEditor) 的右下角。在编辑器的右上角增加一个“进入禅模式”的快捷按钮。 开启时：隐藏右侧边栏 (WriteSidebar) 和顶部的操作栏 (WriteActions)。编辑器 (WriteEditor) 自动居中并适度变宽，页面背景和边框弱化，让您完全聚焦于文字。 退出时：只需按 Esc 键或点击悬浮的退出按钮即可恢复原状。 2. 分栏实时预览 (Split-Screen Preview) 目标：边写边看效果，无需在编辑与预览页面间来回跳转。 改动： 在全局状态 useWriteStore 中新增 isSplitMode 标识。 在顶部操作栏 (WriteActions) 的“全屏预览”旁边增加一个“分栏预览” Toggle 按钮。 开启时：页面自动展开为极宽模式。左半侧保留 WriteEditor，右半侧复用现有的 markdown 渲染组件实时显示最终排版。 编辑器与预览区域将保持布局和谐，适合在大屏幕（如外接显示器或全屏下）使用。 3. 数据统计小组件 (Stats Widget) 目标：提供字数与阅读时间的实时反馈，增强创作爽感。 改动： 编写一个新的 StatsWidget 组件。 实时监听 form.md 内容的变化，通过正则表达式计算真实的中英文字数，并按 300字/分钟 估算预计阅读时间。 将该组件以毛玻璃（Glassmorphism）的视觉风格，悬浮固定在编辑器 (WriteEditor) 的右下角。在编辑器的右上角增加一个“进入禅模式”的快捷按钮。 开启时：隐藏右侧边栏 (WriteSidebar) 和顶部的操作栏 (WriteActions)。编辑器 (WriteEditor) 自动居中并适度变宽，页面背景和边框弱化，让您完全聚焦于文字。 退出时：只需按 Esc 键或点击悬浮的退出按钮即可恢复原状。 2. 分栏实时预览 (Split-Screen Preview) 目标：边写边看效果，无需在编辑与预览页面间来回跳转。 改动： 在全局状态 useWriteStore 中新增 isSplitMode 标识。 在顶部操作栏 (WriteActions) 的“全屏预览”旁边增加一个“分栏预览” Toggle 按钮。 开启时：页面自动展开为极宽模式。左半侧保留 WriteEditor，右半侧复用现有的 markdown 渲染组件实时显示最终排版。 编辑器与预览区域将保持布局和谐，适合在大屏幕（如外接显示器或全屏下）使用。 3. 数据统计小组件 (Stats Widget) 目标：提供字数与阅读时间的实时反馈，增强创作爽感。 改动： 编写一个新的 StatsWidget 组件。 实时监听 form.md 内容的变化，通过正则表达式计算真实的中英文字数，并按 300字/分钟 估算预计阅读时间。 将该组件以毛玻璃（Glassmorphism）的视觉风格，悬浮固定在编辑器 (WriteEditor) 的右下角。