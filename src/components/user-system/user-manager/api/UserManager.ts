import { ajax_get, ajax_post } from "@/components/common-components/api/Ajax";


// 获取用户列表
export const getUserInfoList = (params) => {
    return ajax_get("keeay-user", "/keeay-user/api/userinfo/pageList", params);
}

// 获取组织结构
export const getOrganizationList = (params) => {
    return ajax_post("keeay-user", "/keeay-user/api/organization/info/getTreeList", params);
}

// 新增用户信息
export const addUserInfo = (params) => {
    return ajax_post("keeay-user", "/keeay-user/api/userinfo/add", params);
}

// 编辑用户信息
export const editUserInfo = (params) => {
    return ajax_post("keeay-user", "/keeay-user/api/userinfo/editById", params);
}


// 编辑用户信息
export const removeByUserCode = (params) => {
    return ajax_post("keeay-user", "/keeay-user/api/userinfo/removeByUserCode", params);
}


// 编辑用户信息
export const changeEnable = (params) => {
    return ajax_post("keeay-user", "/keeay-user/api/userinfo/changeEnable", params);
}

// 重置用户密码信息
export const resetLoginPwd = (params) => {
    return ajax_post("keeay-user", "/keeay-user/api/userinfo/resetPassword", params);
}


