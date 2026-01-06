// authMiddleware.js

const ROUTE_PERMISSIONS = {
    // Admin pages - only accessible by admin
    'admin.html': ['admin'],
    'dashboard.html': ['admin', 'helpdesk', 'operator'],
    'dashboard_copy.html': ['admin'],
    'dashboard_dropdown_copy.html': ['admin'],

    // Helpdesk pages
    'helpdesk.html': ['helpdesk', 'admin'],
    'helpdesk_bad.html': ['helpdesk', 'admin'],

    // Operator pages
    'operator.html': ['operator', 'admin'],

    // User pages
    'index.html': ['user', 'admin', 'helpdesk', 'operator'],
    'landing_21.html': ['user', 'admin', 'helpdesk', 'operator'],
    'landing-faq.html': ['user', 'admin', 'helpdesk', 'operator'],

    // Public pages (no auth required)
    'login.html': ['*'],
    'index-old.html': ['*'],
    'fog.html': ['*'] // forgot password page
};

// Redirect routes based on role
const ROLE_REDIRECTS = {
    'admin': 'dashboard.html',
    'helpdesk': 'helpdesk.html',
    'operator': 'operator.html',
    'user': 'index.html'
};

class AuthMiddleware {
    static isAuthenticated() {
        const role = localStorage.getItem("role");
        const usernameKeyMap = {
            "helpdesk": "helpdesk_user_name",
            "user": "user_name",
            "admin": "admin_name",
            "operator": "operator_name"
        };

        if (!role) return false;

        const usernameKey = usernameKeyMap[role];
        return !!localStorage.getItem(usernameKey);
    }

    static getCurrentRole() {
        return localStorage.getItem("role") || 'user';
    }

    static getUserName() {
        const role = this.getCurrentRole();
        const usernameKeyMap = {
            "helpdesk": "helpdesk_user_name",
            "user": "user_name",
            "admin": "admin_name",
            "operator": "operator_name"
        };

        const usernameKey = usernameKeyMap[role];
        return localStorage.getItem(usernameKey) || "User";
    }

    static checkPermission(pageName, userRole) {
        const permissions = ROUTE_PERMISSIONS[pageName];

        // If page not in permissions list, deny access by default
        if (!permissions) {
            console.warn(`Page ${pageName} not in permissions list. Access denied.`);
            return false;
        }

        // Allow if page is public
        if (permissions.includes('*')) {
            return true;
        }

        // Check if user role has permission
        return permissions.includes(userRole);
    }

    static redirectIfNotAuthenticated() {
        const currentPage = window.location.pathname.split('/').pop();

        // Skip auth check for public pages
        if (ROUTE_PERMISSIONS[currentPage] && ROUTE_PERMISSIONS[currentPage].includes('*')) {
            return;
        }

        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return;
        }

        // If authenticated, check permissions
        const userRole = this.getCurrentRole();
        if (!this.checkPermission(currentPage, userRole)) {
            // Redirect to default page for user's role
            const redirectPage = ROLE_REDIRECTS[userRole] || 'index.html';
            window.location.href = redirectPage;
        }
    }

    static login(userData) {
        const { role, username, usernameKey } = userData;

        localStorage.setItem("role", role);
        localStorage.setItem(usernameKey, username);

        // Set session timeout (24 hours)
        localStorage.setItem("loginTime", Date.now());

        // Redirect based on role
        const redirectPage = ROLE_REDIRECTS[role] || 'index.html';
        window.location.href = redirectPage;
    }

    static logout() {
        // Clear all auth data
        Object.keys(localStorage).forEach(key => {
            if (key.includes('_name') || key === 'role' || key === 'loginTime') {
                localStorage.removeItem(key);
            }
        });

        sessionStorage.clear();
        document.cookie = "sessionId=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";

        window.location.href = "login.html";
    }

    static enforceSessionTimeout() {
        const loginTime = localStorage.getItem("loginTime");
        if (loginTime) {
            const hoursSinceLogin = (Date.now() - parseInt(loginTime)) / (1000 * 60 * 60);
            if (hoursSinceLogin > 24) { // 24 hour session
                this.logout();
            }
        }
    }
}

// Initialize auth on every page load
document.addEventListener('DOMContentLoaded', () => {
    AuthMiddleware.enforceSessionTimeout();
    AuthMiddleware.redirectIfNotAuthenticated();
});

// Make it globally available
window.AuthMiddleware = AuthMiddleware;