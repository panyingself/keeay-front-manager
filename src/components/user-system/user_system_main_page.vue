<template>
    <div id="user_system_app">
        <!-- 顶部导航栏 -->
        <nav class="navbar navbar-expand-lg navbar-light">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">用户管理中台</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                    aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ms-auto">
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button"
                                data-bs-toggle="dropdown" aria-expanded="false">
                                <div class="avatar-container">
                                    <img src="https://via.placeholder.com/40" class="rounded-circle" alt="Avatar">
                                </div>
                            </a>
                            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                                <li><a class="dropdown-item dropdown-item-link-py" href="#">个人资料</a></li>
                                <li>
                                    <hr class="dropdown-divider">
                                </li>
                                <li><a class="dropdown-item dropdown-item-link-py" href="#" @click="loginOut">退出</a></li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>

        <!-- 主体内容 -->
        <div class="main-content">
            <!-- 左侧菜单栏 -->
            <nav class="sidebar">
                <ul v-if="menuItems.length > 0" class="nav flex-column">
                    <template v-for="item in menuItems">
                        <!-- 用户中台 -->
                        <template v-if="item.menuCode == 20">
                            <!-- 忽略首层(用户中台本身) -->
                            <li v-for="itemChildren in item.children" class="nav-item">
                                <!-- 判断是否为目录 -->
                                <template v-if="!itemChildren.type">
                                    <a class="nav-link collapsed" href="#" data-bs-toggle="collapse"
                                        :data-bs-target="'#submenu' + itemChildren.id" aria-expanded="false"
                                        :aria-controls="'submenu' + itemChildren.id">{{ itemChildren.menuName }}
                                        <span class="menu-toggle">&#9654;</span>
                                    </a>
                                    <div v-if="itemChildren.children && itemChildren.children.length > 0"
                                        class="collapse submenu" :id="'submenu' + itemChildren.id">
                                        <ul class="nav flex-column">
                                            <li v-for="subItem in itemChildren.children" class="nav-item">
                                                <a class="nav-link" href="#"
                                                    @click="changeContent(subItem.menuName, 'user_system_index_page')">
                                                    {{ subItem.menuName }}
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                </template>
                                <!-- 否则展示为菜单项 -->
                                <template v-else>
                                    <a class="nav-link" href="#"
                                        @click="changeContent(itemChildren.menuName, 'user_system_index_page')">
                                        {{ itemChildren.menuName }}
                                    </a>
                                </template>
                            </li>
                        </template>
                    </template>
                </ul>
            </nav>

            <!-- 内容区域 -->
            <div class="content">
                <component :is="currentView" />
            </div>
        </div>

        <!-- 底部导航栏 -->
        <footer class="footer">
            &copy; 2024 管理后台
        </footer>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import user_list_view from '@/components/user-system/user-manager/user_list_page.vue';
import organization_list_page_view from '@/components/user-system/organization-manager/organization_list_page.vue';
import role_list_page_view from '@/components/user-system/role-manager/role_list_page.vue';
import menu_list_page_view from '@/components/user-system/menu-manager/menu_list_page.vue';
import { useLoginUserStore } from '@/components/common-components/data-store/UserLogin';
import User_system_index_page from './index/user_system_index_page.vue';
import { useRouter } from 'vue-router';

const menuItems = ref([]);
const currentView = ref(User_system_index_page);

const router = useRouter();

// 退出
const loginOut = () => {
    //do login out
    router.push("/");
}

// 加载菜单数据
const loadMenuData = async () => {
    try {
        const loginStore = useLoginUserStore();
        const response = await axios.post('http://localhost:8089/keeay-user/api/menu/getTreeList', {}, {
            headers: {
                "Authorization": loginStore.jwt
            }
        });
        // const response = await getUserMenuTreeList();
        if (response.data.code == '200') {
            menuItems.value = response.data.data;
        } else {
            alert("获取菜单权限失败");
        }
    } catch (error) {
        console.error('Error fetching menu data:', error);
    }
};

onMounted(() => {
    loadMenuData();
});

// 动态改变内容
const changeContent = (menuName, url) => {
    if (menuName == "首页") {
        currentView.value = User_system_index_page;  // 修改为正确的组件
    }
    if (menuName == "用户管理") {
        currentView.value = user_list_view;  // 修改为正确的组件
    }
    if (menuName == "组织管理") {
        currentView.value = organization_list_page_view;  // 修改为正确的组件
    }
    if (menuName == "角色管理") {
        currentView.value = role_list_page_view;  // 修改为正确的组件
    }
    if (menuName == "菜单管理") {
        currentView.value = menu_list_page_view;  // 修改为正确的组件
    }

};
</script>

<style scoped>
#user_system_app {
    display: flex;
    min-height: 100vh;
    flex-direction: column;
    background-color: #f5f5f5;
    color: #333;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.navbar,
.footer {
    background-color: #00332c;
    /* 深墨绿色 */
    color: #fff;
}

.navbar-brand,
.nav-link,
.dropdown-item {
    color: #ffffff !important;
    font-weight: 500;
}

.dropdown-item.dropdown-item-link-py {
    color: #131010 !important;
    font-weight: 500;
}

.navbar-toggler-icon {
    background-image: url("data:image/svg+xml;charset=utf8,%3Csvg viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='rgba%25251, 255, 255%252C 0.7%2529' stroke-width='2' stroke-linecap='round' stroke-miterlimit='10' d='M4 7h22M4 15h22M4 23h22'/%3E%3C/svg%3E");
}

.main-content {
    display: flex;
    flex: 1;
}

.sidebar {
    width: 250px;
    background-color: #2f6769;
    border-right: 1px solid #ddd;
    color: #333;
    transition: width 0.3s ease-in-out;
    overflow-y: auto;
    /* 如果内容过多，显示垂直滚动条 */
}

.sidebar .nav-link {
    color: #000;
    font-weight: 500;
}

.sidebar .nav-link:hover {
    background-color: #26ac64;
    color: #333;
}

.sidebar .nav-link.active {
    background-color: hsl(176, 41%, 39%);
    color: #333;
}

.sidebar .nav-item {
    margin-bottom: 0.5rem;
}

.submenu {
    padding-left: 1rem;
}

.collapse.show {
    display: block;
}

.menu-toggle {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.8rem;
    color: #ccc;
    transition: transform 0.3s;
}

.nav-item.collapsed .menu-toggle {
    transform: translateY(-50%) rotate(-90deg);
}

.nav-item.active>.submenu {
    display: block;
}

.content {
    flex: 1;
    padding: 20px;
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    margin: 20px;
    color: #333;
    overflow-y: auto;
    /* 如果内容过多，显示垂直滚动条 */
}

.footer {
    padding: 10px;
    text-align: center;
    font-weight: 300;
    background-color: #00332c;
    border-top: 1px solid #002226;
    color: #fff;
}
</style>
