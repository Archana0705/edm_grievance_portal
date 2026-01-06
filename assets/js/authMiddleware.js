// // authMiddleware.js

// const ROUTE_PERMISSIONS = {
//     // Admin pages - only accessible by admin
//     'admin.html': ['admin'],
//     'dashboard.html': ['admin', 'helpdesk', 'operator'],
//     'dashboard_copy.html': ['admin'],
//     'dashboard_dropdown_copy.html': ['admin'],

//     // Helpdesk pages
//     'helpdesk.html': ['helpdesk', 'admin'],
//     'helpdesk_bad.html': ['helpdesk', 'admin'],

//     // Operator pages
//     'operator.html': ['operator', 'admin'],

//     // User pages
//     'index.html': ['user', 'admin', 'helpdesk', 'operator'],
//     'landing_21.html': ['user', 'admin', 'helpdesk', 'operator'],
//     'landing-faq.html': ['user', 'admin', 'helpdesk', 'operator'],

//     // Public pages (no auth required)
//     'login.html': ['*'],
//     'index-old.html': ['*'],
//     'fog.html': ['*'] // forgot password page
// };

// // Redirect routes based on role
// const ROLE_REDIRECTS = {
//     'admin': 'dashboard.html',
//     'helpdesk': 'helpdesk.html',
//     'operator': 'operator.html',
//     'user': 'index.html'
// };

// class AuthMiddleware {
//     static isAuthenticated() {
//         const role = localStorage.getItem("role");
//         const usernameKeyMap = {
//             "helpdesk": "helpdesk_user_name",
//             "user": "user_name",
//             "admin": "admin_name",
//             "operator": "operator_name"
//         };

//         if (!role) return false;

//         const usernameKey = usernameKeyMap[role];
//         return !!localStorage.getItem(usernameKey);
//     }

//     static getCurrentRole() {
//         return localStorage.getItem("role") || 'user';
//     }

//     static getUserName() {
//         const role = this.getCurrentRole();
//         const usernameKeyMap = {
//             "helpdesk": "helpdesk_user_name",
//             "user": "user_name",
//             "admin": "admin_name",
//             "operator": "operator_name"
//         };

//         const usernameKey = usernameKeyMap[role];
//         return localStorage.getItem(usernameKey) || "User";
//     }

//     static checkPermission(pageName, userRole) {
//         const permissions = ROUTE_PERMISSIONS[pageName];

//         // If page not in permissions list, deny access by default
//         if (!permissions) {
//             console.warn(`Page ${pageName} not in permissions list. Access denied.`);
//             return false;
//         }

//         // Allow if page is public
//         if (permissions.includes('*')) {
//             return true;
//         }

//         // Check if user role has permission
//         return permissions.includes(userRole);
//     }

//     static redirectIfNotAuthenticated() {
//         const currentPage = window.location.pathname.split('/').pop();

//         // Skip auth check for public pages
//         if (ROUTE_PERMISSIONS[currentPage] && ROUTE_PERMISSIONS[currentPage].includes('*')) {
//             return;
//         }

//         if (!this.isAuthenticated()) {
//             window.location.href = 'login.html';
//             return;
//         }

//         // If authenticated, check permissions
//         const userRole = this.getCurrentRole();
//         if (!this.checkPermission(currentPage, userRole)) {
//             // Redirect to default page for user's role
//             const redirectPage = ROLE_REDIRECTS[userRole] || 'index.html';
//             window.location.href = redirectPage;
//         }
//     }

//     static login(userData) {
//         const { role, username, usernameKey } = userData;

//         localStorage.setItem("role", role);
//         localStorage.setItem(usernameKey, username);

//         // Set session timeout (24 hours)
//         localStorage.setItem("loginTime", Date.now());

//         // Redirect based on role
//         const redirectPage = ROLE_REDIRECTS[role] || 'index.html';
//         window.location.href = redirectPage;
//     }

//     static logout() {
//         // Clear all auth data
//         Object.keys(localStorage).forEach(key => {
//             if (key.includes('_name') || key === 'role' || key === 'loginTime') {
//                 localStorage.removeItem(key);
//             }
//         });

//         sessionStorage.clear();
//         document.cookie = "sessionId=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";

//         window.location.href = "login.html";
//     }

//     static enforceSessionTimeout() {
//         const loginTime = localStorage.getItem("loginTime");
//         if (loginTime) {
//             const hoursSinceLogin = (Date.now() - parseInt(loginTime)) / (1000 * 60 * 60);
//             if (hoursSinceLogin > 24) { // 24 hour session
//                 this.logout();
//             }
//         }
//     }
// }

// // Initialize auth on every page load
// document.addEventListener('DOMContentLoaded', () => {
//     AuthMiddleware.enforceSessionTimeout();
//     AuthMiddleware.redirectIfNotAuthenticated();
// });

// // Make it globally available
// window.AuthMiddleware = AuthMiddleware;


// authMiddleware.js

// Role configurations with separate login pages
const ROLE_CONFIG = {
    'admin': {
        loginPage: 'index.html',
        homePage: 'dashboard.html',
        localStorageKey: 'admin_name'
    },
    'helpdesk': {
        loginPage: 'index.html',
        homePage: 'dashboard.html',
        localStorageKey: 'helpdesk_user_name'
    },
    'operator': {
        loginPage: 'index.html',
        homePage: 'dashboard.html',
        localStorageKey: 'operator_name'
    },
    'citizen': {
        loginPage: 'index.html', // or citizen-login.html
        homePage: 'dashboard.html',
        localStorageKey: 'user_name'
    }
};

// Define which pages each role can access
const PAGE_PERMISSIONS = {
    // Admin pages
    'admin.html': ['admin'],
    'dashboard.html': ['admin'],
    'dashboard_copy.html': ['admin'],
    'dashboard_dropdown_copy.html': ['admin'],
    'cm_heights.html': ['admin'],
    'department_user.html': ['admin'],

    // Helpdesk pages
    'helpdesk.html': ['helpdesk'],
    'helpdesk_bad.html': ['helpdesk'],

    // Operator pages
    'operator.html': ['operator'],
    'edm.html': ['operator'],

    // User pages
    'index.html': ['user'],
    'citizen-borne.html': ['user'],
    'landing_21.html': ['user'],
    'landing-faq.html': ['user'],
    'landing-dair.html': ['user'],

    // Shared pages (multiple roles)
    'dashboard-disk.html': ['admin', 'helpdesk'],
    'index-wex.html': ['user', 'admin'],
    'index-three.html': ['user', 'admin'],
    'index-two.html': ['user', 'admin'],

    // Public pages (no auth required)
    'login.html': ['*'],
    'admin-login.html': ['*'],
    'helpdesk-login.html': ['*'],
    'operator-login.html': ['*'],
    'fog.html': ['*'],
    'index-old.html': ['*']
};

class AuthMiddleware {
    static getCurrentRole() {
        return localStorage.getItem("role");
    }

    static isAuthenticated() {
        const role = this.getCurrentRole();

        if (!role || !ROLE_CONFIG[role]) {
            return false;
        }

        const usernameKey = ROLE_CONFIG[role].localStorageKey;
        return !!localStorage.getItem(usernameKey);
    }

    static getUsername() {
        const role = this.getCurrentRole();
        if (!role || !ROLE_CONFIG[role]) return "User";

        const usernameKey = ROLE_CONFIG[role].localStorageKey;
        return localStorage.getItem(usernameKey) || "User";
    }

    static getRoleConfig(role) {
        return ROLE_CONFIG[role] || ROLE_CONFIG.user;
    }

    static checkPagePermission(pageName) {
        const role = this.getCurrentRole();

        // If no role, deny access
        if (!role) {
            return false;
        }

        const permissions = PAGE_PERMISSIONS[pageName];

        // If page not in permissions list, deny by default
        if (!permissions) {
            console.warn(`Page ${pageName} not in permissions list. Access denied.`);
            return false;
        }

        // Allow public pages
        if (permissions.includes('*')) {
            return true;
        }

        // Check if role has permission
        return permissions.includes(role);
    }

    static enforceAuthentication() {
        const currentPage = window.location.pathname.split('/').pop();
        const role = this.getCurrentRole();

        // Check if current page is a login page for a different role
        if (currentPage.includes('-login.html')) {
            const pageRole = this.getRoleFromLoginPage(currentPage);
            if (pageRole && role && pageRole !== role && this.isAuthenticated()) {
                // User is logged in as different role, redirect to their home
                this.redirectToHome();
                return;
            }
        }

        // Skip auth check for public pages
        if (PAGE_PERMISSIONS[currentPage] && PAGE_PERMISSIONS[currentPage].includes('*')) {
            return;
        }

        // If not authenticated, redirect to appropriate login
        if (!this.isAuthenticated()) {
            this.redirectToLogin();
            return;
        }

        // Check if user has permission for current page
        if (!this.checkPagePermission(currentPage)) {
            alert('Access Denied: You do not have permission to access this page.');
            this.redirectToHome();
        }
    }

    static getRoleFromLoginPage(loginPage) {
        if (loginPage === 'admin-login.html') return 'admin';
        if (loginPage === 'helpdesk-login.html') return 'helpdesk';
        if (loginPage === 'operator-login.html') return 'operator';
        if (loginPage === 'login.html') return 'user';
        return null;
    }

    static redirectToLogin() {
        const role = this.getCurrentRole();
        let loginPage = 'login.html'; // default

        if (role && ROLE_CONFIG[role]) {
            loginPage = ROLE_CONFIG[role].loginPage;
        }

        // Prevent redirect loop
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage !== loginPage) {
            window.location.href = loginPage;
        }
    }

    static redirectToHome() {
        const role = this.getCurrentRole();

        if (!role || !ROLE_CONFIG[role]) {
            this.redirectToLogin();
            return;
        }

        const homePage = ROLE_CONFIG[role].homePage;
        const currentPage = window.location.pathname.split('/').pop();

        if (currentPage !== homePage) {
            window.location.href = homePage;
        }
    }

    static login(role, username) {
        if (!ROLE_CONFIG[role]) {
            console.error(`Invalid role: ${role}`);
            return false;
        }

        // Clear any existing auth
        this.clearAllAuth();

        // Set new auth
        localStorage.setItem("role", role);
        localStorage.setItem(ROLE_CONFIG[role].localStorageKey, username);
        localStorage.setItem("loginTime", Date.now());

        return true;
    }

    static clearAllAuth() {
        // Clear all role-specific user data
        Object.values(ROLE_CONFIG).forEach(config => {
            localStorage.removeItem(config.localStorageKey);
        });

        // Clear common auth data
        localStorage.removeItem("role");
        localStorage.removeItem("loginTime");

        sessionStorage.clear();
        document.cookie.split(";").forEach(cookie => {
            document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
    }

    static logout() {
        this.clearAllAuth();
        window.location.href = 'login.html'; // default login
    }

    static checkSessionTimeout() {
        const loginTime = localStorage.getItem("loginTime");
        if (loginTime) {
            const hoursSinceLogin = (Date.now() - parseInt(loginTime)) / (1000 * 60 * 60);
            if (hoursSinceLogin > 24) { // 24 hour session
                this.logout();
            }
        }
    }

    static preventBackButton() {
        // Clear cache on page load
        window.onload = function () {
            if (typeof window.history.pushState === 'function') {
                window.history.pushState(null, null, window.location.href);
                window.onpopstate = function () {
                    window.history.pushState(null, null, window.location.href);
                };
            }
        };
    }
}

// Initialize on every page
document.addEventListener('DOMContentLoaded', () => {
    AuthMiddleware.checkSessionTimeout();
    AuthMiddleware.enforceAuthentication();
    AuthMiddleware.preventBackButton();
});

window.AuthMiddleware = AuthMiddleware;