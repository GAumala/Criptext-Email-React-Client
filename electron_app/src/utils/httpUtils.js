/* eslint-env node */
const extractResponseSubset = ({ status, text, body }) => ({
  status,
  text,
  body
});

const rejectAsNetworkError = (/*err*/) => {
  // we should do some logging here
  return Promise.reject({ code: 'NETWORK_ERROR' });
};

module.exports = { extractResponseSubset, rejectAsNetworkError };
