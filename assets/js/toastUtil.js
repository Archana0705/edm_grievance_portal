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
    try {
        const script = document.currentScript || document.getElementsByTagName('script')[document.getElementsByTagName('script').length - 1];
        const scriptSrc = script.src;

        // Remove the file name (toastUtil.js) to get the base folder
        const baseFolder = scriptSrc.substring(0, scriptSrc.lastIndexOf('/'));

        // Go up one folder and go to partials
        const toastPath = `${baseFolder.replace('/js', '')}/partials/toastLayout.html`;

        fetch(toastPath)
            .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); })
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

// ✅ Auto-load toast layout after DOM ready
document.addEventListener('DOMContentLoaded', () => {
    loadToastLayout(() => {
        // Test example:
        // showSuccessToast('Toast system ready!');
    });
});
