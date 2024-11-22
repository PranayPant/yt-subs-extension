function handleButtonClick() {
  console.log("[ytdlp-extension]: Popup button was clicked!");
  // window.postMessage(
  //   { type: "FROM_PAGE", text: "Hello from the extension!" },
  //   "*"
  // );
  // popup.js

  // Get a reference to the active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    // Send a message to the content script in the active tab
    chrome.tabs.sendMessage(tabs[0].id, { message: "Hello from popup!" });
  });
}

document.getElementById("clickme").addEventListener("click", handleButtonClick);
