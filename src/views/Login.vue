<template>
  <div class="login-container">
    <div class="login-background"></div>
    <el-card class="login-card">
      <template #header>
        <h2 class="login-title">AI辅助胚胎发育预测系统</h2>
      </template>

      <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          label-width="80px"
          class="login-form"
      >
        <el-form-item label="账号" prop="username">
          <el-input
              v-model="loginForm.username"
              placeholder="请输入账号"
              clearable
          >
            <template #prefix>
              <el-icon>
                <User/>
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              show-password
              clearable
              @keyup.enter="handleLogin"
          >
            <template #prefix>
              <el-icon>
                <Lock/>
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item class="login-button-container">
          <el-button
              type="primary"
              class="login-button"
              :loading="loading"
              @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import {ref, reactive} from 'vue'
import {useRouter} from 'vue-router'
import {ElMessage} from 'element-plus'
import {User, Lock} from '@element-plus/icons-vue'
import request from '../utils/request'

export default {
  name: 'Login',
  components: {
    User,
    Lock
  },
  setup() {
    const router = useRouter()
    const loginFormRef = ref(null)
    const loading = ref(false)
    // 设置请求头（可选）
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };
    const loginForm = reactive({
      username: '',
      password: ''
    })

    const loginRules = reactive({
      username: [
        {required: true, message: '请输入账号', trigger: 'blur'}
      ],
      password: [
        {required: true, message: '请输入密码', trigger: 'blur'}
      ]
    })

    const handleLogin = async () => {
      if (!loginFormRef.value) return

      loginFormRef.value.validate(async (valid) => {
        if (valid) {
          loading.value = true
          try {
            const response = await request.post('/login/', {
              username: loginForm.username,
              password: loginForm.password
            }, {headers})

            if (response.data.flag) {
              // 存储 token
              localStorage.setItem('access_token', response.data.token.access_token)
              // 存储过期时间
              localStorage.setItem('token_expires', response.data.expires_in)
              // 存储用户信息
              localStorage.setItem('user', JSON.stringify({
                username: loginForm.username,
                role: response.data.role
              }))
              ElMessage.success(response.data.message)
              router.push('/')
            } else {
              ElMessage.error('登录失败')
            }
          } catch (error) {
            console.error('登录错误:', error)
            ElMessage.error('用户名或密码错误')
          } finally {
            loading.value = false
          }
        }
      })
    }

    return {
      loginForm,
      loginFormRef,
      loginRules,
      loading,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.login-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('../assets/login.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: brightness(0.8);
  z-index: 0;
}

.login-card {
  width: 400px;
  position: relative;
  z-index: 1;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: none;
}

/* 美化卡片样式 */
:deep(.el-card) {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

:deep(.el-card__header) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.login-title {
  text-align: center;
  color: #303133;
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.login-form {
  padding-right: 20px;
}

.login-button {
  width: 200px;
  height: 40px;
}

:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  background-color: rgba(255, 255, 255, 0.9);
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #409eff inset;
}

.login-button-container {
  margin-bottom: 0;
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

/* 添加响应式设计 */
@media screen and (max-width: 480px) {
  .login-card {
    width: 90%;
    margin: 0 20px;
  }

  .login-form {
    padding: 20px 10px;
  }
}
</style> 