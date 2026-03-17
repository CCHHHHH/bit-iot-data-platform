# 设备服务真实 API 集成文档

## 1. 概述

本文档基于真实的 Swagger OpenAPI 文档，详细说明了物联网数据中台与设备服务的完整集成方案。

**Swagger 文档地址**:
- UI 界面：http://127.0.0.1:9001/iot/doc.html
- OpenAPI JSON: http://127.0.0.1:9001/iot/v3/api-docs

**服务信息**:
- 服务名称：IoT Device Service API
- 版本：1.0
- 基础路径：/iot
- 网关地址：http://127.0.0.1:9001

## 2. 完整 API 端点列表

### 2.1 设备目录管理接口 (/device-catalogue)

| 方法 | 路径 | 描述 | 参数 |
|------|------|------|------|
| GET | /iot/device-catalogue/tree | 查询树形结构的设备目录 | 无 |
| GET | /iot/device-catalogue/list | 分页查询设备目录列表 | current, size, catalogueName |
| POST | /iot/device-catalogue | 新增设备目录 | DeviceCatalogue |
| PUT | /iot/device-catalogue | 编辑设备目录 | DeviceCatalogue |
| DELETE | /iot/device-catalogue/{id} | 删除设备目录 | id (path) |

### 2.2 设备管理接口 (/device)

| 方法 | 路径 | 描述 | 参数 |
|------|------|------|------|
| GET | /iot/device/list | 分页查询设备列表 | current, size, deviceName, catalogueId |
| GET | /iot/device/by-catalogue/{catalogueId} | 根据目录 ID 查询设备 | catalogueId (path) |
| POST | /iot/device | 新增设备 | Device |
| PUT | /iot/device | 编辑设备 | Device |
| DELETE | /iot/device/{id} | 删除设备 | id (path) |

### 2.3 设备测点管理接口 (/device-station-code)

| 方法 | 路径 | 描述 | 参数 |
|------|------|------|------|
| GET | /iot/device-station-code/list | 分页查询测点列表 | current, size, deviceId |
| GET | /iot/device-station-code/by-device/{deviceId} | 根据设备 ID 查询测点 | deviceId (path) |
| POST | /iot/device-station-code | 新增测点 | DeviceStationCode |
| PUT | /iot/device-station-code | 编辑测点 | DeviceStationCode |
| DELETE | /iot/device-station-code/{id} | 删除测点 | id (path) |

### 2.4 设备事件管理接口 (/device-event)

| 方法 | 路径 | 描述 | 参数 |
|------|------|------|------|
| GET | /iot/device-event/list | 分页查询事件列表 | current, size, deviceId |
| GET | /iot/device-event/by-device/{deviceId} | 根据设备 ID 查询事件 | deviceId (path) |
| POST | /iot/device-event | 新增事件 | DeviceEvent |
| PUT | /iot/device-event | 编辑事件 | DeviceEvent |
| DELETE | /iot/device-event/{id} | 删除事件 | id (path) |

## 3. 数据模型详解

### 3.1 DeviceCatalogue（设备目录）

```json
{
  "id": "string",
  "parentId": "string",
  "catalogueName": "string",
  "children": [],
  "deviceCount": 0,
  "createTime": "2026-02-04T10:30:00.000Z",
  "updateTime": "2026-02-04T10:30:00.000Z"
}
```

**字段说明**:
- `id`: 目录 ID
- `parentId`: 父级目录 ID
- `catalogueName`: 目录名称
- `children`: 子节点列表（递归结构）
- `deviceCount`: 该目录下挂载的设备数量
- `createTime`: 创建时间
- `updateTime`: 更新时间

### 3.2 Device（设备）

```json
{
  "id": "string",
  "deviceName": "string",
  "deviceCode": "string",
  "status": "string",
  "deviceType": "string",
  "catalogueId": "string",
  "createTime": "2026-02-04T10:30:00.000Z",
  "updateTime": "2026-02-04T10:30:00.000Z"
}
```

**字段说明**:
- `id`: 设备 ID
- `deviceName`: 设备名称
- `deviceCode`: 设备编码
- `status`: 设备状态
- `deviceType`: 设备类型
- `catalogueId`: 所属目录 ID
- `createTime`: 创建时间
- `updateTime`: 更新时间

### 3.3 DeviceStationCode（设备测点）

```json
{
  "id": "string",
  "deviceId": "string",
  "stationCode": "string",
  "stationName": "string",
  "standardStationCode": "string",
  "stationDesc": "string"
}
```

**字段说明**:
- `id`: 测点 ID
- `deviceId`: 设备 ID
- `stationCode`: 测点原始编码
- `stationName`: 测点名称
- `standardStationCode`: 测点标准编码
- `stationDesc`: 测点描述

### 3.4 DeviceEvent（设备事件）

```json
{
  "id": "string",
  "deviceId": "string",
  "eventTime": "2026-02-04T10:30:00.000Z",
  "eventMessage": "string"
}
```

**字段说明**:
- `id`: 事件 ID
- `deviceId`: 设备 ID
- `eventTime`: 事件发生时间
- `eventMessage`: 事件内容

### 3.5 Result（统一响应结果）

```json
{
  "code": 200,
  "message": "success",
  "data": {},
  "total": 0
}
```

**字段说明**:
- `code`: 状态码（int32）
- `message`: 响应消息
- `data`: 响应数据
- `total`: 数据总数（分页时使用）

## 4. 请求示例

### 4.1 获取设备目录树

```bash
curl -X GET "http://127.0.0.1:9001/iot/device-catalogue/tree"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "catalogue-001",
      "parentId": null,
      "catalogueName": "办公楼 A 区",
      "deviceCount": 10,
      "children": [
        {
          "id": "catalogue-001-01",
          "parentId": "catalogue-001",
          "catalogueName": "一楼",
          "deviceCount": 5,
          "children": []
        }
      ]
    }
  ]
}
```

### 4.2 分页查询设备列表

```bash
curl -X GET "http://127.0.0.1:9001/iot/device/list?current=1&size=10&deviceName=传感器&catalogueId=catalogue-001"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "device-001",
      "deviceName": "温湿度传感器",
      "deviceCode": "TH-001",
      "status": "online",
      "deviceType": "传感器",
      "catalogueId": "catalogue-001",
      "createTime": "2026-01-01T00:00:00.000Z",
      "updateTime": "2026-02-04T10:30:00.000Z"
    }
  ],
  "total": 50
}
```

### 4.3 根据目录查询设备

```bash
curl -X GET "http://127.0.0.1:9001/iot/device/by-catalogue/catalogue-001"
```

### 4.4 创建设备

```bash
curl -X POST "http://127.0.0.1:9001/iot/device" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceName": "新设备",
    "deviceCode": "DEV-001",
    "status": "online",
    "deviceType": "传感器",
    "catalogueId": "catalogue-001"
  }'
```

### 4.5 创建测点

```bash
curl -X POST "http://127.0.0.1:9001/iot/device-station-code" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "device-001",
    "stationCode": "TEMP",
    "stationName": "温度",
    "standardStationCode": "STD-TEMP",
    "stationDesc": "温度测量点"
  }'
```

### 4.6 查询设备事件

```bash
curl -X GET "http://127.0.0.1:9001/iot/device-event/list?current=1&size=10&deviceId=device-001"
```

## 5. 前端集成代码

### 5.1 API 调用示例

```typescript
import { 
  getDeviceCatalogueTree,
  getDeviceList,
  getStationCodesByDeviceId,
  getEventsByDeviceId
} from '@/api/device-real'

// 获取目录树
const tree = await getDeviceCatalogueTree()

// 分页查询设备
const devices = await getDeviceList({
  current: 1,
  size: 10,
  deviceName: '传感器',
  catalogueId: 'catalogue-001'
})

// 根据目录获取设备
const devicesByCatalogue = await getDevicesByCatalogueId('catalogue-001')

// 获取设备测点
const stationCodes = await getStationCodesByDeviceId('device-001')

// 获取设备事件
const events = await getEventsByDeviceId('device-001')
```

### 5.2 类型使用示例

```typescript
import type { 
  Device, 
  DeviceCatalogue, 
  DeviceStationCode, 
  DeviceEvent,
  Result
} from '@/types/device-real'

// 使用类型定义
const device: Device = {
  id: 'device-001',
  deviceName: '温湿度传感器',
  deviceCode: 'TH-001',
  status: 'online',
  deviceType: '传感器',
  catalogueId: 'catalogue-001'
}

// 处理响应
const response: Result<Device[]> = await getDeviceList()
console.log(response.data)
console.log(response.total)
```

## 6. 注意事项

### 6.1 路径参数

- 路径参数使用 `{id}` 格式
- 例如：`/iot/device/{id}` 需要替换为 `/iot/device/device-001`

### 6.2 查询参数

- 分页参数：`current`（页码，默认 1），`size`（每页数量，默认 10）
- 查询参数使用 query string 格式

### 6.3 请求体

- POST 和 PUT 请求需要设置 `Content-Type: application/json`
- 请求体为 JSON 格式

### 6.4 响应格式

- 所有响应都包装在 `Result` 对象中
- 成功时 `code` 为 200
- 数据在 `data` 字段中
- 分页数据包含 `total` 字段

### 6.5 错误处理

```typescript
try {
  const response = await getDeviceList(params)
  if (response.code === 200) {
    // 处理成功
  } else {
    // 处理业务错误
    console.error(response.message)
  }
} catch (error) {
  // 处理网络错误或 HTTP 错误
  console.error('请求失败:', error)
}
```

## 7. 认证说明

根据当前实现，所有请求需要通过网关，并在请求头中添加认证信息：

```typescript
// request.ts 中已配置
config.headers['Authorization'] = `Bearer ${token}`
```

## 8. 完整测试脚本

```bash
#!/bin/bash

BASE_URL="http://127.0.0.1:9001/iot"

# 1. 获取目录树
echo "=== 获取设备目录树 ==="
curl -s "$BASE_URL/device-catalogue/tree" | jq .

# 2. 查询设备列表
echo "=== 查询设备列表 ==="
curl -s "$BASE_URL/device/list?current=1&size=10" | jq .

# 3. 根据目录查询设备
echo "=== 根据目录查询设备 ==="
curl -s "$BASE_URL/device/by-catalogue/catalogue-001" | jq .

# 4. 查询测点列表
echo "=== 查询测点列表 ==="
curl -s "$BASE_URL/device-station-code/list?current=1&size=10&deviceId=device-001" | jq .

# 5. 查询事件列表
echo "=== 查询事件列表 ==="
curl -s "$BASE_URL/device-event/list?current=1&size=10&deviceId=device-001" | jq .
```

## 9. 相关文件

- API 定义：`src/api/device-real.ts`
- 类型定义：`src/types/device-real.ts`
- 集成文档：`docs/DEVICE_SERVICE_REAL_INTEGRATION.md`

## 10. 更新日志

- 2026-02-04: 基于真实 Swagger 文档创建完整集成方案
- 2026-02-04: 添加所有 API 端点详细说明
- 2026-02-04: 提供完整的请求/响应示例
