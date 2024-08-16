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
                    <!-- 机构名称搜索框 -->
                    <label for="userNameSearch" class="search-label">机构名称</label>
                    <input id="userNameSearch" type="text" v-model="organizationNameKeyword" placeholder="机构名称搜索..."
                        @input="searchDataFunc" />

                    <!-- 机构编码搜索框 -->
                    <label for="phoneSearch" class="search-label">机构编码</label>
                    <input id="phoneSearch" type="text" v-model="organizationCodeKeyword" placeholder="机构编码搜索..."
                        @input="searchDataFunc" />
                </div>
                <!-- 操作按钮 -->
                 <!-- 搜索按钮 -->
                <button id="list-header-search" class="btn btn-success" style="position: absolute; right: 8%"
                    @click="searchDataFunc">
                    搜索
                </button>
                <!-- 重置按钮 -->
                <button id="list-header-reset" class="btn btn-warning" style="position: absolute; right: 5.5%"
                    @click="resetDataFunc">
                    重置
                </button>
                <!-- 新增按钮 -->
                <button @click="doAddRootShowDrawerFunc" class="btn btn-info" style="position: absolute; right: 3%">
                    <i class="bi bi-plus"></i> 新增
                </button>
            </div>

            <!-- 列表内容区域 -->
            <div class="list-content">
                <!-- 加载状态指示器 -->
                <div v-if="loading" class="loading-spinner"></div>
                <!-- 列表表格 -->
                <a-table :columns="list_view_columns" :data-source="organizationDataList" :pagination="false" filterMode = "tree" 
                    rowKey='code'>
                    <template #bodyCell="{ column, record }">
                        <template v-if="column.key === 'action'">
                            <span>
                                <button class="btn btn-sm btn-info" @click="doAddShowDrawerFunc(record)">
                                    新增
                                </button>
                                <button class="btn btn-sm btn-warning" @click="doEditShowDrawerFunc(record)"
                                    style="margin-left: 0.75%;">
                                    编辑
                                </button>
                                <a-popconfirm title="您确定要删除这条记录吗?" ok-text="确定" cancel-text="取消"
                                    @confirm="deleteItemFunc(record.code)" @cancel="handleCancel">
                                    <button class="btn btn-sm btn-danger" style="margin-left: 0.75%;">
                                        删除
                                    </button>
                                </a-popconfirm>
                            </span>
                        </template>
                    </template>
                </a-table>
            </div>
        </div>
    </div>

    <!-- drawer内容区域 -->
    <div>
        <a-drawer title="组织机构信息" :placement="placement" :closable="false" :open="showDrawer" @close="doOnCloseFunc">
            <!-- 表单项 -->
            <div class="drawer-content">
                <div v-for="column in drawer_view_columns" :key="column.name" class="form-group">
                    <label :for="column.name">
                        <i class="bi bi-person"></i> {{ column.name }}：
                    </label>
                    <!-- 输入框 -->
                    <a-input :disabled=column.disabled :value="currentDrawerData[column.value]"
                        :placeholder=column.placeholder :maxlength=column.maxlength
                        @input="event => currentDrawerData[column.value] = event.target.value" :id="column.name" />
                </div>
            </div>
            <div class="drawer-footer">
                <a-button @click="doOnCloseFunc" class="btn-cancel">取消</a-button>
                <a-button type="primary" @click="drawerSaveFunc" class="btn-save">保存</a-button>
            </div>
        </a-drawer>
    </div>

</template>

<script setup>
import { ref, onMounted } from 'vue';
import { addOrganizationInfo, editOrganizationInfo, fetchOrganizationDetailById, getOrganizationList, removeOrganizationInfo } from './api/OrganizationManager';
import { message } from 'ant-design-vue';

//==========================================列表逻辑开始===============================================
// 列表数据和分页数据定义(loading)
const organizationDataList = ref([]);
const currentPage = ref(1);
const loading = ref(false);

// 搜索关键字定义
const organizationNameKeyword = ref('');
const organizationCodeKeyword = ref('');

// 搜索数据
const searchDataFunc = async () => {
    currentPage.value = 1;
    fetchOrganizationListDataFunc();
};

// 列表视图列定义
const list_view_columns = ref(
    [
        {
            title: '机构名称',
            dataIndex: 'name',
            key: 'name',
            filterSearch: true
        },
        {
            title: '机构编码',
            dataIndex: 'code',
            key: 'code',
        },
        {
            title: '排序',
            key: 'showOrder',
            dataIndex: 'showOrder',
            align: 'center'
        },
        {
            title: '操作',
            key: 'action',
            align: 'center'
        },
    ]
);

// 重置数据
const resetDataFunc = async () => {
    organizationNameKeyword.value = '';
    organizationCodeKeyword.value = '';
    currentPage.value = 1;
    fetchOrganizationListDataFunc();
};

// 获取组织列表数据
const fetchOrganizationListDataFunc = async () => {
    loading.value = true;
    try {
        const params = {
            name: organizationNameKeyword.value,
            code: organizationCodeKeyword.value
        };
        const response = await getOrganizationList(params);
        organizationDataList.value = response.data.data;
    } catch (error) {
        console.error('获取数据失败:', error);
    } finally {
        loading.value = false;
    }
};

// 删除项目
const deleteItemFunc = async (code) => {
    const params = { "code": code };
    const response = await removeOrganizationInfo(params);
    if (response.data.code === 200 && response.data.data === true) {
        message.success("删除成功", 2, onclose)
        fetchOrganizationListDataFunc();
        return;
    }
    message.error(response.data.message, 2, onclose)
};

//==========================================列表逻辑结束===============================================

//==========================================drawer逻辑开始===============================================
// 抽屉组件
// 控制抽屉显示/隐藏的状态
const showDrawer = ref(false);
const currentDrawerData = ref({});
const drawer_view_columns = ref();

const drawer_add_view_columns = ref([
    { name: '机构名称', value: 'name' },
    { name: '父级编码', value: 'parentCode', disabled: true },
    { name: '机构编码', value: 'code' , placeholder: "请输入2位编码", maxlength: 2},
    { name: '排序', value: 'showOrder' },
]);

const drawer_edit_view_columns = ref([
    { name: '机构名称', value: 'name' },
    { name: '父级编码', value: 'parentCode', disabled: true },
    { name: '机构编码', value: 'code', disabled: true },
    { name: '排序', value: 'showOrder' },
]);

const doAddShowDrawerFunc = (record) => {
    currentDrawerData.value = {}; // 初始化 currentDrawerData 为一个空对象
    currentDrawerData.value.parentCode = record.code;
    showDrawer.value = true;
    drawer_view_columns.value = drawer_add_view_columns.value;
    getMenuTreeList();
}

const doAddRootShowDrawerFunc = () => {
    currentDrawerData.value = {}; // 初始化 currentDrawerData 为一个空对象
    currentDrawerData.value.parentCode = -1;
    showDrawer.value = true;
    drawer_view_columns.value = drawer_add_view_columns.value;
    getMenuTreeList();
}

const doEditShowDrawerFunc = (record) => {
    //查询详情
    fetchOrganizationDetailDataFunc(record);
    //打开drawer
    showDrawer.value = true;
    //设置列
    drawer_view_columns.value = drawer_edit_view_columns.value;
}
const doOnCloseFunc = () => {
    drawer_view_columns.value = [];
    showDrawer.value = false;
};

// 保存项目(新增/编辑)
const drawerSaveFunc = async () => {
    const params = currentDrawerData.value;
    try {
        if (params.id) {
            await editOrganizationInfo(params);
        } else {
            await addOrganizationInfo(params);
        }
        doOnCloseFunc();
        fetchOrganizationListDataFunc();
    } catch (error) {
        console.error('保存失败:', error);
    } finally {
        showModal.value = false;
    }
};

const fetchOrganizationDetailDataFunc = async (record) => {
    const params = { "recordId": record.id }
    const response = await fetchOrganizationDetailById(params);
    currentDrawerData.value = response.data.data
}
//==========================================drawer逻辑结束===============================================

// 组件挂载后获取数据
onMounted(() => {
    fetchOrganizationListDataFunc();
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
/* ====================================================列表样式end=============================================== */

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