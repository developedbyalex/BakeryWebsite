document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('admin-login-form');
    const rememberMeCheckbox = document.getElementById('remember-me');

    // Check if there's a stored username
    const storedUsername = localStorage.getItem('adminUsername');
    if (storedUsername) {
        document.getElementById('username').value = storedUsername;
        rememberMeCheckbox.checked = true;
    }

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Here you would typically validate the credentials against a server
        // For this example, we'll use a simple check
        if (username === 'admin' && password === 'password') {
            if (rememberMeCheckbox.checked) {
                localStorage.setItem('adminUsername', username);
            } else {
                localStorage.removeItem('adminUsername');
            }

            // Redirect to dashboard immediately
            window.location.href = './dashboard.html';
        } else {
            // Show a generic error notification
            notificationSystem.show('Invalid credentials. Please try again.', 'error');
            
            // Clear both username and password fields
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            
            // If "Remember Me" was checked, uncheck it after a failed login attempt
            rememberMeCheckbox.checked = false;
            localStorage.removeItem('adminUsername');
        }
    });
});