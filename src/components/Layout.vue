<template>
  <div class="layout-container">
    <!-- 侧边栏 -->
    <div class="sidebar" :class="{ collapsed: isCollapsed }">
      <div class="sidebar-header">
        <div class="logo">
          <el-icon class="logo-icon" v-if="!isCollapsed">
            <OfficeBuilding/>
          </el-icon>
          <span v-if="!isCollapsed" class="logo-text">昆华医院生殖医学科</span>
          <el-button
              class="collapse-btn"
              @click="toggleCollapse"
              text
          >
            <el-icon class="logo-icon">
              <Expand v-if="isCollapsed"/>
              <Fold v-else/>
            </el-icon>
          </el-button>
        </div>
      </div>

      <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          :collapse="isCollapsed"
          :collapse-transition="false"
          router
          unique-opened
      >
        <el-menu-item index="/statistics">
          <el-icon>
            <DataAnalysis/>
          </el-icon>
          <template #title>数据统计</template>
        </el-menu-item>

        <el-sub-menu index="/management">
          <template #title>
            <el-icon>
              <Setting/>
            </el-icon>
            数据管理
          </template>
          <el-menu-item index="/management/add">
            <el-icon>
              <CirclePlus/>
            </el-icon>
            <template #title>新增病人数据</template>
          </el-menu-item>
          <el-menu-item index="/management/edit">
            <el-icon>
              <Edit/>
            </el-icon>
            <template #title>修改病人数据</template>
          </el-menu-item>
          <el-menu-item index="/management/delete">
            <el-icon>
              <Delete/>
            </el-icon>
            <template #title>删除病人数据</template>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="prediction">
          <template #title>
            <el-icon>
              <MagicStick/>
            </el-icon>
            AI胚胎发育预测
          </template>
          <el-menu-item index="/prediction/new">
            <el-icon>
              <DocumentAdd/>
            </el-icon>
            <template #title>新建数据预测</template>
          </el-menu-item>
          <el-menu-item index="/prediction/existing">
            <el-icon>
              <Document/>
            </el-icon>
            <template #title>现有数据预测</template>
          </el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/integrated">
          <el-icon>
            <Grid/>
          </el-icon>
          <template #title>集成版页面</template>
        </el-menu-item>

        <el-menu-item index="/old-home">
          <el-icon>
            <House/>
          </el-icon>
          <template #title>旧版页面</template>
        </el-menu-item>
      </el-menu>

      <!-- 用户信息和退出 -->
      <div class="sidebar-footer">
        <div class="user-info" v-if="!isCollapsed">
          <div class="user-avatar">
            <el-icon>
              <User/>
            </el-icon>
          </div>
          <div class="user-details">
            <div class="username">{{ username }}</div>
            <div class="user-role">{{ userRole }}</div>
          </div>
        </div>
        <div class="user-info">
          <el-button
              class="logout-btn"
              @click="handleLogout"
              :title="isCollapsed ? '退出登录' : ''"
              text
          >
            <el-icon class="logout-icon">
              <SwitchButton/>
            </el-icon>
            <span v-if="!isCollapsed">退出登录</span>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content" :class="{ expanded: isCollapsed }">
      <router-view/>
    </div>
  </div>
</template>

<script>
import {ref, computed, onMounted} from 'vue'
import {useRouter, useRoute} from 'vue-router'
import {ElMessage, ElMessageBox} from 'element-plus'
import {
  OfficeBuilding,
  Expand,
  Fold,
  DataAnalysis,
  MagicStick,
  Setting,
  Grid,
  House,
  User,
  SwitchButton,
  Edit,
  Delete,
  CirclePlus,
  DocumentAdd,
  Document
} from '@element-plus/icons-vue'

export default {
  name: 'Layout',
  components: {
    OfficeBuilding,
    Expand,
    Fold,
    DataAnalysis,
    MagicStick,
    Setting,
    Grid,
    House,
    User,
    SwitchButton,
    Edit,
    Delete,
    CirclePlus,
    DocumentAdd,
    Document
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const isCollapsed = ref(false)

    // 获取当前激活的菜单项
    const activeMenu = computed(() => {
      return route.path
    })

    // 获取用户信息
    const userInfo = computed(() => {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return user
    })

    const username = computed(() => {
      return userInfo.value.username || '未知用户'
    })

    const userRole = computed(() => {
      const role = userInfo.value.role
      return role === 'admin' ? '管理员' : '普通用户'
    })

    // 切换侧边栏折叠状态
    const toggleCollapse = () => {
      isCollapsed.value = !isCollapsed.value
      // 保存折叠状态到本地存储
      localStorage.setItem('sidebarCollapsed', isCollapsed.value.toString())
    }

    // 处理退出登录
    const handleLogout = async () => {
      try {
        await ElMessageBox.confirm(
            '确定要退出登录吗？',
            '提示',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
        )

        // 清除本地存储
        localStorage.removeItem('token')
        localStorage.removeItem('token_expires')
        localStorage.removeItem('user')
        localStorage.removeItem('sidebarCollapsed')

        ElMessage.success('退出登录成功')

        // 跳转到登录页
        router.push('/login')
      } catch {
        // 用户取消退出
      }
    }

    // 组件挂载时恢复侧边栏状态
    onMounted(() => {
      const collapsed = localStorage.getItem('sidebarCollapsed')
      if (collapsed === 'true') {
        isCollapsed.value = true
      }
    })

    return {
      isCollapsed,
      activeMenu,
      username,
      userRole,
      toggleCollapse,
      handleLogout
    }
  }
}
</script>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
  background-color: #f5f7fa;
}

.sidebar {
  width: 250px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.sidebar.collapsed {
  width: 64px;
}

.sidebar-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex: 1;
}

.logo-icon {
  font-size: 24px;
  color: white;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
}

.collapse-btn {
  padding: 0;
  color: white !important;
  border: none;
  background: transparent;
}

.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.1) !important;
}

.sidebar.collapsed .collapse-btn {
  justify-content: center;
}

.sidebar-menu {
  flex: 1;
  border: none;
  background: transparent;
}

:deep(.el-menu-item) {
  height: 56px;
  line-height: 56px;
  border-radius: 0;
  transition: all 0.3s ease;
}

.sidebar.collapsed :deep(.el-menu-item) {
  padding: 0;
  justify-content: center;
}

:deep(.el-menu-item:hover) {
  background-color: #f1f5f9;
  color: #1e3a8a;
}

:deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
}

:deep(.el-menu-item .el-icon) {
  font-size: 18px;
  margin-right: 12px;
}

.sidebar.collapsed :deep(.el-sub-menu .el-menu-item) {
  padding-left: 0 !important;
  justify-content: center;
}

:deep(.el-sub-menu .el-menu-item .el-menu-item__title) {
  padding-left: 8px;
}

:deep(.el-sub-menu .el-icon) {
  font-size: 18px;
  margin-right: 12px;
}

:deep(.el-sub-menu:hover > .el-sub-menu__title) {
  background-color: #f1f5f9;
  color: #1e3a8a;
}

/* 父菜单选中样式 - 当子菜单被选中时 */
:deep(.el-sub-menu.is-active > .el-sub-menu__title) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  font-weight: 600;
}

/* 折叠状态下的父菜单选中样式 */
.sidebar.collapsed :deep(.el-sub-menu.is-active > .el-sub-menu__title) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  justify-content: center;
}

/* 父菜单标题的图标样式 */
:deep(.el-sub-menu.is-active > .el-sub-menu__title .el-icon) {
  color: white !important;
}

/* 折叠状态下隐藏子菜单标题文字 */
.sidebar.collapsed :deep(.el-sub-menu__title) {
  justify-content: center;
  font-size: 0;
}

.sidebar.collapsed :deep(.el-sub-menu__title .el-icon) {
  font-size: 18px;
}

.sidebar-footer {
  padding: 8px;
  border-top: 1px solid #e6e9f0;
  background: #f8fafc;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.username {
  font-size: 14px;
  font-weight: 600;
  color: #1e3a8a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 12px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-btn {
  width: 100%;
  justify-content: flex-start;
  color: #ef4444;
  padding: 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: 16px;
}

.logout-btn:hover {
  background-color: #fef2f2;
  color: #dc2626;
}

.sidebar.collapsed .logout-btn {
  justify-content: center;
  padding: 12px 0;
}

.sidebar.collapsed .user-info {
  background: transparent;
  box-shadow: none;
  padding: 0;
  margin: 0;
}

.logout-icon {
  color: #ef4444;
  font-size: 18px;
}

.main-content {
  flex: 1;
  overflow: auto;
  transition: margin-left 0.3s ease;
}

.main-content.expanded {
  margin-left: 0;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1000;
    height: 100vh;
  }

  .sidebar.collapsed {
    transform: translateX(-100%);
  }

  .main-content {
    margin-left: 0;
    width: 100%;
  }
}

/* 滚动条样式 */
.main-content::-webkit-scrollbar {
  width: 6px;
}

.main-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.main-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>