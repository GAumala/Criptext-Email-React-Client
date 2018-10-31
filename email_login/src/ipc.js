/* eslint-env node */
const { callMain } = require('@criptext/electron-better-ipc/renderer');

const getComputerName = () => callMain('get-computer-name');

const checkAvailableUsername = username =>
  callMain('check-available-username', username);

const login = params => callMain('login', params);

module.exports = { checkAvailableUsername, getComputerName, login };
