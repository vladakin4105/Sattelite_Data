import React from 'react';
import NdviButton from "../../../components/NdviButton";
import ModisButton from "../../../components/ModisButton";
import History from '../../../utils/History';
import UserInfo from './UserInfo';
import ActionButtons from './ActionButtons';
import CoordinateForm from './CoordinateForm';
import { SIDEBAR_STYLES, LAYOUT_STYLES } from '../../constants/styleConfig';

const SidePanel = ({
  // User props
  user,
  mapReady,
  
  // Map props
  mapRef,
  coordInputs,
  
  // Actions
  userActions,
  coordinateActions,
  ndviActions,
  guestStorage,
  
  // Data
  historyVersion,
  message
}) => {
  const { getPendingCount, getActionsCount } = guestStorage;

  const handleHistoryDelete = async (coordId) => {
    try {
      const response = await fetch(
        `http://localhost:8000/users/${user.username}/coords/${coordId}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to delete coord");
      alert(`Coordinate deleted for user: ${user.username}`);
      coordinateActions.refreshHistory();
    } catch (err) {
      console.error("Error deleting coord:", err);
      throw err;
    }
  };

  return (
    <div style={SIDEBAR_STYLES.container}>
      <h3>Menu</h3>

      <NdviButton 
        mapRef={mapRef} 
        coordInputs={coordInputs} 
        saveBox={coordinateActions.saveBox} 
      />
      
      <ModisButton 
        bbox={
          coordInputs.x1 && coordInputs.y1 && coordInputs.x2 && coordInputs.y2
            ? [
                parseFloat(coordInputs.x1),
                parseFloat(coordInputs.y1),
                parseFloat(coordInputs.x2),
                parseFloat(coordInputs.y2),
              ]
            : null
        }
        mapRef={mapRef}
      />

      <div style={SIDEBAR_STYLES.menuSection}>
        <UserInfo 
          user={user}
          mapReady={mapReady}
          onLogout={userActions.handleLogout}
        />

        <p>
          Map status: <strong>{mapReady ? 'Ready' : 'Loading...'}</strong>
        </p>

        <ActionButtons
          nameInput={userActions.nameInput}
          onChangeName={userActions.handleChangeName}
          onSetName={(e) => userActions.handleSetName(e, coordinateActions.setUsername)}
          onPress={userActions.handlePress}
        />

        <CoordinateForm
          coordInputs={coordInputs}
          onCoordChange={coordinateActions.handleCoordChange}
          onSaveCoords={coordinateActions.handleSaveCoords}
          onShowOnMap={() => coordinateActions.showRectOnMap(mapRef)}
          onRemoveOverlay={() => {
            const message = ndviActions.handleRemoveOverlay();
            userActions.setMessage(message);
          }}
          isLoadingNdvi={ndviActions.isLoadingNdvi}
          mapReady={mapReady}
          ndviActive={ndviActions.ndviActive}
        />

        <History
          fetchHistory={async () => {
            try {
              const response = await fetch(
                `http://localhost:8000/users/${user.username}/coords`
              );
              if (!response.ok) throw new Error('Failed to fetch history');
              return await response.json();
            } catch (err) {
              console.error(err);
              return [];
            }
          }}
          onSelect={coordinateActions.handleHistorySelect}
          deleteCoord={handleHistoryDelete}
          version={historyVersion}
        />

        {/* Storage Information */}
        <div style={LAYOUT_STYLES.infoSection}>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Storage type:</strong>{' '}
            {!user || user.username === 'guest' ? 'Temporary' : 'Persistent'}
          </div>

          {getPendingCount(user) > 0 && (
            <div style={LAYOUT_STYLES.pendingAlert}>
              <strong>Pending coordinates:</strong> {getPendingCount(user)}
            </div>
          )}

          {getActionsCount(user) > 0 && (
            <div style={LAYOUT_STYLES.actionsAlert}>
              <strong>Actions:</strong> {getActionsCount(user)}
            </div>
          )}
        </div>

        {message && (
          <div style={LAYOUT_STYLES.messageAlert}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default SidePanel;