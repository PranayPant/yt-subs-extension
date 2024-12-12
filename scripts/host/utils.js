function parseTTML(ttmlString) {
  const lines = ttmlString.split("\\n");
  const subtitles = [];
  const regex = /<p begin=\\\"(.*)\\\"\s+end=\\\"(.*)\\\"\s+.*>(.*)<\/p>/;

  for (const line of lines) {
    if (!line.startsWith("<p")) continue;
    const [, begin, end, text] = line.match(regex);
    if (text.length) {
      subtitles.push({
        begin,
        end,
        text,
        beginSeconds: timeStringToSeconds(begin),
        endSeconds: timeStringToSeconds(end),
      });
    }
  }

  return subtitles;
}

function getNextIndex(currentIndex, subtitlesData, currentTime) {
  if (currentTime <= subtitlesData[currentIndex].endSeconds) {
    return currentIndex;
  }
  return (currentIndex + 1) % subtitlesData.length;
}

function timeStringToSeconds(timeString) {
  const [hours, minutes, seconds] = timeString.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

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

function log(...messages) {
  console.log("[yt-dlp extension]:", ...messages);
}
