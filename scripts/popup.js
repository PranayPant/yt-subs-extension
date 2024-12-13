let port = null;
let currentTab = null;
let subtitles = "";

const downloadButton = document.getElementById("downloadsubs");
const generateSubsButton = document.getElementById("generatesubs");

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
    case "generate-subs-loading": {
      document.getElementById("generatesubs-loading").style = "display:block";
      generateSubsButton.disabled = true;
      break;
    }
    case "generate-subs-success": {
      document.getElementById("generatesubs-loading").style = "display:none";
      generateSubsButton.disabled = false;
      copySubButton.disabled = false;
      subtitles = message.data;
      break;
    }
    case "subtitle-parsed-data": {
      console.log(
        `[yt-dlp extension]:Parsed subtitle data ${JSON.stringify(
          message.data
        )}`
      );
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

  const loadingIcons = document.querySelectorAll("img.loading");
  loadingIcons.forEach((icon) => (icon.style = "display:none"));

  generateSubsButton.addEventListener("click", handleGenerateSubs);
  downloadButton.addEventListener("click", handleDownloadSubtitles);
}

function handleGenerateSubs() {
  console.log(
    `[yt-dlp extension]: Sending generate subtitles message to client`
  );
  sendMessageToHost("generate-subs", "generate subtitles");
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
  // let data = null;
  // if (currentTab) {
  //   document.getElementById("downloadsubs").textContent = "Downloading...";
  //   document.getElementById("downloadsubs").disabled = "true";
  //   const response = await fetch(
  //     `http://localhost:8080/sub?url=${currentTab.url}`
  //   );
  //   data = await response.text();
  //   document.getElementById("downloadsubs").textContent = "Download subtitles";
  //   document.getElementById("downloadsubs").disabled = null;
  //   console.log("[ytdlp-extension]: Done downloading subtitles!");
  // }

  // if (port) {
  //   port.postMessage({ event: "subtitles_downloaded", data });
  // }
  chrome.downloads.download({
    url: `http://localhost:8080/sub?url=${currentTab.url}`,
  });
}

init();
