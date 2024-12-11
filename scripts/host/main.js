console.log("[yt-dlp extension]: Loaded content script.");

function parseTTML(ttmlString) {
  console.log(ttmlString.length);

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(ttmlString, "text/xml");

  // Now you can traverse the XML document
  const subtitles = [];
  const paragraphs = xmlDoc.querySelectorAll("p");
  console.log("[yt-dlp extension]: Paragraphs", paragraphs);

  paragraphs.forEach((p) => {
    const start = p.getAttribute("begin");
    console.log("start", start);
    const end = p.getAttribute("end");
    const text = p.textContent;

    subtitles.push({ start, end, text });
  });

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
      let subtitles = [];
      try {
        subtitles = parseTTML(data);
      } catch (err) {
        console.error("Error parsing", err);
      }
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
});
