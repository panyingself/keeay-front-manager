import { ajax_get, ajax_get_blob, ajax_post } from "@/components/common-components/api/Ajax";

// 获取获取二维码连接
export const fetchMfaQrCodeUrl = (params) => {
    return ajax_get_blob("keeay-auth","/keeay-auth/api/mfa/generate-qr", params);
}

// 验证otpCode
export const verifyOtpCode = (params) => {
    return ajax_post("keeay-auth","/keeay-auth/api/mfa/verify-otp", params);
}

// 获取组织结构
export const verifyDeviceCode = (params) => {
    return ajax_post("keeay-auth","/keeay-auth/api/mfa/bindCode/info/verifyCode", params);
}

