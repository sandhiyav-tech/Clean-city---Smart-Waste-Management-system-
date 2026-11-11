const { z } = require('zod');
const reportService = require('../services/reportService');

const createReportSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(150),
  description: z.string().min(5, 'Description must be at least 5 characters').max(1000),
  imageUrl: z.string().optional().default(''),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    address: z.string().optional().default('Location unspecified'),
  }),
  wasteType: z.enum(['ORGANIC', 'PLASTIC', 'METAL', 'E-WASTE', 'HAZARDOUS', 'MIXED']).default('MIXED'),
});

const assignDriverSchema = z.object({
  driverId: z.string().min(1, 'Driver ID is required'),
});

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COLLECTED']),
  note: z.string().optional().default(''),
});

async function createReport(req, res, next) {
  try {
    const validatedData = createReportSchema.parse(req.body);
    const report = await reportService.createReport({
      ...validatedData,
      user: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Waste report created successfully',
      data: { report },
    });
  } catch (err) {
    next(err);
  }
}

async function getReports(req, res, next) {
  try {
    const result = await reportService.getReports(req.query, req.user);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function getReportById(req, res, next) {
  try {
    const report = await reportService.getReportById(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    // Role check: citizen can only view their own
    if (req.user.role === 'CITIZEN' && report.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this report',
      });
    }

    return res.status(200).json({
      success: true,
      data: { report },
    });
  } catch (err) {
    next(err);
  }
}

async function assignDriver(req, res, next) {
  try {
    const { driverId } = assignDriverSchema.parse(req.body);
    const report = await reportService.assignDriver(req.params.id, driverId, req.user);

    return res.status(200).json({
      success: true,
      message: 'Driver assigned successfully',
      data: { report },
    });
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { status, note } = updateStatusSchema.parse(req.body);
    const report = await reportService.updateReportStatus(req.params.id, status, req.user, note);

    return res.status(200).json({
      success: true,
      message: `Report status updated to ${status}`,
      data: { report },
    });
  } catch (err) {
    next(err);
  }
}

async function deleteReport(req, res, next) {
  try {
    await reportService.deleteReport(req.params.id, req.user);
    return res.status(200).json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createReportSchema,
  assignDriverSchema,
  updateStatusSchema,
  createReport,
  getReports,
  getReportById,
  assignDriver,
  updateStatus,
  deleteReport,
};

