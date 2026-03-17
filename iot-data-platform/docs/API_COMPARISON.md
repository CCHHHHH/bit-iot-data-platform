# API 接口对比分析

## 问题总结

当前前端使用的 API 路径与真实 Swagger 文档**不匹配**，需要修复。

## 路径对比

### 当前使用的前缀（❌ 错误）
```
/api/device/iot/device-catalogue/tree
/api/device/iot/device/list
/api/device/iot/device-station-code/list
/api/device/iot/device-event/list
```

### 真实 Swagger 路径（✅ 正确）
```
/iot/device-catalogue/tree
/iot/device/list
/iot/device-station-code/list
/iot/device-event/list
```

## 完整接口映射表

### 1. 设备目录管理 (Device Catalogue)

| 功能 | 当前路径 (❌) | 真实路径 (✅) | 状态 |
|------|------------|------------|------|
| 获取目录树 | `/api/device/iot/device-catalogue/tree` | `/iot/device-catalogue/tree` | ❌ 需要修复 |
| 分页查询目录 | `/api/device/iot/device-catalogue/list` | `/iot/device-catalogue/list` | ❌ 需要修复 |
| 新增目录 | `/api/device/iot/device-catalogue` | `/iot/device-catalogue` | ❌ 需要修复 |
| 编辑目录 | `/api/device/iot/device-catalogue` | `/iot/device-catalogue` | ❌ 需要修复 |
| 删除目录 | `/api/device/iot/device-catalogue/{id}` | `/iot/device-catalogue/{id}` | ❌ 需要修复 |

### 2. 设备管理 (Device)

| 功能 | 当前路径 (❌) | 真实路径 (✅) | 状态 |
|------|------------|------------|------|
| 分页查询设备 | `/api/device/iot/device/list` | `/iot/device/list` | ❌ 需要修复 |
| 根据目录查询设备 | `/api/device/iot/device/by-catalogue/{catalogueId}` | `/iot/device/by-catalogue/{catalogueId}` | ❌ 需要修复 |
| 新增设备 | `/api/device/iot/device` | `/iot/device` | ❌ 需要修复 |
| 编辑设备 | `/api/device/iot/device` | `/iot/device` | ❌ 需要修复 |
| 删除设备 | `/api/device/iot/device/{id}` | `/iot/device/{id}` | ❌ 需要修复 |

### 3. 设备测点管理 (Device Station Code)

| 功能 | 当前路径 (❌) | 真实路径 (✅) | 状态 |
|------|------------|------------|------|
| 分页查询测点 | `/api/device/iot/device-station-code/list` | `/iot/device-station-code/list` | ❌ 需要修复 |
| 根据设备查询测点 | `/api/device/iot/device-station-code/by-device/{deviceId}` | `/iot/device-station-code/by-device/{deviceId}` | ❌ 需要修复 |
| 新增测点 | `/api/device/iot/device-station-code` | `/iot/device-station-code` | ❌ 需要修复 |
| 编辑测点 | `/api/device/iot/device-station-code` | `/iot/device-station-code` | ❌ 需要修复 |
| 删除测点 | `/api/device/iot/device-station-code/{id}` | `/iot/device-station-code/{id}` | ❌ 需要修复 |

### 4. 设备事件管理 (Device Event)

| 功能 | 当前路径 (❌) | 真实路径 (✅) | 状态 |
|------|------------|------------|------|
| 分页查询事件 | `/api/device/iot/device-event/list` | `/iot/device-event/list` | ❌ 需要修复 |
| 根据设备查询事件 | `/api/device/iot/device-event/by-device/{deviceId}` | `/iot/device-event/by-device/{deviceId}` | ❌ 需要修复 |
| 新增事件 | `/api/device/iot/device-event` | `/iot/device-event` | ❌ 需要修复 |
| 编辑事件 | `/api/device/iot/device-event` | `/iot/device-event` | ❌ 需要修复 |
| 删除事件 | `/api/device/iot/device-event/{id}` | `/iot/device-event/{id}` | ❌ 需要修复 |

## 数据模型对比

### Device 实体

**当前前端使用**:
```typescript
{
  id: string
  name: string           // ❌ 应该是 deviceName
  sn: string            // ❌ 应该是 deviceCode
  model?: string
  type?: string
  ip?: string
  location?: string
  status: string
}
```

**真实 Swagger 定义**:
```typescript
{
  id: string
  deviceName: string     // ✅
  deviceCode: string     // ✅
  status: string
  deviceType: string     // ✅
  catalogueId: string    // ✅
}
```

### DeviceStationCode 实体

**当前前端使用**:
```typescript
{
  id: string
  deviceId: string
  name: string          // ❌ 应该是 stationName
  code: string          // ❌ 应该是 stationCode
  type: string
  unit: string
  description: string   // ❌ 应该是 stationDesc
}
```

**真实 Swagger 定义**:
```typescript
{
  id: string
  deviceId: string
  stationCode: string    // ✅
  stationName: string    // ✅
  standardStationCode: string
  stationDesc: string    // ✅
}
```

### DeviceEvent 实体

**当前前端使用**:
```typescript
{
  id: string
  deviceId: string
  title: string         // ❌ 应该是 eventMessage
  description: string   // ❌
  level: string
  status: string
  type: string
}
```

**真实 Swagger 定义**:
```typescript
{
  id: string
  deviceId: string
  eventTime: string      // ✅
  eventMessage: string   // ✅
}
```

## 需要修复的文件

1. ❌ **src/api/device.ts** - API 路径全部错误
2. ❌ **src/types/device.ts** - 类型定义字段不匹配
3. ✅ **src/api/device-real.ts** - 已创建正确的 API 定义
4. ✅ **src/types/device-real.ts** - 已创建正确的类型定义

## 修复方案

### 方案 1：修改现有文件（推荐）
直接修改 `src/api/device.ts` 和 `src/types/device.ts`，使其匹配真实 Swagger

### 方案 2：使用新文件
将现有的 `src/api/device-real.ts` 重命名为 `src/api/device.ts`

## 修复步骤

1. 备份当前文件
2. 使用 `src/api/device-real.ts` 替换 `src/api/device.ts`
3. 使用 `src/types/device-real.ts` 替换 `src/types/device.ts`
4. 更新所有引用这些 API 的组件
5. 测试所有功能

## 影响范围

- DeviceManagementView.vue
- DeviceCatalogView.vue
- DeviceMeasurementPointView.vue
- DeviceEventDialog.vue
- 所有使用设备相关 API 的组件
