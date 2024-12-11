let port = null;
let currentTab = null;
let subtitles = "";
const downloadButton = document.getElementById("downloadsubs");
const copySubButton = document.getElementById("copysubtitles");
const testCacheButton = document.getElementById("testcache");
const testParseButton = document.getElementById("testparse");

function sendMessageToHost(event, data) {
  if (port) {
    port.postMessage({
      event,
      data,
    });
  }
}

async function handleClientMessage(message) {
  switch (message.event) {
    case "subtitle-cache-full": {
      copySubButton.disabled = false;
      subtitles = message.data;
      break;
    }
    default:
      break;
  }
}

async function init() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTab = tabs[0];
  port = chrome.tabs.connect(currentTab.id, { name: "subs" });

  port.onMessage.addListener(handleClientMessage);

  copySubButton.disabled = true;

  testParseButton.addEventListener("click", handleTestParse);
  testCacheButton.addEventListener("click", handleTestCache);
  downloadButton.addEventListener("click", handleDownloadSubtitles);
  copySubButton.addEventListener("click", handleCopySubtitles);
}

function handleTestParse() {
  console.log(`[yt-dlp extension]: Sending test message to client`);
  sendMessageToHost("test-parse", "test parse");
}

function handleTestCache() {
  console.log(`[yt-dlp extension]: Sending test message to client`);
  sendMessageToHost("test-cache", "test cache");
}

async function handleCopySubtitles() {
  await navigator.clipboard.writeText(subtitles);
  console.log(`[yt-dlp extension]: Copied to clipboard ${subtitles}`);
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
    document.getElementById("downloadsubs").disabled = "true";
    const response = await fetch(
      `http://localhost:8080/sub?url=${currentTab.url}`
    );
    data = await response.text();
    document.getElementById("downloadsubs").textContent = "Download subtitles";
    document.getElementById("downloadsubs").disabled = null;
    console.log("[ytdlp-extension]: Done downloading subtitles!");
  }

  if (port) {
    port.postMessage({ event: "subtitles_downloaded", data });
  }
}

init();
