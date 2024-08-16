import { ajax_post } from "@/components/common-components/api/Ajax";

// 获取菜单
export const getMenuList = (params) => {
    return ajax_post("keeay-user","/keeay-user/api/menu/info/getTreeList", params);
}

// 获取菜单
export const getMenuByCode = (params) => {
    return ajax_post("keeay-user","/keeay-user/api/menu/info/fetchDetailByCode", params);
}

// 新增菜单
export const addMenuInfo = (params) => {
    return ajax_post("keeay-user", "/keeay-user/api/menu/info/add", params);
}

// 编辑菜单
export const editMenuInfo = (params) => {
    return ajax_post("keeay-user", "/keeay-user/api/menu/info/editById", params);
}

// 编辑菜单
export const removeMenuInfo = (params) => {
    return ajax_post("keeay-user", "/keeay-user/api/menu/info/removeByCode", params);
}