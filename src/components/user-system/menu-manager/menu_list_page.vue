<template>
    <div class="title_region">
        <!-- 面包屑导航区域 -->
        <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
                <li class="breadcrumb-item"><a href="#">用户中台</a></li>
                <li class="breadcrumb-item"><a href="#">组织管理</a></li>
                <li class="breadcrumb-item active" aria-current="page">菜单管理列表</li>
            </ol>
        </nav>
    </div>

    <div class="list-view-container">
        <!-- 列表视图区域 -->
        <div class="list-view">
            <!-- 列表头部区域 -->
            <div class="list-header">
                <div class="list-controls">
                    <!-- 菜单名称搜索框 -->
                    <label for="menuNameSearch" class="search-label">菜单名称</label>
                    <input type="text" id="menuNameSearch" v-model="userNameKeyword" placeholder="菜单名称搜索..."
                        @input="searchData" />

                    <!-- 菜单编码搜索框 -->
                    <label for="menuCodeSearch" class="search-label">菜单编码</label>
                    <input type="text" id="menuCodeSearch" v-model="phoneKeyword" placeholder="菜单编码搜索..."
                        @input="searchData" />
                </div>

                <!-- 搜索按钮 -->
                <button id="list-header-search" class="btn btn-success" style="position: absolute; right: 8%"
                    @click="searchData">
                    搜索
                </button>
                <!-- 重置按钮 -->
                <button id="list-header-reset" class="btn btn-warning" style="position: absolute; right: 5.5%"
                    @click="resetData">
                    重置
                </button>
                <!-- 新增按钮 -->
                <button @click="doAddRootShowDrawer" class="btn btn-info" style="position: absolute; right: 3%">
                    <i class="bi bi-plus"></i> 新增
                </button>
            </div>

            <!-- 列表内容区域 -->
            <div class="list-content">
                <!-- 加载状态指示器 -->
                <div v-if="loading" class="loading-spinner"></div>

                <!-- 列表表格 -->
                <a-table :columns="list_view_columns" :data-source="menuDataList" :pagination=false rowKey = 'menuCode'>
                    <template #bodyCell="{ column, record }">
                        <template v-if="column.key === 'action'">
                            <span>
                                <button v-show="record.type === 0 || record.type ===1" class="btn btn-sm btn-info" @click="doAddShowDrawer(record)">
                                    新增
                                </button>
                                <button class="btn btn-sm btn-warning" @click="doEditShowDrawer(record)" style="margin-left: 0.75%;">
                                    编辑
                                </button>
                                <a-popconfirm title="您确定要删除这条记录吗?" ok-text="确定" cancel-text="取消"
                                    @confirm="deleteItem(record)" @cancel="handleCancel">
                                    <button class="btn btn-sm btn-danger" style="margin-left: 0.75%;">
                                        删除
                                    </button>
                                </a-popconfirm>
                            </span>
                        </template>
                    </template>
                </a-table>
            </div>

            <!-- 抽屉组件 -->
            <div>
                <a-drawer title="菜单信息" :closable="false" :open="showDrawer" @close="doOnClose">
                    <!-- 表单项 -->
                    <div class="drawer-content">
                        <div v-for="column in drawer_view_columns" :key="column.name" class="form-group">
                            <label :for="column.name">
                                <i class="bi bi-person"></i> {{ column.name }}：
                            </label>
                            <!-- 非类型选择项的输入框 -->
                            <a-input v-show="column.value !== 'permissionList' && column.value !== 'type'"
                                :disabled=column.disabled :value="currentMenuData[column.value]"
                                :maxlength=column.maxlength
                                @input="event => currentMenuData[column.value] = event.target.value"
                                :placeholder=column.placeholder :id="column.name" />
                            <!--权限select -->
                            <a-select v-if="column.value === 'permissionList'"
                                v-model:value="currentMenuData[column.value]" show-search mode="multiple" :maxTagCount=3
                                style="width: 100%" placeholder="Please select" :options="drawer_permission_data_list"
                                :fieldNames="{ label: 'permissionName', value: 'permissionCode' }"
                                @change="handleChange" :filterOption="filterOption"></a-select>
                            <!--目录类型select -->
                            <a-select v-if="column.value === 'type'" v-model:value="currentMenuData[column.value]"
                                style="width: 100%" placeholder="Please select" :options="typeSelectOptionData"
                                @change="handleChange"></a-select>
                        </div>
                    </div>
                    <div class="drawer-footer">
                        <a-button @click="doOnClose" class="btn-cancel">取消</a-button>
                        <a-button type="primary" @click="drawerSaveFunc" class="btn-save">保存</a-button>
                    </div>
                </a-drawer>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { addMenuInfo, editMenuInfo, getMenuByCode, getMenuList, removeMenuInfo } from './api/MenuManager';
import { getPermissionList } from '../permission-manager/api/PermissionManager';
import { message } from 'ant-design-vue';

// ==================================================抽屉逻辑开始====================================================
// 抽屉组件
// 控制抽屉显示/隐藏的状态
const showDrawer = ref(false);
const currentMenuData = ref({});
const drawer_view_columns = ref();
const drawer_permission_data_list = ref([]);
//目录类型选项
const typeSelectOptionData = [
    { label: "目录", value: 0 },
    { label: "菜单", value: 1 },
    { label: "按钮/功能", value: 2 }
]
// 权限下拉选择框search功能
const filterOption = (inputValue, option) => {
    const { permissionName, permissionCode } = option;
    const lowerInputValue = inputValue.toLowerCase();
    return (
        permissionName.toLowerCase().includes(lowerInputValue) ||
        permissionCode.toLowerCase().includes(lowerInputValue)
    );
}

const drawer_add_view_columns = ref([
    { name: '菜单名称', value: 'menuName', disabled: false },
    { name: '父级编码', value: 'parentMenuCode', disabled: true },
    { name: '菜单编码', value: 'menuCode', disabled: false, placeholder: "请输入2位编码", maxlength: 2 },
    { name: '权限资源', value: 'permissionList', disabled: false },
    { name: '菜单类型', value: 'type', disabled: false },
    { name: '排序', value: 'sort', disabled: false }
]);

const drawer_edit_view_columns = ref([
    { name: '菜单名称', value: 'menuName', disabled: false },
    { name: '父级编码', value: 'parentMenuCode', disabled: true },
    { name: '菜单编码', value: 'menuCode', disabled: true, placeholder: "请输入2位编码" },
    { name: '资源权限', value: 'permissionList', disabled: false },
    { name: '排序', value: 'sort', disabled: false },
    { name: '类型', value: 'type', disabled: false },
]);

const doAddRootShowDrawer = () => {
    currentMenuData.value = {}; // 初始化 currentMenuData 为一个空对象
    currentMenuData.value.type = 0;
    currentMenuData.value.parentMenuCode = -1;
    drawer_view_columns.value = drawer_add_view_columns.value;
    getPermissionListFunc();
    showDrawer.value = true;
}
const doAddShowDrawer = (parentData) => {
    currentMenuData.value = {}; // 初始化 currentMenuData 为一个空对象
    currentMenuData.value.parentMenuCode = parentData.menuCode;
    drawer_view_columns.value = drawer_add_view_columns.value;
    getPermissionListFunc();
    showDrawer.value = true;
}

const doEditShowDrawer = (userData) => {
    getMenuByCodeFunc(userData.menuCode);
    getPermissionListFunc();
    drawer_view_columns.value = drawer_edit_view_columns.value;
    showDrawer.value = true;
}
const doOnClose = () => {
    drawer_view_columns.value = [];
    showDrawer.value = false;
};

const drawerSaveFunc = () => {
    saveItem();
}

// 保存项（新增或编辑）
const saveItem = async () => {
    const params = currentMenuData.value;
    //编辑
    if (currentMenuData.value.id) {
        const response = await editMenuInfo(params);
        if (response.data.code === 200 && response.data.data === true) {
            message.success("保存成功", 2, onclose)
        } else {
            message.error(response.data.message, 2, onclose)
            return;
        }
        doOnClose();
        fetchMenuListData();
        return;
    }
    //新增
    const response = await addMenuInfo(params);
    if (response.data.code === 200 && response.data.data === true) {
        message.success("保存成功", 2, onclose)
    } else {
        message.error(response.data.message, 2, onclose)
        return;
    }
    doOnClose();
    fetchMenuListData();
};

const getPermissionListFunc = async () => {
    const params = {};
    const response = await getPermissionList(params);
    drawer_permission_data_list.value = response.data.data;
}

const getMenuByCodeFunc = async (menuCode) => {
    const params = { "menuCode": menuCode };
    const response = await getMenuByCode(params);
    currentMenuData.value = response.data.data;
}

// ==================================================抽屉js逻辑结束====================================================

// ==================================================列表js逻辑开始====================================================
// 列表展示列
const list_view_columns = ref(
    [
        {
            title: '菜单名称',
            dataIndex: 'menuName',
            key: 'menuName',
        },
        {
            title: '菜单编码',
            dataIndex: 'menuCode',
            key: 'menuCode',
        },
        {
            title: '排序',
            key: 'sort',
            dataIndex: 'sort'
        },
        {
            title: '类型',
            key: 'typeDesc',
            dataIndex: 'typeDesc',
            align: 'center'
        },

        {
            title: '操作',
            key: 'action',
            align: 'center'
        },
    ]
);
const userNameKeyword = ref(''); // 菜单名称搜索关键词
const phoneKeyword = ref(''); // 菜单编码搜索关键词
const menuDataList = ref([]); // 列表数据
const currentPage = ref(1); // 当前页码
const loading = ref(false); // 加载状态

// 搜索数据
const searchData = async () => {
    currentPage.value = 1;
    fetchMenuListData();
};

// 重置数据
const resetData = async () => {
    userNameKeyword.value = '';
    phoneKeyword.value = '';
    currentPage.value = 1;
    fetchMenuListData();
};

// 获取菜单列表数据
const fetchMenuListData = async () => {
    loading.value = true;
    try {
        const params = {
            menuName: userNameKeyword.value,
            menuCode: phoneKeyword.value
        };
        const response = await getMenuList(params);
        menuDataList.value = response.data.data;
        //菜单类型desc
        wrapTypeDescDataFunc(menuDataList.value);
    } catch (error) {
        console.error('获取数据失败:', error);
    } finally {
        loading.value = false;
    }
};

const wrapTypeDescDataFunc = (targetDataList) => {
    if (!targetDataList) {
        return;
    }
    targetDataList.forEach(menudata => {
        const selectedOption = typeSelectOptionData.find(option => option.value === menudata.type);
        menudata.typeDesc = selectedOption ? selectedOption.label : '未知类型'; // '未知类型' 可以根据需要调整
        if (menudata.children) {
            wrapTypeDescDataFunc(menudata.children);
        }
    })
}

// 删除项（功能暂未实现）
const deleteItem = async (item) => {
    const params = {
        menuCode: item.menuCode
    }
    const response = await removeMenuInfo(params);
    if (response.data.code !== 200) {
        window.alert(response.data.message);
        return;
    }
    fetchMenuListData();
};
// ==================================================列表js逻辑结束====================================================
// 页面挂载后获取菜单列表数据
onMounted(async () => {
    fetchMenuListData();
});
</script>

<style scoped>
/* 标题区域样式 */
.title_region {
    padding: 16px;
}

/* 列表视图容器样式 */
.list-view-container {
    display: flex;
    height: 94%;
    background-color: #f0f2f5;
    gap: 16px;
    padding: 16px;
    background-color: #f4f4f9;
}

/* 列表视图样式 */
.list-view {
    width: 100%;
    height: 100%;
    padding: 16px;
    background-color: #fff;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
}

/* 列表头部样式 */
.list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background-color: #f5f5f5;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    margin-bottom: 16px;
    border-bottom: 1px solid #e8e8e8;
}

.search-label {
    margin-right: 16px;
    font-weight: bold;
}

/* 列表控件样式 */
.list-controls input {
    padding: 8px;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    margin-right: 8px;
}

.list-controls .btn {
    margin-right: 30px;
}

.list-controls .btn:hover {
    background-color: #40a9ff;
}

/* 列表内容区域样式 */
.list-content {
    flex-grow: 1;
    overflow-y: auto;
}

/* 加载动画样式 */
.loading-spinner {
    display: flex;
    justify-content: center;
    height: 100%;
}

.loading-spinner::before {
    content: '';
    width: 50px;
    height: 50px;
    border: 5px solid #ccc;
    border-top: 5px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

/* 按钮样式 */
.list-content .btn {
    padding: 4px 8px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}

.list-content .btn-info:hover {
    background-color: #16e1c9;
}

.list-content .btn-warning:hover {
    background-color: #f7ef12;
}

.list-content .btn-danger {
    background-color: #ff4d4f;
    color: #fff;
}

.list-content .btn-danger:hover {
    background-color: #ff7875;
}


/* =========================================抽屉底部样式start===================================== */
.drawer-content {
    padding: 1rem;
}

.form-group {
    display: flex;
    margin-bottom: 1rem;
}

.form-group label {
    font-weight: bold;
    color: #004d00;
    margin-right: 1rem;
    flex: 0 0 80px;
    /* Adjust width as needed */
    text-align: right;
}

.form-group .a-input,
.form-group .a-tree-select,
.form-group .a-input-password {
    width: 70%;
}

.drawer-footer {
    position: absolute;
    bottom: 0;
    right: 0;
    width: calc(100% - 1rem);
    padding: 1rem;
    background-color: #f9f9f9;
    border-top: 1px solid #e8e8e8;
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
}

.drawer-footer .btn-cancel {
    background-color: #4a6a41;
    color: #fff;
    border: none;
    transition: background-color 0.3s;
}

.drawer-footer .btn-cancel:hover {
    background-color: #3b5a32;
}

.drawer-footer .btn-save {
    background-color: #007f00;
    color: #fff;
    border: none;
    transition: background-color 0.3s;
}

.drawer-footer .btn-save:hover {
    background-color: #005d00;
}

/* =========================================抽屉底部样式end===================================== */
/* 按钮样式 */
.btn {
    display: inline-flex;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    border-radius: 0.25rem;
    transition: background-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}
</style>