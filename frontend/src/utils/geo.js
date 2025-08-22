// src/utils/geo.js
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (deg) => deg * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a = Math.sin(dLat/2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

export function calcParcelArea(x1, y1, x2, y2) {
  const width = haversineDistance(y1, x1, y1, x2);
  const height = haversineDistance(y1, x1, y2, x1);
  return {
    m2: width * height,
    ha: (width * height) / 10000
  };
}
