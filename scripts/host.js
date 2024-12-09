console.log("[yt-dlp extension]: Loaded content script.");

function showSubtitles(subtitleText) {
  const video = document.querySelector("div.html5-video-player");
  const subtitleDiv = document.createElement("div");
  subtitleDiv.style =
    "background-color:lightgreen;position:absolute;bottom:0;left:0;z-index:999";
  subtitleDiv.textContent = subtitleText;
  video.appendChild(subtitleDiv);
}

chrome.runtime.onConnect.addListener(function (port) {
  console.log(
    "[yt-dlp extension]: Connected to extension, ready to receive messages."
  );
  port.onMessage.addListener(function (message) {
    console.log("[yt-dlp extension]: Message from extension:", message.data);
  });
});
