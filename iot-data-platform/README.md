# IoT Data Platform

物联网数据中台前端管理台，基于 Vue 3、TypeScript、Vite 和 Element Plus 构建。

## 功能概览

- 数据仪表盘
- 设备管理与设备目录
- 设备集成与插件管理
- 告警管理
- 规则引擎与算法管理
- 用户、角色、权限管理

## 技术栈

- Vue 3
- TypeScript
- Vite
- Vue Router
- Pinia
- Element Plus
- Axios
- ECharts

## 目录结构

```text
src/
  api/          接口封装
  components/   通用组件
  router/       路由配置与登录校验
  stores/       Pinia 状态管理
  styles/       全局样式与主题变量
  types/        TypeScript 类型定义
  views/        页面级视图
docs/           业务对接与设计文档
```

## 环境要求

- Node.js 18+
- npm 9+

## 安装与启动

```bash
npm install
npm run dev
```

默认开发地址一般为 `http://localhost:5173`。

## 构建

```bash
npm run build
```

## 后端依赖

项目默认通过网关访问后端服务，请确保本地网关已启动：

- 网关地址：`http://127.0.0.1:9000`

当前前端已接入或预留以下后端服务前缀：

- 系统服务：`/api/system/iot`
- 设备服务：`/api/device/iot`
- 规则服务：`/api/rule/iot`
- 集成服务：`/api/integration/iot`

## 登录说明

- 未登录访问业务页面会被重定向到登录页
- 登录成功后会回跳到原始访问页面
- 登录态当前保存在浏览器 `localStorage` 的 `token` 字段中

## 相关文档

- [UI 设计规范](/Users/chenhao/Documents/trae_projects/iot-data-platform/docs/UI_DESIGN_SPEC.md)
- [设备服务真实 API 集成](/Users/chenhao/Documents/trae_projects/iot-data-platform/docs/DEVICE_SERVICE_REAL_INTEGRATION.md)
- [设备服务集成说明](/Users/chenhao/Documents/trae_projects/iot-data-platform/docs/DEVICE_SERVICE_INTEGRATION.md)

## 当前说明

- 这是前端项目仓库，不包含后端服务实现
- 部分页面仍存在联调中的占位逻辑或 mock 数据
