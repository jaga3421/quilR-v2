// import jwtDecode from 'jwt-decode';

export async function isAuthenticated() {
  const results = await Promise.all([
    checkCookies(),
    // checkJWT(),
    checkLocalStorage(),
    checkRedirects(),
    checkAuthTokens(),
    checkThirdPartyAuth(),
  ]);

  // Calculate the total score based on the results of all checks
  const score = results.reduce((total: any, res: any) => total + res, 0);
  console.log('Auth score', score)

  const threshold = 4;
  return score >= threshold;
}

// Check for authentication cookies
function checkCookies() {
  const authCookies = ['auth_token', 'session_id', 'user_id', 'remember_me']; // Add your relevant cookies
  const foundCookie = authCookies.some(cookie => {
    const match = document.cookie.split(';').find(c => c.trim().startsWith(`${cookie}=`));
    return match && match.split('=')[1] !== ''; // Ensure cookie has a valid value
  });
  return Promise.resolve(foundCookie ? 1 : 0); // 1 if a valid cookie is found, 0 otherwise
}

// // Check if a JWT token is present in localStorage and validate it
// function checkJWT() {
//   const token = localStorage.getItem('jwt_token');
//   if (token) {
//     try {
//       const decoded = jwtDecode(token); // Ensure jwtDecode is callable
//       const currentTime = Date.now() / 1000; // Current time in seconds
//       if (decoded.exp && decoded.exp > currentTime) {
//         return Promise.resolve(2); // Higher score if JWT is valid
//       }
//     } catch (e) {
//       return Promise.resolve(0); // Token invalid or can't be decoded
//     }
//   }
//   return Promise.resolve(0);
// }

// // Check for user information in sessionStorage
// function checkSessionStorage() {
//   const sessionUser = sessionStorage.getItem('user');
//   try {
//     const userData = JSON.parse(sessionUser); // Assuming it's stored as JSON
//     if (userData && typeof userData === 'object' && userData.id) {
//       return Promise.resolve(1); // 1 if valid user data found
//     }
//   } catch (e) {
//     return Promise.resolve(0); // Invalid session data
//   }
//   return Promise.resolve(0);
// }

// Check for specific authentication data in localStorage
function checkLocalStorage() {
  const localStorageKeys = ['user_data', 'auth_info', 'session_token']; // Add your relevant keys
  const foundLocalStorage = localStorageKeys.some(key => localStorage.getItem(key) !== null);
  return Promise.resolve(foundLocalStorage ? 1 : 0); // 1 if relevant localStorage key found
}

// Check if the current page is not a login page (could indicate authenticated state)
function checkRedirects() {
  const notOnLoginPage = !window.location.pathname.includes('/login');
  return Promise.resolve(notOnLoginPage ? 1 : 0); // 1 if not on a login page
}

// Check for authentication tokens in URL or localStorage
function checkAuthTokens() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('auth_token');
  const storedToken = localStorage.getItem('auth_token');
  return Promise.resolve((token !== null || storedToken !== null) ? 1 : 0); // 1 if token is found
}

// Check if third-party authentication is used (e.g., OAuth)
function checkThirdPartyAuth() {
  const thirdPartyAuthElement = document.querySelector('.third-party-auth');
  return Promise.resolve(thirdPartyAuthElement ? 1 : 0); // 1 if third-party auth is detected
}