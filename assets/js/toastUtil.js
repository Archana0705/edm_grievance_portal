// // toastUtil.js

// window.showSuccessToast = function (message) {
//     const toastElement = document.getElementById('successToast');
//     const toastBody = document.getElementById('successMessage');

//     if (toastElement && toastBody) {
//         toastBody.textContent = message;
//         const toast = new bootstrap.Toast(toastElement, {
//             autohide: true,
//             delay: 3000
//         });
//         toast.show();
//     } else {
//         console.warn('Success toast layout not found in DOM.');
//     }
// };

// window.showErrorToast = function (message) {
//     const toastElement = document.getElementById('errorToast');
//     const toastBody = document.getElementById('errorMessage');

//     if (toastElement && toastBody) {
//         toastBody.textContent = message;
//         const toast = new bootstrap.Toast(toastElement, {
//             autohide: true,
//             delay: 3000
//         });
//         toast.show();
//     } else {
//         console.warn('Error toast layout not found in DOM.');
//     }
// };


// window.loadToastLayout = function (callback) {
//     const currentPath = window.location.pathname;
//     // Fix: match the actual folder name
//     const isInEdmPortal = currentPath.includes("/edm-grievance-portal/");

//     const toastPath = isInEdmPortal
//         ? "assets/partials/toastLayout.html"
//         : "/assets/partials/toastLayout.html";

//     fetch(toastPath)
//         .then(response => response.text())
//         .then(html => {
//             const div = document.createElement('div');
//             div.innerHTML = html;
//             document.body.appendChild(div);
//             console.log('Toast layout loaded.');
//             if (typeof callback === 'function') {
//                 callback();
//             }
//         })
//         .catch(err => console.error('Toast layout load failed:', err));
// };


// document.addEventListener('DOMContentLoaded', () => {
//     loadToastLayout(() => {
//         // You can test after layout is ready
//         // Example:
//         // showSuccessToast('Loaded successfully!');
//     });
// });

// ==============================
// toastUtil.js
// ==============================
// ==============================
// toastUtil.js (Universal Version)
// ==============================

// ✅ Show Success Toast
window.showSuccessToast = function (message) {
    const toastElement = document.getElementById('successToast');
    const toastBody = document.getElementById('successMessage');

    if (toastElement && toastBody) {
        toastBody.textContent = message;
        const toast = new bootstrap.Toast(toastElement, { autohide: true, delay: 3000 });
        toast.show();
    } else {
        console.warn('⚠️ Success toast layout not found in DOM.');
    }
};

// ✅ Show Error Toast
window.showErrorToast = function (message) {
    const toastElement = document.getElementById('errorToast');
    const toastBody = document.getElementById('errorMessage');

    if (toastElement && toastBody) {
        toastBody.textContent = message;
        const toast = new bootstrap.Toast(toastElement, { autohide: true, delay: 3000 });
        toast.show();
    } else {
        console.warn('⚠️ Error toast layout not found in DOM.');
    }
};

// ✅ Load Toast Layout (works in local / staging / production)
window.loadToastLayout = function (callback) {
    try {
        // Compute base path dynamically
        let basePath = window.location.origin + window.location.pathname;

        // Remove any file name (like index.html, dashboard.html)
        if (basePath.match(/\.html?$/)) {
            basePath = basePath.substring(0, basePath.lastIndexOf('/'));
        }

        // Always locate "assets/partials/toastLayout.html" relative to site root
        // Detect if "edm-grievance-portal" is part of the URL
        const portalRoot = basePath.includes('/edm-grievance-portal/')
            ? '/edm-grievance-portal'
            : '';

        const toastPath = `${portalRoot}/assets/partials/toastLayout.html`;

        fetch(toastPath)
            .then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.text();
            })
            .then(html => {
                const div = document.createElement('div');
                div.innerHTML = html;
                document.body.appendChild(div);
                console.log(`✅ Toast layout loaded from: ${toastPath}`);
                if (callback) callback();
            })
            .catch(err => console.error('❌ Toast layout load failed:', err));
    } catch (err) {
        console.error('❌ Error determining toast layout path:', err);
    }
};

// ✅ Auto-load toast layout on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    loadToastLayout();
});
