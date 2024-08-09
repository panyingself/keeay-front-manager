import { ajax_get, ajax_post } from "@/components/common-components/api/Ajax";

// 获取组织结构
export const getUserMenuTreeList = (params) => {
    return ajax_get("keeay-user","/keeay-user/api/menu/getUserTreeList", params);
}