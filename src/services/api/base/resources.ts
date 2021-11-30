// maybe declare env type for globalThis as that works in workers and everywhere else too.
function env() {
  if (window._env_) {
    return window._env_;
  } else {
    return process.env;
  }
}

function apiUrl() {
  // TODO: this should probably use these variables instead of process.env
  // return window._env_;

  // dotenv-webpack requires DIRECT reference to output the variable
  const apiUrl = env().REACT_APP_API_URL ?? process.env.REACT_APP_API_URL;

  if (!apiUrl) {
    throw new Error('No environment variables could be found.');
  }

  return apiUrl;
}

export default {
  baseApiUrl: apiUrl()
};
