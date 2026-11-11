const Report = require('../models/Report');
const { optimizeWasteRoute } = require('../services/routeOptimizer');

async function optimizeRoute(req, res, next) {
  try {
    const { reportIds, startOrigin } = req.body;
    let stops = [];

    if (Array.isArray(reportIds) && reportIds.length > 0) {
      stops = await Report.find({ _id: { $in: reportIds } })
        .populate('user', 'name phone')
        .populate('assignedDriver', 'name phone');
    } else if (req.user.role === 'DRIVER') {
      // Optimize driver's active assigned pickups
      stops = await Report.find({
        assignedDriver: req.user._id,
        status: { $in: ['ASSIGNED', 'IN_PROGRESS', 'PENDING'] },
      }).populate('user', 'name phone');
    } else {
      // Default: active pickups in system
      stops = await Report.find({
        status: { $in: ['ASSIGNED', 'IN_PROGRESS', 'PENDING'] },
      })
        .limit(30)
        .populate('user', 'name phone');
    }

    if (stops.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No active pickup stops found to optimize.',
        data: {
          orderedStops: [],
          totalDistanceKm: 0,
          estimatedMinutes: 0,
          polyline: [],
        },
      });
    }

    // Default depot coordinate: Ripon Building / Chennai Municipal HQ if no origin specified
    const defaultDepot = {
      lat: 13.0827,
      lng: 80.2707,
      address: 'Greater Chennai Corporation HQ (Ripon Building)',
    };

    const origin = startOrigin || defaultDepot;

    const result = optimizeWasteRoute(stops, origin);

    return res.status(200).json({
      success: true,
      message: `Successfully optimized route across ${stops.length} stops using 2-Opt algorithm.`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  optimizeRoute,
};

