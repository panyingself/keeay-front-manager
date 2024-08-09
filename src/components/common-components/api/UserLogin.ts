import { ajax_post, projects } from "./Ajax";



export const accreditForAccount = (params) => {
    return ajax_post(projects["keeay-user"], "http://localhost:8087/keeay-auth/api/accredit/user/accreditForAccount", params);
}