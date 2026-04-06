declare global {
  interface Window {
    openDonateForm?: () => void;
    _formsappInstance?: { open: () => void };
  }
}

export function openDonate(): void {
  if (typeof window === "undefined") return;

  if (typeof window.openDonateForm === "function") {
    window.openDonateForm();
    return;
  }

  // Fallback: try the instance directly
  if (window._formsappInstance && typeof window._formsappInstance.open === "function") {
    window._formsappInstance.open();
    return;
  }

  // Last resort: click the hidden trigger button
  const trigger = document.getElementById("formsapp-hidden-trigger");
  if (trigger) trigger.click();
}
