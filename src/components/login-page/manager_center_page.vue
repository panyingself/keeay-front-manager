<template>
    <div id="manager-container">
        <!-- 顶部导航栏 -->
        <nav class="navbar navbar-expand-lg navbar-light">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">管理后台</a>
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
                                <li><a class="dropdown-item dropdown-item-link-py" href="#">退出</a></li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>

        <!-- 主体内容 -->
        <div class="main-content">
            <!-- 内容区域 -->
            <div class="content">
                <h1 id="pageTitle">欢迎来到管理后台</h1>
                <p id="pageContent">请选择下面的子系统进入：</p>
                <div class="container-fluid">
                    <div v-for="userMenuData in userMenuDataList"
                        class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-4">
                        <!-- 中台子系统卡片 -->
                        <div class="col">
                            <div class="card">
                                <div class="card-body">
                                    <h5 class="card-title"> {{ userMenuData.menuName }}</h5>
                                    <p class="card-text">{{ userMenuData.description }}</p>
                                    <a href="#" @click="toManagerCenterSystem(userMenuData.path)" class="btn btn-primary">进入</a>
                                </div>
                            </div>
                        </div>
                        <!-- <div class="col">
                            <div class="card">
                                <div class="card-body">
                                    <h5 class="card-title">客户交互中台</h5>
                                    <p class="card-text">客户交互统一管理中心。</p>
                                    <a href="#" @click="toChildrenSystem(2)" class="btn btn-primary">进入</a>
                                </div>
                            </div>
                        </div>
                        <div class="col">
                            <div class="card">
                                <div class="card-body">
                                    <h5 class="card-title">数据中台</h5>
                                    <p class="card-text">数据统一管理中心</p>
                                    <a href="#" @click="toChildrenSystem(3)" class="btn btn-primary">进入</a>
                                </div>
                            </div>
                        </div>
                        <div class="col">
                            <div class="card">
                                <div class="card-body">
                                    <h5 class="card-title">品类中台</h5>
                                    <p class="card-text">统一管理品类信息</p>
                                    <a href="#" @click="toChildrenSystem(4)" class="btn btn-primary">进入</a>
                                </div>
                            </div>
                        </div>
                        <div class="col">
                            <div class="card">
                                <div class="card-body">
                                    <h5 class="card-title">物流中台</h5>
                                    <p class="card-text">统一物流管理中心</p>
                                    <a href="#" @click="toChildrenSystem(5)" class="btn btn-primary">进入</a>
                                </div>
                            </div>
                        </div>
                        <div class="col">
                            <div class="card">
                                <div class="card-body">
                                    <h5 class="card-title">仓储中台</h5>
                                    <p class="card-text">统一仓储管理中心</p>
                                    <a href="#" @click="toChildrenSystem(6)" class="btn btn-primary">进入</a>
                                </div>
                            </div>
                        </div> -->
                    </div>
                </div>
            </div>
        </div>

        <!-- 底部导航栏 -->
        <footer class="footer">
            &copy; 2024 管理后台
        </footer>
    </div>
</template>


<script setup>
import { useRouter } from 'vue-router';
import { fetchUserMenuTreeList } from './api/LoginPage';
import { onMounted, ref } from 'vue';

// 使用 Vue Router 的 useRouter 函数来获取路由对象
const router = useRouter();
const userMenuDataList = ref([]);

// 加载用户权限菜单
const fetchUserMenuListFunc = async () => {
    const response = await fetchUserMenuTreeList();
    // 加载权限菜单树
    if (response.data.code === 200) {
        userMenuDataList.value = response.data.data;
        console.log(userMenuDataList);
    }
}

const toManagerCenterSystem = (routerUrl) => {
    // router.push('/user_system_main_page');
    router.push({ path: routerUrl });

}

// 组件挂载时添加点击事件监听器
onMounted(() => {
    fetchUserMenuListFunc();
});


</script>
<style scoped>
#manager-container {
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

.card {
    margin-bottom: 20px;
    border: none;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}

.card:hover {
    transform: translateY(-10px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.card-body {
    background-color: #e9f5f3;
}

.card-title {
    color: #00332c;
    font-weight: bold;
}

.card-text {
    color: #00332c;
}

.btn-primary {
    background-color: #00332c;
    border: none;
    transition: background-color 0.3s ease;
}

.btn-primary:hover {
    background-color: #00594c;
}

.container-fluid {
    padding-left: 30px;
    padding-right: 30px;
}
</style>