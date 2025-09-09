import React from 'react';
import { LAYOUT_STYLES, BUTTON_STYLES } from '../../constants/styleConfig';

const UserInfo = ({ user, mapReady, onLogout }) => {
  return (
    <div style={LAYOUT_STYLES.userInfoRow}>
      <span>
        Current user: <strong>{user?.username ?? 'guest'}</strong>
      </span>
      <button
        onClick={onLogout}
        style={BUTTON_STYLES.logout}
      >
        Log Out
      </button>
    </div>
  );
};

export default UserInfo;