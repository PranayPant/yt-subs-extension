let port = null;
let currentTab = null;
let subtitles = "";

async function init() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTab = tabs[0];
  port = chrome.tabs.connect(currentTab.id, { name: "subs" });

  port.onMessage.addListener(function (message) {
    if (message.event === "subtitle") {
      showSubtitles(message.data);
      port.postMessage({ hostResponse: "ok from popup - subtitle" });
    }

    console.log(`[yt-dlp extension]: Message from client ${message.data}`);
  });

  document
    .getElementById("downloadsubs")
    .addEventListener("click", handleDownloadSubtitles);
  document
    .getElementById("copysubtitles")
    .addEventListener("click", handleCopySubtitles);
}

function handleCopySubtitles() {
  if (port) {
    port.postMessage({
      event: "subtitles_content_copy",
      data: subtitles,
    });
  }
}

async function handleDownloadSubtitles() {
  console.log("[ytdlp-extension]: Downloading subtitles...");
  // window.postMessage(
  //   { type: "FROM_PAGE", text: "Hello from the extension!" },
  //   "*"
  // );
  // popup.js

  // Get a reference to the active tab
  // chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  //   // Send a message to the content script in the active tab
  //   chrome.tabs.sendMessage(tabs[0].id, { data: "Hello from popup!" });
  // });
  let data = null;
  if (currentTab) {
    document.getElementById("downloadsubs").textContent = "Downloading...";
    document.getElementById("downloadsubs").disable = true;
    const response = await fetch(
      `http://localhost:8080/sub?url=${currentTab.url}`
    );
    data = await response.text();
    document.getElementById("downloadsubs").textContent = "Download subtitles";
    document.getElementById("downloadsubs").disable = false;
    console.log("[ytdlp-extension]: Done downloading subtitles!");
  }

  if (port) {
    port.postMessage({ event: "subtitles_downloaded", data });
  }
}

init();
