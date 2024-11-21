import { throttle } from "./scripts/throttle.js";

let video = null;
let currentTime = null;

const youtubeVideoPageUrl = "http://www.youtube.com/watch?v=";

function handleTimeUpdate(time) {
  console.log("Time Update:", time);
  currentTime = time;
}

function main() {
  video = document.querySelector("video.html5-main-video");

  if (!video) {
    throw new Error("No video element found!");
  }
  video.addEventListener("timeupdate", throttle(handleTimeUpdate, 500));
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
    text: "OFF",
  });
});

chrome.action.onClicked.addListener(async (tab) => {
  console.log("HELLO");
  const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
  // Next state will always be the opposite
  const nextState = prevState === "ON" ? "OFF" : "ON";

  // Set the action badge to the next state
  await chrome.action.setBadgeText({
    tabId: tab.id,
    text: nextState,
  });

  // Send a message to the active tab

  // Run the code
  main();
});
