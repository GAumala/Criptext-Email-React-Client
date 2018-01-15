import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Email from './Email';
import './thread.css';

class Thread extends Component {
  render() {
    return (
      <div className="thread-container">
        <header />
        <div className="thread-content">
          <div className="thread-info" />
          <div className="thread-emails">
            {this.props.emails.map((email, index) => {
              return <Email key={index} email={email} />;
            })}
          </div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    this.props.onLoadEmails();
  }
}

Thread.propTypes = {
  emails: PropTypes.object
};

export default Thread;