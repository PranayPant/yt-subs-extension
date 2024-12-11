console.log("[yt-dlp extension]: Loaded content script.");

function parseTTML(ttmlString) {
  const lines = ttmlString.split("\\n");
  const subtitles = [];
  const regex = /<p begin=\\\"(.*)\\\"\s+end=\\\"(.*)\\\"\s+.*>(.*)<\/p>/;

  for (const line of lines) {
    if (!line.startsWith("<p")) continue;
    const [, begin, end, text] = line.match(regex);
    subtitles.push({ begin, end, text });
  }

  return subtitles;
}

// Try to get data from the cache, but fall back to fetching it live.
async function getCacheData() {
  const cacheVersion = 1;
  const cacheName = `yt-dlp-subs-${cacheVersion}`;
  const url = `http://localhost:8080/sub?url=${window.location.href}`;
  const cachedResponse = await caches.match(url);
  if (cachedResponse) {
    return await cachedResponse.text();
  }
  await (await caches.open(cacheName)).add(url);
  return await (await caches.match(url)).text();
}

async function handleExtensionMessage(message, port) {
  switch (message.event) {
    case "test-cache": {
      const data = await getCacheData();
      port.postMessage({ event: "subtitle-cache-full", data });
      break;
    }
    case "test-parse": {
      const data = await getCacheData();
      const subtitlesData = parseTTML(data);
      port.postMessage({ event: "subtitle-parsed-data", data: subtitlesData });
      break;
    }
    default:
      break;
  }
}

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
  port.onMessage.addListener(async function (message) {
    console.log("[yt-dlp extension]: Message from extension:", message.data);
    await handleExtensionMessage(message, port);
  });
  const video = document.querySelector("video");
  video.addEventListener(
    "timeupdate",
    throttle(() => {
      console.log(
        "The currentTime attribute has been updated, it's now at",
        video.currentTime
      );
    }, 500)
  );
});

function throttle(func, delay = 100) {
  let inThrottle = false;

  return function () {
    if (!inThrottle) {
      func.apply(this, arguments);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), delay);
    }
  };
}
