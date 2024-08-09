import { ajax_get, ajax_post } from "@/components/common-components/api/Ajax";

// 获取菜单
export const getMenuList = (params) => {
    return ajax_post("keeay-user","/keeay-user/api/menu/getTreeList", params);
}

// 新增菜单
export const addMenuInfo = (params) => {
    return ajax_post("keeay-user", "/keeay-user/api/menu/add", params);
}

// 编辑菜单
export const editMenuInfo = (params) => {
    return ajax_post("keeay-user", "/keeay-user/api/menu/editById", params);
}

// 编辑菜单
export const deleteMenuInfo = (params) => {
    return ajax_post("keeay-user", "/keeay-user/api/menu/deleteByCode", params);
}