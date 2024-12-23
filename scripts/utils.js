export function handleTimeUpdate(time) {
  console.log("Time Update:", time);
  currentTime = time;
}

export function throttle(func, delay) {
  let inThrottle = false;

  return function () {
    if (!inThrottle) {
      func.apply(this, arguments);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), delay);
    }
  };
}
