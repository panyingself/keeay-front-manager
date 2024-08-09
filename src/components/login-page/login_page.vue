<template>
    <div id="login-app">
        <div class="login-container">
            <h1>登录</h1>
            <form @submit.prevent="submitLogin">
                <div class="mb-3">
                    <label for="email" class="form-label">邮箱地址</label>
                    <input type="email" class="form-control" id="email" v-model="email" placeholder="请输入邮箱地址" />
                    <div class="form-text">我们不会与任何人分享您的邮箱。</div>
                </div>
                <div class="mb-3">
                    <label for="password" class="form-label">密码</label>
                    <input type="password" class="form-control" id="password" v-model="password" placeholder="请输入密码" />
                </div>
                <button type="submit" class="btn btn-primary">登录</button>
                <!-- <RouterLink to="/manager_center_page">test特殊</RouterLink> -->
            </form>
        </div>
        <footer class="footer">&copy; 2024 管理后台</footer>
    </div>
</template>


<script lang='ts'>
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useLoginUserStore } from '../common-components/data-store/UserLogin';

export default {
    setup() {
        const router = useRouter();
        return { router };
    },
    data() {
        return {
            email: '',
            password: '',
            userStore: useLoginUserStore()
        };
    },
    methods: {
        async submitLogin() {
            try {
                const response = await axios.post('http://localhost:8087/keeay-auth/api/accredit/user/accreditForAccount', {
                    loginName: this.email,
                    loginPwd: this.password
                });
                if (response.data.code == '200') {
                    // 登录成功后导航到MFA页面
                    // const loginUserStore = useLoginUserStore();
                    this.userStore.userName = this.email;
                    this.userStore.jwt = response.data.data;
                    this.router.push({ path: '/login_mfa_page' });
                } else {
                    this.userStore.userName = null;
                    this.userStore.jwt = null;
                    alert('登录失败，请重试');
                }
            } catch (error) {
                this.userStore.userName = null;
                this.userStore.jwt = null;
                console.error('Error during login:', error);
                alert('登录时出错，请重试');
            }
        }
    }
};
</script>

<style scoped>
#login-app {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #00332c;
    background-image: url('../../../public/背景2.jpg');
    background-size: cover;
    background-position: center;
    margin: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #fff;
}

.login-container {
    background-color: rgba(255, 255, 255, 0.9);
    color: #333;
    padding: 40px;
    border-radius: 15px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    max-width: 400px;
    width: 100%;
    text-align: center;
}

.login-container h1 {
    margin-bottom: 30px;
    color: #00332c;
}

.form-control {
    background-color: #e9f5f3;
    border: none;
    border-radius: 10px;
    padding: 10px;
    margin-bottom: 20px;
    color: #00332c;
}

.form-control:focus {
    box-shadow: none;
    border-color: #00594c;
}

.btn-primary {
    background-color: #00332c;
    border: none;
    width: 100%;
    padding: 10px;
    border-radius: 10px;
    transition: background-color 0.3s ease;
}

.btn-primary:hover {
    background-color: #00594c;
}

.form-text {
    color: #00594c;
}

.footer {
    width: 100%;
    text-align: center;
    padding: 10px 0;
    color: #fff;
    font-weight: 300;
    background-color: rgba(0, 0, 0, 0.5);
    position: absolute;
    bottom: 0;
}
</style>