<template>
    <div class="title_region">
        <!-- 面包屑导航区域 -->
        <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
                <li class="breadcrumb-item"><a href="#">用户中台</a></li>
                <li class="breadcrumb-item"><a href="#">用户管理</a></li>
                <li class="breadcrumb-item active" aria-current="page">用户列表</li>
            </ol>
        </nav>
    </div>

    <div class="list-view-container">
        <!-- 左侧树组件区域 -->
        <div class="tree-view">
            <!-- 树组件，用于显示组织结构 -->
            <a-tree :tree-data="treeData" :fieldNames="{ children: 'children', title: 'name', key: 'code' }"
                @select="handleSelectNode">
                <template #title="{ name }">
                    <!-- 树节点标题，带有上下文菜单 -->
                    <a-dropdown>
                        <span>{{ name }}</span>
                        <template #overlay>
                            <!-- 上下文菜单内容 -->
                            <a-menu @click="({ key: menuKey }) => onContextMenuClick(key, menuKey)">
                                <a-menu-item key="1">1st menu item</a-menu-item>
                                <a-menu-item key="2">2nd menu item</a-menu-item>
                                <a-menu-item key="3">3rd menu item</a-menu-item>
                            </a-menu>
                        </template>
                    </a-dropdown>
                </template>
            </a-tree>
        </div>

        <!-- 列表区域 -->
        <div class="list-view">
            <!-- 列表header区域 -->
            <div class="list-header">
                <div class="list-controls">
                    <!-- 用户名搜索框 -->
                    <label style="margin-right: 16px;" class="search-label">用户名</label>
                    <input type="text" v-model="userNameKeyword" placeholder="用户名搜索..." @input="searchData" />
                    <!-- 手机号搜索框 -->
                    <label style="margin-right: 16px;" class="search-label">手机号</label>
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
                <button @click="doAddShowDrawer()" class="btn btn-info" style="position: absolute; right: 3%">
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
                        <tr v-for="userData in userDataList" :key="userData.id" class="table-row">
                            <!-- 表格数据 -->
                            <td v-for="column in list_view_columns" :key="column.value">
                                <template v-if="column.name == '是否启用'">
                                    <!-- @click="handleConfirm"  -->
                                    <a-popconfirm title="确定要改变激活状态吗?" ok-text="Yes" cancel-text="No"
                                        @confirm="dataEnableFunc(userData)">
                                        <div style="position: relative;">
                                            <a-switch v-model:checked="userData[column.value]" checked-children="启用"
                                                un-checked-children="禁用" />
                                            <div style="position: absolute;inset: 0;"></div>
                                        </div>
                                    </a-popconfirm>
                                </template>
                                <template v-else-if="column.name == '所属角色'">
                                    <div class="role-info" :title="getRolesTooltip(userData)">
                                        {{ getRolesDisplay(userData.roleList) }}
                                    </div>
                                </template>
                                <template v-else>
                                    {{ userData[column.value] }}
                                </template>
                            </td>
                            <!-- 操作按钮 -->
                            <td>
                                <button class="btn btn-sm btn-warning" @click="doEditShowDrawer(userData)">
                                    编辑
                                </button>
                                <a-popconfirm title="您确定要删除这条记录吗?" ok-text="确定" cancel-text="取消"
                                    @confirm="removeByUserCodeFunc(userData.userCode)">
                                    <button class="btn btn-sm btn-danger" style="margin-left: 2.5%;">
                                        删除
                                    </button>
                                </a-popconfirm>
                                <button class="btn btn-sm btn-warning" @click="doResetPassWordShowDrawer(userData)"
                                    style="margin-left: 2.5%;">
                                    密码重置
                                </button>
                                <a-popconfirm title="确定要重置MFA设备吗?" ok-text="Yes" cancel-text="No"
                                    @confirm="resetMfaFunc(userData)">
                                    <button class="btn btn-sm btn-warning" style="margin-left: 2.5%;">
                                        MFA重置
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

            <div>
                <a-drawer :title="rightDrawerTitle" :closable="false" :open="showDrawer" @close="doOnClose">
                    <!-- 表单项 -->
                    <div class="drawer-content">
                        <div v-for="column in modal_view_columns" :key="column.name" class="form-group">
                            <label :for="column.name">
                                <i class="bi bi-person"></i> {{ column.name }}：
                            </label>
                            <!-- 非机构选择项的输入框 -->
                            <a-input
                                v-show="column.value !== 'organizationCode' && column.value !== 'loginPwd' && column.value !== 'activeStatus' && column.value !== 'roleList'"
                                :value="currentUserData[column.value]"
                                @input="event => currentUserData[column.value] = event.target.value"
                                :disabled=column.disabled :id="column.name" />
                            <!-- 机构选择项的下拉框 -->
                            <a-tree-select v-show="column.value === 'organizationCode'" style="width: 100%"
                                :value="currentUserData[column.value]"
                                @change="value => currentUserData[column.value] = value" :tree-data="treeData"
                                :fieldNames="{ children: 'children', label: 'name', value: 'code' }"
                                placeholder="请选择" />
                            <!-- 密码框 -->
                            <a-space v-show="column.value === 'loginPwd'" class="full-width">
                                <a-input-password placeholder="输入密码" defaultValue=""
                                    @input="event => currentUserData[column.value] = event.target.value"
                                    style="width: 100%" />
                            </a-space>
                            <!-- 角色select -->
                            <a-select v-show="column.value === 'roleList'" v-model:value="suffRoleList" mode="multiple"
                                :maxTagCount="3" style="width: 100%" placeholder="请选择" :options="allRoleDataList"
                                :field-names="{ label: 'roleName', value: 'roleCode' }">
                            </a-select>

                            <!-- 是否启用 -->
                            <template v-if="column.value == 'activeStatus'">
                                <a-switch v-model:checked="currentUserData[column.value]" />
                            </template>
                        </div>
                    </div>
                    <div class="drawer-footer">
                        <a-button @click="doOnClose" class="btn-cancel">取消</a-button>
                        <a-button type="primary" @click="rightDrawerSaveFunc" class="btn-save">保存</a-button>
                    </div>
                </a-drawer>
            </div>
        </div>
    </div>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import Pagination from '@/components/common-components/pagenation.vue';
import { addUserInfo, changeEnable, editUserInfo, getOrganizationList, getUserInfoList, removeByUserCode, resetLoginPwd, resetMfaData } from '@/components/user-system/user-manager/api/UserManager';
import { getAllRoleList } from '../role-manager/api/RoleManager';
import { message, Modal } from 'ant-design-vue';
import { h } from 'vue';

// ==============================================抽屉组件js start==============================================
//抽屉组件
// 控制抽屉显示/隐藏的状态
// 定义新增列的数据
const add_view_columns = ref([
    { name: '用户名', value: 'userName', disabled: false },
    { name: '登录名', value: 'loginName', disabled: false },
    { name: '手机号', value: 'phone', disabled: false },
    { name: '所属机构', value: 'organizationCode', disabled: false },
    { name: '所属角色', value: 'roleList', disabled: false },
    { name: '密码', value: 'loginPwd', disabled: false },
    { name: '是否启用', value: 'activeStatus', disabled: false },
]);
// 定义编辑列的数据
const edit_view_columns = ref([
    { name: '用户名', value: 'userName', disabled: false },
    { name: '登录名', value: 'loginName', disabled: false },
    { name: '手机号', value: 'phone', disabled: false },
    { name: '所属机构', value: 'organizationCode', disabled: false },
    { name: '所属角色', value: 'roleList', disabled: false },
    { name: '是否启用', value: 'activeStatus', disabled: false },
]);
// 定义重置密码列的数据
const reset_password_view_columns = ref([
    { name: '用户名', value: 'userName', disabled: true },
    { name: '登录名', value: 'loginName', disabled: true },
    { name: '手机号', value: 'phone', disabled: true },
    { name: '密码', value: 'loginPwd', disabled: false },
]);
const currentUserData = ref({});
const selectedOrgId = ref(null);
const loading = ref(false);
const showDrawer = ref(false);
const rightDrawerTitle = ref('');
const allRoleDataList = ref([]);
const suffRoleList = ref([]);
const drawerOperationType = ref(0);

const doAddShowDrawer = () => {
    drawerOperationType.value = 0;
    rightDrawerTitle.value = '新增信息';
    currentUserData.value = {}; // 初始化 currentUserData 为一个空对象
    currentUserData.value.organizationCode = selectedOrgId.value; // 从 ref 中获取值并赋给 currentUserData
    showDrawer.value = true;
    modal_view_columns.value = add_view_columns.value;
    suffRoleList.value = [];
    getAllRoleDataList();

}

// 编辑信息
const doEditShowDrawer = (userData) => {
    drawerOperationType.value = 1;
    rightDrawerTitle.value = '编辑信息';
    currentUserData.value = { ...userData };
    showDrawer.value = true;
    modal_view_columns.value = edit_view_columns.value;
    suffRoleList.value = userData.roleList.map(role => role.roleCode) || [];
    getAllRoleDataList();
}

// 重置密码
const doResetPassWordShowDrawer = (userData) => {
    drawerOperationType.value = 2;
    rightDrawerTitle.value = '重置密码';
    currentUserData.value = { ...userData };
    currentUserData.value.loginPwd = "1";
    showDrawer.value = true;
    modal_view_columns.value = reset_password_view_columns.value;
}

const doOnClose = () => {
    modal_view_columns.value = [];
    showDrawer.value = false;
};

const getAllRoleDataList = async () => {
    //点击编辑时，获取角色信息
    const params = {};
    const roleResponse = await getAllRoleList(params);
    allRoleDataList.value = roleResponse.data.data;
}

// 保存/新增
const rightDrawerSaveFunc = async () => {
    // 模拟保存操作
    try {
        //edit
        const params = { ...currentUserData.value, roleCodeList: suffRoleList.value || [] };
        if (drawerOperationType.value === 0) { // 新增
            const response = await addUserInfo(params);
            if (!(response.data.code === 200 && response.data.data === true)) {
                message.error(response.data.message, 2);
                return;
            }
            message.success("操作成功", 2);
            fetchUserListDataFunc();
            doOnClose();
            return;
        }
        if (drawerOperationType.value === 1) { // 修改
            const response = await editUserInfo(params);
            if (!(response.data.code === 200 && response.data.data === true)) {
                message.error(response.data.message, 2);
                return;
            }
            message.success("操作成功", 2);
            fetchUserListDataFunc();
            doOnClose();
            return;
        }
        if (drawerOperationType.value === 2) { // 重置密码
            const response = await resetLoginPwd(params);
            if (!(response.data.code === 200 && response.data.data === true)) {
                message.error(response.data.message, 2);
                return;
            }
            message.success("操作成功", 2);
            doOnClose();
            return;
        }
    } catch (error) {
        console.error('Error saving item:', error);
    }
};

// ==============================================抽屉组件js end==============================================

// ==============================================列表组件js start==============================================
//列表组件
// 定义列的数据
const list_view_columns = ref([
    { name: '用户名', value: 'userName' },
    { name: '登录名', value: 'loginName' },
    { name: '手机号', value: 'phone' },
    { name: '所属机构', value: 'organizationName' },
    { name: '所属角色', value: '' },
    { name: '是否启用', value: 'activeStatus' },
]);

const modal_view_columns = ref([]);

// 搜索条件
const userNameKeyword = ref('');
const phoneKeyword = ref('');
const searchQuery = ref('');

// 数据列表
const userDataList = ref([]);
const totalCount = ref(0);
const currentPage = ref(1);
const pageSize = ref(10); // 初始化每页显示10条

const open = ref(false);

const showModal = () => {
    open.value = true;
};


// 列表启用
const dataEnableFunc = async (userData) => {
    // 修改数据
    const params = { "id": userData.id, "activeStatus": !userData.activeStatus };
    const response = await changeEnable(params);
    if (response.data.code !== 200) {
        alert(response.data.message);
        return;
    } else {
        // 修改成功 - 调整按钮值
        userData.activeStatus = !userData.activeStatus
    }
}

// 重置MFA绑定码
const resetMfaFunc = async (userData) => {
    const params = { "userCode": userData.userCode };
    const response = await resetMfaData(params);
    if (response.data.code === 200) {
        message.success("重置MFA绑定码成功,绑定码 : " + response.data.data, 2)
        return;
    }
    message.error("重置MFA绑定码失败 : " + response.data.message, 2);
};

const success = () => {
    const dataModal = Modal.success({
        zIndex: 0,
        maskClosable: true,
        title: 'This is a success message',
        content: h('div', {}, [
            h('p', 'some messages...some messages...'),
            h('p', 'some messages...some messages...'),
        ]),
        closable: true,
        onOk: () => {
            // 确保 onOk 不返回任何内容，也不需要返回 Promise
            console.log("Modal closed");
            Modal.destroyAll();
        },
        onCancel: () => {
            // 确保 onOk 不返回任何内容，也不需要返回 Promise
            console.log("Modal closed");
            Modal.destroyAll();
        }
    });
}

// 处理分页变化事件
const handlePageChange = (page) => {
    currentPage.value = page;
    fetchUserListDataFunc();
};

// 处理分页大小变化事件
const handlePageSizeChange = (size) => {
    pageSize.value = size;
    currentPage.value = 1; // 重置到第一页
    fetchUserListDataFunc();
};

// 搜索数据
const searchData = async () => {
    currentPage.value = 1;
    fetchUserListDataFunc();
};

// 重置搜索条件
const resetData = async () => {
    userNameKeyword.value = null;
    phoneKeyword.value = null;
    currentPage.value = 1;
    fetchUserListDataFunc();
};

// 获取角色显示文本
const getRolesDisplay = (roleList) => {
    if (!Array.isArray(roleList)) {
        return '';
    }
    const roles = roleList.map(role => role.roleName);
    return roles.slice(0, 1).join(', ') + (roles.length > 1 ? '...' : '');
};
// 获取角色 tooltip 内容
const getRolesTooltip = (userData) => {
    if (!Array.isArray(userData.roleList)) {
        return '';
    }
    const roles = userData.roleList.map(role => role.roleName);
    return roles.join(', ');
};
// 获取数据列表
const fetchUserListDataFunc = async () => {
    loading.value = true;
    try {
        const params = {
            currentPage: currentPage.value,
            pageSize: pageSize.value,
            search: searchQuery.value,
            userNameKeyword: userNameKeyword.value,
            phoneKeyword: phoneKeyword.value,
            organizationCodeLike: selectedOrgId.value, // 使用组织 ID 进行过滤
        };
        // 请求数据
        const response = await getUserInfoList(params);
        // 响应处理
        userDataList.value = response.data.data.dataList;
        totalCount.value = response.data.data.totalCount;
    } catch (error) {
        console.error('Error fetching data:', error);
        message.error("服务开小差了哟", 2);
    } finally {
        loading.value = false;
    }
};
// 重置用户密码
const resetLoginPwdFunc = async (userCode) => {
    const params = { ...currentUserData.value };
    const response = await resetLoginPwd(params);
    if (response.data.code !== 200) {
        alert(response.data.message);
        return;
    }
    message.error("服务开小差了哟", 2);
}
// 通过code删除用户
const removeByUserCodeFunc = async (userCode) => {
    const params = { "userCode": userCode };
    const response = await removeByUserCode(params);
    if (response.data.code !== 200) {
        alert(response.data.message);
        return;
    }
    currentPage.value = 1; // 重置到第一页
    fetchUserListDataFunc();
}
// ==============================================列表组件js end==============================================

// ==============================================tree组件js start==============================================
// 树组件数据
const treeData = ref([]);
// 处理树节点选择事件
const handleSelectNode = (node) => {
    selectedOrgId.value = node[0];
    currentPage.value = 1; // 重置分页参数
    fetchUserListDataFunc();
};

// 获取组织列表数据
const fetchOrganizationListData = async () => {
    try {
        const params = {
        }
        const response = await getOrganizationList(params);
        treeData.value = response.data.data;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

// ==============================================tree组件js end==============================================
// 组件挂载时初始化数据
onMounted(() => {
    fetchUserListDataFunc();
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
    background-color: #f0f2f5;
    gap: 16px;
    padding: 16px;
    background-color: #f4f4f9;
}

/* 树视图样式 */
.tree-view {
    width: 10%;
    padding: 16px;
    background-color: #fff;
    border-right: 1px solid #e8e8e8;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    overflow-y: auto;
    border-radius: 8px;
}

/* ====================================================列表样式start=============================================== */
/* 列表视图样式 */
.list-view {
    width: 90%;
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

/* 将操作列的标题和内容居中对齐 */
.table th:last-child,
.table td:last-child {
    text-align: center;
    /* 水平居中对齐 */
}

/* 为操作列的按钮设置样式，使其更加整齐 */
.table td:last-child .btn {
    margin: 0 4px;
    /* 按钮之间的间距 */
}

/* 设置光标样式 */
.table th,
.table td {
    padding: 12px 16px;
    border-bottom: 1px solid #e8e8e8;
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

/* 角色列样式 */
.role-info {
    position: relative;
    display: inline-block;
    cursor: pointer;
}

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

/* 按钮样式 */
.table .btn {
    padding: 4px 8px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}

.table .btn-info:hover {
    background-color: #16e1c9;
}

.table .btn-warning:hover {
    background-color: #f7ef12;
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

/* 为多选树组件添加样式 */
.tree-container {
    position: relative;
    display: inline-block;
    width: 100%;
    height: auto;
}

/* ====================================================抽屉样式start=============================================== */
/* 抽屉内容样式 */
.drawer-content {
    padding: 1rem;
    /* 背景颜色 */
}

.form-group {
    margin-bottom: 1rem;
}

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
/* 按钮样式 */
.btn {
    display: inline-flex;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    border-radius: 0.25rem;
    transition: background-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}
</style>
