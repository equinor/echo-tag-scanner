import { EchoEnv } from '@equinor/echo-core';

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

function getIsDevelopment() {
  return (
    EchoEnv.env().REACT_APP_API_URL ===
    'https://dt-echopedia-api-dev.azurewebsites.net'
  );
}

export const isDevelopment = getIsDevelopment();
