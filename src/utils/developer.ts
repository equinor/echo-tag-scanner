import { EchoEnv } from '@equinor/echo-core';

/**
 * Returns true if the developer is currently in a predetermined local development environment.
 */
function getIsLocalDevelopment() {
  const url = globalThis.location.href;
  if (url.includes('localhost')) return true;
  if (url.includes('.loca.lt')) return true;

  return false;
}

/**
 * Returns true if the developer is currently in a development environment, which is strictly not just a local machine.
 */
function getIsDevelopment() {
  return (
    EchoEnv.env().REACT_APP_API_URL ===
    'https://dt-echopedia-api-dev.azurewebsites.net'
  );
}

export const isDevelopment = getIsDevelopment();
export const isLocalDevelopment = isDevelopment && getIsLocalDevelopment();
export const isProduction = EchoEnv.isProduction();
export const isQA =
  EchoEnv.env().REACT_APP_API_URL ===
  'https://dt-echopedia-api-dev.azurewebsites.net';
