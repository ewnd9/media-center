import React from 'react';

export default ({ icon, children, onClick, disabled, className }) => {
  return (
    <button type="button"
            className={`btn btn-default btn-icon btn-sm ${disabled && 'disabled' || ''} ${className || ''}`}
            onClick={onClick}>
      <span className={`glyphicon glyphicon-${icon}`}
            aria-hidden="true"></span>
      {' '}
      {children}
    </button>
  );
};
