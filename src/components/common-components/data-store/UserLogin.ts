//导入pinia框架
import { defineStore } from 'pinia';

//定义登录用户数据状态管理
interface loginUserInfo {
    userName: String,
    jwt: String
}

//定义用户登录信息store
export const useLoginUserStore = defineStore('userLoginStore', {
    state: (): loginUserInfo => {
        return {
            userName: '',
            jwt: ''
        }
    },
    actions: {
        clearData() {
            this.jwt = null;
            this.userName = null;
        },
    },
    persist: true
});

