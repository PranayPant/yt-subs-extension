import { throttle } from "./throttle.js";
import { waitForElement } from "./utils.js";

let video = null;
let currentTime = null;

function handleTimeUpdate(time) {
  console.log("Time Update:", time);
  currentTime = time;
}

chrome.webNavigation.onCompleted.addListener(
  async function (details) {
    console.log("loaded", details);
    video = await waitForElement("video.html5-main-video");
    if (!video) {
      throw new Error("No video element found!");
    }
    console.log("Video", video);
    video.addEventListener("timeupdate", throttle(handleTimeUpdate, 500));
  },
  {
    url: [
      {
        hostEquals: "www.youtube.com",
        pathEquals: "/watch",
        queryPrefix: "?v=",
      },
    ],
  }
);
