# Vue 学习导航站

基于 Vue 3 + Vite 构建的插件学习导航站，集成了 vue-router 用于页面间跳转，每个页面都是一个可快速扩展的小 Demo。

## 快速开始

```bash
pnpm install

# 启动配置后端（默认 http://localhost:3000/ ）
pnpm run server

# 另启一个终端运行前端
pnpm run dev
```

访问开发地址（默认 <http://localhost:5173/>）即可体验导航与 Demo，前端会从 <http://localhost:3000/api/navigation> 拉取最新配置。若需更换接口地址，可在 `.env` 或启动命令中设置 `VITE_NAVIGATION_ENDPOINT`。

## Demo 创建与管理

### 一键创建（推荐）

1. 启动前后端服务后，点击侧边栏的「新建 Demo」。
2. 按照提示填写标题、路由 ID、描述、标签与（可选）组件路径。
3. 提交后 KOA 会：
  - 在 `src/demos/` 下生成对应组件文件；
  - 将该 Demo 追加到 `config/navigation.json`；
  - 返回最新配置，前端立即注入路由并展示。

### 管理面板（编辑 / 删除）

首页底部新增了 Demo 管理表格，可直接：

- 修改标题、描述、标签、组件路径；
- 删除 Demo（默认同时删除组件文件，可在代码里调整 `removeComponent`）。

所有操作都会即时刷新导航栏，无需手动改路由。

### 恢复默认配置

如需回退到仓库内置示例，可点击侧边栏的「恢复默认」。该操作会把 `src/config/defaultNavigation.json` 覆盖写入后端的 `config/navigation.json`，请谨慎使用。

仍可以手动编辑 `config/navigation.json` 或 `src/config/defaultNavigation.json`，然后在前端点击「重新加载」来拉取。

## 现有 Demo 列表

- Vuex 计数器基础：演练 mutation、步长控制与基本状态管理。
- Vue Router 玩转导航：熟悉 `useRoute` / `useRouter` 与查询参数控制。
- 自定义插件：通过插件扩展 `$log` 全局方法与 provide/inject。

## 推荐阅读

- [Vue 官方文档](https://cn.vuejs.org/guide/introduction.html)
- [Vuex 指南](https://vuex.vuejs.org/zh/)
- [Vue Router 指南](https://router.vuejs.org/zh/)
