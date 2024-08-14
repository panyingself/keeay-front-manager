<template>
    <div class="title_region">
        <!-- 面包屑导航区域 -->
        <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
                <li class="breadcrumb-item"><a href="#">用户中台</a></li>
                <li class="breadcrumb-item"><a href="#">角色管理</a></li>
                <li class="breadcrumb-item active" aria-current="page">角色列表</li>
            </ol>
        </nav>
    </div>

    <div class="list-view-container">
        <!-- 列表区域 -->
        <div class="list-view">
            <!-- 列表header区域 -->
            <div class="list-header">
                <div class="list-controls">
                    <!-- 用户名搜索框 -->
                    <a style="margin-right: 16px;">用户名</a>
                    <input type="text" v-model="userNameKeyword" placeholder="用户名搜索..." @input="searchData" />
                    <!-- 手机号搜索框 -->
                    <a style="margin-right: 16px;">手机号</a>
                    <input type="text" v-model="phoneKeyword" placeholder="手机号搜索..." @input="searchData" />
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
                        <tr v-for="record in recordDataList" :key="record.id" class="table-row">
                            <!-- 表格数据 -->
                            <td v-for="column in list_view_columns" :key="column.value">
                                <template v-if="column.value == 'activeStatus'">
                                    <!-- @click="handleConfirm"  -->
                                    <a-popconfirm title="确定要改变激活状态吗?" ok-text="Yes" cancel-text="No"
                                        @confirm="dataEnableFunc(record)" @cancel="handleCancel">
                                        <div style="position: relative;">
                                            <a-switch v-model:checked="record[column.value]" :unCheckedValue="0"
                                                :checkedValue="1" checked-children="启用" un-checked-children="禁用" />
                                            <div style="position: absolute;inset: 0;"></div>
                                        </div>
                                    </a-popconfirm>
                                </template>
                                <template v-else>
                                    {{ record[column.value] }}
                                </template>
                            </td>
                            <!-- 操作按钮 -->
                            <td>
                                <button class="btn btn-sm btn-warning" @click="doEditShowDrawer(record)">
                                    <i class="bi bi-pencil"></i> 编辑
                                </button>
                                <button class="btn btn-sm btn-danger" @click="deleteItem(record.id)" style="margin-left: 2%;">
                                    <i class="bi bi-trash"></i> 删除
                                </button>
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
                                :value="currentDrawerData[column.value]"
                                :disabled=column.disabled
                                @input="event => currentDrawerData[column.value] = event.target.value"
                                :id="column.name" />
                            <!--菜单权限select -->
                            <a-tree-select v-if="column.value === 'menuCodeList'"
                                v-model:value="currentDrawerData[column.value]" show-search style="width: 100%"
                                :treeCheckable="true" :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                                placeholder="Please select" allow-clear multiple tree-default-expand-all :maxTagCount=4
                                :tree-data="drawer_menu_data_list" :field-names="{
                                    children: 'children',
                                    label: 'menuName',
                                    value: 'menuCode',
                                }" tree-node-filter-prop="name"></a-tree-select>
                            <!-- 是否启用 -->
                            <template v-if="column.value == 'activeStatus'">
                                <a-switch v-model:checked="currentDrawerData[column.value]" />
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
import { addRoleInfo, changeEnable, editRoleInfo, fetchRoleDetailByCode, getRoleList } from './api/RoleManager';
import { getMenuList } from '../menu-manager/api/MenuManager';
import { message } from 'ant-design-vue';

const flag = ref(true);
// ==================================================抽屉js逻辑开始====================================================
// 抽屉组件
// 控制抽屉显示/隐藏的状态
const showDrawer = ref(false);
const currentDrawerData = ref({});
const drawer_view_columns = ref();
const drawer_menu_data_list = ref([]);

const drawer_add_view_columns = ref([
    { name: '角色名称', value: 'roleName' },
    { name: '角色编码', value: 'roleCode' },
    { name: '菜单权限', value: 'menuCodeList' },
    { name: '备注', value: 'remark' },
    { name: '状态', value: 'activeStatus' },
]);

const drawer_edit_view_columns = ref([
    { name: '角色名称', value: 'roleName' },
    { name: '角色编码', value: 'roleCode' , disabled: true},
    { name: '菜单权限', value: 'menuCodeList' },
    { name: '备注', value: 'remark' },
]);

const doAddShowDrawer = () => {
    currentDrawerData.value = {}; // 初始化 currentDrawerData 为一个空对象
    showDrawer.value = true;
    drawer_view_columns.value = drawer_add_view_columns.value;
    getMenuTreeList();

}

const doEditShowDrawer = (userData) => {
    fetchRoleDetailDataFunc(userData.roleCode);
    getMenuTreeList();
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
    const params = currentDrawerData.value;
    if (currentDrawerData.value.id) {
        await editRoleInfo(params);
    } else {
        await addRoleInfo(params);
    }
    doOnClose();
    fetchRoleListData();
};

// 根据code获取role详情数据
const fetchRoleDetailDataFunc = async (code) => {
    const params = { "code": code };
    const response = await fetchRoleDetailByCode(params);
    if (response.data.code === 200) {
        currentDrawerData.value = response.data.data;
        return;
    }
    message.error("系统异常", 2, onclose)
}
// 获取菜单列表数据
const getMenuTreeList = async () => {
    const response = await getMenuList();
    drawer_menu_data_list.value = response.data.data;
}

// ==================================================抽屉js逻辑结束====================================================


// ==================================================列表js逻辑开始====================================================
// 搜索条件
const userNameKeyword = ref('');
const phoneKeyword = ref('');

const loading = ref(false);
const list_view_columns = ref([
    { name: '角色名称', value: 'roleName' },
    { name: '角色编码', value: 'roleCode' },
    { name: '备注', value: 'remark' },
    { name: '创建时间', value: 'createTime' },
    { name: '状态', value: 'activeStatus' },
]);

// 数据列表
const recordDataList = ref([]);
const totalCount = ref(0);
const currentPage = ref(1);
const pageSize = ref(10); // 初始化每页显示10条

const searchData = async () => {
    currentPage.value = 1;
    fetchRoleListData();
};

const resetData = async () => {
    userNameKeyword.value = '';
    phoneKeyword.value = '';
    currentPage.value = 1;
    fetchRoleListData();
};

const fetchRoleListData = async () => {
    loading.value = true;
    try {
        const params = {
            // 根据需要设置 API 请求参数
            currentPage: currentPage.value,
            pageSize: pageSize.value,
            'name': userNameKeyword.value,
            'code': phoneKeyword.value
        };
        const response = await getRoleList(params);
        recordDataList.value = response.data.data.dataList;
        totalCount.value = response.data.data.totalCount;
    } catch (error) {
        console.error('获取数据失败:', error);
    } finally {
        loading.value = false;
    }
};

// 列表启用
const dataEnableFunc = async (record) => {
    let newActiveStatus = 0;
    // 修改成功 - 调整按钮值
    if (record.activeStatus === 0) {
        newActiveStatus = 1;
    } else {
        newActiveStatus = 0;
    }
    // 修改数据
    const params = { "roleCode": record.roleCode, "activeStatus": newActiveStatus };
    const response = await changeEnable(params);
    if (response.data.code === 200 && response.data.data === true) {
        // 修改成功 - 调整按钮值
        record.activeStatus = newActiveStatus;

        return;
    } else {
        message.error(response.data.message, 2, onclo);
    }
}
// 处理分页变化事件
const handlePageChange = (page) => {
    currentPage.value = page;
    fetchRoleListData();
};

// 处理分页大小变化事件
const handlePageSizeChange = (size) => {
    pageSize.value = size;
    currentPage.value = 1; // 重置到第一页
    fetchRoleListData();
};


const deleteItem = async (id) => {
    alert("暂不支持该操作");
};

// ==================================================列表js逻辑结束====================================================
onMounted(async () => {
    fetchRoleListData();
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

/* ====================================================列表样式start=============================================== */
/* 列表视图样式 */
.list-view {
    width: 100%;
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

.role-info {
    position: relative;
    display: inline-block;
    cursor: pointer;
}

/* 角色列样式 */
.role-info::after {
    content: attr(title);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: #333;
    color: #fff;
    padding: 5px;
    border-radius: 4px;
    white-space: nowrap;
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.3s;
    z-index: 1;
}

.role-info:hover::after {
    visibility: visible;
    opacity: 1;
}

/* 加载状态指示器 */
.loading-spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 24px;
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
    align-items: center;
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
/* ====================================================列表样式end=============================================== */

/* ====================================================抽屉样式start=============================================== */
/* 抽屉内容样式 */
.form-group-row {
    display: flex;
    align-items: center;
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
    align-items: center;
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
/* ====================================================抽屉样式end=============================================== */
</style>