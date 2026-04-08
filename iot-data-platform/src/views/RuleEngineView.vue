<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Delete, VideoPlay, VideoPause, Upload, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { UploadFile } from 'element-plus'
import {
  getRuleList, startRule, stopRule, deleteRule as apiDeleteRule,
  getAlgorithmList, uploadAlgorithm, updateAlgorithm, deleteAlgorithm as apiDeleteAlgorithm,
  enableAlgorithm, disableAlgorithm,
  getExecutionLogs
} from '../api/rule-engine'
import RuleWizardDialog from '../components/RuleWizardDialog.vue'

const router = useRouter()
const activeTab = ref('rules')

// ─────────────────────────────────────────────
// 规则列表
// ─────────────────────────────────────────────
const rulesLoading = ref(false)
const ruleSearchQuery = ref('')
const rules = ref<any[]>([])
const rulePagination = ref({ currentPage: 1, pageSize: 10, total: 0 })
const ruleActionLoading = ref<Record<string, boolean>>({})

const fetchRules = async () => {
  rulesLoading.value = true
  try {
    const resp = await getRuleList({
      current: rulePagination.value.currentPage,
      size: rulePagination.value.pageSize,
      ruleName: ruleSearchQuery.value || undefined
    })
    if (resp.data?.code === 200) {
      rules.value = resp.data.data || []
      rulePagination.value.total = resp.data.total || 0
    }
  } catch {
    ElMessage.error('获取规则列表失败')
  } finally {
    rulesLoading.value = false
  }
}

const handleStartRule = async (row: any) => {
  ruleActionLoading.value[row.id] = true
  try {
    const resp = await startRule(row.id)
    if (resp.data?.code === 200) {
      ElMessage.success('规则已启动')
      await fetchRules()
    } else {
      ElMessage.error(resp.data?.msg || '启动失败')
    }
  } catch {
    ElMessage.error('启动失败')
  } finally {
    ruleActionLoading.value[row.id] = false
  }
}

const handleStopRule = async (row: any) => {
  ruleActionLoading.value[row.id] = true
  try {
    const resp = await stopRule(row.id)
    if (resp.data?.code === 200) {
      ElMessage.success('规则已停止')
      await fetchRules()
    } else {
      ElMessage.error(resp.data?.msg || '停止失败')
    }
  } catch {
    ElMessage.error('停止失败')
  } finally {
    ruleActionLoading.value[row.id] = false
  }
}

const handleDeleteRule = (row: any) => {
  ElMessageBox.confirm(`确定要删除规则「${row.ruleName}」吗？此操作不可恢复！`, '删除确认', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await apiDeleteRule(row.id)
      ElMessage.success('删除成功')
      await fetchRules()
    } catch {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

// 向导弹窗
const wizardVisible = ref(false)
const editingRule = ref<any>(null)

const openAddRule = () => {
  editingRule.value = null
  wizardVisible.value = true
}

const openEditRule = (row: any) => {
  editingRule.value = row
  wizardVisible.value = true
}

const onWizardDone = () => {
  wizardVisible.value = false
  fetchRules()
}

// ─────────────────────────────────────────────
// 算法管理
// ─────────────────────────────────────────────
const algoLoading = ref(false)
const algoSearchQuery = ref('')
const algorithms = ref<any[]>([])
const algoPagination = ref({ currentPage: 1, pageSize: 10, total: 0 })

const uploadDialogVisible = ref(false)
const uploadForm = ref({
  algorithmName: '',
  algorithmDesc: '',
  algorithmType: '',
  algorithmClass: '',
  algorithmVersion: '1.0.0'
})
const uploadFile = ref<File | null>(null)
const uploadLoading = ref(false)

// 编辑算法
const editAlgoDialogVisible = ref(false)
const editAlgoForm = ref<any>({})
const editAlgoLoading = ref(false)

const fetchAlgorithms = async () => {
  algoLoading.value = true
  try {
    const resp = await getAlgorithmList({
      current: algoPagination.value.currentPage,
      size: algoPagination.value.pageSize,
      algorithmName: algoSearchQuery.value || undefined
    })
    if (resp.data?.code === 200) {
      algorithms.value = resp.data.data || []
      algoPagination.value.total = resp.data.total || 0
    }
  } catch {
    ElMessage.error('获取算法列表失败')
  } finally {
    algoLoading.value = false
  }
}

const handleFileChange = (uploadFileObj: UploadFile) => {
  uploadFile.value = uploadFileObj.raw || null
  if (uploadFile.value) {
    const name = uploadFile.value.name
    if (!uploadForm.value.algorithmType) {
      uploadForm.value.algorithmType = name.endsWith('.py') ? 'python' : 'jar'
    }
    if (!uploadForm.value.algorithmName) {
      uploadForm.value.algorithmName = name.replace(/\.[^.]+$/, '')
    }
  }
}

const submitUpload = async () => {
  if (!uploadFile.value) {
    ElMessage.warning('请选择算法文件')
    return
  }
  if (uploadForm.value.algorithmType === 'jar' && !uploadForm.value.algorithmClass) {
    ElMessage.warning('JAR 类型必须填写入口类')
    return
  }
  uploadLoading.value = true
  try {
    const params: any = {}
    if (uploadForm.value.algorithmName) params.algorithmName = uploadForm.value.algorithmName
    if (uploadForm.value.algorithmDesc) params.algorithmDesc = uploadForm.value.algorithmDesc
    if (uploadForm.value.algorithmType) params.algorithmType = uploadForm.value.algorithmType
    if (uploadForm.value.algorithmClass) params.algorithmClass = uploadForm.value.algorithmClass
    if (uploadForm.value.algorithmVersion) params.algorithmVersion = uploadForm.value.algorithmVersion
    const resp = await uploadAlgorithm(uploadFile.value, params)
    if (resp.data?.code === 200) {
      ElMessage.success('上传成功')
      uploadDialogVisible.value = false
      uploadFile.value = null
      uploadForm.value = { algorithmName: '', algorithmDesc: '', algorithmType: '', algorithmClass: '', algorithmVersion: '1.0.0' }
      await fetchAlgorithms()
    } else {
      ElMessage.error(resp.data?.msg || '上传失败')
    }
  } catch {
    ElMessage.error('上传失败')
  } finally {
    uploadLoading.value = false
  }
}

const openEditAlgo = (row: any) => {
  editAlgoForm.value = { ...row }
  editAlgoDialogVisible.value = true
}

const submitEditAlgo = async () => {
  editAlgoLoading.value = true
  try {
    const resp = await updateAlgorithm(editAlgoForm.value)
    if (resp.data?.code === 200) {
      ElMessage.success('编辑成功')
      editAlgoDialogVisible.value = false
      await fetchAlgorithms()
    } else {
      ElMessage.error(resp.data?.msg || '编辑失败')
    }
  } catch {
    ElMessage.error('编辑失败')
  } finally {
    editAlgoLoading.value = false
  }
}

const handleToggleAlgo = async (row: any) => {
  try {
    const resp = row.algorithmStatus === 1
      ? await disableAlgorithm(row.id)
      : await enableAlgorithm(row.id)
    if (resp.data?.code === 200) {
      ElMessage.success(row.algorithmStatus === 1 ? '已禁用' : '已启用')
      await fetchAlgorithms()
    } else {
      ElMessage.error(resp.data?.msg || '操作失败')
    }
  } catch {
    ElMessage.error('操作失败')
  }
}

const handleDeleteAlgo = (row: any) => {
  ElMessageBox.confirm(`确定要删除算法「${row.algorithmName}」吗？`, '删除确认', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await apiDeleteAlgorithm(row.id)
      ElMessage.success('删除成功')
      await fetchAlgorithms()
    } catch {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

const formatFileSize = (bytes: number) => {
  if (!bytes) return '-'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

// ─────────────────────────────────────────────
// 执行日志
// ─────────────────────────────────────────────
const logLoading = ref(false)
const logs = ref<any[]>([])
const logPagination = ref({ currentPage: 1, pageSize: 20, total: 0 })
const logStatusFilter = ref<number | ''>('')
const expandedLogs = ref<Set<string>>(new Set())

const fetchLogs = async () => {
  logLoading.value = true
  try {
    const resp = await getExecutionLogs({
      current: logPagination.value.currentPage,
      size: logPagination.value.pageSize,
      execStatus: logStatusFilter.value !== '' ? logStatusFilter.value as number : undefined
    })
    if (resp.data?.code === 200) {
      logs.value = resp.data.data || []
      logPagination.value.total = resp.data.total || 0
    }
  } catch {
    ElMessage.error('获取执行日志失败')
  } finally {
    logLoading.value = false
  }
}

const toggleLogExpand = (id: string) => {
  if (expandedLogs.value.has(id)) {
    expandedLogs.value.delete(id)
  } else {
    expandedLogs.value.add(id)
  }
}

const formatResultData = (str: string) => {
  try { return JSON.stringify(JSON.parse(str), null, 2) } catch { return str }
}

const handleTabChange = (tab: string | number) => {
  if (tab === 'rules') {
    fetchRules()
    return
  }

  if (tab === 'algorithms') {
    fetchAlgorithms()
    return
  }

  if (tab === 'logs') {
    fetchLogs()
  }
}

onMounted(() => {
  fetchRules()
  fetchAlgorithms()
})
</script>

<template>
  <div class="rule-engine-view">
    <h1 class="page-title">规则引擎</h1>

    <el-tabs v-model="activeTab" class="rule-tabs" @tab-change="handleTabChange">

      <!-- ══════════════════════════════════════
           Tab 1: 规则配置
      ══════════════════════════════════════ -->
      <el-tab-pane label="规则配置" name="rules">
        <div class="list-panel" v-loading="rulesLoading">
          <div class="list-toolbar">
            <el-input
              v-model="ruleSearchQuery"
              placeholder="搜索规则名称"
              clearable
              style="width: 280px"
              @keydown.enter="fetchRules"
            >
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
            <div class="toolbar-right">
              <el-button @click="fetchRules">搜索</el-button>
              <el-button type="primary" @click="openAddRule">
                <el-icon><Plus /></el-icon>新增规则
              </el-button>
            </div>
          </div>

          <el-table :data="rules" style="width:100%" size="small" class="config-table rule-config-table">
            <el-table-column prop="ruleName" label="规则名称" min-width="180" show-overflow-tooltip />
            <el-table-column prop="algorithmName" label="算法" min-width="160" show-overflow-tooltip />
            <el-table-column prop="algorithmType" label="算法类型" width="110" align="center">
              <template #default="{ row }">
                <el-tag :type="row.algorithmType === 'jar' ? 'primary' : 'warning'" size="small">
                  {{ row.algorithmType === 'jar' ? 'JAR' : 'Python' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="triggerType" label="触发方式" width="116" align="center">
              <template #default="{ row }">
                <el-tag :type="row.triggerType === 'realtime' ? 'success' : 'info'" size="small">
                  {{ row.triggerType === 'realtime' ? '实时' : '定时' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="窗口" width="142" align="center">
              <template #default="{ row }">
                <span class="window-info">{{ row.windowSize }}{{ row.windowUnit }} / {{ row.windowType }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="ruleStatus" label="状态" width="106" align="center">
              <template #default="{ row }">
                <span class="status-badge" :class="row.ruleStatus === 1 ? 'status-running' : 'status-stopped'">
                  {{ row.ruleStatus === 1 ? '运行中' : '已停止' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="updateTime" label="更新时间" width="184" align="center" show-overflow-tooltip />
            <el-table-column label="操作" fixed="right" width="252" align="center" class-name="table-action-column">
              <template #default="{ row }">
                <div class="table-actions">
                  <el-button
                    v-if="row.ruleStatus === 0"
                    type="success" size="small"
                    :loading="ruleActionLoading[row.id]"
                    @click="handleStartRule(row)"
                  >
                    <el-icon><VideoPlay /></el-icon>启动
                  </el-button>
                  <el-button
                    v-else
                    type="warning" size="small"
                    :loading="ruleActionLoading[row.id]"
                    @click="handleStopRule(row)"
                  >
                    <el-icon><VideoPause /></el-icon>停止
                  </el-button>
                  <el-button
                    type="info" size="small"
                    @click="router.push(`/rules/${row.id}`)"
                  >
                    详情
                  </el-button>
                  <el-button
                    type="primary" size="small"
                    :disabled="row.ruleStatus === 1"
                    @click="openEditRule(row)"
                  >
                    编辑
                  </el-button>
                  <el-button
                    type="danger" size="small"
                    :disabled="row.ruleStatus === 1"
                    @click="handleDeleteRule(row)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <div class="list-footer">
            <el-pagination
              v-model:current-page="rulePagination.currentPage"
              v-model:page-size="rulePagination.pageSize"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="rulePagination.total"
              prev-text="上一页" next-text="下一页"
              @size-change="() => fetchRules()"
              @current-change="() => fetchRules()"
            />
          </div>
        </div>
      </el-tab-pane>

      <!-- ══════════════════════════════════════
           Tab 2: 算法管理
      ══════════════════════════════════════ -->
      <el-tab-pane label="算法管理" name="algorithms">
        <div class="list-panel" v-loading="algoLoading">
          <div class="list-toolbar">
            <el-input
              v-model="algoSearchQuery"
              placeholder="搜索算法名称"
              clearable
              style="width: 280px"
              @keydown.enter="fetchAlgorithms"
            >
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
            <div class="toolbar-right">
              <el-button @click="fetchAlgorithms">搜索</el-button>
              <el-button type="primary" @click="uploadDialogVisible = true">
                <el-icon><Upload /></el-icon>上传算法
              </el-button>
            </div>
          </div>

          <el-table :data="algorithms" style="width:100%" size="small" class="config-table algorithm-table">
            <el-table-column prop="algorithmName" label="算法名称" min-width="190" show-overflow-tooltip />
            <el-table-column prop="algorithmType" label="类型" width="104" align="center">
              <template #default="{ row }">
                <el-tag :type="row.algorithmType === 'jar' ? 'primary' : 'warning'" size="small">
                  {{ row.algorithmType === 'jar' ? 'JAR' : 'Python' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="algorithmVersion" label="版本" width="104" align="center" />
            <el-table-column prop="fileSize" label="文件大小" width="124" align="center">
              <template #default="{ row }">{{ formatFileSize(row.fileSize) }}</template>
            </el-table-column>
            <el-table-column prop="algorithmStatus" label="状态" width="104" align="center">
              <template #default="{ row }">
                <span class="status-badge" :class="row.algorithmStatus === 1 ? 'status-running' : 'status-stopped'">
                  {{ row.algorithmStatus === 1 ? '启用' : '禁用' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="algorithmDesc" label="描述" min-width="220" show-overflow-tooltip />
            <el-table-column prop="createTime" label="创建时间" width="184" align="center" show-overflow-tooltip />
            <el-table-column label="操作" fixed="right" width="232" align="center" class-name="table-action-column">
              <template #default="{ row }">
                <div class="table-actions">
                  <el-button
                    :type="row.algorithmStatus === 1 ? 'warning' : 'success'"
                    size="small"
                    @click="handleToggleAlgo(row)"
                  >
                    {{ row.algorithmStatus === 1 ? '禁用' : '启用' }}
                  </el-button>
                  <el-button type="primary" size="small" @click="openEditAlgo(row)">编辑</el-button>
                  <el-button type="danger" size="small" @click="handleDeleteAlgo(row)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <div class="list-footer">
            <el-pagination
              v-model:current-page="algoPagination.currentPage"
              v-model:page-size="algoPagination.pageSize"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="algoPagination.total"
              prev-text="上一页" next-text="下一页"
              @size-change="() => fetchAlgorithms()"
              @current-change="() => fetchAlgorithms()"
            />
          </div>
        </div>
      </el-tab-pane>

      <!-- ══════════════════════════════════════
           Tab 3: 执行日志
      ══════════════════════════════════════ -->
      <el-tab-pane label="执行日志" name="logs">
        <div class="list-panel" v-loading="logLoading">
          <div class="list-toolbar">
            <el-select
              v-model="logStatusFilter"
              placeholder="执行状态"
              clearable
              style="width: 160px"
              @change="fetchLogs"
            >
              <el-option label="执行中" :value="0" />
              <el-option label="成功" :value="1" />
              <el-option label="失败" :value="2" />
            </el-select>
            <div class="toolbar-right">
              <el-button @click="fetchLogs">刷新</el-button>
            </div>
          </div>

          <el-table :data="logs" style="width:100%" size="small">
            <el-table-column prop="ruleId" label="规则ID" width="200" show-overflow-tooltip />
            <el-table-column prop="startTime" label="开始时间" width="165" show-overflow-tooltip />
            <el-table-column prop="endTime" label="结束时间" width="165" show-overflow-tooltip />
            <el-table-column prop="durationMs" label="耗时(ms)" width="100" />
            <el-table-column prop="execStatus" label="状态" width="90">
              <template #default="{ row }">
                <span class="status-badge"
                  :class="row.execStatus === 1 ? 'status-running' : row.execStatus === 0 ? 'status-pending' : 'status-stopped'">
                  {{ ['执行中','成功','失败'][row.execStatus] }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="结果/错误" min-width="200">
              <template #default="{ row }">
                <template v-if="row.execStatus === 2 && row.errorMsg">
                  <span class="error-text">{{ row.errorMsg }}</span>
                </template>
                <template v-else-if="row.resultData">
                  <el-button text size="small" @click="toggleLogExpand(row.id)">
                    {{ expandedLogs.has(row.id) ? '收起' : '展开结果' }}
                  </el-button>
                  <pre v-if="expandedLogs.has(row.id)" class="result-pre">{{ formatResultData(row.resultData) }}</pre>
                </template>
                <span v-else class="muted">—</span>
              </template>
            </el-table-column>
          </el-table>

          <div class="list-footer">
            <el-pagination
              v-model:current-page="logPagination.currentPage"
              v-model:page-size="logPagination.pageSize"
              :page-sizes="[20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="logPagination.total"
              prev-text="上一页" next-text="下一页"
              @size-change="() => fetchLogs()"
              @current-change="() => fetchLogs()"
            />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- ══════════════════════════════════════
         规则向导弹窗
    ══════════════════════════════════════ -->
    <RuleWizardDialog
      v-model:visible="wizardVisible"
      :edit-data="editingRule"
      :algorithms="algorithms"
      @done="onWizardDone"
    />

    <!-- ══════════════════════════════════════
         上传算法弹窗
    ══════════════════════════════════════ -->
    <el-dialog v-model="uploadDialogVisible" title="上传算法" width="520px" :close-on-click-modal="false">
      <el-form label-width="90px" label-position="left">
        <el-form-item label="算法文件" required>
          <el-upload
            action="#"
            :auto-upload="false"
            :limit="1"
            accept=".jar,.py"
            :on-change="handleFileChange"
            drag
          >
            <el-icon style="font-size:40px;color:var(--color-primary-400)"><Upload /></el-icon>
            <div style="margin-top:8px;font-size:14px">拖拽或点击上传 .jar / .py 文件</div>
            <div style="font-size:12px;color:var(--color-text-tertiary)">最大 50MB</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="算法名称">
          <el-input v-model="uploadForm.algorithmName" placeholder="留空则从文件名推断" />
        </el-form-item>
        <el-form-item label="算法类型">
          <el-select v-model="uploadForm.algorithmType" placeholder="留空则从后缀推断" style="width:100%">
            <el-option label="JAR" value="jar" />
            <el-option label="Python" value="python" />
          </el-select>
        </el-form-item>
        <el-form-item label="入口类" v-if="uploadForm.algorithmType === 'jar'">
          <el-input v-model="uploadForm.algorithmClass" placeholder="如：com.example.MyAlgorithm" />
        </el-form-item>
        <el-form-item label="版本号">
          <el-input v-model="uploadForm.algorithmVersion" placeholder="默认 1.0.0" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="uploadForm.algorithmDesc" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="uploadDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="uploadLoading" @click="submitUpload">上传</el-button>
      </template>
    </el-dialog>

    <!-- ══════════════════════════════════════
         编辑算法弹窗
    ══════════════════════════════════════ -->
    <el-dialog v-model="editAlgoDialogVisible" title="编辑算法" width="480px" :close-on-click-modal="false">
      <el-form :model="editAlgoForm" label-width="90px" label-position="left">
        <el-form-item label="算法名称">
          <el-input v-model="editAlgoForm.algorithmName" />
        </el-form-item>
        <el-form-item label="算法类型">
          <el-select v-model="editAlgoForm.algorithmType" style="width:100%">
            <el-option label="JAR" value="jar" />
            <el-option label="Python" value="python" />
          </el-select>
        </el-form-item>
        <el-form-item label="入口类" v-if="editAlgoForm.algorithmType === 'jar'">
          <el-input v-model="editAlgoForm.algorithmClass" />
        </el-form-item>
        <el-form-item label="版本号">
          <el-input v-model="editAlgoForm.algorithmVersion" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editAlgoForm.algorithmDesc" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editAlgoDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="editAlgoLoading" @click="submitEditAlgo">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.rule-engine-view {
  padding: 20px;
}
.page-title {
  font-size: 21px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 18px;
  display: flex;
  align-items: center;
  letter-spacing: -0.3px;
}
.page-title::before {
  content: '';
  display: inline-block;
  width: 3px;
  height: 20px;
  background: linear-gradient(180deg, var(--color-primary-500) 0%, #06B6D4 100%);
  border-radius: 9999px;
  margin-right: 10px;
  flex-shrink: 0;
}
.rule-tabs {
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  padding: 0 16px 16px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-light);
}
:deep(.el-tabs__header) { margin-bottom: 16px; }

.config-table {
  margin-top: 6px;
}

:deep(.config-table .el-table__header th) {
  padding: 14px 18px;
  background: var(--color-bg-secondary);
}

:deep(.config-table .el-table__body td) {
  padding: 15px 18px;
}

:deep(.config-table .cell) {
  padding-left: 2px;
  padding-right: 2px;
}

.table-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

:deep(.table-actions .el-button + .el-button) {
  margin-left: 0;
}

.window-info {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-family: var(--font-family-mono, monospace);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
}
.status-badge::before {
  content: '';
  width: 6px; height: 6px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}
.status-running  { background: var(--color-success-bg); color: var(--color-success); }
.status-stopped  { background: var(--color-bg-tertiary); color: var(--color-text-tertiary); }
.status-pending  { background: #EFF6FF; color: #1668DC; }

.error-text { color: var(--color-danger); font-size: 12px; }
.muted { color: var(--color-text-tertiary); }
.result-pre {
  margin: 6px 0 0;
  padding: 8px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-family: var(--font-family-mono, monospace);
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
}
</style>
