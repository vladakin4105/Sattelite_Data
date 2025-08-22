// src/components/CoordinateForm.js
import React from 'react';
import { calcParcelArea } from '../utils/geo';

export default function CoordinateForm({ coordInputs, setCoordInputs, onSave }) {
  const handleChange = (field, value) => {
    setCoordInputs(prev => ({ ...prev, [field]: value }));
  };

  const { m2, ha } = (coordInputs.x1 && coordInputs.x2)
    ? calcParcelArea(coordInputs.x1, coordInputs.y1, coordInputs.x2, coordInputs.y2)
    : { m2: 0, ha: 0 };

  return (
    <div style={{ padding: '1rem', background: '#666', borderRadius: '6px' }}>
      <h4>Enter Coordinates:</h4>
      <input value={coordInputs.x1} onChange={(e) => handleChange('x1', e.target.value)} />
      <input value={coordInputs.y1} onChange={(e) => handleChange('y1', e.target.value)} />
      <input value={coordInputs.x2} onChange={(e) => handleChange('x2', e.target.value)} />
      <input value={coordInputs.y2} onChange={(e) => handleChange('y2', e.target.value)} />
      <button onClick={() => onSave(coordInputs)}>Save</button>
      {m2 > 0 && (
        <p>Suprafață: {m2.toFixed(2)} m² ({ha.toFixed(4)} ha)</p>
      )}
    </div>
  );
}
