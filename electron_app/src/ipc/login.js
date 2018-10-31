const ipc = require('@criptext/electron-better-ipc');
const {
  extractResponseSubset,
  rejectAsNetworkError
} = require('../utils/httpUtils');
const { hashPassword } = require('../utils/HashUtils');
const { getComputerName } = require('../utils/osUtils');
const {
  DEV_SERVER_URL,
  PROD_SERVER_URL,
  DEVICE_TYPE
} = require('../utils/const');
const ClientAPI = require('@criptext/api');

const client = new ClientAPI({
  timeout: 6000,
  url:
    process.env.NODE_ENV === 'development' ? DEV_SERVER_URL : PROD_SERVER_URL,
  version: '3.0.0'
});

ipc.answerRenderer('check-available-username', username =>
  client.checkAvailableUsername(username).then(extractResponseSubset)
);

const linkBegin = async (targetUsername, didInputPassword) => {
  const { status, body } = await client
    .linkBegin(targetUsername)
    .then(extractResponseSubset, rejectAsNetworkError);

  if (status === 200) {
    const { hasTwoFactorAuth, token } = body;
    if (hasTwoFactorAuth && !didInputPassword)
      return Promise.reject({ code: 'HAS_2FA' });

    return token;
  }

  if (status === 439) throw { code: 'TOO_MANY_DEVICES' };

  if (status === 404) throw { code: 'NOT_FOUND' };

  if (status === 400) throw { code: 'NO_DEVICES' };

  throw { code: 'UNKNOWN_STATUS', status };
};

const linkAuth = async ({ recipientId, jwt, password }) => {
  const pcName = getComputerName();
  const newDeviceData = {
    recipientId,
    password: password || undefined,
    deviceName: pcName || 'desktop',
    deviceFriendlyName: pcName || 'desktop',
    deviceType: DEVICE_TYPE
  };

  const { status } = await client
    .linkAuth(newDeviceData)
    .then(extractResponseSubset, rejectAsNetworkError);

  if (status === 200) return;

  throw { code: 'UNKNOWN_STATUS', ephemeralToken: jwt, status };
};

ipc.answerRenderer('login', async ({ username, password, ephemeralToken }) => {
  const token = ephemeralToken || (await linkBegin(username, !!password));
  await linkAuth({
    recipientId: username,
    password: password && hashPassword(password),
    jwt: token
  });
  return token;
});
