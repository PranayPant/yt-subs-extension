console.log("[yt-dlp extension]: Hello World from client");

// var port = chrome.runtime.connect();

// window.addEventListener(
//   "message",
//   (event) => {
//     // We only accept messages from ourselves
//     if (event.source !== window) {
//       console.log(
//         "[yt-dlp extension]: Host page received message from external source"
//       );

//       return;
//     }

//     if (event.data.type && event.data.type === "FROM_PAGE") {
//       console.log(
//         "[yt-dlp extension]: Host page received message from extension"
//       );
//       console.log("Content script received: " + event.data.text);
//       port.postMessage(event.data.text);
//     }
//   },
//   false
// );

// content.js

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "Hello from popup!") {
    console.log("Message from popup:", request.message);
    const video = document.querySelector("div.html5-video-player");
    const subtitleDiv = document.createElement("div");
    subtitleDiv.clientWidth = video.clientWidth;
    subtitleDiv.clientHeight = video.clientHeight;
    subtitleDiv.style = "background-color:lightgreen;position:absolute;bottom:0;left:0";
    subtitleDiv.textContent = request.message;
    video.appendChild(subtitleDiv);

    // Send a response back to the popup (optional)
    sendResponse("Hello from content script!");
  }
});
