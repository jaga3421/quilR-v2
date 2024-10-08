export function showAlert(message: string, useUiAlert: boolean = false): void {
  if (useUiAlert) {
    showUiAlert(message);
  } else {
    showAlertBox(message);
  }
}

function showUiAlert(message: string): void {
  const alertElement = document.createElement('div');
  alertElement.style.cssText = `
    position: fixed;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #f44336;
    color: white;
    padding: 15px;
    border-radius: 5px;
    z-index: 10000;
  `;
  alertElement.textContent = message;

  document.body.appendChild(alertElement);

  setTimeout(() => {
    alertElement.remove();
  }, 5000);
}

function showAlertBox(message: string): void {
  alert(message);
}
