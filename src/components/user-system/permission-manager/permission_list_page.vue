<template>
    <div class="title_region">
        <!-- 面包屑导航区域 -->
        <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
                <li class="breadcrumb-item"><a href="#">用户中台</a></li>
                <li class="breadcrumb-item"><a href="#">权限管理</a></li>
                <li class="breadcrumb-item active" aria-current="page">权限列表</li>
            </ol>
        </nav>
    </div>

    <div class="list-view-container">
        <!-- 列表区域 -->
        <div class="list-view">
            <!-- 列表header区域 -->
            <div class="list-header">
                <div class="list-controls">
                    <!-- 权限名称搜索框 -->
                    <a style="margin-right: 16px;">权限名称</a>
                    <input type="text" v-model="permissionNameKeyword" placeholder="权限名称搜索..." @input="searchData" />
                    <!-- 权限编码搜索框 -->
                    <a style="margin-right: 16px;">权限编码</a>
                    <input type="text" v-model="permissionCodeKeyword" placeholder="权限编码搜索..." @input="searchData" />
                    <!-- 权限编码搜索框 -->
                    <a style="margin-right: 16px;">uri匹配</a>
                    <input type="text" v-model="uriKeyword" placeholder="uri搜索..." @input="searchData" />
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
                <button @click="doAddShowDrawer" class="btn btn-info" style="position: absolute; right: 3%">
                    <i class="bi bi-plus"></i> 新增
                </button>
            </div>

            <!-- 列表内容区域 -->
            <div class="list-content">
                <!-- 加载状态指示器 -->
                <div v-if="loading" class="loading-spinner"></div>
                <!-- 列表表格 -->
                <table v-else class="table">
                    <thead>
                        <tr>
                            <!-- 表头 -->
                            <th v-for="column in list_view_columns" :key="column.name">{{ column.name }}</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <transition-group name="fade" tag="tbody">
                        <tr v-for="item in permissionDataList" :key="item.id" class="table-row">
                            <!-- 表格数据 -->
                            <td v-for="column in list_view_columns" :key="column.value">
                                {{ item[column.value] }}
                            </td>
                            <!-- 操作按钮 -->
                            <td>
                                <button class="btn btn-sm btn-info" @click="doEditShowDrawer(item)">
                                    <i class="bi bi-pencil"></i> 编辑
                                </button>
                                <a-popconfirm title="您确定要删除这条记录吗?" ok-text="确定" cancel-text="取消"
                                    @confirm="deleteItemFunc(item.permissionCode)" @cancel="handleCancel">
                                    <button class="btn btn-sm btn-danger" style="margin-left: 5px;">
                                        删除
                                    </button>
                                </a-popconfirm>
                            </td>
                        </tr>
                    </transition-group>
                </table>
            </div>

            <!-- 列表分页脚标 -->
            <div class="list-footer">
                <pagination :totalCount="totalCount" :currentPage="currentPage" :pageSize="pageSize"
                    @change="handlePageChange" @update:pageSize="handlePageSizeChange" />
            </div>

            <!-- 抽屉组件 -->
            <div>
                <a-drawer title="角色信息" :placement="placement" :closable="false" :open="showDrawer" @close="doOnClose">
                    <!-- 表单项 -->
                    <div class="drawer-content">
                        <div v-for="column in drawer_view_columns" :key="column.name" class="form-group">
                            <label :for="column.name">
                                <i class="bi bi-person"></i> {{ column.name }}：
                            </label>
                            <!-- 非机构选择项的输入框 -->
                            <a-input v-show="column.value !== 'activeStatus' && column.value !== 'menuCodeList'"
                                :value="currentUserData[column.value]"
                                @input="event => currentUserData[column.value] = event.target.value"
                                :id="column.name" />
                            <!--菜单权限select -->
                            <a-tree-select v-if="column.value === 'menuCodeList'"
                                v-model:value="currentUserData[column.value]" show-search style="width: 100%"
                                :treeCheckable="true" :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                                placeholder="Please select" allow-clear multiple tree-default-expand-all :maxTagCount=4
                                :tree-data="drawer_menu_data_list" :field-names="{
                                    children: 'children',
                                    label: 'menuName',
                                    value: 'menuCode',
                                }" tree-node-filter-prop="name"></a-tree-select>
                            <!-- 是否启用 -->
                            <template v-if="column.value == 'activeStatus'">
                                <a-switch v-model:checked="currentUserData[column.value]" />
                            </template>
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
import Pagination from '@/components/common-components/pagenation.vue';
import { addPermissionInfo, deletePermissionInfo, editPermissionInfo, getPagePermissionList } from './api/PermissionManager';
import { message } from 'ant-design-vue';

// ==================================================抽屉逻辑开始====================================================
// 抽屉组件
// 控制抽屉显示/隐藏的状态
const showDrawer = ref(false);
const currentUserData = ref({});
const drawer_view_columns = ref();
const drawer_menu_data_list = ref([]);

const drawer_add_view_columns = ref([
    { name: '权限名称', value: 'permissionName' },
    { name: 'uri', value: 'uri' },
]);

const drawer_edit_view_columns = ref([
    { name: '权限名称', value: 'permissionName' },
    { name: 'uri', value: 'uri' },
    { name: '创建时间', value: 'createTime' },
    { name: '创建人', value: 'createUser' },
]);

const doAddShowDrawer = () => {
    currentUserData.value = {}; // 初始化 currentUserData 为一个空对象
    showDrawer.value = true;
    drawer_view_columns.value = drawer_add_view_columns.value;

}

const doEditShowDrawer = (userData) => {
    currentUserData.value = userData; // 初始化 currentUserData 为一个空对象
    showDrawer.value = true;
    drawer_view_columns.value = drawer_edit_view_columns.value;
}
const doOnClose = () => {
    drawer_view_columns.value = [];
    showDrawer.value = false;
};

const drawerSaveFunc = () => {
    saveItem();
}

const saveItem = async () => {
    //edit
    const params = currentUserData.value;
    if (currentUserData.value.id) {
        const response = await editPermissionInfo(params);
        if (response.data.code === 200 && response.data.data === true) {
            doOnClose();
            fetchpermissionListData();
            message.success('保存成功', 2, onclose);
            return;
        }
        message.error(response.data.message, 2, response.data.message);
        return;
    }
    const response = await addPermissionInfo(params);
    if (response.data.code === 200 && response.data.data === true) {
        doOnClose();
        fetchpermissionListData();
        message.success('保存成功', 2, onclose);
        return;
    }
    message.error(response.data.message, 2, onclose);

};

// ==================================================抽屉逻辑结束====================================================


// ==================================================列表逻辑开始====================================================
// 搜索条件
const permissionNameKeyword = ref('');
const permissionCodeKeyword = ref('');
const uriKeyword = ref('');

const loading = ref(false);
const list_view_columns = ref([
    { name: '权限名称', value: 'permissionName' },
    { name: '权限编码', value: 'permissionCode' },
    { name: 'uri', value: 'uri' },
    { name: '创建时间', value: 'createTime' },
    { name: '创建人', value: 'createUser' },
    { name: '修改时间', value: 'updateTime' },
    { name: '修改人', value: 'updateUser' },
]);

// 数据列表
const permissionDataList = ref([]);
const totalCount = ref(0);
const currentPage = ref(1);
const pageSize = ref(10); // 初始化每页显示10条

const searchData = async () => {
    currentPage.value = 1;
    fetchpermissionListData();
};

const resetData = async () => {
    permissionNameKeyword.value = '';
    permissionCodeKeyword.value = '';
    currentPage.value = 1;
    fetchpermissionListData();
};

const fetchpermissionListData = async () => {
    loading.value = true;
    try {
        const params = {
            // 根据需要设置 API 请求参数
            currentPage: currentPage.value,
            pageSize: pageSize.value,
            'permissionNameKeyword': permissionNameKeyword.value,
            'permissionCodeKeyword': permissionCodeKeyword.value,
            'uriKeyword': uriKeyword.value
        };
        const response = await getPagePermissionList(params);
        permissionDataList.value = response.data.data.dataList;
        totalCount.value = response.data.data.totalCount;
    } catch (error) {
        console.error('获取数据失败:', error);
    } finally {
        loading.value = false;
    }
};

// 处理分页变化事件
const handlePageChange = (page) => {
    currentPage.value = page;
    fetchpermissionListData();
};

// 处理分页大小变化事件
const handlePageSizeChange = (size) => {
    pageSize.value = size;
    currentPage.value = 1; // 重置到第一页
    fetchpermissionListData();
};


const deleteItemFunc = async (permissionCode) => {
    const params = { 'permissionCode': permissionCode };
    const response = await deletePermissionInfo(params);
    if (response.data.code === 200 && response.data.data === true) {
        fetchpermissionListData();
        message.success('删除成功', 2, onclose);
        return;
    }
    message.error('删除失败', 2, onclose);
};

// ==================================================列表逻辑结束====================================================

onMounted(async () => {
    fetchpermissionListData();
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
    font-family: Arial, sans-serif;
    /* 统一字体样式 */
    font-size: 14px;
    /* 统一字体大小 */
    line-height: 1.5;
    /* 统一行高 */
}

/* 列表头部样式 */
.list-header {
    display: flex;
    justify-content: space-between;
    align-permissionDataList: center;
    padding: 16px;
    background-color: #f5f5f5;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    margin-bottom: 16px;
    border-bottom: 1px solid #e8e8e8;
    font-family: Arial, sans-serif;
    /* 统一字体样式 */
    font-size: 14px;
    /* 统一字体大小 */
    line-height: 1.5;
    /* 统一行高 */
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
    margin-top: 16px;
}

/* 加载动画样式 */
.loading-spinner {
    display: flex;
    justify-content: center;
    align-permissionDataList: center;
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

/* 表格样式 */
.table {
    width: 100%;
    border-collapse: collapse;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.table th,
.table td {
    padding: 12px 16px;
    border-bottom: 1px solid #e8e8e8;
}

/* 设置光标样式 */
.table th,
.table td {
    cursor: pointer;
    /* 鼠标悬停时变成小手 */
}

.table th {
    background-color: #fafafa;
}

/* 设置鼠标悬停时的背景色 */
.table-row:hover {
    background-color: #10945f;
    color: white;
    /* 如果需要在悬停时文本颜色变化，可以设置 */
}

.table-row td {
    background-color: transparent;
}

/* 按钮样式 */
.table .btn {
    padding: 4px 8px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.table .btn-info {
    background-color: #4ae36e;
    color: #fff;
    margin-right: 6px;
}

.table .btn-info:hover {
    background-color: #40a9ff;
}

.table .btn-danger {
    background-color: #ff4d4f;
    color: #fff;
}

.table .btn-danger:hover {
    background-color: #ff7875;
}

/* 淡入淡出动画样式 */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}

/* 列表页脚按钮样式 */
.list-footer button {
    margin: 0 8px;
    padding: 8px 16px;
    background-color: #007bff;
    color: white;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s;
}

/* 表单组样式 */
.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: flex;
    align-permissionDataList: center;
    font-weight: bold;
    margin-bottom: 0.5rem;
}

.form-group label i {
    margin-right: 0.5rem;
}

/* 输入框样式 */
.form-control {
    width: 100%;
    padding: 0.5rem;
    font-size: 1rem;
    border-radius: 0.25rem;
    border: 1px solid #ced4da;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus {
    border-color: #80bdff;
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* 下拉选择框样式 */
.form-control {
    height: calc(2.5rem + 2px);
    /* 调整高度 */
    font-size: 1rem;
    border-radius: 0.25rem;
    border: 1px solid #ced4da;
    background-color: #fff;
}

.form-control:focus {
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* 确保下拉框选项不被裁剪 */
.form-control option {
    padding: 0.5rem;
}

/* 设置下拉框最大高度，并启用滚动条 */
.form-control {
    max-height: 200px;
    /* 根据需要调整 */
    overflow-y: auto;
}

/* 按钮样式 */
.btn {
    display: inline-flex;
    align-permissionDataList: center;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    border-radius: 0.25rem;
    transition: background-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.btn-primary {
    background-color: #007bff;
    border-color: #007bff;
    color: #fff;
}

.btn-primary:hover {
    background-color: #0056b3;
    border-color: #004085;
}

.btn-secondary {
    background-color: #6c757d;
    border-color: #6c757d;
    color: #fff;
    margin-left: 1rem;
}

.btn-secondary:hover {
    background-color: #5a6268;
    border-color: #545b62;
}

/* 抽屉内容样式 */
.form-group-row {
    display: flex;
    align-permissionDataList: center;
    margin-bottom: 0.5rem;
}

.form-label {
    flex: 0 0 30%;
    font-weight: bold;
    color: #005d54;
    /* 墨绿色 */
    margin-right: 0.5rem;
}

.form-input {
    flex: 1;
    margin-left: 0.5rem;
}

/* 抽屉底部样式 */
.drawer-content {
    padding: 1rem;
}

.form-group {
    display: flex;
    align-permissionDataList: center;
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
</style>