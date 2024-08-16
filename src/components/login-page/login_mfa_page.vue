<template>
    <!-- MFA（多因素认证）页面的根元素 -->
    <div id="login_mfa_page_app">

        <!-- MFA 认证容器 -->
        <div class="mfa-container">
            <!-- 页面标题 -->
            <h1>MFA认证</h1>

            <!-- 认证码输入部分，只有当 showCodeSection 为 0 时显示 -->
            <div v-if="showCodeSection === 0" id="mfa-code-section">
                <p>请输入您的认证码</p>
                <!-- 表单，提交时调用 submitCode 方法，并阻止默认的表单提交行为 -->
                <form id="submitOptCode" @submit.prevent="submitOptCodeFunc">
                    <!-- 认证码输入框 -->
                    <div class="mb-3">
                        <label for="mfa-otp-code" class="form-label">认证码</label>
                        <!-- 认证码输入框，绑定到 otpCode 数据属性 -->
                        <input type="text" class="form-control" id="mfa-otp-code" v-model="otpCode"
                            placeholder="6位认证码" />
                    </div>
                    <!-- 提交按钮 -->
                    <button type="submit" class="btn btn-primary">认证</button>
                </form>
                <p>
                    没有绑定设备？
                    <!-- 点击后切换到二维码绑定部分 -->
                    <span class="toggle-link" @click="changeShowCodeSectionFunc('bindCode')">绑定设备</span>
                </p>
            </div>

            <!-- 绑定码绑定部分，只有当 showCodeSection 为 1 时显示 -->
            <div v-else-if="showCodeSection === 1" id="mfa-bind-code-section">
                <p>请输入您的绑定验证码</p>
                <!-- 表单，提交时调用 submitCode 方法，并阻止默认的表单提交行为 -->
                <form id="submitBindVerifyCode" @submit.prevent="submitBindVerifyCodeFunc">
                    <!-- 认证码输入框 -->
                    <div class="mb-3">
                        <label for="mfa-device-code" class="form-label">绑定验证码</label>
                        <!-- 认证码输入框，绑定到 otpCode 数据属性 -->
                        <input type="text" class="form-control" id="mfa-device-code" v-model="deviceCode"
                            placeholder="6位绑定验证码" />
                    </div>
                    <!-- 提交按钮 -->
                    <button type="submit" class="btn btn-primary">验证绑定码</button>
                </form>
                <p>
                    已经绑定设备？
                    <!-- 点击后切换到二维码绑定部分 -->
                    <span class="toggle-link" @click="changeShowCodeSectionFunc('submitCode')">输入认证码</span>
                </p>
            </div>

            <!-- 二维码绑定部分，只有当 showCodeSection 为 2 时显示 -->
            <div v-else-if="showCodeSection === 2" id="qr-code-section">
                <p>请扫描以下二维码绑定您的设备</p>
                <!-- 显示二维码图片 -->
                <div class="qr-code">
                    <img :src="qrCodeUrl" alt="QR Code" />
                </div>
                <p>
                    已经绑定设备？
                    <!-- 点击后切换到认证码输入部分 -->
                    <span class="toggle-link" @click="changeShowCodeSectionFunc('submitCode')">输入认证码</span>
                </p>
            </div>
        </div>

        <!-- 页脚 -->
        <footer class="footer">&copy; 2024 管理后台</footer>

    </div>
</template>

<script setup>
import axios from 'axios';  // 导入 axios 用于发送 HTTP 请求
import { useRouter } from 'vue-router';  // 导入 useRouter 用于页面导航
import { useLoginUserStore } from '@/components/common-components/data-store/UserLogin';  // 导入用户登录数据存储
import { ref } from 'vue';
import { fetchMfaQrCodeUrl, verifyDeviceCode, verifyOtpCode } from './api/MfaManager';

const showCodeSection = ref(0); // 控制显示认证码输入部分还是二维码绑定部分
const otpCode = ref(""); // 认证码的响应式数据属性
const deviceCode = ref(""); // 认证码的响应式数据属性
const qrCodeUrl = ref(''); // 二维码图片的 URL
const loginStore = useLoginUserStore(); // 登录存储实例，用于访问 JWT 等数据
const router = useRouter(); // 获取路由对象用于页面导航

// 改变展示内容 func
const changeShowCodeSectionFunc = (type) => {
    if (type === "submitCode") {
        showCodeSection.value = 0;
        cleanFormDataFunc();
        return;
    }
    if (type === "bindCode") {
        showCodeSection.value = 1;
        cleanFormDataFunc();
        return;
    }
    if (type === "qrCode") {
        showCodeSection.value = 2;
        cleanFormDataFunc();
        fetchQrCodeFunc();
        return;
    }
}

// 清空表单数据 func
const cleanFormDataFunc = () => {
    otpCode.value = '';
    deviceCode.value = '';
    qrCodeUrl.value = '';
}

// 提交otpCode func
const submitOptCodeFunc = async () => {
    try {
        const params = {
            "otpCode": otpCode.value,  // 传递认证码
            "jwt": loginStore.jwt
        }
        // 发送请求验证认证码
        const response = await verifyOtpCode(params);
        // 根据验证结果进行处理
        if (response.data.data == true) {
            // 认证成功后导航到管理中台页面
            router.push({ path: '/manager_center_page' });
        } else {
            // 认证失败时提示用户
            alert('认证码无效，请重试');
        }
    } catch (error) {
        // 处理认证过程中的错误
        console.error('验证时出错:', error);
        alert('验证时出错，请重试');
    }
}

// 提交otpCode func
const submitBindVerifyCodeFunc = async () => {
    try {
        const params = {
            "otpCode": otpCode.value,  // 传递认证码
            "jwt": loginStore.jwt
        }
        // 发送请求验证认证码
        const response = await verifyDeviceCode(params);
        // 根据验证结果进行处理
        if (response.data.data == true) {
            // 认证成功后导航到管理中台页面
            changeShowCodeSectionFunc("qrCode");
        } else {
            // 认证失败时提示用户
            alert('认证码无效，请重试');
        }
    } catch (error) {
        // 处理认证过程中的错误
        console.error('验证时出错:', error);
        alert('验证时出错，请重试');
    }
}

// 提交otpCode func
const fetchQrCodeFunc = async () => {
    // 当显示二维码绑定部分时，获取二维码 URL
    try {
        // 发送请求获取二维码
        const params = { "jwt": loginStore.jwt }
        const response = await fetchMfaQrCodeUrl(params);
        // 使用 FileReader 读取二维码图片数据
        const reader = new FileReader();
        reader.readAsDataURL(response.data);
        reader.onload = () => {
            // 设置二维码图片的 URL
            qrCodeUrl.value = reader.result;
        };
    } catch (error) {
        // 处理获取二维码时的错误
        console.error('获取二维码时异常:', error);
    }
}
</script>

<style scoped>
/* MFA 页面根元素的样式 */
#login_mfa_page_app {
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
    background-image: url('../../../public/背景2.jpg');
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

/* MFA 认证容器的样式 */
.mfa-container {
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

/* MFA 认证容器标题的样式 */
.mfa-container h1 {
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

/* 二维码的样式 */
.qr-code {
    margin: 20px 0;
    /* 上下外边距 */
}

/* 切换链接的样式 */
.toggle-link {
    cursor: pointer;
    /* 光标为指针 */
    color: #00594c;
    /* 字体颜色 */
    text-decoration: underline;
    /* 下划线 */
}
</style>
