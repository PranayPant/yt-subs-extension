log("Loaded content script.");

let subtitlesData = [];
let lastIndex = 0;
let lastBeginSeconds = 0;
let lastEndSeconds = 0;

async function handleExtensionMessage(message, port) {
  switch (message.event) {
    case "generate-subs": {
      try {
        port.postMessage({ event: "generate-subs-loading" });
        const data = await getCacheData();
        subtitlesData = parseTTML(data);
        port.postMessage({ event: "generate-subs-success", data });
      } catch (err) {
        port.postMessage({ event: "generate-subs-error", err });
      }
      break;
    }
    default:
      break;
  }
}

function getSubtitlesForTime(currentTime) {
  let lines = [];

  for (
    let currentIndex = lastIndex;
    currentIndex < subtitlesData.length;
    currentIndex += 1
  ) {
    const { text, beginSeconds, endSeconds } = subtitlesData[currentIndex];
    if (lines.length && currentTime > endSeconds) {
      break;
    } else if (currentTime >= beginSeconds && currentTime <= endSeconds) {
      lines.push(text);
      lastIndex = currentIndex;
    }
  }

  return lines.join("\n");
}

chrome.runtime.onConnect.addListener(function (port) {
  try {
    log("Connected to extension, ready to receive messages.");
    port.onMessage.addListener(async function (message) {
      log("Message from extension:", message.data);
      await handleExtensionMessage(message, port);
    });
    const video = document.querySelector("video");
    video.addEventListener(
      "timeupdate",
      throttle(() => {
        if (!subtitlesData?.length) return;
        if (video.currentTime > lastEndSeconds) {
          const text = getSubtitlesForTime(video.currentTime);
          showSubtitles(text);
        }
      }, 1000)
    );
  } catch (err) {
    log("Error:", err);
  }
});
