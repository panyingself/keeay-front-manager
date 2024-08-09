import { ajax_get, ajax_post } from "@/components/common-components/api/Ajax";

// 获取角色结构
export const getRoleList = (params) => {
    return ajax_post("keeay-user","/keeay-user/api/role/info/pageList", params);
}

// 获取角色结构
export const getAllRoleList = (params) => {
    return ajax_post("keeay-user","/keeay-user/api/role/info/list", params);
}

// 新增角色机构
export const addRoleInfo = (params) => {
    return ajax_post("keeay-user", "/keeay-user/api/role/info/add", params);
}

// 编辑角色机构
export const editRoleInfo = (params) => {
    return ajax_post("keeay-user", "/keeay-user/api/role/info/editById", params);
}