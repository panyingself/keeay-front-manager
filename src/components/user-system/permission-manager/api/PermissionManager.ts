import { ajax_get, ajax_post } from "@/components/common-components/api/Ajax";

// 获取列表
export const getPagePermissionList = (params) => {
    return ajax_post("keeay-user","/keeay-user/api/permission/info/pageList", params);
}

// 获取列表
export const getPermissionList = (params) => {
    return ajax_post("keeay-user","/keeay-user/api/permission/info/list", params);
}

// 新增权限
export const addPermissionInfo = (params) => {
    return ajax_post("keeay-user", "/keeay-user/api/permission/info/add", params);
}

// 编辑权限
export const editPermissionInfo = (params) => {
    return ajax_post("keeay-user", "/keeay-user/api/permission/info/editById", params);
}

// 删除权限
export const deletePermissionInfo = (params) => {
    return ajax_get("keeay-user", "/keeay-user/api/permission/info/deleteByCode", params);
}