// login.js - Handles user authentication via LocalStorage.

const USER_KEY = 'admin@email.com';
const PASS_KEY = 'admin123';
const SESSION_KEY = 'barangay_map_logged_in';
const REMEMBER_ME_KEY = 'barangay_map_remember';

/**
 * Validates the current user session and redirects if necessary.
 */
function validateSession() {
    const isLoggedIn = localStorage.getItem(SESSION_KEY);
    const pathname = window.location.pathname;

    // Check if on a protected page (dashboard, map, resources)
    if (pathname.includes('dashboard.html') || pathname.includes('map.html') || pathname.includes('resources.html')) {
        if (!isLoggedIn) {
            // Not logged in, redirect to login page
            window.location.href = 'index.html';
        }
    } 
    // Check if on the login page and already logged in
    else if (pathname.includes('index.html')) {
        if (isLoggedIn) {
            // Already logged in, redirect to dashboard
            window.location.href = 'dashboard.html';
        }
    }
    
    // Check 'Remember Me' on load
    if (localStorage.getItem(REMEMBER_ME_KEY) === 'true' && !isLoggedIn) {
        localStorage.setItem(SESSION_KEY, 'true');
        // Re-run validation for immediate redirect
        validateSession();
    }
}

/**
 * Handles the login form submission.
 * @param {Event} event - The form submission event.
 */
function handleLogin(event) {
    event.preventDefault(); // Stop default form submission

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    const errorMessage = document.getElementById('error-message');

    if (email === USER_KEY && password === PASS_KEY) {
        // Successful login
        localStorage.setItem(SESSION_KEY, 'true');
        if (rememberMe) {
            localStorage.setItem(REMEMBER_ME_KEY, 'true');
        } else {
            localStorage.removeItem(REMEMBER_ME_KEY);
        }
        errorMessage.style.display = 'none';
        window.location.href = 'dashboard.html'; // Redirect to dashboard
    } else {
        // Failed login
        errorMessage.textContent = 'Invalid email or password.';
        errorMessage.style.display = 'block';
    }
}

// Add event listener for the form on the login page
document.addEventListener('DOMContentLoaded', () => {
    // Run session check on all pages
    validateSession(); 
    
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});