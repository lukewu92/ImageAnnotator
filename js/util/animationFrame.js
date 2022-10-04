let stop = false;
let frameCount = 0;
let fps, fpsInterval, startTime, now, then, elapsed;

const requestAnimate = (callback) => {
  // request another frame
  requestAnimationFrame(() => requestAnimate(callback));
  // calc elapsed time since last loop

  now = Date.now();
  elapsed = now - then;

  // if enough time has elapsed, draw the next frame

  if (elapsed > fpsInterval) {
    then = now - (elapsed % fpsInterval);
    // Put your drawing code here
    if (callback) {
      callback();
    }
  }
};

// This allows us to limit requestAnimationFrame fps
export const startRequestAnimation = (fps, callback) => {
  fpsInterval = 1000 / fps;
  then = Date.now();
  startTime = then;
  requestAnimate(callback);
};
