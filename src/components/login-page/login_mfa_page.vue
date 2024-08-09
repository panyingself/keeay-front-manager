<template>
    <div id="login_mfa_page_app">

        <div class="mfa-container">
            <h1>MFA认证</h1>
            <div v-if="showCodeSection" id="mfa-code-section">
                <p>请输入您的认证码</p>
                <form @submit.prevent="submitCode">
                    <div class="mb-3">
                        <label for="mfa-code" class="form-label">认证码</label>
                        <input type="text" class="form-control" id="mfa-code" v-model="otpCode" placeholder="6位认证码" />
                    </div>
                    <button type="submit" class="btn btn-primary">认证</button>
                </form>
                <p>
                    没有绑定设备？
                    <span class="toggle-link" @click="toggleSections">扫描二维码绑定</span>
                </p>
            </div>
            <div v-else id="qr-code-section">
                <p>请扫描以下二维码绑定您的设备</p>
                <div class="qr-code">
                    <img :src="qrCodeUrl" alt="QR Code" />
                </div>
                <p>
                    已经绑定设备？
                    <span class="toggle-link" @click="toggleSections">输入认证码</span>
                </p>
            </div>
        </div>


        <footer class="footer">&copy; 2024 管理后台</footer>

    </div>
</template>


<script>
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useLoginUserStore } from '../common-components/data-store/UserLogin';


export default {
    data() {
        return {
            showCodeSection: true,
            otpCode: '',
            userCode: '',  // 示例值，可以动态设置
            qrCodeUrl: '',
            loginStore: useLoginUserStore()
        };
    },
    setup() {
        const router = useRouter();
        return { router };
    },
    methods: {
        async toggleSections() {
            this.showCodeSection = !this.showCodeSection;
            if (!this.showCodeSection) {
                // 获取用户名并查询二维码
                try {
                    const response = await axios.get(`http://localhost:8087/keeay-auth/api/mfa/generate-qr`, {
                        params: {
                            jwt: this.loginStore.jwt
                        },
                        responseType: 'blob' // 重要：将响应类型设置为 blob
                    });
                    const reader = new FileReader();
                    reader.readAsDataURL(response.data);
                    reader.onload = () => {
                        this.qrCodeUrl = reader.result;
                    };
                } catch (error) {
                    console.error('Error fetching QR code:', error);
                    alert('获取二维码时异常，请联系管理员重置');
                }
            } else {
                // 清空验证码
                this.mfaCode = '';
            }
        },
        async submitCode() {
            try {
                alert(this.loginStore.jwt);
                const response = await axios.post('http://localhost:8087/keeay-auth/api/mfa/verify-otp', {
                    otpCode: this.otpCode,  // 确保 otpCode 被正确传递
                    jwt: this.loginStore.jwt
                }, {
                    headers: {
                        "otpCode": this.otpCode,  // 确保 otpCode 被正确传递
                        "jwt": this.loginStore.jwt
                    },
                    params: {
                        "otpCode": this.otpCode,  // 确保 otpCode 被正确传递
                        "jwt": this.loginStore.jwt
                    }
                });
                if (response.data.data == true) {
                    // 登录成功后导航到管理中台页面
                    this.router.push({ path: '/manager_center_page' });
                } else {
                    alert('认证码无效，请重试');
                }
            } catch (error) {
                console.error('Error verifying MFA code:', error);
                alert('验证时出错，请重试');
            }
        }
    }
};
</script>

<style scoped>
/* 样式定义 */
#login_mfa_page_app {
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

.mfa-container {
    background-color: rgba(255, 255, 255, 0.9);
    color: #333;
    padding: 40px;
    border-radius: 15px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    max-width: 400px;
    width: 100%;
    text-align: center;
}

.mfa-container h1 {
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

.qr-code {
    margin: 20px 0;
}

.toggle-link {
    cursor: pointer;
    color: #00594c;
    text-decoration: underline;
}
</style>