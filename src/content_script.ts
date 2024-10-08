import { showAlert } from './alert';
import { isAuthenticated } from './isAuthenticated'; // Import the module

let lastUrl = window.location.href;

// Init everything
function initialize() {
  console.log('Initializing content script');
  monitorUrlChanges(); // Start monitoring URL changes
  scanForPasswordInputs();
  
  // Mutation Observer for dynamically added content
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (element.querySelector('input[type="password"]')) {
              console.log('New password input detected, re-scanning');
              scanForPasswordInputs();
              break;
            }
          }
        }
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  console.log('Content script fully initialized');
}

/**
 * 
 * Look for URL change or new page load. 
 * In this case, we will check with Sowrker and see if a password submission has been initiated
 * If yes, we compare cookies count, if it is more, then Weak password check will happen in SWorker
 */

async function notifyPageChange() {
  // const auth = await isAuthenticated();
  // count number of cookies
  const cookieCount = document.cookie.split(';').length
  chrome.runtime.sendMessage({ type: 'NEW_PAGE_LOADED', url: window.location.href, cookieCount }, (response)=>{
    console.log(response)
  });
}

function monitorUrlChanges() {
  window.addEventListener('popstate', () => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      notifyPageChange();
    }
  });

  // Also check for initial page load
  notifyPageChange();
}

/**
 * Event listener added to Password field.
 * Incase of a submission, send the password to SWorker
 */
function scanForPasswordInputs() {
  const passwordInputs = document.querySelectorAll('input[type="password"]');
  if (passwordInputs.length > 0) {
    passwordInputs.forEach((input:any) => {
      console.log('Blurring')
      input.addEventListener('blur', () => {
        const password = input.value;
        if (password.trim()) {
          console.log('Sending password');
          sendPasswordToBackground(password.trim());
        }
      });
    });
  }
}

function sendPasswordToBackground(password: string) {
  const cookieCount=document.cookie.split(';').length
  console.log(password);
  console.log(cookieCount)
  chrome.runtime.sendMessage({
    type: "PASSWORD_SUBMITTED",
    password: password,
    url: window.location.href,
    cookieCount
  });
}

/**
 *  Once weak Password is detected the listener shows an Alert
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'WEAK_PASSWORD_DETECTED') {
    console.log('Weak Pwd detected')
    createToast(message.url);
  }
});

function createToast(url: string) {
  console.log('Creating toast notification');
  showAlert(`Weak password detected for ${url}. Please use a stronger password.`, true);
}

/**
 * Initialise on Dom ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

console.log('Content script fully loaded');
