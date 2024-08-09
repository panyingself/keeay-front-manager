<template>
    <div class="title_region">
        <!-- 面包屑导航区域 -->
        <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
                <li class="breadcrumb-item"><a href="#">用户中台</a></li>
                <li class="breadcrumb-item"><a href="#">组织管理</a></li>
                <li class="breadcrumb-item active" aria-current="page">组织管理列表</li>
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
                    <label for="userNameSearch" class="search-label">用户名</label>
                    <input id="userNameSearch" type="text" v-model="userNameKeyword" placeholder="用户名搜索..."
                        @input="searchData" />

                    <!-- 手机号搜索框 -->
                    <label for="phoneSearch" class="search-label">手机号</label>
                    <input id="phoneSearch" type="text" v-model="phoneKeyword" placeholder="手机号搜索..."
                        @input="searchData" />
                </div>
                <!-- 操作按钮 -->
                <div class="action-buttons">
                    <button id="list-header-search" class="btn btn-success" @click="searchData">搜索</button>
                    <button id="list-header-reset" class="btn btn-warning" @click="resetData">重置</button>
                    <button @click="showAddModal" class="btn btn-info">
                        <i class="bi bi-plus"></i> 新增
                    </button>
                </div>
            </div>

            <!-- 列表内容区域 -->
            <div class="list-content">
                <!-- 加载状态指示器 -->
                <div v-if="loading" class="loading-spinner"></div>
                <!-- 列表表格 -->
                <table v-else class="table">
                    <thead>
                        <tr>
                            <th v-for="column in list_view_columns" :key="column.value" class="fixed-column">{{
                                column.name }}</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <recursive-item v-for="item in items" :key="item.id" :item="item" :columns="list_view_columns"
                            :level="0" @show-edit-modal="showEditModal" @delete-item="deleteItem"
                            @show-add-modal="showAddModal" />
                    </tbody>
                </table>
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
                            <div v-for="column in modal_view_columns" :key="column.value" class="form-group">
                                <label :for="column.value">
                                    <i class="bi bi-person"></i> {{ column.name }}
                                </label>
                                <input v-if="column.value !== 'organizationCode'" type="text"
                                    v-model="currentItem[column.value]" :id="column.value" class="form-control" />
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
import Modal from '@/components/common-components/modal.vue';
import RecursiveItem from '@/components/user-system/organization-manager/RecursiveItem.vue';
import { addOrganizationInfo, editOrganizationInfo, getOrganizationList } from './api/OrganizationManager';

// 列表视图列定义
const list_view_columns = ref([
    { name: '机构名称', value: 'name', iconFlag: true },
    { name: '机构编码', value: 'code', iconFlag: false },
    { name: '排序', value: 'showOrder', iconFlag: false },
    { name: '状态', value: 'activeStatus', iconFlag: false },
]);

// 模态框视图列定义
const modal_view_columns = ref(list_view_columns.value);
const add_view_columns = ref(list_view_columns.value);
const edit_view_columns = ref(list_view_columns.value);

// 搜索关键字
const userNameKeyword = ref('');
const phoneKeyword = ref('');

// 列表数据和分页
const items = ref([]);
const currentPage = ref(1);

// 模态框控制
const showModal = ref(false);
const modalTitle = ref('');
const currentItem = ref({});
const loading = ref(false);
const modalType = ref('');

// 搜索数据
const searchData = async () => {
    currentPage.value = 1;
    fetchOrganizationListData();
};

// 重置数据
const resetData = async () => {
    userNameKeyword.value = '';
    phoneKeyword.value = '';
    currentPage.value = 1;
    fetchOrganizationListData();
};

// 获取组织列表数据
const fetchOrganizationListData = async () => {
    loading.value = true;
    try {
        const params = {
            name: userNameKeyword.value,
            code: phoneKeyword.value
        };
        const response = await getOrganizationList(params);
        items.value = response.data.data;
    } catch (error) {
        console.error('获取数据失败:', error);
    } finally {
        loading.value = false;
    }
};

// 显示新增模态框
const showAddModal = (item) => {
    showModal.value = true;
    modalTitle.value = '新增';
    currentItem.value = { parentCode: item?.code || -1 }; // 默认值
    modal_view_columns.value = add_view_columns.value;
    modalType.value = 'add';
};

// 显示新增根目录模态框
const showAddRootModal = () => {
    showModal.value = true;
    modalTitle.value = '新增根目录';
    currentItem.value = { parentCode: -1 }; // 根目录的 parentCode
    modal_view_columns.value = add_view_columns.value;
    modalType.value = 'add';
};

// 显示编辑模态框
const showEditModal = (item) => {
    showModal.value = true;
    modalTitle.value = '编辑';
    currentItem.value = { ...item };
    modal_view_columns.value = edit_view_columns.value;
    modalType.value = 'edit';
};

// 关闭模态框
const closeModal = () => {
    showModal.value = false;
};

// 保存项目
const saveItem = async () => {
    const params = currentItem.value;
    try {
        if (params.id) {
            await editOrganizationInfo(params);
        } else {
            await addOrganizationInfo(params);
        }
        fetchOrganizationListData();
    } catch (error) {
        console.error('保存失败:', error);
    } finally {
        showModal.value = false;
    }
};

// 删除项目
const deleteItem = async (id) => {
    alert("暂不支持该操作");
};

// 组件挂载后获取数据
onMounted(() => {
    fetchOrganizationListData();
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
    padding: 16px;
    background-color: #f4f4f9;
}

/* 列表视图样式 */
.list-view {
    flex: 1;
    padding: 16px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
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

/* 搜索控件样式 */
.list-controls {
    display: flex;
    align-items: center;
}

.search-label {
    margin-right: 16px;
    font-weight: bold;
}

.list-controls input {
    padding: 8px;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    margin-right: 16px;
}

/* 操作按钮样式 */
.action-buttons .btn {
    margin-left: 8px;
}

/* 列表内容区域样式 */
.list-content {
    flex: 1;
    overflow-y: auto;
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

.table th {
    background-color: #fafafa;
}

.table-row:hover {
    background-color: #10945f;
    color: white;
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
}

.btn-secondary:hover {
    background-color: #5a6268;
    border-color: #545b62;
}

.btn-success {
    background-color: #28a745;
    border-color: #28a745;
    color: #fff;
}

.btn-warning {
    background-color: #ffc107;
    border-color: #ffc107;
    color: #212529;
}

.btn-info {
    background-color: #17a2b8;
    border-color: #17a2b8;
    color: #fff;
}

/* 模态框样式 */
.modal-header {
    background-color: #007bff;
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
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.form-control {
    height: calc(2.5rem + 2px);
    overflow-y: auto;
    max-height: 200px;
}
</style>