import { ajax_post } from "@/components/common-components/api/Ajax";


// 用户登录
export const userLogin = (params) => {
    return ajax_post("keeay-auth","/keeay-auth/api/accredit/user/accreditForAccount", params);
}


