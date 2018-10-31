/* eslint-env jest, node */
const fns = {
  linkBegin: jest.fn(),
  linkAuth: jest.fn(),
  checkAvailableUsername: jest.fn()
};
class ClientAPI {
  constructor() {
    this.linkBegin = a => fns.linkBegin(a);
    this.linkAuth = a => fns.linkAuth(a);
    this.checkAvailableUsername = a => fns.checkAvailableUsername(a);
  }

  static mockResolvedValueOnce(fnKey, v) {
    fns[fnKey].mockResolvedValueOnce(v);
  }

  static mockRejectedValueOnce(fnKey, e) {
    fns[fnKey].mockRejectedValueOnce(e);
  }

  static getCalls(fnKey) {
    return fns[fnKey].mock.calls;
  }
}

module.exports = ClientAPI;
