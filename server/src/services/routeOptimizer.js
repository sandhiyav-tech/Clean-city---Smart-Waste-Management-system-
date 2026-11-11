/**
 * Haversine distance formula between two (lat, lng) points in kilometers.
 */
function haversineDistance(coord1, coord2) {
  const R = 6371; // Earth's mean radius in km
  const toRad = (deg) => (deg * Math.PI) / 180;

  const lat1 = coord1.lat;
  const lon1 = coord1.lng;
  const lat2 = coord2.lat;
  const lon2 = coord2.lng;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates total distance of an ordered route array.
 */
function calculateTotalDistance(points) {
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    total += haversineDistance(
      { lat: points[i].lat || points[i].location.lat, lng: points[i].lng || points[i].location.lng },
      { lat: points[i + 1].lat || points[i + 1].location.lat, lng: points[i + 1].lng || points[i + 1].location.lng }
    );
  }
  return total;
}

/**
 * Nearest-Neighbor TSP Heuristic
 */
function nearestNeighborRoute(stops, startOrigin) {
  if (stops.length <= 1) return [...stops];

  const unvisited = [...stops];
  const route = [];

  let currentCoord = startOrigin
    ? { lat: startOrigin.lat, lng: startOrigin.lng }
    : {
        lat: unvisited[0].location ? unvisited[0].location.lat : unvisited[0].lat,
        lng: unvisited[0].location ? unvisited[0].location.lng : unvisited[0].lng,
      };

  if (!startOrigin) {
    route.push(unvisited.shift());
  }

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let shortestDist = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const stopCoord = {
        lat: unvisited[i].location ? unvisited[i].location.lat : unvisited[i].lat,
        lng: unvisited[i].location ? unvisited[i].location.lng : unvisited[i].lng,
      };
      const dist = haversineDistance(currentCoord, stopCoord);
      if (dist < shortestDist) {
        shortestDist = dist;
        nearestIndex = i;
      }
    }

    const nextStop = unvisited.splice(nearestIndex, 1)[0];
    route.push(nextStop);
    currentCoord = {
      lat: nextStop.location ? nextStop.location.lat : nextStop.lat,
      lng: nextStop.location ? nextStop.location.lng : nextStop.lng,
    };
  }

  return route;
}

/**
 * 2-Opt heuristic optimization
 */
function twoOpt(route) {
  if (route.length < 4) return route;

  let bestRoute = [...route];
  let improved = true;
  let iterations = 0;
  const MAX_ITERATIONS = 50;

  const getCoord = (item) => ({
    lat: item.location ? item.location.lat : item.lat,
    lng: item.location ? item.location.lng : item.lng,
  });

  while (improved && iterations < MAX_ITERATIONS) {
    improved = false;
    iterations++;

    for (let i = 0; i < bestRoute.length - 2; i++) {
      for (let j = i + 2; j < bestRoute.length; j++) {
        const a = getCoord(bestRoute[i]);
        const b = getCoord(bestRoute[i + 1]);
        const c = getCoord(bestRoute[j]);
        const d = j + 1 < bestRoute.length ? getCoord(bestRoute[j + 1]) : null;

        // Current distance of edges (i -> i+1) and (j -> j+1)
        const currentDist = haversineDistance(a, b) + (d ? haversineDistance(c, d) : 0);

        // New distance if swapped: (i -> j) and (i+1 -> j+1)
        const newDist = haversineDistance(a, c) + (d ? haversineDistance(b, d) : 0);

        if (newDist < currentDist - 0.001) {
          // Reverse subroute from i+1 to j
          const subroute = bestRoute.slice(i + 1, j + 1).reverse();
          bestRoute = [
            ...bestRoute.slice(0, i + 1),
            ...subroute,
            ...bestRoute.slice(j + 1),
          ];
          improved = true;
          break;
        }
      }
      if (improved) break;
    }
  }

  return bestRoute;
}

/**
 * Main optimizer function:
 * Takes stops (reports with location or coordinates) and optional start origin.
 * Applies Nearest Neighbor followed by 2-Opt improvement.
 */
function optimizeWasteRoute(stops, startOrigin = null) {
  if (!stops || stops.length === 0) {
    return {
      orderedStops: [],
      totalDistanceKm: 0,
      estimatedMinutes: 0,
      polyline: [],
    };
  }

  // 1. Initial greedy route
  const nnRoute = nearestNeighborRoute(stops, startOrigin);

  // 2. 2-Opt local search improvement
  const optimized = twoOpt(nnRoute);

  // Build sequential polyline coordinates and step legs
  const fullSequence = startOrigin
    ? [{ _id: 'start', title: 'Start Location / Depot', location: startOrigin, isStart: true }, ...optimized]
    : optimized;

  const polyline = fullSequence.map((s) => [
    s.location ? s.location.lat : s.lat,
    s.location ? s.location.lng : s.lng,
  ]);

  const totalDistance = calculateTotalDistance(fullSequence);

  // Estimated driving speed 25 km/h in city + 10 mins collection per stop
  const driveMinutes = (totalDistance / 25) * 60;
  const collectionMinutes = stops.length * 10;
  const estimatedMinutes = Math.round(driveMinutes + collectionMinutes);

  return {
    orderedStops: fullSequence,
    totalDistanceKm: parseFloat(totalDistance.toFixed(2)),
    estimatedMinutes,
    polyline,
  };
}

module.exports = {
  haversineDistance,
  calculateTotalDistance,
  nearestNeighborRoute,
  twoOpt,
  optimizeWasteRoute,
};

