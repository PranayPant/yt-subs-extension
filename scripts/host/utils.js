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

function getNextLines(lastIndex, subtitlesData, currentTime) {
  if (!isNaN(lastIndex) && currentTime <= subtitlesData[lastIndex].endSeconds) {
    return currentIndex;
  }

  let lines = []

  for(let iteration = 0; iteration < subtitlesData.length ; iteration += 1){
    const {text, beginSeconds, endSeconds} = subtitlesData[lastIndex]
    if(currentTime >= beginSeconds && currentTime <= endSeconds){
        lines.push(text)
    }
    else {
        break
    }
  }

  return lines;
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
