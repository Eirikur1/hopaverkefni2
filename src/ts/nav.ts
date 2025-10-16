// Get a reference to the navigation element (login/logout button)
const navLoginLink = document.getElementById("nav-login") as HTMLAnchorElement | null;

/**
 * Updates the state of the navigation button.
 * If the user is logged in — shows "Log Out", otherwise "Log In".
 */

function updateNavLink(): void {
  if (!navLoginLink) return;

  const userEmail = localStorage.getItem("userEmail");

  if (userEmail) {
    // User is logged in → show "Log Out"
    navLoginLink.textContent = "Logout";
    navLoginLink.onclick = (e: MouseEvent) => {
      e.preventDefault();
      localStorage.removeItem("userEmail");
      window.location.href = "login.html";
    };
  } else {
    // User is not logged in → show "Log In"
    navLoginLink.textContent = "Login";
    navLoginLink.onclick = (e: MouseEvent) => {
      e.preventDefault();
      window.location.href = "login.html";
    };
  }
}

// Run on page load
updateNavLink();