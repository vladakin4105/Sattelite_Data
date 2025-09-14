import React,{useEffect,useRef} from "react";

export function DataFlowDiagram() {
  return (
    <div style={{
      display: 'flex',
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      margin: '5px 0',
      padding: '5px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        padding: '10px',
        background: 'rgba(0,0,0,0)',
        borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        border: '1px solid rgba(59,130,246,0)',
        flexWrap: 'wrap',
        justifyContent: 'space-evenly'
      }}>
        {/* Satelitul */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            color: 'white',
            boxShadow: '0 8px 20px rgba(59,130,246,0.3)',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            🛰️
          </div>
          <div style={{
            textAlign: 'center',
            fontSize: '0.9rem',
            color: '#64748b',
            fontWeight: '500'
          }}>
            Sentinel 2
          </div>
        </div>

        {/* Săgeată animată */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              style={{
                width: '8px',
                height: '8px',
                background: '#3b82f6',
                borderRadius: '50%',
                animation: `flow 1.5s ease-in-out infinite ${i * 0.2}s`
              }}
            />
          ))}
        </div>

        {/* Procesarea */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #059669, #10b981)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            color: 'white',
            boxShadow: '0 8px 20px rgba(16,185,129,0.3)'
          }}>
            ⚙️
          </div>
          <div style={{
            textAlign: 'center',
            fontSize: '0.9rem',
            color: '#64748b',
            fontWeight: '500'
          }}>
            NDVI Script
          </div>
        </div>

        {/* Săgeată animată */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              style={{
                width: '8px',
                height: '8px',
                background: '#10b981',
                borderRadius: '50%',
                animation: `flow 1.5s ease-in-out infinite ${i * 0.2}s`
              }}
            />
          ))}
        </div>

        {/* Rezultatul */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #dc2626, #ef4444)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            color: 'white',
            boxShadow: '0 8px 20px rgba(239,68,68,0.3)'
          }}>
            📊
          </div>
          <div style={{
            textAlign: 'center',
            fontSize: '0.9rem',
            color: '#64748b',
            fontWeight: '500'
          }}>
            NDVI Map
          </div>
        </div>

        <style jsx>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          
          @keyframes flow {
            0%, 100% { opacity: 0.3; transform: translateX(0); }
            50% { opacity: 1; transform: translateX(10px); }
          }
        `}</style>
      </div>
    </div>
  );
}


export function HorizontalSatelliteBanner() {
    return (
    <div style={{
      height: '120px',  
      width: '100%',
      margin: '30px auto',
      background: 'linear-gradient(90deg, rgba(10, 16, 30, 1) 0%, rgba(15,23,42,1) 20%, rgba(30,58,59,0.8) 40%, rgba(34,150,94,0.7) 60%, rgba(22,163,74,0.4) 80%, rgba(22,163,74,0) 100%)',
      borderRadius: '12px',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
    }}>
      {/* Satelitul */}
      <div style={{
        position: 'absolute',
        left: '40px',
        top: '20px',
        fontSize: '2.5rem',
        animation: 'satelliteFloat 3s ease-in-out infinite'
      }}>
        🛰️
      </div>
      
      {/* Raza de scanare */}
      <div style={{
        position: 'absolute',
        left: '90px',
        top: '35px',
        width: '200px',
        height: '2px',
        background: 'linear-gradient(90deg, #fbbf24, transparent)',
        animation: 'scanLine 2s ease-in-out infinite'
      }} />
      
      {/* Mini câmpuri */}
      <div style={{
        position: 'absolute',
        right: '60px',
        top: '30px',
        display: 'flex',
        gap: '8px'
      }}>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            style={{
              width: '20px',
              height: '30px',
              background: ['#84cc16', '#eab308', '#22c55e', '#16a34a'][i],
              borderRadius: '2px',
              animation: `cropPulse ${1.5 + i * 0.3}s ease-in-out infinite alternate`
            }}
          />
        ))}
      </div>

      {/* Text */}
      <div style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: '15px',
        color: 'white',
        fontSize: '0.9rem',
        fontWeight: '500',
        textShadow: '0 2px 4px rgba(0,0,0,0.7)',
        textAlign: 'center'
      }}>
        Satellite data processing for agricultural insights
      </div>

      <style jsx>{`
        @keyframes satelliteFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes scanLine {
          0% { opacity: 0; width: 50px; }
          50% { opacity: 1; width: 200px; }
          100% { opacity: 0; width: 300px; }
        }
        
        @keyframes cropPulse {
          0% { transform: scaleY(0.8); opacity: 0.7; }
          100% { transform: scaleY(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );

}

export function createLandCoverAnimation() {
  const landTypes = [
    { name: 'Forest', color: '#228B22' },
    { name: 'Water', color: '#1E90FF' },
    { name: 'Urban', color: '#A9A9A9' },
    { name: 'Grassland', color: '#ADFF2F' }
  ];

  return (
    <div style={{
      height: '100px',
      width: '100%',
      margin: '30px auto',
      background: 'linear-gradient(90deg, #0f172a 0%, #1e293b 100%)',
      borderRadius: '12px',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '0 40px',
      boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
    }}>
      
      {/* Titlu animat */}
      <div style={{
        fontSize: '1rem',
        fontWeight: '600',
        color: '#fff',
        textShadow: '0 2px 4px rgba(0,0,0,0.6)',
        animation: 'fadeIn 2s ease-in-out'
      }}>
        MODIS Land Cover Classification
      </div>

      {/* Pătrate animate */}
      <div style={{ display: 'flex', gap: '12px' }}>
        {landTypes.map((type, i) => (
          <div key={i} style={{
            width: '30px',
            height: '30px',
            backgroundColor: type.color,
            borderRadius: '4px',
            animation: `pulse ${1.5 + i * 0.3}s ease-in-out infinite alternate`,
            boxShadow: '0 0 6px rgba(0,0,0,0.3)'
          }} title={type.name} />
        ))}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 0.7; }
          100% { transform: scale(1.1); opacity: 1; }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}