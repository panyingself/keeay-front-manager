import { ajax_get, ajax_post } from "@/components/common-components/api/Ajax";


// 用户登录
export const userLogin = (params) => {
    return ajax_post("keeay-auth","/keeay-auth/api/accredit/user/accreditForAccount", params);
}

// 用户登录 - 权限
export const fetchUserMenuTreeList = (params) => {
    return ajax_get("keeay-user","/keeay-user/api/menu/info/getUserTreeList", params);
}


