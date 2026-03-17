# 设备服务集成文档

## 1. 概述

本文档详细说明了物联网数据中台与设备服务的集成过程，包括 API 接口定义、请求/响应格式、认证授权、错误处理等。

## 2. 集成架构

### 2.1 网关访问模式

所有设备服务接口通过 API 网关统一访问，遵循以下模式：

```
网关地址：http://localhost:9000
服务前缀：/api/device
完整路径：http://localhost:9000/api/device/iot/{module}/{endpoint}
```

### 2.2 认证方式

- **认证类型**: JWT Token
- **请求头**: `Authorization: Bearer {token}`
- **Token 获取**: 通过登录接口获取，存储在 localStorage 中

## 3. API 接口详解

### 3.1 设备目录管理 (Device Catalogue)

#### 3.1.1 获取设备目录树

**接口**: `GET /api/device/iot/device-catalogue/tree`

**请求参数**:
```typescript
{
  name?: string  // 可选，目录名称模糊搜索
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "catalogue-001",
      "name": "办公楼 A 区",
      "parentId": null,
      "description": "办公楼 A 区所有设备",
      "order": 1,
      "deviceCount": 10,
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z",
      "children": [
        {
          "id": "catalogue-001-01",
          "name": "一楼设备",
          "parentId": "catalogue-001",
          "deviceCount": 5,
          "children": []
        }
      ]
    }
  ]
}
```

#### 3.1.2 创建目录

**接口**: `POST /api/device/iot/device-catalogue`

**请求体**:
```json
{
  "name": "新目录",
  "parentId": "catalogue-001",
  "description": "目录描述",
  "order": 1
}
```

#### 3.1.3 更新目录

**接口**: `PUT /api/device/iot/device-catalogue`

**请求体**:
```json
{
  "id": "catalogue-001",
  "name": "更新后的名称",
  "parentId": null,
  "description": "更新描述",
  "order": 2
}
```

#### 3.1.4 删除目录

**接口**: `DELETE /api/device/iot/device-catalogue/{id}`

#### 3.1.5 移动目录

**接口**: `PUT /api/device/iot/device-catalogue/{id}/move`

**请求体**:
```json
{
  "newParentId": "catalogue-002"
}
```

### 3.2 设备列表管理 (Device)

#### 3.2.1 分页查询设备列表

**接口**: `GET /api/device/iot/device/list`

**请求参数**:
```typescript
{
  current?: number,      // 当前页码，默认 1
  size?: number,         // 每页数量，默认 10
  name?: string,         // 设备名称模糊搜索
  sn?: string,           // 设备序列号
  status?: string,       // 设备状态：online/offline/warning/error
  catalogueId?: string,  // 目录 ID
  model?: string,        // 设备型号
  ip?: string            // IP 地址
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "device-001",
      "name": "温湿度传感器 -001",
      "sn": "TH-2026-001",
      "model": "TH-2000",
      "type": "温湿度传感器",
      "ip": "192.168.1.101",
      "location": "办公楼 1 楼",
      "description": "用于监测温湿度",
      "status": "online",
      "catalogueIds": ["catalogue-001"],
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-02-04T10:30:00.000Z",
      "lastActiveAt": "2026-02-04T10:30:00.000Z"
    }
  ],
  "total": 100,
  "current": 1,
  "size": 10,
  "pages": 10
}
```

#### 3.2.2 获取设备详情

**接口**: `GET /api/device/iot/device/{id}`

#### 3.2.3 创建设备

**接口**: `POST /api/device/iot/device`

**请求体**:
```json
{
  "name": "新设备",
  "sn": "SN-2026-001",
  "model": "Model-X",
  "type": "传感器",
  "ip": "192.168.1.100",
  "location": "办公楼",
  "description": "设备描述",
  "catalogueIds": ["catalogue-001"]
}
```

#### 3.2.4 更新设备

**接口**: `PUT /api/device/iot/device`

**请求体**:
```json
{
  "id": "device-001",
  "name": "更新后的名称",
  "sn": "SN-2026-001",
  "model": "Model-X",
  "ip": "192.168.1.100",
  "location": "新位置",
  "description": "更新描述"
}
```

#### 3.2.5 删除设备

**接口**: `DELETE /api/device/iot/device/{id}`

#### 3.2.6 批量删除设备

**接口**: `DELETE /api/device/iot/device/batch`

**请求参数**:
```typescript
{
  ids: string  // 逗号分隔的设备 ID 列表
}
```

#### 3.2.7 获取设备状态

**接口**: `GET /api/device/iot/device/{id}/status`

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "deviceId": "device-001",
    "status": "online",
    "lastActiveAt": "2026-02-04T10:30:00.000Z",
    "errorCode": null,
    "errorMessage": null
  }
}
```

#### 3.2.8 更新设备状态

**接口**: `PUT /api/device/iot/device/{id}/status`

**请求体**:
```json
{
  "status": "online"
}
```

### 3.3 设备测量点 (Device Measurement Point)

#### 3.3.1 分页查询测量点列表

**接口**: `GET /api/device/iot/device-measurement-point/list`

**请求参数**:
```typescript
{
  current?: number,
  size?: number,
  deviceId?: string,  // 设备 ID
  name?: string,      // 测量点名称
  code?: string,      // 测量点编码
  type?: string       // 类型：analog/digital/counter/pulse
}
```

**响应示例**:
```json
{
  "code": 200,
  "data": [
    {
      "id": "point-001",
      "deviceId": "device-001",
      "name": "温度",
      "code": "TEMP",
      "type": "analog",
      "unit": "°C",
      "description": "温度测量点",
      "minRange": -20,
      "maxRange": 60,
      "precision": 2,
      "currentValue": 25.5,
      "lastUpdateTime": "2026-02-04T10:30:00.000Z",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-02-04T10:30:00.000Z"
    }
  ]
}
```

#### 3.3.2 根据设备 ID 获取测量点列表

**接口**: `GET /api/device/iot/device-measurement-point/device/{deviceId}`

#### 3.3.3 创建测量点

**接口**: `POST /api/device/iot/device-measurement-point`

**请求体**:
```json
{
  "deviceId": "device-001",
  "name": "温度",
  "code": "TEMP",
  "type": "analog",
  "unit": "°C",
  "description": "温度测量点",
  "minRange": -20,
  "maxRange": 60,
  "precision": 2
}
```

#### 3.3.4 更新测量点

**接口**: `PUT /api/device/iot/device-measurement-point`

#### 3.3.5 删除测量点

**接口**: `DELETE /api/device/iot/device-measurement-point/{id}`

#### 3.3.6 获取测量点最新数据

**接口**: `GET /api/device/iot/device-measurement-point/{id}/latest-data`

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "pointId": "point-001",
    "value": 25.5,
    "quality": "good",
    "timestamp": "2026-02-04T10:30:00.000Z"
  }
}
```

#### 3.3.7 获取测量点历史数据

**接口**: `GET /api/device/iot/device-measurement-point/{id}/history-data`

**请求参数**:
```typescript
{
  startTime: string,  // ISO 8601 格式
  endTime: string,    // ISO 8601 格式
  limit?: number      // 返回记录数限制
}
```

### 3.4 设备事件 (Device Event)

#### 3.4.1 分页查询事件列表

**接口**: `GET /api/device/iot/device-event/list`

**请求参数**:
```typescript
{
  current?: number,
  size?: number,
  deviceId?: string,   // 设备 ID
  level?: string,      // 事件级别：info/warning/error/critical
  status?: string,     // 事件状态：active/confirmed/resolved/closed
  type?: string,       // 事件类型：alarm/fault/notification/maintenance
  startTime?: string,  // 开始时间
  endTime?: string     // 结束时间
}
```

**响应示例**:
```json
{
  "code": 200,
  "data": [
    {
      "id": "event-001",
      "deviceId": "device-001",
      "deviceName": "温湿度传感器 -001",
      "title": "温度过高告警",
      "description": "温度超过阈值 60°C",
      "level": "error",
      "type": "alarm",
      "status": "active",
      "source": "temperature",
      "code": "TEMP_HIGH",
      "value": "65.5",
      "confirmedAt": null,
      "confirmedBy": null,
      "resolvedAt": null,
      "resolvedBy": null,
      "solution": null,
      "createdAt": "2026-02-04T10:30:00.000Z",
      "updatedAt": "2026-02-04T10:30:00.000Z"
    }
  ]
}
```

#### 3.4.2 根据设备 ID 获取事件列表

**接口**: `GET /api/device/iot/device-event/device/{deviceId}`

#### 3.4.3 确认事件

**接口**: `PUT /api/device/iot/device-event/{id}/confirm`

**请求体**:
```json
{
  "operator": "admin"
}
```

#### 3.4.4 解决事件

**接口**: `PUT /api/device/iot/device-event/{id}/resolve`

**请求体**:
```json
{
  "solution": "已检查设备，温度恢复正常",
  "resolver": "admin"
}
```

#### 3.4.5 批量确认事件

**接口**: `PUT /api/device/iot/device-event/batch-confirm`

**请求体**:
```json
{
  "ids": ["event-001", "event-002"],
  "operator": "admin"
}
```

#### 3.4.6 批量解决事件

**接口**: `PUT /api/device/iot/device-event/batch-resolve`

**请求体**:
```json
{
  "ids": ["event-001", "event-002"],
  "solution": "批量处理完成",
  "resolver": "admin"
}
```

#### 3.4.7 获取事件统计信息

**接口**: `GET /api/device/iot/device-event/statistics`

**请求参数**:
```typescript
{
  deviceId?: string,
  startTime?: string,
  endTime?: string
}
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "total": 100,
    "active": 10,
    "confirmed": 30,
    "resolved": 50,
    "byLevel": {
      "info": 20,
      "warning": 40,
      "error": 30,
      "critical": 10
    },
    "byType": {
      "alarm": 50,
      "fault": 30,
      "notification": 15,
      "maintenance": 5
    }
  }
}
```

## 4. 错误处理

### 4.1 HTTP 状态码

- `200`: 请求成功
- `400`: 请求参数错误
- `401`: 未授权，需要重新登录
- `403`: 拒绝访问，权限不足
- `404`: 资源不存在
- `500`: 服务器内部错误

### 4.2 错误响应格式

```json
{
  "code": 500,
  "message": "错误描述信息",
  "data": null,
  "timestamp": "2026-02-04T10:30:00.000Z"
}
```

### 4.3 前端错误处理

```typescript
try {
  const response = await getDeviceList(params)
  // 处理成功响应
} catch (error: any) {
  if (error.response) {
    // HTTP 错误
    switch (error.response.status) {
      case 401:
        // 未授权，跳转登录页
        break
      case 404:
        // 资源不存在
        break
      default:
        // 其他错误
    }
  } else if (error.request) {
    // 网络错误
  } else {
    // 请求配置错误
  }
}
```

## 5. 实现注意事项

### 5.1 Token 管理

- Token 存储在 localStorage 中，key 为 `token`
- 每次请求自动在请求头添加 `Authorization: Bearer {token}`
- Token 过期时自动跳转登录页

### 5.2 请求超时

- 默认超时时间：30 秒
- 超时后显示网络错误提示

### 5.3 数据格式

- 所有日期时间使用 ISO 8601 格式
- 数值类型注意精度处理
- 枚举类型使用字符串字面量

### 5.4 分页处理

- 分页参数：current（页码）, size（每页数量）
- 响应包含 total（总数）, pages（总页数）

## 6. 测试

### 6.1 单元测试

测试文件位于 `src/api/__tests__/device.test.ts`

```typescript
import { getDeviceList } from '../device'

describe('Device API', () => {
  it('should get device list', async () => {
    const response = await getDeviceList({
      current: 1,
      size: 10
    })
    expect(response.data).toBeDefined()
    expect(Array.isArray(response.data.data)).toBe(true)
  })
})
```

### 6.2 集成测试

- 测试真实后端接口连通性
- 验证认证流程
- 测试错误处理机制

## 7. 已知限制和解决方法

### 7.1 限制

1. 批量操作接口可能受限于请求大小
2. 历史数据查询有时间范围限制
3. 某些操作需要特定权限

### 7.2 解决方法

1. 分批处理大量数据
2. 使用分页和增量查询
3. 实现完善的权限检查机制

## 8. 相关文件

- API 定义：`src/api/device.ts`
- 类型定义：`src/types/device.ts`
- 请求配置：`src/utils/request.ts`
- 设备管理页面：`src/views/DeviceManagementView.vue`
- 测量点管理页面：`src/views/DeviceMeasurementPointView.vue`
- 事件对话框：`src/components/DeviceEventDialog.vue`

## 9. 更新日志

- 2026-02-04: 初始版本，完成所有接口定义和集成
- 2026-02-04: 添加事件管理功能
- 2026-02-04: 添加测量点管理功能
