log("Loaded content script.");

let subtitlesData = [];
let lastIndex = 0;
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
  let lines = [];

  log("Last Index -- Start", lastIndex);

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

  log(
    lastIndex,
    lines,
    subtitlesData[lastIndex].beginSeconds,
    subtitlesData[lastIndex].endSeconds
  );

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
