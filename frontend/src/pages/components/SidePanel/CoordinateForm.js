import React from 'react';
import { LAYOUT_STYLES, BUTTON_STYLES, INPUT_STYLES } from '../../constants/styleConfig';

const CoordinateForm = ({ 
  coordInputs, 
  onCoordChange, 
  onSaveCoords, 
  onShowOnMap,
  onRemoveOverlay,
  isLoadingNdvi, 
  mapReady,
  ndviActive
}) => {
  return (
    <div style={LAYOUT_STYLES.coordinateSection}>
      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9em' }}>
        Enter Coordinates:
      </h4>

      <div style={LAYOUT_STYLES.coordinateGrid}>
        {['x1', 'y1', 'x2', 'y2'].map((field) => (
          <div key={field}>
            <label
              style={{
                display: 'block',
                fontSize: '0.8em',
                marginBottom: '2px'
              }}
            >
              {field.toUpperCase()}:
            </label>
            <input
              type="number"
              step="0.000001"
              value={coordInputs[field]}
              onChange={(e) => onCoordChange(field, e.target.value)}
              style={INPUT_STYLES.coordinate}
            />
          </div>
        ))}
      </div>

      <button
        onClick={onSaveCoords}
        disabled={isLoadingNdvi || !mapReady}
        style={
          isLoadingNdvi || !mapReady 
            ? BUTTON_STYLES.disabled 
            : BUTTON_STYLES.primary
        }
      >
        {!mapReady
          ? 'Map Loading...'
          : isLoadingNdvi
          ? 'Loading NDVI...'
          : 'Save Coordinates'}
      </button>

      {ndviActive && (
        <button
          onClick={onRemoveOverlay}
          disabled={!mapReady}
          style={!mapReady ? BUTTON_STYLES.disabled : BUTTON_STYLES.danger}
        >
          Remove NDVI Overlay
        </button>
      )}

      <button
        onClick={onShowOnMap}
        disabled={!mapReady}
        style={!mapReady ? BUTTON_STYLES.disabled : BUTTON_STYLES.secondary}
      >
        Show on Map
      </button>
    </div>
  );
};

export default CoordinateForm;