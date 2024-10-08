import { checkPasswordStrength } from './passwordStrength';

/** 
 * Helper Functions
 */
function getDomainName(url:string) {
  const urlObj = new URL(url);
  let domain = urlObj.hostname.replace(/^www\./, ''); // Remove 'www.' if present
  let domainParts = domain.split('.');
  if (domainParts.length > 2) {
    domain = domainParts.slice(-2).join('.');
  }
  return domain;
}


function notifyWeakPasswordDetected(sender:any) {
  chrome.tabs.sendMessage(sender.tab.id, {type: 'WEAK_PASSWORD_DETECTED'})
}

/** 
 * Process New page loading & Password submission
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'NEW_PAGE_LOADED') {
    const domainName = getDomainName(message.url);

    // check if entry exists in submittedPasswords
    chrome.storage.local.get('submittedPasswords').then(result=>{
      const { submittedPasswords } = result;
      if(submittedPasswords[domainName]) {
        // check for cookie count
        if(message.cookieCount > submittedPasswords[domainName].cookieCount) {
          if(checkPasswordStrength(submittedPasswords[domainName].password)) {
            console.log('Weak password detected');
            notifyWeakPasswordDetected(sender);
            delete submittedPasswords[domainName];
            chrome.storage.local.set({ submittedPasswords: submittedPasswords });
          }
        }

      }
    })
    console.log(`New page loaded: ${message.url}`);
  }

  if (message.type === 'PASSWORD_SUBMITTED') {
    console.log(`Password Submitted ${message.password} ${message.url} ${message.cookieCount}`)
    saveSubmittedPassword(message)
    
  }
});

function saveSubmittedPassword(message:any) {
    const domainName = getDomainName(message.url); 

    // Retrieve existing submittedPasswords from Chrome storage
    chrome.storage.local.get(['submittedPasswords'], (result) => {
        const submittedPasswords = result.submittedPasswords || {}; 

        // Save the new password and cookie count
        submittedPasswords[domainName] = {
            password: message.password,
            cookieCount: message.cookieCount
        };

        // Save updated data back to Chrome storage
        chrome.storage.local.set({ submittedPasswords: submittedPasswords }, () => {
            console.log('Submitted passwords saved successfully.');
        });
    });
}


