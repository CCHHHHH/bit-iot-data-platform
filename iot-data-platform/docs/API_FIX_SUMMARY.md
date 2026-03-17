# API 接口修复总结

## 修复的问题

### 1. API 路径错误 ✅ 已修复

**修复前**（错误）:
```typescript
/api/device/iot/device-catalogue/tree
/api/device/iot/device/list
/api/device/iot/device-station-code/list
/api/device/iot/device-event/list
```

**修复后**（正确）:
```typescript
/iot/device-catalogue/tree
/iot/device/list
/iot/device-station-code/list
/iot/device-event/list
```

### 2. 数据模型字段不匹配 ✅ 已修复

**Device 实体**:
- ❌ `name` → ✅ `deviceName`
- ❌ `sn` → ✅ `deviceCode`
- ❌ `type` → ✅ `deviceType`
- ❌ 缺少 `catalogueId` → ✅ 已添加

**DeviceCatalogue 实体**:
- ❌ `name` → ✅ `catalogueName`
- ❌ 缺少 `children` 递归类型 → ✅ 已添加

**DeviceStationCode 实体**:
- ❌ `name` → ✅ `stationName`
- ❌ `code` → ✅ `stationCode`
- ❌ `description` → ✅ `stationDesc`

**DeviceEvent 实体**:
- ❌ `title`, `description` → ✅ `eventMessage`
- ❌ `createdAt` → ✅ `eventTime`

## 修改的文件

### 1. src/api/device.ts
- ✅ 替换为正确的 API 定义
- ✅ 所有路径使用 `/iot` 前缀
- ✅ 包含 20 个完整的 API 接口

### 2. src/types/device.ts
- ✅ 替换为正确的类型定义
- ✅ 匹配 Swagger 文档的数据模型
- ✅ 包含所有实体和响应类型

### 3. src/views/DeviceManagementView.vue
- ✅ 更新导入的 API 函数
- ✅ 更新类型引用
- ✅ 修复模拟数据以匹配 Device 类型
- ✅ 修复字段访问（`name` → `catalogueName`）

## API 接口清单

### 设备目录管理 (5 个接口)
1. ✅ `GET /iot/device-catalogue/tree` - 获取目录树
2. ✅ `GET /iot/device-catalogue/list` - 分页查询
3. ✅ `POST /iot/device-catalogue` - 新增目录
4. ✅ `PUT /iot/device-catalogue` - 编辑目录
5. ✅ `DELETE /iot/device-catalogue/{id}` - 删除目录

### 设备管理 (5 个接口)
1. ✅ `GET /iot/device/list` - 分页查询设备
2. ✅ `GET /iot/device/by-catalogue/{catalogueId}` - 根据目录查询设备
3. ✅ `POST /iot/device` - 新增设备
4. ✅ `PUT /iot/device` - 编辑设备
5. ✅ `DELETE /iot/device/{id}` - 删除设备

### 设备测点管理 (5 个接口)
1. ✅ `GET /iot/device-station-code/list` - 分页查询测点
2. ✅ `GET /iot/device-station-code/by-device/{deviceId}` - 根据设备查询测点
3. ✅ `POST /iot/device-station-code` - 新增测点
4. ✅ `PUT /iot/device-station-code` - 编辑测点
5. ✅ `DELETE /iot/device-station-code/{id}` - 删除测点

### 设备事件管理 (5 个接口)
1. ✅ `GET /iot/device-event/list` - 分页查询事件
2. ✅ `GET /iot/device-event/by-device/{deviceId}` - 根据设备查询事件
3. ✅ `POST /iot/device-event` - 新增事件
4. ✅ `PUT /iot/device-event` - 编辑事件
5. ✅ `DELETE /iot/device-event/{id}` - 删除事件

## 当前页面调用的 API

### DeviceManagementView.vue
```typescript
// 获取目录树
getDeviceCatalogueTree()  // GET /iot/device-catalogue/tree

// 获取设备列表（分页）
getDeviceList(params)     // GET /iot/device/list

// 根据目录获取设备
getDevicesByCatalogueId(catalogueId)  // GET /iot/device/by-catalogue/{catalogueId}
```

### DeviceEventDialog.vue
```typescript
// 获取设备事件
getEventsByDeviceId(deviceId)  // GET /iot/device-event/by-device/{deviceId}

// 确认事件
confirmEvent(eventId, operator)  // PUT /iot/device-event/{id}/confirm

// 解决事件
resolveEvent(eventId, solution, resolver)  // PUT /iot/device-event/{id}/resolve
```

### DeviceMeasurementPointView.vue
```typescript
// 获取设备详情
getDeviceById(deviceId)  // 需要从真实 API 添加

// 获取测点列表
getStationCodesByDeviceId(deviceId)  // GET /iot/device-station-code/by-device/{deviceId}
```

## 注意事项

### 1. 缺失的 API
以下 API 在真实 Swagger 中不存在，需要从代码中移除或使用其他方式实现：
- ❌ `getDeviceById` - Swagger 中没有此接口
- ❌ `moveDeviceCatalogue` - Swagger 中没有此接口
- ❌ 批量操作接口 - Swagger 中没有

### 2. 字段映射
前端组件中需要确保使用正确的字段名：
```typescript
// ✅ 正确
device.deviceName
device.deviceCode
device.deviceType
device.catalogueId

catalogue.catalogueName

stationCode.stationCode
stationCode.stationName
stationCode.stationDesc

event.eventMessage
event.eventTime
```

### 3. 响应格式
所有 API 响应都包装在 `Result` 对象中：
```typescript
{
  code: number
  message: string
  data?: T
  total?: number
}
```

访问数据时需要使用 `response.data.data`

## 测试建议

1. **设备目录树**
   - 测试树形结构加载
   - 测试节点展开/折叠
   - 测试点击节点加载设备

2. **设备列表**
   - 测试分页功能
   - 测试按目录筛选
   - 测试搜索功能
   - 测试事件按钮

3. **设备事件**
   - 测试事件列表加载
   - 测试事件确认
   - 测试事件解决

4. **错误处理**
   - 测试网络错误
   - 测试 401 未授权
   - 测试空数据情况

## 后续工作

1. ✅ API 路径已统一为 `/iot` 前缀
2. ✅ 数据模型已匹配 Swagger 定义
3. ⏳ 需要测试真实后端接口
4. ⏳ 需要添加缺失的 API（如 getDeviceById）
5. ⏳ 需要更新其他使用旧 API 的组件

## 验证方法

访问设备管理页面：http://localhost:5173/devices

打开浏览器开发者工具，查看 Network 标签，确认请求 URL 为：
- ✅ `http://localhost:9001/iot/device-catalogue/tree`
- ✅ `http://localhost:9001/iot/device/list?current=1&size=10`
- ✅ `http://localhost:9001/iot/device/by-catalogue/{catalogueId}`
- ✅ `http://localhost:9001/iot/device-event/by-device/{deviceId}`
