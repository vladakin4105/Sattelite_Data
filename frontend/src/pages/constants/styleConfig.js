// src/pages/Home/constants/styleConfig.js

export const SIDEBAR_STYLES = {
  container: {
    width: '350px',
    background: 'linear-gradient(145deg, #4f4f4f, #3a3a3a)',
    padding: '1rem',
    color: '#fff',
    overflowY: 'auto'
  },
  menuSection: {
    background: '#555',
    padding: '1rem',
    borderRadius: '8px',
    boxShadow: '2px 2px 5px rgba(0,0,0,0.5)'
  },
  coordinateSection: {
    marginTop: '1rem',
    padding: '1rem',
    background: '#666',
    borderRadius: '6px'
  }
};

export const BUTTON_STYLES = {
  primary: {
    width: '100%',
    padding: '0.5rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginBottom: '0.5rem'
  },
  secondary: {
    width: '100%',
    padding: '0.5rem',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  danger: {
    width: '100%',
    padding: '0.5rem',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginBottom: '0.5rem'
  },
  disabled: {
    width: '100%',
    padding: '0.5rem',
    backgroundColor: '#555',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'not-allowed',
    fontWeight: 'bold',
    marginBottom: '0.5rem'
  },
  logout: {
    marginLeft: 'auto',
    padding: '0.25rem 0.5rem',
    fontSize: '0.8rem',
    borderRadius: '4px',
    backgroundColor: '#000000ff',
    color: 'white',
    border: 'none',
    cursor: 'pointer'
  },
  action: {
    display: 'block',
    marginTop: '0.5rem',
    padding: '0.5rem',
    backgroundColor: '#666',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '100%'
  }
};

export const INPUT_STYLES = {
  text: {
    marginRight: '0.5rem',
    padding: '0.25rem'
  },
  coordinate: {
    width: '100%',
    padding: '0.25rem',
    borderRadius: '3px',
    border: 'none'
  }
};

export const LAYOUT_STYLES = {
  mainContainer: {
    display: 'flex',
    height: 'calc(100vh - 64px)'
  },
  mapContainer: {
    flex: 1,
    position: 'relative'
  },
  userInfoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '0.5rem'
  },
  coordinateGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.5rem',
    marginBottom: '0.5rem'
  },
  infoSection: {
    marginTop: '1rem',
    fontSize: '0.9em'
  },
  pendingAlert: {
    marginBottom: '0.5rem',
    padding: '0.5rem',
    background: 'rgba(255,165,0,0.2)',
    borderRadius: 4
  },
  actionsAlert: {
    marginBottom: '0.5rem',
    padding: '0.5rem',
    background: 'rgba(0,255,0,0.2)',
    borderRadius: 4
  },
  messageAlert: {
    marginTop: '1rem',
    padding: '0.5rem',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: 6
  }
};

export const MAP_MENU_STYLES = {
  container: {
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    padding: '4px'
  },
  button: {
    cursor: 'pointer',
    fontSize: '16px',
    background: '#ffffff',
    border: '1px solid #ddd',
    borderRadius: '6px',
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    pointerEvents: 'auto'
  },
  buttonHover: {
    background: '#eef6ff'
  }
};