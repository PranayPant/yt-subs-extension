import { handleTimeUpdate, throttle, executePopupScript } from "./utils.js";
import { log } from "./log.js";
let video = null;
let currentTime = null;

const youtubeVideoPageUrl = "http://www.youtube.com/watch?v=";

function main() {
  video = document.querySelector("video.html5-main-video");

  if (!video) {
    throw new Error("No video element found!");
  }
  video.addEventListener("timeupdate", throttle(handleTimeUpdate, 500));
}

chrome.runtime.onInstalled.addListener(async ({ tabId }) => {
  log("New Active Tab");
  await chrome.action.setPopup({ popup: "popup.html", tabId });
});
