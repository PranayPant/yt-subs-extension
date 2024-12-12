log("Loaded content script.");

let subtitlesData = [];
let lastIndex;
let lastBeginSeconds = 0;
let lastEndSeconds = 0;

async function handleExtensionMessage(message, port) {
  switch (message.event) {
    case "test-cache": {
      const data = await getCacheData();
      port.postMessage({ event: "subtitle-cache-full", data });
      break;
    }
    case "test-parse": {
      const data = await getCacheData();
      subtitlesData = parseTTML(data);
      port.postMessage({ event: "subtitle-parsed-data", data: subtitlesData });
      break;
    }
    default:
      break;
  }
}

function getSubtitlesForTime(currentTime) {
  let currentIndex, beginSeconds, endSeconds, text;

  currentIndex = isNaN(lastIndex)
    ? 0
    : getNextIndex(lastIndex, subtitlesData, currentTime);
  ({ beginSeconds, endSeconds, text } = subtitlesData[currentIndex]);
  lastIndex = currentIndex;
  lastBeginSeconds = beginSeconds;
  lastEndSeconds = endSeconds;
  log(text, beginSeconds, endSeconds);

  return text;
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
          log("***Getting subtitles for time***", video.currentTime);
          const text = getSubtitlesForTime(video.currentTime);
          showSubtitles(text);
        }
      }, 1000)
    );
  } catch (err) {
    log("Error:", err);
  }
});
