import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  validateUsername,
  validateFullname,
  validatePassword,
  validateConfirmPassword,
  validateAcceptTerms,
  validateEmail
} from './../validators/validators';
import SignUp from './SignUp';
import { hashPassword } from '../utils/HashUtils';

const formItems = [
  {
    name: 'username',
    placeholder: 'Username',
    type: 'text',
    label: {
      text: '@criptext.com',
      strong: ''
    },
    icon: '',
    icon2: '',
    errorMessage: 'Username not available',
    value: '',
    optional: false
  },
  {
    name: 'fullname',
    placeholder: 'Full name',
    type: 'text',
    label: {
      text: '',
      strong: ''
    },
    icon: '',
    icon2: '',
    errorMessage: '',
    value: '',
    optional: false
  },
  {
    name: 'password',
    placeholder: 'Password',
    type: 'password',
    label: {
      text: '',
      strong: ''
    },
    icon: 'icon-not-show',
    icon2: 'icon-show',
    errorMessage: '',
    value: '',
    optional: false
  },
  {
    name: 'confirmpassword',
    placeholder: 'Confirm password',
    type: 'password',
    label: {
      text: '',
      strong: ''
    },
    icon: 'icon-not-show',
    icon2: 'icon-show',
    errorMessage: 'Passwords do not match',
    value: '',
    optional: false
  },
  {
    name: 'recoveryemail',
    placeholder: 'Recovery email address (optional)',
    type: 'text',
    label: {
      text: '',
      strong: ''
    },
    icon: '',
    icon2: '',
    errorMessage: 'Email invalid',
    value: '',
    optional: true
  },
  {
    name: 'acceptterms',
    placeholder: '',
    type: 'checkbox',
    label: {
      text: 'I have read and agree with the ',
      strong: 'Terms and Conditions'
    },
    icon: '',
    icon2: '',
    errorMessage: '',
    value: false,
    optional: false
  }
];

const onInitState = (array, field) =>
  array.reduce((obj, item) => {
    // eslint-disable-next-line fp/no-mutation
    obj[item[field]] = item.value;
    return obj;
  }, {});

const onInitErrors = (array, field) =>
  array.reduce((obj, item) => {
    // eslint-disable-next-line fp/no-mutation
    obj[item[field]] = false;
    return obj;
  }, {});

class SignUpWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: onInitState(formItems, 'name'),
      errors: onInitErrors(formItems, 'name'),
      disabled: true
    };
  }

  render() {
    return (
      <div>
        <SignUp
          {...this.props}
          states={this.state}
          items={formItems}
          onChangeField={this.handleChange}
          disabled={this.state.disabled}
          onClickSignUp={this.handleClickSignUp}
          validator={this.universalValidator}
          errors={this.state.errors}
          onSetError={this.onSetError}
        />
      </div>
    );
  }

  checkDisable = () => {
    var disabled = false;
    const errors = {};
    formItems.forEach(formItem => {
      if (
        !formItem.optional ||
        (formItem.optional && this.state.values[formItem.name] !== '')
      ) {
        const result = this.universalValidator(
          formItem.name,
          this.state.values[formItem.name]
        );
        // eslint-disable-next-line fp/no-mutation
        errors[formItem.name] = !result;
        // eslint-disable-next-line fp/no-mutation
        disabled = disabled || !result;
      }
    });
    this.setState({
      disabled: disabled,
      errors: errors
    });
  };

  onSetError = (formItemName, errorValue) => {
    const errors = this.state.errors;
    this.setState({ errors: { ...errors, [formItemName]: errorValue } });
  };

  handleChange = (event, field) => {
    const values = { ...this.state.values, [field]: event.target.value };
    this.setState({ values }, () => {
      this.checkDisable();
    });
  };

  handleClickSignUp = event => {
    event.preventDefault();
    event.stopPropagation();
    const values = this.state.values;

    if (values.recoveryemail !== '') {
      this.onSubmit(values);
    } else {
      this.props.onSubmitWithoutRecoveryEmail(response => {
        if (response === 'Confirm') {
          this.onSubmit(values);
        }
      });
    }
  };

  onSubmit = values => {
    const username = values.username;
    const password = values.password;
    const hashedPassword = hashPassword(password);
    const submitValues = {
      username: username,
      password: hashedPassword,
      name: values.fullname,
      recoveryEmail: values.recoveryemail
    };
    this.props.onFormReady(submitValues);
  };

  checkUsername = async user => {
    const isUsernameAvailable =
      validateUsername(user) && (await this.props.isUsernameAvailable(user));
    if (!isUsernameAvailable) {
      const errorState = { ...this.state.errors, username: true };
      this.setState({
        disabled: true,
        errors: errorState
      });
    }
  };

  universalValidator = (formItemName, formItemValue) => {
    switch (formItemName) {
      case 'username': {
        this.checkUsername(formItemValue);
        return validateUsername(formItemValue);
      }
      case 'fullname': {
        return validateFullname(formItemValue);
      }
      case 'password': {
        return validatePassword(formItemValue);
      }
      case 'confirmpassword': {
        const password = this.state.values['password'];
        return validateConfirmPassword(password, formItemValue);
      }
      case 'recoveryemail': {
        return validateEmail(formItemValue);
      }
      default:
        return validateAcceptTerms(formItemValue);
    }
  };
}

// eslint-disable-next-line fp/no-mutation
SignUpWrapper.propTypes = {
  isUsernameAvailable: PropTypes.func,
  onFormReady: PropTypes.func,
  onSubmitWithoutRecoveryEmail: PropTypes.func
};

export default SignUpWrapper;
