<template>
    <div id="user_system_app" @click="handleClickOutside">
        <!-- 顶部导航栏 -->
        <nav class="navbar navbar-expand-lg navbar-light">
            <div class="container-fluid">
                <!-- 导航栏品牌名称 -->
                <a class="navbar-brand" href="#">用户管理中台</a>
                <!-- 导航栏折叠按钮（用于响应式设计） -->
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                    aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <!-- 导航栏折叠部分 -->
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ms-auto">
                        <!-- 头像和下拉菜单 -->
                        <li class="nav-item dropdown" style="margin-right: 10%;">
                            <!-- 头像容器，点击时切换下拉菜单显示状态 -->
                            <div class="avatar-container" @click="toggleDropdown">
                                <!-- 头像 -->
                                <img src="/public/头像.jpg" class="rounded-circle" alt="Avatar">
                                <!-- 头像下方的用户信息 -->
                                <div class="avatar-info">
                                    <!-- 用户名 -->
                                    <span class="username">超级管理员</span>
                                    <!-- 用户描述 -->
                                    <span class="description">潘滢,欢迎您</span>
                                </div>
                            </div>
                            <!-- 下拉菜单 -->
                            <ul class="dropdown-menu dropdown-menu-end" :class="{ show: isDropdownOpen }" aria-labelledby="navbarDropdown">
                                <!-- 个人资料项 -->
                                <li><a class="dropdown-item dropdown-item-link-py" href="#">个人资料</a></li>
                                <!-- 分隔线 -->
                                <li>
                                    <hr class="dropdown-divider">
                                </li>
                                <!-- 退出项 -->
                                <li><a class="dropdown-item dropdown-item-link-py" href="#" @click="loginOut">退出</a>
                                </li>
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
                <!-- 如果菜单项数组不为空，展示菜单 -->
                <ul v-if="menuItems.length > 0" class="nav flex-column">
                    <template v-for="item in menuItems">
                        <!-- 用户中台部分 -->
                        <template v-if="item.menuCode == 10">
                            <!-- 忽略首层(用户中台本身) -->
                            <li v-for="itemChildren in item.children" class="nav-item">
                                <!-- 判断是否为目录 -->
                                <template v-if="!itemChildren.type">
                                    <!-- 展示为目录项，点击可展开子菜单 -->
                                    <a class="nav-link collapsed" href="#" data-bs-toggle="collapse"
                                        :data-bs-target="'#submenu' + itemChildren.id" aria-expanded="false"
                                        :aria-controls="'submenu' + itemChildren.id">{{ itemChildren.menuName }}
                                    </a>
                                    <!-- 如果有子菜单，展示子菜单 -->
                                    <div v-if="itemChildren.children && itemChildren.children.length > 0"
                                        class="collapse submenu" :id="'submenu' + itemChildren.id">
                                        <ul class="nav flex-column">
                                            <li v-for="subItem in itemChildren.children" class="nav-item">
                                                <!-- 子菜单项 -->
                                                <a class="nav-link" href="#"
                                                    @click="changeContent(subItem.menuName, 'user_system_index_page')">
                                                    {{ subItem.menuName }}
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                </template>
                                <!-- 否则展示为普通菜单项 -->
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
                <!-- 动态组件，根据当前视图展示不同内容 -->
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
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import user_list_view from '@/components/user-system/user-manager/user_list_page.vue';
import organization_list_page_view from '@/components/user-system/organization-manager/organization_list_page.vue';
import role_list_page_view from '@/components/user-system/role-manager/role_list_page.vue';
import menu_list_page_view from '@/components/user-system/menu-manager/menu_list_page.vue';
import { useLoginUserStore } from '@/components/common-components/data-store/UserLogin';
import User_system_index_page from '@/components/user-system/index/user_system_index_page.vue';
import { useRouter } from 'vue-router';
import Permission_list_page from '@/components/user-system/permission-manager/permission_list_page.vue';

const menuItems = ref([]); // 存储菜单项的数组
const currentView = ref(User_system_index_page); // 当前展示的视图组件
const isDropdownOpen = ref(false); // 控制下拉菜单的显示状态

const router = useRouter();

// 退出操作
const loginOut = () => {
    // 执行退出操作并跳转到登录页
    router.push("/");
}

// 加载菜单数据
const loadMenuData = async () => {
    try {
        const loginStore = useLoginUserStore(); // 获取登录用户信息
        const response = await axios.post('http://localhost:8089/keeay-user/api/menu/info/getTreeList', {}, {
            headers: {
                "Authorization": loginStore.jwt // 添加授权头
            }
        });
        if (response.data.code == '200') {
            menuItems.value = response.data.data; // 设置菜单数据
        } else {
            alert("获取菜单权限失败"); // 获取菜单失败提示
        }
    } catch (error) {
        console.error('Error fetching menu data:', error); // 错误处理
    }
};

// 组件挂载后加载菜单数据
onMounted(() => {
    loadMenuData();
});

// 处理点击外部区域以关闭下拉菜单
const handleClickOutside = (event) => {
    const avatarContainer = document.querySelector('.avatar-container');
    // 如果点击的区域不在头像容器内，则关闭下拉菜单
    if (avatarContainer && !avatarContainer.contains(event.target)) {
        isDropdownOpen.value = false;
    }
};

// 组件挂载时添加点击事件监听器
onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

// 组件卸载时移除点击事件监听器
onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});

// 动态改变内容区域展示的组件
const changeContent = (menuName, url) => {
    if (menuName == "首页") {
        currentView.value = User_system_index_page;
    }
    if (menuName == "用户管理") {
        currentView.value = user_list_view;
    }
    if (menuName == "组织管理") {
        currentView.value = organization_list_page_view;
    }
    if (menuName == "角色管理") {
        currentView.value = role_list_page_view;
    }
    if (menuName == "菜单管理") {
        currentView.value = menu_list_page_view;
    }
    if (menuName == "权限管理") {
        currentView.value = Permission_list_page;
    }
};

// 切换下拉菜单显示状态
const toggleDropdown = () => {
    isDropdownOpen.value = !isDropdownOpen.value;
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

/* 顶部导航栏和底部导航栏样式 */
.navbar,
.footer {
    background-color: #00332c;
    color: #fff;
}

/* 导航栏品牌名称、导航链接、下拉菜单项的颜色设置 */
.navbar-brand,
.nav-link,
.dropdown-item {
    color: #ffffff !important;
    font-weight: 500;
}

/* 下拉菜单项的颜色设置 */
.dropdown-item.dropdown-item-link-py {
    color: #131010 !important;
    font-weight: 500;
}

/* 导航栏折叠按钮图标样式 */
.navbar-toggler-icon {
    background-image: url("data:image/svg+xml;charset=utf8,%3Csvg viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='rgba%25251, 255, 255%252C 0.7%2529' stroke-width='2' stroke-linecap='round' stroke-miterlimit='10' d='M4 7h22M4 15h22M4 23h22'/%3E%3C/svg%3E");
}

/* 主体内容区域样式 */
.main-content {
    display: flex;
    flex: 1;
}

/* 左侧菜单栏样式 */
.sidebar {
    width: 250px;
    background-color: #2f6769;
    border-right: 1px solid #ddd;
    color: #333;
    transition: width 0.3s ease-in-out;
    overflow-y: auto;
}

/* 左侧菜单栏链接的样式 */
.sidebar .nav-link {
    color: #000;
    font-weight: 500;
}

/* 左侧菜单栏链接的悬停效果 */
.sidebar .nav-link:hover {
    background-color: #26ac64;
    color: #333;
}

/* 左侧菜单栏链接的激活状态 */
.sidebar .nav-link.active {
    background-color: hsl(176, 41%, 39%);
    color: #333;
}

/* 左侧菜单栏项的底部间距 */
.sidebar .nav-item {
    margin-bottom: 0.5rem;
}

/* 子菜单的内边距 */
.submenu {
    padding-left: 1rem;
}

/* 展开状态的子菜单显示 */
.collapse.show {
    display: block;
}

/* 激活状态的子菜单显示 */
.nav-item.active>.submenu {
    display: block;
}

/* 内容区域样式 */
.content {
    flex: 1;
    padding: 20px;
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    margin: 20px;
    color: #333;
    overflow-y: auto;
}

/* 底部导航栏样式 */
.footer {
    padding: 10px;
    text-align: center;
    font-weight: 300;
    background-color: #00332c;
    border-top: 1px solid #002226;
    color: #fff;
}

/* 头像容器样式 */
.avatar-container {
    display: flex;
    align-items: center;
    position: relative;
    margin-right: 1.5%; /* 头像容器距离左侧1.5% */
    cursor: pointer; /* 添加光标效果 */
}

/* 头像样式 */
.avatar-container img {
    width: 50px;
    height: 50px;
    border-radius: 50%; /* 圆形头像 */
    animation: rotate 4s linear infinite; /* 一直旋转 */
}

/* 头像和描述信息容器 */
.avatar-info {
    display: flex;
    flex-direction: column;
    margin-left: 15px; /* 头像和描述之间的间距 */
    position: relative; /* 相对定位，确保描述信息紧随头像 */
}

/* 用户名样式 */
.username {
    font-weight: bold; /* 字体加粗 */
    width: 8em; /* 固定宽度，适应8个字符 */
    white-space: nowrap; /* 防止文字换行 */
    overflow: hidden; /* 隐藏超出部分 */
    text-overflow: ellipsis; /* 使用省略号表示超出部分 */
}

/* 描述样式 */
.description {
    font-size: 0.8rem; /* 描述字体大小 */
    width: 8em; /* 固定宽度，适应8个字符 */
    white-space: nowrap; /* 防止文字换行 */
    overflow: hidden; /* 隐藏超出部分 */
    text-overflow: ellipsis; /* 使用省略号表示超出部分 */
}

/* 下拉菜单样式 */
.dropdown-menu {
    display: none; /* 默认隐藏 */
    position: absolute;
    right: 0;
    top: 60px; /* 调整位置以避免覆盖头像 */
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 5px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    min-width: 160px;
}

/* 下拉菜单显示样式 */
.dropdown-menu.show {
    display: block;
}

/* 旋转动画 */
@keyframes rotate {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
</style>
