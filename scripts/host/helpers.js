const SUBTITLE_DIV_ID = "yt-dlp-subtitles-container";
const PARENT_DIV_SELECTOR = "div.html5-video-player";

// Needed to dynamically calculate the text node's width after it is attached to DOM for the first time
const observer = new MutationObserver(() => {
  const targetDiv = document.getElementById(SUBTITLE_DIV_ID);
  if (targetDiv) {
    const video = document.querySelector(PARENT_DIV_SELECTOR);
    const margin = (video.offsetWidth - targetDiv.offsetWidth) / 2;
    targetDiv.style = getCSS({ margin });
  }
});

function getCSS({ margin }) {
  return `background-color:black;position:absolute;bottom:50px;left:${margin}px;z-index:999;font-size:3em;max-width:700px`;
}

function showSubtitles(subtitleText) {
  const video = document.querySelector(PARENT_DIV_SELECTOR);
  let targetDiv = document.getElementById(SUBTITLE_DIV_ID);

  if (targetDiv) {
    observer.disconnect();
    targetDiv.innerHTML = subtitleText;
    const margin = (video.offsetWidth - targetDiv.offsetWidth) / 2;
    targetDiv.style = getCSS({ margin });
  } else {
    observer.observe(document.querySelector(PARENT_DIV_SELECTOR), {
      childList: true,
    });
    targetDiv = document.createElement("div");
    targetDiv.id = SUBTITLE_DIV_ID;
    targetDiv.innerHTML = subtitleText;
    video.appendChild(targetDiv);
    const margin =
      (video.offsetWidth -
        document.getElementById(SUBTITLE_DIV_ID).offsetWidth) /
      2;
    targetDiv.style = getCSS({ margin });
  }
}
