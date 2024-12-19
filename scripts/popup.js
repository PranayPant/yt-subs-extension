let port = null;
let currentTab = null;
let subtitles = "";

const downloadButton = document.getElementById("downloadsubs");
const generateSubsButton = document.getElementById("generatesubs");

function sanitizeFilename(filename) {
  return filename.replace(/[<>:"/\\|?*]+/g, "_");
}

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

  const sanitizedFilename = sanitizeFilename(
    `subtitles_${new Date().toISOString()}.ttml`
  );

  chrome.downloads.download(
    {
      url: `http://localhost:8080/sub?url=${currentTab.url}`,
      filename: sanitizedFilename,
      saveAs: true,
    },
    function (downloadId) {
      if (chrome.runtime.lastError) {
        console.error(
          "[ytdlp-extension]: Download failed:",
          (chrome.runtime.lastError.message || "Unknown error").toString()
        );
      } else {
        console.log("[ytdlp-extension]: Download started with ID:", downloadId);
      }
    }
  );
}

init();
