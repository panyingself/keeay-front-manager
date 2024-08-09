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
                <button @click="showAddModal" class="btn btn-info" style="position: absolute; right: 3%">
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
                        <tr v-for="item in items" :key="item.id" class="table-row">
                            <!-- 表格数据 -->
                            <td v-for="column in list_view_columns" :key="column.value">
                                {{ item[column.value] }}
                            </td>
                            <!-- 操作按钮 -->
                            <td>
                                <button class="btn btn-sm btn-info" @click="showEditModal(item)">
                                    <i class="bi bi-pencil"></i> 编辑
                                </button>
                                <button class="btn btn-sm btn-danger" @click="deleteItem(item.id)">
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

            <!-- 模态框 -->
            <modal v-if="showModal" @close="closeModal">
                <template v-slot:header>
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="bi bi-file-earmark-plus"></i> {{ modalTitle }}
                        </h5>
                    </div>
                </template>
                <template v-slot:body>
                    <div class="modal-body">
                        <form @submit.prevent="saveItem">
                            <!-- 表单项 -->
                            <div v-for="column in modal_view_columns" :key="column.name" class="form-group">
                                <label :for="column.name">
                                    <i class="bi bi-person"></i> {{ column.name }}
                                </label>
                                <!-- 非机构选择项的输入框 -->
                                <input v-if="column.value !== 'organizationCode'" type="text"
                                    v-model="currentItem[column.value]" :id="column.name" class="form-control" />
                                <!-- 机构选择项的下拉框 -->
                                <div v-if="column.value === 'organizationCode'" :id="column.name" class="form-control">
                                    <div class="tree-container">
                                        <tree-component :treeData="treeData"
                                            @selectNode="handleSelectNode"></tree-component>
                                    </div>
                                </div>
                            </div>
                            <!-- 表单操作按钮 -->
                            <div class="modal-footer">
                                <button type="submit" class="btn btn-primary">
                                    <i class="bi bi-save"></i> 保存
                                </button>
                                <button type="button" class="btn btn-secondary" @click="closeModal">
                                    <i class="bi bi-x-circle"></i> 取消
                                </button>
                            </div>
                        </form>
                    </div>
                </template>
            </modal>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Pagination from '@/components/common-components/pagenation.vue';
import Modal from '@/components/common-components/modal.vue';
import { getRoleList } from './api/RoleManager';

const list_view_columns = ref([
    { name: '角色名称', value: 'roleName' },
    { name: '角色编码', value: 'roleCode' },
    { name: '显示顺序', value: 'code' },
    { name: '排序', value: 'showOrder' },
    { name: '状态', value: 'activeStatus' },
]);

const modal_view_columns = ref(list_view_columns.value);
const add_view_columns = ref(list_view_columns.value);
const edit_view_columns = ref(list_view_columns.value);

// 搜索条件
const userNameKeyword = ref('');
const phoneKeyword = ref('');

// 模态框相关状态
const showModal = ref(false);
const modalTitle = ref('');
const currentItem = ref({});
const loading = ref(false);
const modalType = ref('');

// 数据列表
const items = ref([]);
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
        items.value = response.data.data.dataList;
        totalCount.value = response.data.data.totalCount;
    } catch (error) {
        console.error('获取数据失败:', error);
    } finally {
        loading.value = false;
    }
};

const showAddModal = (item) => {
    alert(item.code.value)
    showModal.value = true;
    modalTitle.value = '新增';
    currentItem.value = { parentCode: item.code.value || -1 }; // 默认值
    modal_view_columns.value = add_view_columns.value;
    modalType.value = 'add';
};

const showAddRootModal = () => {
    showModal.value = true;
    modalTitle.value = '新增根目录';
    currentItem.value = { parentCode: -1 }; // 根目录的 parentCode
    modal_view_columns.value = add_view_columns.value;
    modalType.value = 'add';
};

const showEditModal = (item) => {
    showModal.value = true;
    modalTitle.value = '编辑';
    currentItem.value = { ...item };
    modal_view_columns.value = edit_view_columns.value;
    modalType.value = 'edit';
};

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


const closeModal = () => {
    showModal.value = false;
};

const saveItem = async () => {
    //edit
    const params = currentItem.value;
    if (currentItem.value.id) {
        await editRoleInfo(params);
    } else {
        await addRoleInfo(params);
    }
    showModal.value = false;
    fetchRoleListData();
};

const deleteItem = async (id) => {
    alert("暂不支持该操作");
};

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

/* 模态框样式 */
/* 模态框整体样式 */
.modal-header {
    color: white;
    border-top-left-radius: 0.3rem;
    border-top-right-radius: 0.3rem;
}

.modal-title {
    display: flex;
    align-items: center;
}

.modal-title i {
    margin-right: 0.5rem;
}

.modal-body {
    padding: 1.5rem;
    background-color: #f9f9f9;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 1.5rem;
}

/* 表单组样式 */
.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: flex;
    align-items: center;
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
    align-items: center;
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
</style>