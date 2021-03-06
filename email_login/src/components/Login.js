import React from 'react';
import PropTypes from 'prop-types';
import './login.scss';

const Login = props => renderLogin(props);

const renderLogin = props => (
  <div className="login">
    {renderHeader()}
    {renderForm(props)}
    {renderFooter(props)}
  </div>
);

const renderHeader = () => (
  <div className="header">
    <div className="logo">
      <div className="icon" />
    </div>
    <div className="text">
      <span>Welcome to Criptext!</span>
    </div>
  </div>
);

const renderForm = props => (
  <div className="form">
    <form autoComplete="off">
      <div className="label">
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={props.value}
          onChange={props.onChangeField}
          autoFocus={true}
        />
        &nbsp;
        <span>@criptext.com</span>
      </div>
      <span className="error-message">{props.errorMessage}</span>
      <div className="button">
        <button
          className="button-login"
          onClick={ev => props.onClickSignIn(ev)}
          disabled={props.disabledLoginButton}
        >
          <span>Sign In</span>
        </button>
      </div>
    </form>
  </div>
);

const renderFooter = props => (
  <div className="footer">
    <div className="signup-message">
      <span>
        Not registered? &nbsp;
        <strong onClick={ev => props.toggleSignUp(ev)}>Sign up</strong>
      </span>
    </div>
  </div>
);

// eslint-disable-next-line fp/no-mutation
renderForm.propTypes = {
  disabledLoginButton: PropTypes.bool,
  errorMessage: PropTypes.string,
  onChangeField: PropTypes.func,
  onClickSignIn: PropTypes.func,
  value: PropTypes.string
};

// eslint-disable-next-line fp/no-mutation
renderFooter.propTypes = {
  toggleSignUp: PropTypes.func
};

export default Login;
