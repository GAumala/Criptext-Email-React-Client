import React from 'react';
import PropTypes from 'prop-types';
import ActivityPanel from './../containers/ActivityPanel';
import MainWrapper from './MainWrapper';
import SideBar from './../containers/SideBar';
import WelcomeWrapper from './WelcomeWrapper';
import { myAccount } from '../utils/electronInterface';
import PopupHOC from './PopupHOC';
import DeviceRemovedPopup from './DeviceRemovedPopup';
import PasswordChangedPopupWrapper from './PasswordChangedPopupWrapper';
import { MAILBOX_POPUP_TYPES } from './PanelWrapper';
import './panel.css';

const Panel = props => (
  <div
    className={
      'wrapper-in ' +
      defineWrapperClass(props.isOpenSideBar, props.isOpenActivityPanel)
    }
  >
    <div className="wrapper-left">
      <SideBar
        mailboxSelected={props.sectionSelected.params.mailboxSelected}
        onClickSection={props.onClickSection}
        onToggleSideBar={props.onToggleSideBar}
      />
      <MainWrapper
        onClickSection={props.onClickSection}
        onClickThreadBack={props.onClickThreadBack}
        onToggleActivityPanel={props.onToggleActivityPanel}
        sectionSelected={props.sectionSelected}
      />
    </div>
    <ActivityPanel
      onClickSection={props.onClickSection}
      onToggleActivityPanel={props.onToggleActivityPanel}
    />
    {props.isOpenWelcome &&
      !myAccount.opened && (
        <WelcomeWrapper onClickCloseWelcome={props.onClickCloseWelcome} />
      )}
    {!props.isHiddenMailboxPopup &&
      renderMailboxPopup({
        type: props.mailboxPopupType,
        isHidden: props.isHiddenMailboxPopup,
        props
      })}
  </div>
);

const renderMailboxPopup = ({ type, isHidden, props }) => {
  switch (type) {
    case MAILBOX_POPUP_TYPES.DEVICE_REMOVED: {
      const DeviceRemovedpopup = PopupHOC(DeviceRemovedPopup);
      return (
        <DeviceRemovedpopup
          isHidden={isHidden}
          popupPosition={{ left: '50%', top: '50%' }}
          {...props}
        />
      );
    }
    case MAILBOX_POPUP_TYPES.PASSWORD_CHANGED: {
      const PasswordChangedpopup = PopupHOC(PasswordChangedPopupWrapper);
      return (
        <PasswordChangedpopup
          isHidden={props.isHiddenMailboxPopup}
          popupPosition={{ left: '50%', top: '50%' }}
          isClosable={false}
          theme={'dark'}
          {...props}
        />
      );
    }
    case MAILBOX_POPUP_TYPES.ONLY_BACKDROP: {
      return <div className="mailbox-linking-devices-backdrop" />;
    }
    default:
      return null;
  }
};

const defineWrapperClass = (isOpenSideBar, isOpenActivityPanel) => {
  const sidebarClass = isOpenSideBar
    ? 'sidebar-app-expand'
    : 'sidebar-app-collapse';
  const navigationClass = isOpenActivityPanel
    ? ' navigation-feed-expand'
    : ' navigation-feed-collapse';
  return sidebarClass.concat(navigationClass);
};

Panel.propTypes = {
  isHiddenMailboxPopup: PropTypes.bool,
  isOpenActivityPanel: PropTypes.bool,
  isOpenSideBar: PropTypes.bool,
  isOpenWelcome: PropTypes.bool,
  mailboxPopupType: PropTypes.string,
  onClickCloseWelcome: PropTypes.func,
  onClickThreadBack: PropTypes.func,
  onClickSection: PropTypes.func,
  onToggleActivityPanel: PropTypes.func,
  onToggleSideBar: PropTypes.func,
  sectionSelected: PropTypes.object
};

export default Panel;
