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

// ✅ Show Success Toast
window.showSuccessToast = function (message) {
    const toastElement = document.getElementById('successToast');
    const toastBody = document.getElementById('successMessage');

    if (toastElement && toastBody) {
        toastBody.textContent = message;
        const toast = new bootstrap.Toast(toastElement, {
            autohide: true,
            delay: 3000
        });
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
        const toast = new bootstrap.Toast(toastElement, {
            autohide: true,
            delay: 3000
        });
        toast.show();
    } else {
        console.warn('⚠️ Error toast layout not found in DOM.');
    }
};

window.loadToastLayout = function (callback) {
    let toastPath = '';

    // If running locally (Live Server)
    if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
        toastPath = '../assets/partials/toastLayout.html'; // adjust based on page location
    } else {
        // On staging or production
        const script = document.currentScript || document.getElementsByTagName('script')[document.getElementsByTagName('script').length - 1];
        const fullSrc = script.src;
        const baseUrl = fullSrc.substring(0, fullSrc.indexOf('/assets/js/'));
        toastPath = `${baseUrl}/assets/partials/toastLayout.html`;
    }

    fetch(toastPath)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.text();
        })
        .then(html => {
            const div = document.createElement('div');
            div.innerHTML = html;
            document.body.appendChild(div);
            console.log(`✅ Toast layout loaded from: ${toastPath}`);
            if (typeof callback === 'function') callback();
        })
        .catch(err => console.error('❌ Toast layout load failed:', err));
};


// ✅ Auto-load toast layout after DOM ready
document.addEventListener('DOMContentLoaded', () => {
    loadToastLayout(() => {
        // Test example:
        // showSuccessToast('Toast system ready!');
    });
});
