import { connect } from 'react-redux';
import randomcolor from 'randomcolor';
import SettingsWrapper from './../components/SettingsWrapper';
import { version } from './../../package.json';
import { addLabel, updateLabel, removeLabel } from './../actions';
import {
  cleanDataLogout,
  composerEvents,
  getUserSettings,
  LabelType,
  logout,
  logoutApp,
  myAccount,
  openEmailInComposer,
  removeDevice,
  updateAccount,
  updateNameEvent,
  resendConfirmationEmail
} from '../utils/electronInterface';
import { appDomain, SocketCommand } from '../utils/const';

const defineSystemLabels = labelsArray => {
  return labelsArray.filter(label => {
    const isStarred = label.id === LabelType.starred.id;
    return isStarred;
  });
};

const defineCustomLabels = labelsArray => {
  return labelsArray.filter(label => label.type === 'custom');
};

const mapStateToProps = state => {
  const labels = state.get('labels').toJS();
  const labelsArray = Object.values(labels);
  const systemLabels = defineSystemLabels(labelsArray);
  const customLabels = defineCustomLabels(labelsArray);
  return {
    systemLabels,
    customLabels
  };
};

const formatDevicesData = devices => {
  return devices
    .map(device => {
      return {
        name: device.deviceFriendlyName,
        type: device.deviceType,
        deviceId: device.deviceId,
        lastConnection: {
          place: null,
          time: null
        },
        isCurrentDevice: device.deviceId === myAccount.deviceId
      };
    })
    .sort(device => !device.isCurrentDevice);
};

const deleteDeviceData = async () => {
  await cleanDataLogout(myAccount.recipientId);
  await logoutApp();
};

const getOS = () => {
  const osName = window.navigator.platform;
  return osName.split(' ')[0];
};

const formContactSupportEmailContent = () => {
  const lines = '<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>';
  const header = '<strong>Do not write below this line.</strong>';
  const separator = '<br/>*****************************<br/>';
  const appVersion = `<strong>Version:</strong>  ${version}<br/>`;
  const OS = `<strong>OS:</strong>  ${getOS()}<br/>`;
  return lines + header + separator + appVersion + OS;
};

const mapDispatchToProps = dispatch => {
  return {
    onAddLabel: text => {
      const color = randomcolor({
        seed: text,
        luminosity: 'bright'
      });
      const label = {
        text,
        color: color.replace('#', ''),
        visible: true
      };
      dispatch(addLabel(label));
    },
    onComposeContactSupportEmail: () => {
      const content = formContactSupportEmailContent();
      openEmailInComposer({
        type: composerEvents.NEW_WITH_DATA,
        data: {
          email: { subject: 'Customer Support - Desktop', content },
          recipients: {
            to: { name: 'Contact Support', email: `support@${appDomain}` }
          }
        }
      });
    },
    onGetUserSettings: async () => {
      const {
        devices,
        recoveryEmail,
        recoveryEmailConfirmed
      } = await getUserSettings();
      return {
        devices: formatDevicesData(devices),
        recoveryEmail,
        recoveryEmailConfirmed
      };
    },
    onUpdateAccount: async params => {
      const recipientId = myAccount.recipientId;
      const { name } = params;
      if (name) {
        const res = await updateNameEvent({
          cmd: SocketCommand.PEER_USER_NAME_CHANGED,
          params: { name }
        });
        if (res.status === 200) {
          await updateAccount({ ...params, recipientId });
        }
      } else {
        await updateAccount({ ...params, recipientId });
      }
    },
    onUpdateLabel: params => {
      dispatch(updateLabel(params));
    },
    onLogout: async () => {
      const res = await logout();
      return res.status === 200;
    },
    onDeleteDeviceData: async () => {
      await deleteDeviceData();
    },
    onRemoveLabel: labelId => {
      dispatch(removeLabel(String(labelId)));
    },
    onRemoveDevice: async params => {
      const { status } = await removeDevice(params);
      return status === 200;
    },
    onResendConfirmationEmail: () => {
      return resendConfirmationEmail();
    }
  };
};

const Settings = connect(
  mapStateToProps,
  mapDispatchToProps
)(SettingsWrapper);

export { Settings as default, deleteDeviceData };
