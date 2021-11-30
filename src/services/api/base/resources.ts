function env() {
  if (window._env_) {
    return window._env_;
  } else {
    return process.env;
  }
}

function apiUrl() {
  const apiUrl = env().REACT_APP_API_URL ?? process.env.REACT_APP_API_URL;

  if (!apiUrl) {
    throw new Error('No environment variables could be found.');
  }

  return apiUrl;
}

const baseApiUrl = apiUrl();

export { baseApiUrl };
