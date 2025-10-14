<!-- Add these scripts RIGHT BEFORE the closing </body> tag in dashboard.html -->

<!-- Firebase SDKs -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>

<!-- Firebase Config -->
<script src="firebase-config.js"></script>

<!-- Auth Protection Script -->
<script>
    // Protect this page - redirect to login if not authenticated
    requireAuth().then(user => {
        console.log('User authenticated:', user.email);
        // Page loads normally for authenticated users
    }).catch(() => {
        // Redirect to login if not authenticated
        window.location.href = '/login';
    });

    // Add logout button functionality if you have one
    function logout() {
        signOut();
    }
</script>
