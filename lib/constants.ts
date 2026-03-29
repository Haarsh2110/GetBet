export const APP_CONFIG = {
    admin: {
        path: process.env.NEXT_PUBLIC_ADMIN_PATH || '/admin',
        loginPath: process.env.NEXT_PUBLIC_ADMIN_LOGIN_PATH || '/admin-login',
    },
    master: {
        path: process.env.NEXT_PUBLIC_MASTER_PATH || '/master',
        loginPath: process.env.NEXT_PUBLIC_MASTER_LOGIN_PATH || '/master/login',
    }

};
