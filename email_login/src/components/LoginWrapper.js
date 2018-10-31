import React, { Component } from 'react';
import Login from './Login';
import SignUpWrapper from './SignUpElectronWrapper';
import LostAllDevicesWrapper from './LostAllDevicesWrapper';
import ContinueLogin from './ContinueLogin';
import {
  closeDialog,
  closeLogin,
  confirmLostDevices,
  createTemporalAccount,
  deleteTemporalAccount,
  openCreateKeys,
  socketClient
} from './../utils/electronInterface';
import { checkAvailableUsername, login } from '../ipc.js';
import { validateUsername } from './../validators/validators';
import { addEvent, Event } from '../utils/electronEventInterface';
import DeviceNotApproved from './DeviceNotApproved';

const mode = {
  SIGNUP: 'SIGNUP',
  LOGIN: 'LOGIN',
  CONTINUE: 'CONTINUE',
  DEVICE_NOT_APPROVED: 'DEVICE_NOT_APPROVED',
  LOST_DEVICES: 'LOST_DEVICES'
};

const errorMessages = {
  USERNAME_NOT_EXISTS: "Username doesn't exist",
  USERNAME_INVALID: 'Invalid username',
  STATUS_UNKNOWN: 'Unknown status code: '
};

const shouldDisableLogin = state =>
  !!state.errorMessage || state.username === '';

class LoginWrapper extends Component {
  constructor() {
    super();
    this.state = {
      mode: mode.LOGIN,
      username: '',
      disabledResendLoginRequest: false,
      errorMessage: ''
    };
    this.timeCountdown = 0;
    this.hasTwoFactorAuth = false;
    this.initEventListeners();
  }

  render() {
    switch (this.state.mode) {
      case mode.SIGNUP:
        return <SignUpWrapper toggleSignUp={ev => this.toggleSignUp(ev)} />;
      case mode.CONTINUE:
        return (
          <ContinueLogin
            disabledResendLoginRequest={this.state.disabledResendLoginRequest}
            toggleContinue={this.toggleContinue}
            onClickSignInWithPassword={this.handleClickSignInWithPassword}
            onClickResendLoginRequest={this.handleClickResendLoginRequest}
            hasTwoFactorAuth={this.hasTwoFactorAuth}
          />
        );
      case mode.DEVICE_NOT_APPROVED:
        return (
          <DeviceNotApproved
            toggleDeviceNotApproved={this.toggleDeviceNotApproved}
            onClickSignInWithPassword={this.handleClickSignInWithPassword}
            hasTwoFactorAuth={this.state.hasTwoFactorAuth}
          />
        );
      case mode.LOST_DEVICES:
        return (
          <LostAllDevicesWrapper
            usernameValue={this.state.username}
            toggleLostAllDevices={ev => this.toggleLostAllDevices(ev)}
            hasTwoFactorAuth={this.hasTwoFactorAuth}
            goToWaitingApproval={this.goToWaitingApproval}
          />
        );
      default:
        return (
          <Login
            toggleSignUp={ev => this.toggleSignUp(ev)}
            onClickSignIn={this.handleClickSignIn}
            onChangeField={this.handleChange}
            disabledLoginButton={shouldDisableLogin(this.state)}
            value={this.state.username}
            errorMessage={this.state.errorMessage}
          />
        );
    }
  }

  toggleSignUp = ev => {
    ev.preventDefault();
    ev.stopPropagation();
    const nextMode = this.state.mode === mode.LOGIN ? mode.SIGNUP : mode.LOGIN;
    this.setState({ mode: nextMode });
  };

  toggleContinue = ev => {
    ev.preventDefault();
    ev.stopPropagation();
    socketClient.disconnect();
    this.stopCountdown();
    const nextMode =
      this.state.mode === mode.LOGIN ? mode.CONTINUE : mode.LOGIN;
    this.setState({ mode: nextMode });
  };

  toggleLostAllDevices = ev => {
    ev.preventDefault();
    ev.stopPropagation();
    this.setState(
      {
        mode: mode.LOGIN
      },
      () => this.cleanState()
    );
  };

  toggleDeviceNotApproved = ev => {
    ev.preventDefault();
    ev.stopPropagation();
    this.setState(
      {
        mode: mode.LOGIN
      },
      () => this.cleanState()
    );
  };

  stopCountdown = () => {
    clearTimeout(this.timeCountdown);
  };

  handleCheckUsernameResponse = newUsername => ({ status }) => {
    this.setState(curState => {
      if (curState.username !== newUsername) return curState;

      switch (status) {
        case 200:
          return {
            errorMessage: errorMessages.USERNAME_NOT_EXISTS
          };
        case 422:
          return {
            errorMessage: errorMessages.USERNAME_INVALID
          };
        case 400:
          return { errorMessage: '' };
        default:
          return {
            errorMessage: errorMessages.STATUS_UNKNOWN + status
          };
      }
    });
  };

  handleChange = event => {
    const newUsername = event.target.value;

    if (!newUsername)
      return this.setState({
        username: newUsername,
        errorMessage: ''
      });

    if (!validateUsername(newUsername))
      return this.setState({
        username: newUsername,
        errorMessage: errorMessages.USERNAME_INVALID
      });

    if (this.lastCheck) clearTimeout(this.lastCheck);

    this.lastCheck = setTimeout(() => {
      if (this.state.username !== newUsername) return;

      checkAvailableUsername(newUsername).then(
        this.handleCheckUsernameResponse(newUsername)
      );
    }, 300);

    this.setState({
      username: newUsername,
      errorMessage: ''
    });
  };

  handleClickSignIn = async ev => {
    ev.preventDefault();
    ev.stopPropagation();
    await this.initLinkDevice();
  };

  goToPasswordLogin = () => {
    this.setState({
      mode: mode.LOST_DEVICES
    });
  };

  goToWaitingApproval = password => {
    // cache the password for retres
    this.password = password;
    this.setState(
      {
        mode: mode.CONTINUE
      },
      () => {
        this.initLinkDevice();
      }
    );
  };

  initLinkDevice = () => {
    login({
      password: this.password,
      username: this.state.username,
      ephemeralToken: this.ephemeralToken
    })
      .then(jwt =>
        this.setState({ mode: mode.CONTINUE }, () => {
          this.ephemeralToken = jwt;
          createTemporalAccount({ recipientId: this.state.username });
          socketClient.start({ jwt });
        })
      )
      .catch(err => {
        this.ephemeralToken = err.ephemeralToken || this.ephemeralToken;
        switch (err.code) {
          case 'HAS_2FA': {
            this.hasTwoFactorAuth = true;
            return this.goToPasswordLogin();
          }
          case 'NO_DEVICES': {
            return this.goToPasswordLogin();
          }
          case 'TOO_MANY_DEVICES': {
            return console.error('User has too many devices');
          }
          case 'NOT_FOUND': {
            return console.error('No devices found');
          }
          case 'UNKNOWN_STATUS': {
            return console.error('unknown status code: ', err.status);
          }
          case 'NETWORK_ERROR': {
            return console.error('Network error. Please try again later.');
          }
          default: {
            return console.error('Unexpected error', err);
          }
        }
      });
  };

  handleClickSignInWithPassword = ev => {
    ev.preventDefault();
    ev.stopPropagation();
    confirmLostDevices(response => {
      closeDialog();
      if (response === 'Continue') {
        socketClient.disconnect();
        this.stopCountdown();
        this.goToPasswordLogin();
      }
    });
  };

  handleClickResendLoginRequest = ev => {
    ev.preventDefault();
    ev.stopPropagation();
    this.setState({ disabledResendLoginRequest: true }, () =>
      this.initLinkDevice()
    );
  };

  initEventListeners = () => {
    addEvent(Event.LINK_DEVICE_CONFIRMED, params => {
      socketClient.disconnect();
      openCreateKeys({ loadingType: 'link-new-device', remoteData: params });
      deleteTemporalAccount();
      closeLogin();
    });

    addEvent(Event.LINK_DEVICE_DENIED, () => {
      socketClient.disconnect();
      this.setState({
        mode: mode.DEVICE_NOT_APPROVED
      });
    });
  };

  cleanState = () => {
    this.setState({
      values: {
        username: ''
      },
      disabledResendLoginRequest: false,
      errorMessage: ''
    });
  };
}

export default LoginWrapper;
