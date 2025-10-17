// Debug script for logo issues
// Run this in the browser console to debug logo loading

function debugLogo() {
    console.log('=== LOGO DEBUG INFORMATION ===');
    console.log('Current URL:', window.location.href);
    console.log('Protocol:', window.location.protocol);
    console.log('Hostname:', window.location.hostname);
    console.log('Pathname:', window.location.pathname);
    console.log('Lottie library loaded:', !!window.lottie);
    
    if (window.lottie) {
        console.log('Lottie version:', window.lottie.version || 'Unknown');
    }
    
    const logoContainer = document.getElementById('lottie-logo');
    console.log('Logo container found:', !!logoContainer);
    
    if (logoContainer) {
        console.log('Logo container HTML:', logoContainer.innerHTML);
        console.log('Logo container dimensions:', {
            width: logoContainer.offsetWidth,
            height: logoContainer.offsetHeight
        });
    }
    
    // Test file paths
    const testPaths = [
        "./Images/Images_and_lottie/Logo.json",
        "Images/Images_and_lottie/Logo.json",
        "/Images/Images_and_lottie/Logo.json",
        "./images/Images_and_lottie/Logo.json",
        "images/Images_and_lottie/Logo.json",
        "https://raw.githubusercontent.com/Eirikur1/hopaverkefni2/main/Images/Images_and_lottie/Logo.json"
    ];
    
    console.log('Testing file paths...');
    testPaths.forEach((path, index) => {
        fetch(path, { method: 'HEAD' })
            .then(response => {
                console.log(`Path ${index + 1}: ${path} - Status: ${response.status} ${response.ok ? '✓' : '✗'}`);
            })
            .catch(error => {
                console.log(`Path ${index + 1}: ${path} - Error: ${error.message}`);
            });
    });
}

// Auto-run debug if in console
if (typeof window !== 'undefined') {
    console.log('Logo debug script loaded. Run debugLogo() to start debugging.');
}
