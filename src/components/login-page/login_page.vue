<template>
    <!-- 登录页面的根元素 -->
    <div id="login-app">
        <!-- 登录容器 -->
        <div class="login-container">
            <!-- 页面标题 -->
            <h1>登录</h1>
            <!-- 表单，提交时调用 submitUserLogin 方法，并阻止默认的表单提交行为 -->
            <form @submit.prevent="submitUserLogin">
                <!-- 邮箱输入框 -->
                <div class="mb-3">
                    <label for="email" class="form-label">邮箱地址</label>
                    <!-- 邮箱输入框，绑定到 email 数据属性 -->
                    <input type="email" class="form-control" id="email" v-model="email" placeholder="请输入邮箱地址" />
                    <!-- 提示文本 -->
                    <div class="form-text">我们不会与任何人分享您的邮箱。</div>
                </div>
                <!-- 密码输入框 -->
                <div class="mb-3">
                    <label for="password" class="form-label">密码</label>
                    <!-- 密码输入框，绑定到 password 数据属性 -->
                    <input type="password" class="form-control" id="password" v-model="password" placeholder="请输入密码" />
                </div>
                <!-- 提交按钮 -->
                <button type="submit" class="btn btn-primary">登录</button>
                <!-- <RouterLink to="/manager_center_page">test特殊</RouterLink> -->
                <!-- 这个 RouterLink 被注释掉了，如果需要可以取消注释使用 -->
            </form>
        </div>
        <!-- 页脚 -->
        <footer class="footer">&copy; 2024 管理后台</footer>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';  // 导入 useRouter 用于页面导航
import { useLoginUserStore } from '@/components/common-components/data-store/UserLogin';  // 导入用户登录数据存储
import { userLogin } from './api/LoginPage';  // 导入用户登录 API 方法
import { onMounted, ref } from 'vue';  // 导入 ref 用于创建响应式数据
import { message } from 'ant-design-vue';

// 创建响应式数据属性 email 和 password
const email = ref('');
const password = ref('');

// 使用 Vue Router 的 useRouter 函数来获取路由对象
const router = useRouter();

// 使用数据存储函数获取用户登录状态
const userStore = useLoginUserStore();

// 提交用户登录表单的方法
const submitUserLogin = async () => {
    try {
        // 构建登录请求的参数
        const params = { "loginName": email.value, "loginPwd": password.value };
        // 调用用户登录 API 并等待响应
        const response = await userLogin(params);

        // 判断响应结果是否表示登录成功
        if (response.data.code === 200 && response.data.data !== "failure") {
            // 登录成功后更新用户数据存储
            userStore.userName = email.value;
            userStore.jwt = response.data.data;
            // 导航到 MFA 页面
            router.push({ path: '/login_mfa_page' });
        } else {
            // 登录失败时清空用户数据存储并显示错误提示
            userStore.userName = null;
            userStore.jwt = null;
            message.error(response.data.message, 2);
        }
    } catch (error) {
        // 处理登录过程中的错误
        userStore.userName = null;
        userStore.jwt = null;
        console.error('登录时出错:', error);
        message.error('登录时出错，请重试', 2);
    }
}

// 组件挂载时初始化数据
onMounted(() => {
    userStore.clearData();
});
</script>

<style scoped>
/* 登录页面根元素的样式 */
#login-app {
    display: flex;
    /* 使用弹性布局 */
    justify-content: center;
    /* 水平居中对齐 */
    align-items: center;
    /* 垂直居中对齐 */
    min-height: 100vh;
    /* 页面最小高度为视口高度 */
    background-color: #00332c;
    /* 背景颜色 */
    background-image: url('/public/背景2.jpg');
    /* 背景图片 */
    background-size: cover;
    /* 背景图片覆盖整个容器 */
    background-position: center;
    /* 背景图片居中对齐 */
    margin: 0;
    /* 去掉默认外边距 */
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    /* 字体样式 */
    color: #fff;
    /* 字体颜色 */
}

/* 登录容器的样式 */
.login-container {
    background-color: rgba(255, 255, 255, 0.9);
    /* 背景颜色带透明度 */
    color: #333;
    /* 字体颜色 */
    padding: 40px;
    /* 内边距 */
    border-radius: 15px;
    /* 边角圆角 */
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    /* 阴影效果 */
    max-width: 400px;
    /* 最大宽度 */
    width: 100%;
    /* 宽度为 100% */
    text-align: center;
    /* 文本居中对齐 */
}

/* 登录容器标题的样式 */
.login-container h1 {
    margin-bottom: 30px;
    /* 下边距 */
    color: #00332c;
    /* 字体颜色 */
}

/* 表单控件的样式 */
.form-control {
    background-color: #e9f5f3;
    /* 背景颜色 */
    border: none;
    /* 去掉边框 */
    border-radius: 10px;
    /* 边角圆角 */
    padding: 10px;
    /* 内边距 */
    margin-bottom: 20px;
    /* 下边距 */
    color: #00332c;
    /* 字体颜色 */
}

/* 表单控件获取焦点时的样式 */
.form-control:focus {
    box-shadow: none;
    /* 去掉阴影 */
    border-color: #00594c;
    /* 边框颜色 */
}

/* 提交按钮的样式 */
.btn-primary {
    background-color: #00332c;
    /* 背景颜色 */
    border: none;
    /* 去掉边框 */
    width: 100%;
    /* 宽度为 100% */
    padding: 10px;
    /* 内边距 */
    border-radius: 10px;
    /* 边角圆角 */
    transition: background-color 0.3s ease;
    /* 背景颜色变化过渡效果 */
}

/* 提交按钮的悬停效果 */
.btn-primary:hover {
    background-color: #00594c;
    /* 背景颜色变化 */
}

/* 表单文本的样式 */
.form-text {
    color: #00594c;
    /* 字体颜色 */
}

/* 页脚的样式 */
.footer {
    width: 100%;
    /* 宽度为 100% */
    text-align: center;
    /* 文本居中对齐 */
    padding: 10px 0;
    /* 内边距 */
    color: #fff;
    /* 字体颜色 */
    font-weight: 300;
    /* 字体粗细 */
    background-color: rgba(0, 0, 0, 0.5);
    /* 背景颜色带透明度 */
    position: absolute;
    /* 绝对定位 */
    bottom: 0;
    /* 靠下对齐 */
}
</style>
