export function handleTimeUpdate(time) {
  console.log("Time Update:", time);
  currentTime = time;
}

export async function executePopupScript(tab) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["./scripts/popup.js"],
    });
  } catch (err) {
    console.error("[yt-dlp extension]: Error executing popup script", err);
  }
}

export function throttle(func, delay) {
  let inThrottle = false;

  return function () {
    if (!inThrottle) {
      func.apply(this, arguments);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), delay);
    }
  };
}
