export function debounce(func: Function, timeout = 300) {
  let timer: NodeJS.Timeout;

  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}
