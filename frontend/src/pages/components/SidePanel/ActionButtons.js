import React from 'react';
import { INPUT_STYLES, BUTTON_STYLES } from '../../constants/styleConfig';

const ActionButtons = ({ 
  nameInput, 
  onChangeName, 
  onSetName, 
  onPress 
}) => {
  return (
    <>
      {/* Set Name Form */}
      <form onSubmit={onSetName} style={{ marginBottom: '0.5rem' }}>
        <input
          value={nameInput}
          onChange={onChangeName}
          placeholder="Set display name"
          style={INPUT_STYLES.text}
        />
        <button type="submit" style={{ padding: '0.25rem 0.5rem' }}>
          Set
        </button>
      </form>

      {/* Press Button */}
      <button
        onClick={onPress}
        style={BUTTON_STYLES.action}
      >
        Press me
      </button>
    </>
  );
};

export default ActionButtons;