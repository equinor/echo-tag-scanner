import dotenv from 'dotenv';

const getGlobals = () => {
  const envVars = {
    'NODE_ENV': process.env.NODE_ENV,
    ...dotenv.config().parsed
  }
  const globals = `
    var process = {
      env: ${JSON.stringify(envVars)}
    };
  `
  return globals
}

export const globals = getGlobals();