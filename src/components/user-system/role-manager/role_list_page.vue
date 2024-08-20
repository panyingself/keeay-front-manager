<template>
    <div class="title_region">
        <!-- 面包屑导航区域 -->
        <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
                <li class="breadcrumb-item"><a href="#">用户中台</a></li> <!-- 面包屑导航中的一级导航，链接到用户中台 -->
                <li class="breadcrumb-item"><a href="#">角色管理</a></li> <!-- 面包屑导航中的二级导航，链接到角色管理 -->
                <li class="breadcrumb-item active" aria-current="page">角色列表</li> <!-- 当前所在的页面，角色列表 -->
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
                    <label for="userNameSearch" class="search-label">机构名称</label>
                    <input type="text" v-model="userNameKeyword" placeholder="用户名搜索..." @input="searchData" />
                    <!-- 手机号搜索框 -->
                    <label for="phoneSearch" class="search-label">机构编码</label>
                    <input type="text" v-model="phoneKeyword" placeholder="手机号搜索..." @input="searchData" />
                </div>
                <!-- 搜索按钮 -->
                <button id="list-header-search" class="btn btn-success" style="position: absolute; right: 8%"
                    @click="searchData">
                    搜索
                </button>
                <!-- 重置按钮 -->
                <button id="list-header-reset" class="btn btn-warning" style="position: absolute; right: 5.5%"
                    @click="resetDataFunc">
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
                                <button class="btn btn-sm btn-danger" @click="deleteItemFunc(record.roleCode)"
                                    style="margin-left: 1.5%;">
                                    <i class="bi bi-trash"></i> 删除
                                </button>
                                <button class="btn btn-sm btn-success" @click="showModal" style="margin-left: 1.5%;">
                                    <i class="bi bi-trash"></i> 查看用户
                                </button>
                            </td>
                        </tr>
                    </transition-group>
                </table>
            </div>

            <!-- 列表分页脚标 -->
            <div class="list-footer">
                <pagination :totalCount="totalCount" :currentPage="currentPage" :pageSize="pageSize"
                    @change="handlePageChangeFunc" @update:pageSize="handlePageSizeChangeFunc" />
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
                                :value="currentDrawerData[column.value]" :disabled=column.disabled
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

            <!-- 模态框组件 -->
            <template>
                <div>
                    <a-modal v-model:visible="modalShowVisibale" width="65%" hight = "50%" title="Basic Modal" @ok="handleOk">
                        <!-- 列表内容区域 -->
                        <div class="list-content">
                            <!-- 加载状态指示器 -->
                            <div v-if="loading" class="loading-spinner"></div>
                            <!-- 列表表格 -->
                            <table v-else class="table">
                                <thead>
                                    <tr>
                                        <!-- 表头 -->
                                        <th v-for="column in list_view_columns" :key="column.name">{{ column.name }}
                                        </th>
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
                                                        <a-switch v-model:checked="record[column.value]"
                                                            :unCheckedValue="0" :checkedValue="1" checked-children="启用"
                                                            un-checked-children="禁用" />
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
                                            <button class="btn btn-sm btn-danger"
                                                @click="deleteItemFunc(record.roleCode)" style="margin-left: 1.5%;">
                                                <i class="bi bi-trash"></i> 删除
                                            </button>
                                            <button class="btn btn-sm btn-success" @click="showModal"
                                                style="margin-left: 1.5%;">
                                                <i class="bi bi-trash"></i> 查看用户
                                            </button>
                                        </td>
                                    </tr>
                                </transition-group>
                            </table>
                        </div>
                        <!-- 列表分页脚标 -->
                        <div class="list-footer">
                            <pagination :totalCount="totalCount" :currentPage="currentPage" :pageSize="pageSize"
                                @change="handlePageChangeFunc" @update:pageSize="handlePageSizeChangeFunc" />
                        </div>
                    </a-modal>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Pagination from '@/components/common-components/pagenation.vue';
import { addRoleInfo, changeEnable, editRoleInfo, fetchRoleDetailByCode, getRoleList, removeByRoleCode } from './api/RoleManager';
import { getMenuList } from '../menu-manager/api/MenuManager';
import { message } from 'ant-design-vue';

// ==================================================模态框js逻辑开始====================================================
const modalShowVisibale = ref(false);

const showModal = () => {
    modalShowVisibale.value = !modalShowVisibale.value;
}

// ==================================================模态框js逻辑结束====================================================

// ==================================================抽屉js逻辑开始====================================================
// 抽屉组件
// 控制抽屉显示/隐藏的状态
const showDrawer = ref(false); // 控制抽屉的显示与隐藏
const currentDrawerData = ref({}); // 存储当前抽屉内的数据
const drawer_view_columns = ref(); // 存储抽屉的显示列
const drawer_menu_data_list = ref([]); // 存储菜单数据列表

// 定义在添加操作时使用的抽屉显示列
const drawer_add_view_columns = ref([
    { name: '角色名称', value: 'roleName' },
    { name: '角色编码', value: 'roleCode' },
    { name: '菜单权限', value: 'menuCodeList' },
    { name: '备注', value: 'remark' },
    { name: '状态', value: 'activeStatus' },
]);

// 定义在编辑操作时使用的抽屉显示列
const drawer_edit_view_columns = ref([
    { name: '角色名称', value: 'roleName' },
    { name: '角色编码', value: 'roleCode', disabled: true }, // 角色编码在编辑时不能修改
    { name: '菜单权限', value: 'menuCodeList' },
    { name: '备注', value: 'remark' },
]);

// 打开添加操作的抽屉
const doAddShowDrawer = () => {
    currentDrawerData.value = {}; // 初始化当前抽屉数据为空对象
    showDrawer.value = true; // 显示抽屉
    drawer_view_columns.value = drawer_add_view_columns.value; // 设置抽屉显示列为添加列
    getMenuTreeList(); // 获取菜单树列表
}

// 打开编辑操作的抽屉
const doEditShowDrawer = (userData) => {
    fetchRoleDetailDataFunc(userData.roleCode); // 获取角色详细数据
    getMenuTreeList(); // 获取菜单树列表
    showDrawer.value = true; // 显示抽屉
    drawer_view_columns.value = drawer_edit_view_columns.value; // 设置抽屉显示列为编辑列
}

// 关闭抽屉
const doOnClose = () => {
    drawer_view_columns.value = []; // 清空抽屉显示列
    showDrawer.value = false; // 隐藏抽屉
};

// 保存操作
const drawerSaveFunc = () => {
    saveItem(); // 调用保存方法
}

// 保存数据（添加或编辑）
const saveItem = async () => {
    const params = currentDrawerData.value;
    // 如果有ID则表示是编辑操作，否则为添加操作
    if (currentDrawerData.value.id) {
        await editRoleInfo(params); // 编辑角色信息
    } else {
        await addRoleInfo(params); // 添加角色信息
    }
    doOnClose(); // 关闭抽屉
    fetchRoleListDataFunc(); // 重新获取角色列表数据
};

// 根据角色编码获取角色详细数据
const fetchRoleDetailDataFunc = async (code) => {
    const params = { "code": code };
    const response = await fetchRoleDetailByCode(params);
    if (response.data.code === 200) {
        currentDrawerData.value = response.data.data; // 将获取的数据赋值给currentDrawerData
        return;
    }
    message.error("系统异常", 2, onclose); // 提示系统异常
}

// 获取菜单列表数据
const getMenuTreeList = async () => {
    const response = await getMenuList();
    drawer_menu_data_list.value = response.data.data; // 将菜单数据赋值给drawer_menu_data_list
}

// ==================================================抽屉js逻辑结束====================================================


// ==================================================列表js逻辑开始====================================================
// 定义搜索条件
const userNameKeyword = ref(''); // 角色名称关键词
const phoneKeyword = ref(''); // 角色编码关键词

// 数据列表
const recordDataList = ref([]); // 记录数据列表
const totalCount = ref(0); // 总记录数
const currentPage = ref(1); // 当前页码
const pageSize = ref(10); // 每页显示的数据条数，初始化为10条
const loading = ref(false); // 控制加载状态

const list_view_columns = ref([
    { name: '角色名称', value: 'roleName' },
    { name: '角色编码', value: 'roleCode' },
    { name: '备注', value: 'remark' },
    { name: '创建时间', value: 'createTime' },
    { name: '状态', value: 'activeStatus' },
]);

// 搜索数据
const searchData = async () => {
    currentPage.value = 1; // 搜索时重置页码为1
    fetchRoleListDataFunc(); // 获取角色列表数据
};

// 重置搜索条件
const resetDataFunc = async () => {
    userNameKeyword.value = ''; // 重置角色名称关键词
    phoneKeyword.value = ''; // 重置角色编码关键词
    currentPage.value = 1; // 重置页码为1
    fetchRoleListDataFunc(); // 获取角色列表数据
};

// 获取角色列表数据
const fetchRoleListDataFunc = async () => {
    loading.value = true; // 设置加载状态为true
    try {
        const params = {
            currentPage: currentPage.value, // 当前页码
            pageSize: pageSize.value, // 每页显示的数据条数
            'name': userNameKeyword.value, // 角色名称关键词
            'code': phoneKeyword.value // 角色编码关键词
        };
        const response = await getRoleList(params);
        recordDataList.value = response.data.data.dataList; // 将获取的数据赋值给recordDataList
        totalCount.value = response.data.data.totalCount; // 将获取的总记录数赋值给totalCount
    } catch (error) {
        console.error('获取数据失败:', error); // 捕获错误并输出
    } finally {
        loading.value = false; // 关闭加载状态
    }
};

// 列表启用或禁用操作
const dataEnableFunc = async (record) => {
    let newActiveStatus = 0;
    if (record.activeStatus === 0) {
        newActiveStatus = 1; // 若当前状态为禁用，则设置为启用
    } else {
        newActiveStatus = 0; // 若当前状态为启用，则设置为禁用
    }
    const params = { "roleCode": record.roleCode, "activeStatus": newActiveStatus };
    const response = await changeEnable(params);
    if (response.data.code === 200 && response.data.data === true) {
        record.activeStatus = newActiveStatus; // 更新状态
    } else {
        message.error(response.data.message, 2, onclo); // 提示操作失败
    }
}

// 处理分页变化事件
const handlePageChangeFunc = (page) => {
    currentPage.value = page; // 更新当前页码
    fetchRoleListDataFunc(); // 获取角色列表数据
};

// 处理分页大小变化事件
const handlePageSizeChangeFunc = (size) => {
    pageSize.value = size; // 更新每页显示的数据条数
    currentPage.value = 1; // 重置到第一页
    fetchRoleListDataFunc(); // 获取角色列表数据
};

// 删除操作
const deleteItemFunc = async (roleCode) => {
    const params = { "roleCode": roleCode };
    const response = await removeByRoleCode(params);
    if (response.data.code === 200 && response.data.data === true) {
        message.success("删除成功", 2);
        fetchRoleListDataFunc();
        return;
    }
    message.error("删除失败", 2);

};

// ==================================================列表js逻辑结束====================================================

// 组件挂载后执行的操作
onMounted(async () => {
    fetchRoleListDataFunc(); // 获取角色列表数据
});
</script>

<style scoped>
/* 标题区域样式 */
.title_region {
    padding: 16px;
    /* 标题区域的内边距 */
}

/* 列表视图容器样式 */
.list-view-container {
    display: flex;
    /* 采用 Flex 布局 */
    height: 94%;
    /* 列表容器的高度占可用空间的 94% */
    padding: 16px;
    /* 列表容器的内边距 */
    background-color: #f4f4f9;
    /* 背景颜色为淡灰色 */
}

/* ====================================================列表样式start=============================================== */
/* 列表视图样式 */
.list-view {
    width: 100%;
    /* 列表视图宽度占据父容器的 100% */
    padding: 16px;
    /* 列表视图的内边距 */
    background-color: #fff;
    /* 背景颜色为白色 */
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    /* 设置盒阴影效果，颜色为黑色，透明度为 10% */
    border-radius: 8px;
    /* 圆角半径为 8px */
    display: flex;
    /* 采用 Flex 布局 */
    flex-direction: column;
    /* 子元素按列排列 */
}

/* 列表头部样式 */
.list-header {
    display: flex;
    /* 采用 Flex 布局 */
    justify-content: space-between;
    /* 子元素两端对齐 */
    align-items: center;
    /* 子元素垂直居中 */
    padding: 16px;
    /* 列表头部的内边距 */
    background-color: #f5f5f5;
    /* 背景颜色为浅灰色 */
    border-radius: 8px;
    /* 圆角半径为 8px */
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    /* 设置盒阴影效果 */
    margin-bottom: 16px;
    /* 列表头部与下方内容的间距 */
    border-bottom: 1px solid #e8e8e8;
    /* 下边框颜色为浅灰色 */
}

/* 列表控件样式 */
/* 搜索控件样式 */
.list-controls {
    display: flex;
    /* 采用 Flex 布局 */
    align-items: center;
    /* 子元素垂直居中 */
}

.search-label {
    margin-right: 16px;
    /* 搜索标签与输入框之间的间距 */
    font-weight: bold;
    /* 加粗字体 */
}

.list-controls input {
    padding: 8px;
    /* 输入框的内边距 */
    border: 1px solid #e8e8e8;
    /* 边框颜色为浅灰色 */
    border-radius: 4px;
    /* 圆角半径为 4px */
    margin-right: 8px;
    /* 输入框与按钮之间的间距 */
}

.list-controls .btn {
    margin-right: 30px;
    /* 按钮与其他控件之间的间距 */
}

.list-controls .btn:hover {
    background-color: #40a9ff;
    /* 鼠标悬停时，按钮背景颜色为浅蓝色 */
}

.role-info {
    position: relative;
    /* 设置为相对定位，以便显示悬浮提示 */
    display: inline-block;
    /* 使元素呈现为行内块状元素 */
    cursor: pointer;
    /* 鼠标悬停时显示为指针手型 */
}

/* 角色列样式 */
.role-info::after {
    content: attr(title);
    /* 内容取自元素的 title 属性 */
    position: absolute;
    /* 设置为绝对定位 */
    bottom: 100%;
    /* 定位在元素的上方 */
    left: 50%;
    /* 水平居中 */
    transform: translateX(-50%);
    /* 通过偏移量确保居中 */
    background-color: #333;
    /* 背景颜色为深灰色 */
    color: #fff;
    /* 字体颜色为白色 */
    padding: 5px;
    /* 内边距 */
    border-radius: 4px;
    /* 圆角半径为 4px */
    white-space: nowrap;
    /* 内容不换行 */
    visibility: hidden;
    /* 初始状态下不显示 */
    opacity: 0;
    /* 初始状态下透明 */
    transition: opacity 0.3s;
    /* 透明度的过渡效果持续 0.3 秒 */
    z-index: 1;
    /* 提升层级，使其显示在其他内容之上 */
}

.role-info:hover::after {
    visibility: visible;
    /* 鼠标悬停时显示提示 */
    opacity: 1;
    /* 鼠标悬停时不透明 */
}

/* 加载状态指示器 */
.loading-spinner {
    position: absolute;
    /* 设置为绝对定位 */
    top: 50%;
    /* 垂直居中 */
    left: 50%;
    /* 水平居中 */
    transform: translate(-50%, -50%);
    /* 将加载指示器完全居中 */
    font-size: 24px;
    /* 字体大小 */
}

/* 列表内容区域样式 */
.list-content {
    flex-grow: 1;
    /* 使内容区域占满剩余空间 */
    overflow-y: auto;
    /* 垂直方向出现滚动条 */
    margin-top: 16px;
    /* 内容区域与头部的间距 */
}

/* 加载动画样式 */
.loading-spinner {
    display: flex;
    /* 采用 Flex 布局 */
    justify-content: center;
    /* 水平居中 */
    align-items: center;
    /* 垂直居中 */
    height: 100%;
    /* 高度占满父容器 */
}

.loading-spinner::before {
    content: '';
    /* 不显示文字 */
    width: 50px;
    /* 宽度 */
    height: 50px;
    /* 高度 */
    border: 5px solid #ccc;
    /* 边框颜色为浅灰色 */
    border-top: 5px solid #007bff;
    /* 上边框颜色为蓝色，形成旋转效果 */
    border-radius: 50%;
    /* 边框圆角变为圆形 */
    animation: spin 1s linear infinite;
    /* 设置旋转动画 */
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
        /* 动画开始时旋转角度为 0 */
    }

    100% {
        transform: rotate(360deg);
        /* 动画结束时旋转一周 */
    }
}

/* 表格样式 */
.table {
    width: 100%;
    /* 表格宽度占满父容器 */
    border-collapse: collapse;
    /* 合并表格边框 */
    border-radius: 8px;
    /* 圆角半径为 8px */
    overflow: hidden;
    /* 隐藏溢出内容 */
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    /* 设置盒阴影效果 */
}

.table th,
.table td {
    padding: 12px 16px;
    /* 表格单元格的内边距 */
    border-bottom: 1px solid #e8e8e8;
    /* 单元格底部边框颜色 */
}

/* 设置光标样式 */
.table th,
.table td {
    cursor: pointer;
    /* 鼠标悬停时显示为指针手型 */
}

.table th {
    background-color: #fafafa;
    /* 表头背景颜色为浅灰色 */
}

/* 设置鼠标悬停时的背景色 */
.table-row:hover {
    background-color: #10945f;
    /* 鼠标悬停时行的背景颜色变为绿色 */
    color: white;
    /* 鼠标悬停时文本颜色变为白色 */
}

.table-row td {
    background-color: transparent;
    /* 表格内容区域的背景色为透明 */
}

/* 按钮样式 */
.table .btn {
    padding: 4px 8px;
    /* 按钮内边距 */
    border: none;
    /* 无边框 */
    border-radius: 6px;
    /* 圆角半径为 6px */
    cursor: pointer;
    /* 鼠标悬停时显示为指针手型 */
}

.table .btn-warning:hover {
    background-color: #f7ef12;
    /* 鼠标悬停时，警告按钮背景颜色为黄色 */
}

.table .btn-danger {
    background-color: #ff4d4f;
    /* 删除按钮的背景颜色为红色 */
    color: #fff;
    /* 按钮文本颜色为白色 */
}

.table .btn-danger:hover {
    background-color: #ff7875;
    /* 鼠标悬停时，删除按钮背景颜色变浅 */
}

/* 淡入淡出动画样式 */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
    /* 透明度过渡效果持续 0.5 秒 */
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
    /* 进入或离开时透明度为 0 */
}

/* 列表页脚按钮样式 */
.list-footer button {
    margin: 0 8px;
    /* 按钮与其他元素的间距 */
    padding: 8px 16px;
    /* 按钮的内边距 */
    background-color: #007bff;
    /* 背景颜色为蓝色 */
    color: white;
    /* 文本颜色为白色 */
    border: none;
    /* 无边框 */
    cursor: pointer;
    /* 鼠标悬停时显示为指针手型 */
    transition: background-color 0.3s;
    /* 背景颜色过渡效果持续 0.3 秒 */
}

/* ====================================================列表样式end=============================================== */

/* ====================================================抽屉样式start=============================================== */
/* 抽屉内容样式 */
.form-group-row {
    display: flex;
    /* 采用 Flex 布局 */
    align-items: center;
    /* 子元素垂直居中 */
    margin-bottom: 0.5rem;
    /* 每组表单元素的下边距 */
}

.form-label {
    flex: 0 0 30%;
    /* 标签宽度占父容器的 30% */
    font-weight: bold;
    /* 加粗字体 */
    color: #005d54;
    /* 墨绿色字体 */
    margin-right: 0.5rem;
    /* 标签与输入框之间的间距 */
}

.form-input {
    flex: 1;
    /* 输入框宽度占剩余空间 */
    margin-left: 0.5rem;
    /* 输入框与标签之间的间距 */
}

/* 抽屉底部样式 */
.drawer-content {
    padding: 1rem;
    /* 抽屉内容的内边距 */
}

.form-group {
    display: flex;
    /* 采用 Flex 布局 */
    align-items: center;
    /* 子元素垂直居中 */
    margin-bottom: 1rem;
    /* 每组表单元素的下边距 */
}

.form-group label {
    font-weight: bold;
    /* 加粗字体 */
    color: #004d00;
    /* 墨绿色字体 */
    margin-right: 1rem;
    /* 标签与输入框之间的间距 */
    flex: 0 0 80px;
    /* 标签宽度为 80px */
    text-align: right;
    /* 标签文字右对齐 */
}

.form-group .a-input,
.form-group .a-tree-select,
.form-group .a-input-password {
    width: 70%;
    /* 输入框、下拉选择框及密码框宽度占父容器的 70% */
}

.drawer-footer {
    position: absolute;
    /* 设置为绝对定位 */
    bottom: 0;
    /* 定位在底部 */
    right: 0;
    /* 定位在右侧 */
    width: calc(100% - 1rem);
    /* 宽度为父容器宽度减去 1rem */
    padding: 1rem;
    /* 内边距 */
    background-color: #f9f9f9;
    /* 背景颜色为浅灰色 */
    border-top: 1px solid #e8e8e8;
    /* 上边框颜色为浅灰色 */
    display: flex;
    /* 采用 Flex 布局 */
    justify-content: flex-end;
    /* 子元素右对齐 */
    gap: 0.5rem;
    /* 子元素之间的间距 */
}

.drawer-footer .btn-cancel {
    background-color: #4a6a41;
    /* 取消按钮的背景颜色为墨绿色 */
    color: #fff;
    /* 按钮文本颜色为白色 */
    border: none;
    /* 无边框 */
    transition: background-color 0.3s;
    /* 背景颜色过渡效果持续 0.3 秒 */
}

.drawer-footer .btn-cancel:hover {
    background-color: #3b5a32;
    /* 鼠标悬停时，取消按钮背景颜色变深 */
}

.drawer-footer .btn-save {
    background-color: #007f00;
    /* 保存按钮的背景颜色为绿色 */
    color: #fff;
    /* 按钮文本颜色为白色 */
    border: none;
    /* 无边框 */
    transition: background-color 0.3s;
    /* 背景颜色过渡效果持续 0.3 秒 */
}

.drawer-footer .btn-save:hover {
    background-color: #005d00;
    /* 鼠标悬停时，保存按钮背景颜色变深 */
}

/* ====================================================抽屉样式end=============================================== */
/* 按钮样式 */
.btn {
    display: inline-flex;
    /* 采用行内弹性布局 */
    padding: 0.5rem 1rem;
    /* 按钮的内边距 */
    font-size: 1rem;
    /* 按钮字体大小 */
    border-radius: 0.25rem;
    /* 按钮的圆角半径 */
    transition: background-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    /* 设置背景颜色和阴影的过渡效果 */
}
</style>