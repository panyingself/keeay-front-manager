import { createMemoryHistory, createRouter,createWebHistory} from 'vue-router'

//导入登录相关页面组件
import manager_center_page from '@/components/login-page/manager_center_page.vue';
//导入用户中台相关页面组件
import user_system_index_page from '@/components/user-system/index/user_system_index_page.vue';
import user_system_main_page from '@/components/user-system/user_system_main_page.vue';
import login_page from '@/components/login-page/login_page.vue';
import login_mfa_page from '@/components/login-page/login_mfa_page.vue';

//定义登录路由
// 这些都会传递给 `createRouter`
const loginRoutes = [
    { path: '/', component: login_page },
    { path: '/index.html', component: login_page },
    // 动态字段以冒号开始
    { 
        path: '/login_page', 
        component: login_page
    },
    // 动态字段以冒号开始
    { 
        path: '/login_mfa_page', 
        component: login_mfa_page
    },
    // 动态字段以冒号开始
    { 
        path: '/manager_center_page', 
        component: manager_center_page
    },
    //找不到路由的情况下，执行的路由
    { path: '/:pathMatch(.*)*', component: login_page },
]
 const userSystemRoutes = [
    // 动态字段以冒号开始
    { 
        path: '/user_system_main_page', 
        component: user_system_main_page
    },
    { 
        path: '/user_system_index_page', 
        component: user_system_index_page
    }
]
  
//创建router
const router = createRouter({
    history: createWebHistory(),
    //顺序加载
    routes:[...loginRoutes,...userSystemRoutes]
})

export default router;