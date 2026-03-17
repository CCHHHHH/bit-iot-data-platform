# API 网关前缀修复总结

## 问题说明

所有设备服务接口缺少网关前缀 `/api/device`，导致无法通过网关正确调用。

## 修复内容

### 修复前（❌ 错误）
```typescript
/iot/device-catalogue/tree
/iot/device/list
/iot/device-station-code/list
/iot/device-event/list
```

### 修复后（✅ 正确）
```typescript
/api/device/iot/device-catalogue/tree
/api/device/iot/device/list
/api/device/iot/device-station-code/list
/api/device/iot/device-event/list
```

## 完整的 API 路径列表

### 1. 设备目录管理 (5 个接口)

| 功能 | 修复后的路径 |
|------|------------|
| 获取目录树 | `GET /api/device/iot/device-catalogue/tree` |
| 分页查询目录 | `GET /api/device/iot/device-catalogue/list` |
| 新增目录 | `POST /api/device/iot/device-catalogue` |
| 编辑目录 | `PUT /api/device/iot/device-catalogue` |
| 删除目录 | `DELETE /api/device/iot/device-catalogue/{id}` |

### 2. 设备管理 (5 个接口)

| 功能 | 修复后的路径 |
|------|------------|
| 分页查询设备 | `GET /api/device/iot/device/list` |
| 根据目录查询设备 | `GET /api/device/iot/device/by-catalogue/{catalogueId}` |
| 新增设备 | `POST /api/device/iot/device` |
| 编辑设备 | `PUT /api/device/iot/device` |
| 删除设备 | `DELETE /api/device/iot/device/{id}` |

### 3. 设备测点管理 (5 个接口)

| 功能 | 修复后的路径 |
|------|------------|
| 分页查询测点 | `GET /api/device/iot/device-station-code/list` |
| 根据设备查询测点 | `GET /api/device/iot/device-station-code/by-device/{deviceId}` |
| 新增测点 | `POST /api/device/iot/device-station-code` |
| 编辑测点 | `PUT /api/device/iot/device-station-code` |
| 删除测点 | `DELETE /api/device/iot/device-station-code/{id}` |

### 4. 设备事件管理 (7 个接口)

| 功能 | 修复后的路径 |
|------|------------|
| 分页查询事件 | `GET /api/device/iot/device-event/list` |
| 根据设备查询事件 | `GET /api/device/iot/device-event/by-device/{deviceId}` |
| 新增事件 | `POST /api/device/iot/device-event` |
| 编辑事件 | `PUT /api/device/iot/device-event` |
| 删除事件 | `DELETE /api/device/iot/device-event/{id}` |
| 确认事件 | `PUT /api/device/iot/device-event/{id}/confirm` |
| 解决事件 | `PUT /api/device/iot/device-event/{id}/resolve` |

## 访问架构

```
用户请求
  ↓
网关 (http://localhost:9000)
  ↓
/api/device 前缀路由
  ↓
设备服务 (/iot/...)
  ↓
实际接口处理
```

## 完整的请求示例

### 获取设备目录树
```typescript
GET http://localhost:9000/api/device/iot/device-catalogue/tree
Authorization: Bearer {token}
```

### 分页查询设备列表
```typescript
GET http://localhost:9000/api/device/iot/device/list?current=1&size=10&deviceName=传感器
Authorization: Bearer {token}
```

### 根据目录查询设备
```typescript
GET http://localhost:9000/api/device/iot/device/by-catalogue/catalogue-001
Authorization: Bearer {token}
```

### 获取设备事件
```typescript
GET http://localhost:9000/api/device/iot/device-event/by-device/device-001
Authorization: Bearer {token}
```

### 确认事件
```typescript
PUT http://localhost:9000/api/device/iot/device-event/event-001/confirm
Authorization: Bearer {token}
Content-Type: application/json

{
  "operator": "admin"
}
```

### 解决事件
```typescript
PUT http://localhost:9000/api/device/iot/device-event/event-001/resolve
Authorization: Bearer {token}
Content-Type: application/json

{
  "solution": "已处理",
  "resolver": "admin"
}
```

## 修改的文件

- ✅ `src/api/device.ts` - 所有 27 个 API 接口路径已更新

## 验证方法

1. 访问设备管理页面：http://localhost:5173/devices
2. 打开浏览器开发者工具 → Network 标签
3. 查看请求 URL 应该包含 `/api/device/iot/` 前缀
4. 确认请求成功返回数据

## 预期结果

- ✅ 目录树加载成功
- ✅ 设备列表显示正常
- ✅ 点击目录节点可以筛选设备
- ✅ 事件按钮可以打开事件对话框
- ✅ 可以确认和解决事件

## 注意事项

1. **网关地址**: `http://localhost:9000`
2. **服务前缀**: `/api/device`
3. **实际路径**: `/iot/...`
4. **完整路径**: `/api/device/iot/...`
5. **认证**: 所有请求需要携带 Token

## 响应格式

所有接口返回统一格式：
```json
{
  "code": 200,
  "message": "success",
  "data": { ... },
  "total": 100  // 分页时有此字段
}
```

访问数据时使用：`response.data.data`
