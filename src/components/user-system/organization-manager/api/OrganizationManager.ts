import { ajax_get, ajax_post } from "@/components/common-components/api/Ajax";

// 获取组织结构
export const fetchOrganizationDetailById = (params) => {
    return ajax_get("keeay-user","/keeay-user/api/organization/info/fetchDetailById", params);
}

// 获取组织结构
export const getOrganizationList = (params) => {
    return ajax_post("keeay-user","/keeay-user/api/organization/info/getTreeList", params);
}

// 新增组织机构
export const addOrganizationInfo = (params) => {
    return ajax_post("keeay-user", "/keeay-user/api/organization/info/add", params);
}

// 编辑组织机构
export const editOrganizationInfo = (params) => {
    return ajax_post("keeay-user", "/keeay-user/api/organization/info/editById", params);
}

// 删除组织机构
export const removeOrganizationInfo = (params) => {
    return ajax_get("keeay-user", "/keeay-user/api/organization/info/removeByCode", params);
}