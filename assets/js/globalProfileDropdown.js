$(function () {
    // Load profile dropdown into placeholder
    $("#globalProfileDropdown").load("assets/partials/profileDropdown.html", function () {
        // Update username dynamically if stored
        const username = localStorage.getItem("userName") || "User";
        $("#userName").text(username);

        // Attach sign out functionality
        $(".signOutBtn").on("click", function (e) {
            e.preventDefault();

            // Clear all possible session storage
            // localStorage.removeItem("authToken");
            // localStorage.removeItem("userName");
            // sessionStorage.clear();
            // document.cookie = "sessionId=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";

            // Redirect to login page
            window.location.href = "index.html";
        });
    });
});
