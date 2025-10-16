"use strict";
// Get a reference to the navigation element (login/logout button)
const navLoginLink = document.getElementById("nav-login");
/**
 * Updates the state of the navigation button.
 * If the user is logged in — shows "Log Out", otherwise "Log In".
 */
function updateNavLink() {
    if (!navLoginLink)
        return;
    const userEmail = localStorage.getItem("userEmail");
    if (userEmail) {
        // User is logged in → show "Log Out"
        navLoginLink.textContent = "Logout";
        navLoginLink.onclick = (e) => {
            e.preventDefault();
            localStorage.removeItem("userEmail");
            window.location.href = "login.html";
        };
    }
    else {
        // User is not logged in → show "Log In"
        navLoginLink.textContent = "Login";
        navLoginLink.onclick = (e) => {
            e.preventDefault();
            window.location.href = "login.html";
        };
    }
}
// Run on page load
updateNavLink();
//# sourceMappingURL=nav.js.map