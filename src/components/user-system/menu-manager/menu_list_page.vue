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
                    <label for="menuNameSearch">菜单名称</label>
                    <input type="text" id="menuNameSearch" v-model="userNameKeyword" placeholder="菜单名称搜索..."
                        @input="searchData" />

                    <!-- 菜单编码搜索框 -->
                    <label for="menuCodeSearch">菜单编码</label>
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
                            <th v-for="column in list_view_columns" :key="column.value" class="fixed-column">
                                {{ column.name }}
                            </th>
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
                                <input type="text"
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
import { addMenuInfo, deleteMenuInfo, editMenuInfo, getMenuList } from './api/MenuManager';

// 列表展示列
const list_view_columns = ref([
    { name: '菜单名称', value: 'menuName', iconFlag: true },
    { name: '菜单编码', value: 'menuCode', iconFlag: false },
    { name: '排序', value: 'sort', iconFlag: false },
    { name: '类型', value: 'type', iconFlag: false },
]);

// 模态框展示列
const modal_view_columns = ref(list_view_columns.value);
const add_view_columns = ref(list_view_columns.value);
const edit_view_columns = ref(list_view_columns.value);

const userNameKeyword = ref(''); // 菜单名称搜索关键词
const phoneKeyword = ref(''); // 菜单编码搜索关键词
const items = ref([]); // 列表数据
const currentPage = ref(1); // 当前页码
const showModal = ref(false); // 是否显示模态框
const modalTitle = ref(''); // 模态框标题
const currentItem = ref({}); // 当前编辑或新增的项
const loading = ref(false); // 加载状态
const modalType = ref(''); // 模态框类型：新增或编辑

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
    currentItem.value = { parentMenuCode: item.menuCode || -1 }; // 默认值
    modal_view_columns.value = add_view_columns.value;
    modalType.value = 'add';
};

// 显示新增根目录模态框
const showAddRootModal = () => {
    showModal.value = true;
    modalTitle.value = '新增根目录';
    currentItem.value = { parentMenuCode: -1 }; // 根目录的 parentCode  
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

// 保存项（新增或编辑）
const saveItem = async () => {
    const params = currentItem.value;
    if (currentItem.value.id) {
        await editMenuInfo(params);
    } else {
        await addMenuInfo(params);
    }
    showModal.value = false;
    fetchMenuListData();
};

// 删除项（功能暂未实现）
const deleteItem = async (item) => {
    const params = {
        menuCode: item.menuCode
    }
    const response = await deleteMenuInfo(params);
    if(response.data.code !== 200){
        window.alert(response.data.message);
        return;
    }
    fetchMenuListData();
};

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

/* 鼠标悬停时行背景色 */
.table-row:hover {
    background-color: #10945f;
    color: white;
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

/* 模态框样式 */
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