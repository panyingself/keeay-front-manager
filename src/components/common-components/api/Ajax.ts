import { useLoginUserStore } from '@/components/common-components/data-store/UserLogin';
import axios from 'axios';
import { useRouter } from 'vue-router';

const http_request_prefix = "http://localhost:8089";

function getBaseURL(project) {
    //根据vite执行条件判断，获取环境变量，指定BaseUrl
    // if (project == "keeay-user") {
    //     return "http://localhost:8089/keeay-user";
    // }
    if (project === "keeay-auth") {
        return "http://localhost:8087/";
    }
    // return "http://localhost:8087/keeay-auth";
    return http_request_prefix;
}

export const projects = {
    "keeay-user": "keeay-user"
}

//url统一维护
export function ajax_get(project, url, params) {
    const loginStore = useLoginUserStore(); // 确保这里是正确的 store
    const router = useRouter();
    return new Promise(async (resolve, reject) => {
        try {
            const response = await axios.get(url, {
                baseURL: getBaseURL(project),
                params: params,
                headers: {
                    "Authorization": loginStore.jwt as String // 移除 as string
                },
                responseType: 'json' // 重要：将响应类型设置为 json
            });

            // 根据响应结果处理
            if (response.data.code === 401) { // 将 true 改为具体的判断条件
                alert("用户登录已过期，请重新登录");
                loginStore.clearData(); // 不使用 this
                router.push({ path: '/login_page' });
                return;
            }
            resolve(response);
        } catch (error) {
            console.error('Error fetching data:', error);
            if (error.response && error.response.data.code === 401) {
                alert("用户登录已过期，请重新登录");
                loginStore.clearData(); // 不使用 this
                router.push({ path: '/login_page' });
            } else {
                reject(error);
            }
        }
    });
}

// 获取二维码图片(文件类型)
export async function ajax_get_blob(project, url, params) {
    const loginStore = useLoginUserStore(); // 确保这里是正确的 store
    return new Promise(async (resolve) => {
        try {
            const response = await axios.get(url, {
                baseURL: getBaseURL(project),
                params: params,
                headers: {
                    "Authorization": loginStore.jwt as String // 移除 as string
                },
                responseType: 'blob' // 重要：将响应类型设置为 blob
            });
            resolve(response);
            const reader = new FileReader();
            reader.readAsDataURL(response.data);
        } catch (error) {
            console.error('Error fetching QR code:', error);
            alert('获取二维码时异常，请联系管理员重置');
        }
    });
}


//url统一维护
export function ajax_post(project, url, params) {
    const loginStore = useLoginUserStore();
    const router = useRouter();
    
    return new Promise(async (resolve, reject) => {
        try {
            const response = await axios.post(url, params, {
                baseURL: getBaseURL(project),
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": loginStore.jwt
                },
                responseType: 'json' // 重要：将响应类型设置为 json
            });

            // 根据响应结果处理
            if (response.data.code === 401) {
                alert("用户登录已过期，请重新登录");
                loginStore.clearData();
                router.push({ path: '/login_page' });
                return;
            }
            resolve(response);
        } catch (error) {
            console.error('Error fetching data:', error);
            // if (error.response && error.response.data.code === 401) {
            //     alert("用户登录已过期，请重新登录");
            //     loginStore.clearData();
            //     router.push({ path: '/manager_center_page' });
            //     // router.push({ path: '/login_page' });
            // } else {
            //     reject(error);
            // }
        }
    });
}