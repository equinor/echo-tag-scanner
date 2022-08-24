export function debounce(func: Function, timeout = 300) {
  let timer: NodeJS.Timeout;

  return (...args: any) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      //@ts-expect-error
      func.apply(this, args);
    }, timeout);
  };
}
