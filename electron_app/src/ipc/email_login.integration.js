/*eslint-env node, jest */
require('./utils.js');
require('./login.js');
const { getComputerName, login } = require('../../../email_login/src/ipc.js');
const ClientAPI = require('@criptext/api');
jest.mock('@criptext/electron-better-ipc/renderer');

const expectLoginToThrow = async assertFn => {
  try {
    await login({ username: 'tester' });
    throw new Error('Error not thrown');
  } catch (err) {
    assertFn(err);
  }
};

describe('getComputerName', () => {
  it('calls the correct system call to deliver a result', async () => {
    const res = await getComputerName();
    expect(res).toEqual(expect.any(String));
  });
});

describe('login', () => {
  describe('happy path', () => {
    let res;
    beforeAll(async () => {
      ClientAPI.mockResolvedValueOnce('linkBegin', {
        status: 200,
        body: { hasTwoFactorAuth: false, token: '__JWTOKEN__' }
      });
      ClientAPI.mockResolvedValueOnce('linkAuth', { status: 200, text: 'OK' });

      res = await login({ username: 'tester' });
    });

    it('returns the token receied in linkBegin', () => {
      expect(res).toEqual('__JWTOKEN__');
    });

    it('sends the linkBegin Request correctly', () => {
      const calls = ClientAPI.getCalls('linkBegin');
      expect(calls).toEqual([['tester']]);
    });

    it('sends the linkAuth Request correctly', () => {
      const calls = ClientAPI.getCalls('linkAuth');
      expect(calls).toEqual([
        [
          expect.objectContaining({
            recipientId: 'tester',
            deviceName: expect.any(String),
            deviceFriendlyName: expect.any(String),
            deviceType: 1,
            password: undefined
          })
        ]
      ]);
    });
  });
  it('returns the token when everything goes ok', async () => {
    ClientAPI.mockResolvedValueOnce('linkBegin', {
      status: 200,
      body: { hasTwoFactorAuth: false, token: '__JWTOKEN__' }
    });
    ClientAPI.mockResolvedValueOnce('linkAuth', { status: 200, text: 'OK' });

    const res = await login({ username: 'tester' });
    expect(res).toEqual('__JWTOKEN__');
  });

  it('sends linkBegin with correct body params', async () => {});

  it('throws error with code "HAS_2FA" when user has 2FA activated', async () => {
    ClientAPI.mockResolvedValueOnce('linkBegin', {
      status: 200,
      body: { hasTwoFactorAuth: true, token: '__JWTOKEN__' }
    });

    await expectLoginToThrow(err => expect(err.code).toEqual('HAS_2FA'));
  });

  it('throws error with code "TOO_MANY_DEVICES" when linkBegin returns status code 439', async () => {
    ClientAPI.mockResolvedValueOnce('linkBegin', {
      status: 439
    });

    await expectLoginToThrow(err =>
      expect(err.code).toEqual('TOO_MANY_DEVICES')
    );
  });

  it('throws error with code "NO_DEVICES" when linkBegin returns status code 400', async () => {
    ClientAPI.mockResolvedValueOnce('linkBegin', {
      status: 400
    });

    await expectLoginToThrow(err => expect(err.code).toEqual('NO_DEVICES'));
  });

  it('throws error with code "NETWORK_ERROR" when linkBegin rejects', async () => {
    ClientAPI.mockRejectedValueOnce('linkBegin', new Error('Oops!'));

    await expectLoginToThrow(err => expect(err.code).toEqual('NETWORK_ERROR'));
  });

  it('throws error with code "NETWORK_ERROR" when linkAuth rejects', async () => {
    ClientAPI.mockResolvedValueOnce('linkBegin', {
      status: 200,
      body: { hasTwoFactorAuth: false, token: '__JWTOKEN__' }
    });
    ClientAPI.mockRejectedValueOnce('linkAuth', new Error('Oops!'));

    await expectLoginToThrow(err => expect(err.code).toEqual('NETWORK_ERROR'));
  });

  it('throws error with code "UNKNOWN_STATUS" when linkBegin returns an unknown status code', async () => {
    ClientAPI.mockResolvedValueOnce('linkBegin', {
      status: 499
    });

    await expectLoginToThrow(err => {
      expect(err.code).toEqual('UNKNOWN_STATUS');
      expect(err.status).toEqual(499);
    });
  });

  it('throws error with code "UNKNOWN_STATUS" when linkAuth returns an unknown status code', async () => {
    ClientAPI.mockResolvedValueOnce('linkBegin', {
      status: 200,
      body: { hasTwoFactorAuth: false, token: '__JWTOKEN__' }
    });
    ClientAPI.mockResolvedValueOnce('linkAuth', {
      status: 499
    });

    await expectLoginToThrow(err => {
      expect(err.code).toEqual('UNKNOWN_STATUS');
      expect(err.status).toEqual(499);
    });
  });
});
