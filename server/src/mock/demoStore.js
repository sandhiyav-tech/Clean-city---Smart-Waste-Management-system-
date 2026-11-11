const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { optimizeWasteRoute } = require('../services/routeOptimizer');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_cleancity_jwt_key_2026_change_in_production';

// In-Memory Seed Users
const DEMO_USERS = [
  {
    _id: '64a000000000000000000001',
    name: 'Municipal Admin (Chennai)',
    email: 'admin@cleancity.com',
    role: 'ADMIN',
    phone: '+91 98400 11223',
    passwordHash: '$2a$10$wT3yY1jA1qfM2Z5oWb7qNeYQ7J4l6.lX0H4a6KzP3e4R5u6t7y8i9', // Admin@123
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  },
  {
    _id: '64a000000000000000000002',
    name: 'Karthik Raja (EcoDriver #1)',
    email: 'driver@cleancity.com',
    role: 'DRIVER',
    phone: '+91 97900 44556',
    passwordHash: '$2a$10$wT3yY1jA1qfM2Z5oWb7qNeYQ7J4l6.lX0H4a6KzP3e4R5u6t7y8i9', // Driver@123
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  },
  {
    _id: '64a000000000000000000003',
    name: 'Ananya Sharma',
    email: 'citizen@cleancity.com',
    role: 'CITIZEN',
    phone: '+91 94440 77889',
    passwordHash: '$2a$10$wT3yY1jA1qfM2Z5oWb7qNeYQ7J4l6.lX0H4a6KzP3e4R5u6t7y8i9', // Citizen@123
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  },
  {
    _id: '64a000000000000000000004',
    name: 'Suresh Kumar (EcoDriver #2)',
    email: 'driver2@cleancity.com',
    role: 'DRIVER',
    phone: '+91 98840 55667',
    passwordHash: '$2a$10$wT3yY1jA1qfM2Z5oWb7qNeYQ7J4l6.lX0H4a6KzP3e4R5u6t7y8i9',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  },
  {
    _id: '64a000000000000000000005',
    name: 'Vikram Sundaram',
    email: 'vikram@cleancity.com',
    role: 'CITIZEN',
    phone: '+91 91760 88990',
    passwordHash: '$2a$10$wT3yY1jA1qfM2Z5oWb7qNeYQ7J4l6.lX0H4a6KzP3e4R5u6t7y8i9',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  },
];

const RAW_REPORTS = [
  {
    title: 'Plastic bottles and packaging litter on promenade',
    description: 'Multiple bags of plastic bottles and food wrappers accumulating near the beach entrance.',
    location: { lat: 13.0499, lng: 80.2824, address: 'Marina Beach Promenade, Triplicane, Chennai' },
    wasteType: 'PLASTIC',
    status: 'PENDING',
    imageUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80',
    daysAgo: 1,
  },
  {
    title: 'Overflowing vegetable market organic waste bin',
    description: 'Discarded fruit peels and vegetable leaves spilling onto the pedestrian pathway.',
    location: { lat: 13.0405, lng: 80.2337, address: 'Ranganathan Street, T. Nagar, Chennai' },
    wasteType: 'ORGANIC',
    status: 'ASSIGNED',
    imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    daysAgo: 2,
  },
  {
    title: 'Discarded computer monitors and broken cables',
    description: 'E-waste dumped beside the transformer box outside the tech park.',
    location: { lat: 12.9698, lng: 80.2443, address: 'OMR Road, Thoraipakkam, Chennai' },
    wasteType: 'E-WASTE',
    status: 'IN_PROGRESS',
    imageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80',
    daysAgo: 2,
  },
  {
    title: 'Collected dry leaves and park debris cleared',
    description: 'Garden waste was piling up along the sidewalk; successfully cleared.',
    location: { lat: 13.0012, lng: 80.2565, address: 'Adyar River Park Walkway, Chennai' },
    wasteType: 'ORGANIC',
    status: 'COLLECTED',
    imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
    daysAgo: 3,
  },
  {
    title: 'Construction concrete debris and broken bricks',
    description: 'Renovation rubble obstructing half of the residential lane.',
    location: { lat: 13.085, lng: 80.2101, address: '2nd Avenue, Anna Nagar, Chennai' },
    wasteType: 'MIXED',
    status: 'PENDING',
    imageUrl: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=800&q=80',
    daysAgo: 0,
  },
  {
    title: 'Discarded metal sheets and scrap iron pipes',
    description: 'Sharp metal scraps dumped in an open corner near bus shelter.',
    location: { lat: 13.0315, lng: 80.2299, address: 'CIT Nagar Main Road, Nandanam, Chennai' },
    wasteType: 'METAL',
    status: 'ASSIGNED',
    imageUrl: 'https://images.unsplash.com/photo-1516992654410-9309d4587e94?auto=format&fit=crop&w=800&q=80',
    daysAgo: 1,
  },
  {
    title: 'Chemical cleaning solvent cans dumped in vacant lot',
    description: 'Commercial chemical drums and paint cans discarded without proper hazardous tagging.',
    location: { lat: 13.0067, lng: 80.2023, address: 'Guindy Industrial Estate, Chennai' },
    wasteType: 'HAZARDOUS',
    status: 'IN_PROGRESS',
    imageUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80',
    daysAgo: 1,
  },
  {
    title: 'Beach visitor food waste and disposable cups',
    description: 'Heavy litter around the beach stalls after Sunday evening crowd.',
    location: { lat: 12.9992, lng: 80.2678, address: "Elliot's Beach Promenade, Besant Nagar, Chennai" },
    wasteType: 'PLASTIC',
    status: 'COLLECTED',
    imageUrl: 'https://images.unsplash.com/photo-1526951521990-620dc14c214b?auto=format&fit=crop&w=800&q=80',
    daysAgo: 4,
  },
  {
    title: 'Fallen tree branches and temple flower garlands',
    description: 'Organic floral waste and pruning branches near temple tank periphery.',
    location: { lat: 13.0335, lng: 80.2687, address: 'North Mada Street, Mylapore, Chennai' },
    wasteType: 'ORGANIC',
    status: 'PENDING',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    daysAgo: 1,
  },
  {
    title: 'Cardboard cartons and plastic strapping bands',
    description: 'Commercial packaging refuse left on pavement outside wholesale shops.',
    location: { lat: 13.0612, lng: 80.242, address: 'Nungambakkam High Road, Chennai' },
    wasteType: 'PLASTIC',
    status: 'ASSIGNED',
    imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    daysAgo: 2,
  },
  {
    title: 'Broken fluorescent tube lights and electronics',
    description: 'Mercury tubes and defunct ballast units discarded in alleyway.',
    location: { lat: 13.0519, lng: 80.2212, address: 'Kodambakkam Station Road, Chennai' },
    wasteType: 'HAZARDOUS',
    status: 'IN_PROGRESS',
    imageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80',
    daysAgo: 3,
  },
  {
    title: 'Commercial food carton debris collected',
    description: 'Railway parcel area waste cleared and segregated.',
    location: { lat: 13.0788, lng: 80.2604, address: 'Gandhi Irwin Road, Egmore, Chennai' },
    wasteType: 'ORGANIC',
    status: 'COLLECTED',
    imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
    daysAgo: 5,
  },
  {
    title: 'Old CRT monitors and discarded mobile chargers',
    description: 'Small IT hardware heap behind bus terminus.',
    location: { lat: 13.0483, lng: 80.2078, address: 'Arcot Road, Vadapalani, Chennai' },
    wasteType: 'E-WASTE',
    status: 'PENDING',
    imageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80',
    daysAgo: 0,
  },
  {
    title: 'Discarded single-use polythene bags and plastic sacks',
    description: 'Mass of light carry bags trapped against drainage fence.',
    location: { lat: 13.0901, lng: 80.2882, address: 'Rajaji Salai, George Town, Chennai' },
    wasteType: 'PLASTIC',
    status: 'ASSIGNED',
    imageUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80',
    daysAgo: 1,
  },
  {
    title: 'Hotel food scraps and cooking grease tins',
    description: 'Restaurant rear lane waste bin overflowing with decaying food waste.',
    location: { lat: 13.0645, lng: 80.2703, address: 'Royapettah High Road, Chennai' },
    wasteType: 'ORGANIC',
    status: 'IN_PROGRESS',
    imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    daysAgo: 2,
  },
  {
    title: 'Discarded car battery casing and lead plates',
    description: 'Used automotive battery with acid residue left near stormwater drain.',
    location: { lat: 13.0102, lng: 80.2156, address: 'Five Furlong Road, Maduvinkarai, Guindy, Chennai' },
    wasteType: 'HAZARDOUS',
    status: 'COLLECTED',
    imageUrl: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=800&q=80',
    daysAgo: 3,
  },
  {
    title: 'Residential garbage heap near storm drain outlet',
    description: 'Mixed domestic refuse bags dumped in street corner causing bad odor.',
    location: { lat: 12.9815, lng: 80.218, address: 'Velachery Bypass Road, Chennai' },
    wasteType: 'MIXED',
    status: 'PENDING',
    imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
    daysAgo: 0,
  },
  {
    title: 'Textile scraps and leather remnants',
    description: 'Tailoring and craft scrap bags dumped on open vacant plot.',
    location: { lat: 13.1098, lng: 80.2452, address: 'Perambur Barracks Road, Chennai' },
    wasteType: 'MIXED',
    status: 'COLLECTED',
    imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    daysAgo: 4,
  },
  {
    title: 'Vegetable crate plastics and rotting produce',
    description: 'Market yard runoff and mixed decomposing organics with plastic covers.',
    location: { lat: 12.9249, lng: 80.128, address: 'GST Road, Tambaram Sanatorium, Chennai' },
    wasteType: 'MIXED',
    status: 'ASSIGNED',
    imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
    daysAgo: 1,
  },
  {
    title: 'Iron nails and automobile repair scraps',
    description: 'Vehicle workshop waste discarded on service lane, hazardous to tires.',
    location: { lat: 13.0382, lng: 80.1565, address: 'Mount Poonamallee Road, Porur, Chennai' },
    wasteType: 'METAL',
    status: 'PENDING',
    imageUrl: 'https://images.unsplash.com/photo-1516992654410-9309d4587e94?auto=format&fit=crop&w=800&q=80',
    daysAgo: 0,
  },
];

// Initialize in-memory reports
const DEMO_REPORTS = RAW_REPORTS.map((item, idx) => {
  const idNum = String(idx + 1).padStart(4, '0');
  const reportUser = idx % 2 === 0 ? DEMO_USERS[2] : DEMO_USERS[4]; // Ananya or Vikram
  const assignedDriver = item.status !== 'PENDING' ? DEMO_USERS[1] : null; // Karthik Raja
  const createdAt = new Date(Date.now() - item.daysAgo * 86400000);

  const statusHistory = [
    {
      status: 'PENDING',
      changedBy: reportUser._id,
      at: createdAt,
      note: 'Report submitted by citizen',
    },
  ];

  if (item.status === 'ASSIGNED' || item.status === 'IN_PROGRESS' || item.status === 'COLLECTED') {
    statusHistory.push({
      status: 'ASSIGNED',
      changedBy: DEMO_USERS[0]._id,
      at: new Date(createdAt.getTime() + 3600000),
      note: 'Assigned to driver Karthik Raja',
    });
  }

  if (item.status === 'IN_PROGRESS' || item.status === 'COLLECTED') {
    statusHistory.push({
      status: 'IN_PROGRESS',
      changedBy: DEMO_USERS[1]._id,
      at: new Date(createdAt.getTime() + 7200000),
      note: 'Driver en route to pickup location',
    });
  }

  if (item.status === 'COLLECTED') {
    statusHistory.push({
      status: 'COLLECTED',
      changedBy: DEMO_USERS[1]._id,
      at: new Date(createdAt.getTime() + 10800000),
      note: 'Waste successfully collected and disposed',
    });
  }

  return {
    _id: `64b00000000000000000${idNum}`,
    title: item.title,
    description: item.description,
    location: item.location,
    wasteType: item.wasteType,
    status: item.status,
    imageUrl: item.imageUrl,
    user: {
      _id: reportUser._id,
      name: reportUser.name,
      email: reportUser.email,
      phone: reportUser.phone,
    },
    assignedDriver: assignedDriver
      ? {
          _id: assignedDriver._id,
          name: assignedDriver.name,
          email: assignedDriver.email,
          phone: assignedDriver.phone,
        }
      : null,
    statusHistory,
    createdAt,
    updatedAt: new Date(),
  };
});

// Demo Notifications
const DEMO_NOTIFICATIONS = [
  {
    _id: '64c000000000000000000001',
    user: DEMO_USERS[0]._id,
    title: 'New Waste Report Registered',
    message: 'A citizen reported plastic waste at Marina Beach Promenade.',
    type: 'REPORT_SUBMITTED',
    read: false,
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    _id: '64c000000000000000000002',
    user: DEMO_USERS[1]._id,
    title: 'New Pickup Task Assigned',
    message: 'You have been assigned to collect organic waste at Ranganathan Street.',
    type: 'TASK_ASSIGNED',
    read: false,
    createdAt: new Date(Date.now() - 7200000),
  },
  {
    _id: '64c000000000000000000003',
    user: DEMO_USERS[2]._id,
    title: 'Report Update: In Progress',
    message: 'Your report regarding computer monitors on OMR Road is currently being collected.',
    type: 'STATUS_UPDATED',
    read: true,
    createdAt: new Date(Date.now() - 14400000),
  },
];

// Helper: Extract authenticated user from request
function getAuthUser(req) {
  let token = null;
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return DEMO_USERS.find((u) => u._id === decoded.userId) || decoded;
  } catch {
    return null;
  }
}

function requireDemoAuth(req, res, next) {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please sign in.' });
  }
  req.user = user;
  next();
}

const router = express.Router();

// -------------------------------------------------------------
// AUTH ENDPOINTS
// -------------------------------------------------------------
router.post('/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  const cleanEmail = email.toLowerCase().trim();
  let user = DEMO_USERS.find((u) => u.email.toLowerCase() === cleanEmail);

  // If user doesn't exist, create citizen on-the-fly for smooth demo
  if (!user) {
    user = {
      _id: `64a00000000000000000${String(DEMO_USERS.length + 1).padStart(4, '0')}`,
      name: cleanEmail.split('@')[0],
      email: cleanEmail,
      role: 'CITIZEN',
      phone: '+91 99999 00000',
      createdAt: new Date(),
    };
    DEMO_USERS.push(user);
  }

  const token = jwt.sign(
    { userId: user._id, role: user.role, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const { passwordHash, ...safeUser } = user;
  return res.status(200).json({
    success: true,
    message: 'Logged in successfully (In-Memory Demo Mode)',
    data: { user: safeUser, token },
  });
});

router.post('/auth/signup', (req, res) => {
  const { name, email, password, role = 'CITIZEN', phone = '' } = req.body || {};
  const cleanEmail = (email || '').toLowerCase().trim();

  let user = DEMO_USERS.find((u) => u.email.toLowerCase() === cleanEmail);
  if (user) {
    return res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
  }

  user = {
    _id: `64a00000000000000000${String(DEMO_USERS.length + 1).padStart(4, '0')}`,
    name: name || 'Citizen User',
    email: cleanEmail,
    role: role || 'CITIZEN',
    phone,
    createdAt: new Date(),
  };
  DEMO_USERS.push(user);

  const token = jwt.sign(
    { userId: user._id, role: user.role, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: { user, token },
  });
});

router.get('/auth/me', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  const { passwordHash, ...safeUser } = user;
  return res.status(200).json({ success: true, data: { user: safeUser } });
});

router.post('/auth/logout', (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// -------------------------------------------------------------
// STATS ENDPOINTS
// -------------------------------------------------------------
router.get('/stats', (req, res) => {
  const statusMap = { PENDING: 0, ASSIGNED: 0, IN_PROGRESS: 0, COLLECTED: 0 };
  const wasteTypeMap = { ORGANIC: 0, PLASTIC: 0, METAL: 0, 'E-WASTE': 0, HAZARDOUS: 0, MIXED: 0 };

  DEMO_REPORTS.forEach((r) => {
    if (statusMap[r.status] !== undefined) statusMap[r.status]++;
    if (wasteTypeMap[r.wasteType] !== undefined) wasteTypeMap[r.wasteType]++;
  });

  // Daily reports trend
  const dailyReportsMap = {};
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    dailyReportsMap[key] = { date: key, label, count: 0 };
  }

  DEMO_REPORTS.forEach((r) => {
    const key = new Date(r.createdAt).toISOString().split('T')[0];
    if (dailyReportsMap[key]) dailyReportsMap[key].count++;
  });

  const usersByRole = { CITIZEN: 0, DRIVER: 0, ADMIN: 0 };
  DEMO_USERS.forEach((u) => {
    if (usersByRole[u.role] !== undefined) usersByRole[u.role]++;
  });

  return res.status(200).json({
    success: true,
    data: {
      totalReports: DEMO_REPORTS.length,
      statusBreakdown: statusMap,
      wasteTypeBreakdown: wasteTypeMap,
      statusMap,
      wasteTypeMap,
      avgCollectionHours: 3.8,
      reportsPerDay: Object.values(dailyReportsMap),
      users: {
        total: DEMO_USERS.length,
        byRole: usersByRole,
      },
      usersByRole,
      totalUsers: DEMO_USERS.length,
    },
  });
});

// -------------------------------------------------------------
// REPORTS ENDPOINTS
// -------------------------------------------------------------
router.get('/reports', (req, res) => {
  const user = getAuthUser(req);
  const { status, wasteType, search, driverId, page = 1, limit = 50 } = req.query;

  let filtered = [...DEMO_REPORTS];

  // Role scoping
  if (user && user.role === 'CITIZEN') {
    filtered = filtered.filter((r) => r.user?._id === user._id || r.user?.email === user.email);
  } else if (user && user.role === 'DRIVER') {
    filtered = filtered.filter((r) => r.assignedDriver?._id === user._id);
  } else if (driverId) {
    filtered = filtered.filter((r) => r.assignedDriver?._id === driverId);
  }

  if (status && status !== 'ALL') {
    filtered = filtered.filter((r) => r.status === status);
  }

  if (wasteType && wasteType !== 'ALL') {
    filtered = filtered.filter((r) => r.wasteType === wasteType);
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        (r.location?.address && r.location.address.toLowerCase().includes(q))
    );
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 50;
  const startIdx = (pageNum - 1) * limitNum;
  const paginated = filtered.slice(startIdx, startIdx + limitNum);

  return res.status(200).json({
    success: true,
    data: {
      reports: paginated,
      total: filtered.length,
      page: pageNum,
      totalPages: Math.ceil(filtered.length / limitNum) || 1,
      pagination: {
        total: filtered.length,
        page: pageNum,
        pages: Math.ceil(filtered.length / limitNum) || 1,
        limit: limitNum,
      },
    },
  });
});

router.post('/reports', requireDemoAuth, (req, res) => {
  const { title, description, location, wasteType = 'MIXED', imageUrl = '' } = req.body;

  const newReport = {
    _id: `64b00000000000000000${String(DEMO_REPORTS.length + 1).padStart(4, '0')}`,
    title: title || 'Waste Report',
    description: description || '',
    location: location || { lat: 13.0827, lng: 80.2707, address: 'Chennai City' },
    wasteType,
    status: 'PENDING',
    imageUrl,
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
    },
    assignedDriver: null,
    statusHistory: [
      {
        status: 'PENDING',
        changedBy: req.user._id,
        at: new Date(),
        note: 'Report submitted by citizen',
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  DEMO_REPORTS.unshift(newReport);

  return res.status(201).json({
    success: true,
    message: 'Waste report created successfully',
    data: { report: newReport },
  });
});

router.get('/reports/:id', (req, res) => {
  const report = DEMO_REPORTS.find((r) => r._id === req.params.id);
  if (!report) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }
  return res.status(200).json({ success: true, data: { report } });
});

router.patch('/reports/:id/status', requireDemoAuth, (req, res) => {
  const { status, note = '' } = req.body;
  const report = DEMO_REPORTS.find((r) => r._id === req.params.id);
  if (!report) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }

  report.status = status;
  report.updatedAt = new Date();
  report.statusHistory.push({
    status,
    changedBy: req.user._id,
    at: new Date(),
    note: note || `Status updated to ${status}`,
  });

  return res.status(200).json({
    success: true,
    message: `Report status updated to ${status}`,
    data: { report },
  });
});

router.patch('/reports/:id/assign', requireDemoAuth, (req, res) => {
  const { driverId } = req.body;
  const report = DEMO_REPORTS.find((r) => r._id === req.params.id);
  if (!report) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }

  const driver = DEMO_USERS.find((u) => u._id === driverId);
  if (!driver) {
    return res.status(404).json({ success: false, message: 'Driver not found' });
  }

  report.assignedDriver = {
    _id: driver._id,
    name: driver.name,
    email: driver.email,
    phone: driver.phone,
  };
  report.status = 'ASSIGNED';
  report.statusHistory.push({
    status: 'ASSIGNED',
    changedBy: req.user._id,
    at: new Date(),
    note: `Assigned to driver ${driver.name}`,
  });

  return res.status(200).json({
    success: true,
    message: 'Driver assigned successfully',
    data: { report },
  });
});

router.delete('/reports/:id', requireDemoAuth, (req, res) => {
  const idx = DEMO_REPORTS.findIndex((r) => r._id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }
  DEMO_REPORTS.splice(idx, 1);
  return res.status(200).json({ success: true, message: 'Report deleted successfully' });
});

// -------------------------------------------------------------
// ROUTES / TSP OPTIMIZATION ENDPOINT
// -------------------------------------------------------------
router.post('/routes/optimize', requireDemoAuth, (req, res) => {
  const { reportIds, startOrigin } = req.body || {};
  let stops = [];

  if (Array.isArray(reportIds) && reportIds.length > 0) {
    stops = DEMO_REPORTS.filter((r) => reportIds.includes(r._id));
  } else if (req.user.role === 'DRIVER') {
    stops = DEMO_REPORTS.filter(
      (r) => r.assignedDriver?._id === req.user._id && ['ASSIGNED', 'IN_PROGRESS', 'PENDING'].includes(r.status)
    );
  }

  if (stops.length === 0) {
    // Pick up to 8 active reports for demo optimization
    stops = DEMO_REPORTS.filter((r) => ['ASSIGNED', 'IN_PROGRESS', 'PENDING'].includes(r.status)).slice(0, 8);
  }

  const defaultDepot = {
    lat: 13.0827,
    lng: 80.2707,
    address: 'Greater Chennai Corporation HQ (Ripon Building)',
  };

  const origin = startOrigin || defaultDepot;
  const result = optimizeWasteRoute(stops, origin);

  return res.status(200).json({
    success: true,
    message: 'Route optimized successfully using 2-Opt TSP heuristic',
    data: result,
  });
});

// -------------------------------------------------------------
// USER MANAGEMENT ENDPOINTS
// -------------------------------------------------------------
router.get('/users', requireDemoAuth, (req, res) => {
  const { role, search, page = 1, limit = 15 } = req.query;
  let filtered = DEMO_USERS.map(({ passwordHash, ...u }) => u);

  if (role && role !== 'ALL') {
    filtered = filtered.filter((u) => u.role === role);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 15;
  const paginated = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  return res.status(200).json({
    success: true,
    data: {
      users: paginated,
      total: filtered.length,
      pagination: {
        total: filtered.length,
        page: pageNum,
        pages: Math.ceil(filtered.length / limitNum) || 1,
        limit: limitNum,
      },
    },
  });
});

router.get('/users/drivers', (req, res) => {
  const drivers = DEMO_USERS.filter((u) => u.role === 'DRIVER').map(({ passwordHash, ...u }) => u);
  return res.status(200).json({ success: true, data: { drivers } });
});

router.patch('/users/:id/role', requireDemoAuth, (req, res) => {
  const { role } = req.body;
  const user = DEMO_USERS.find((u) => u._id === req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  user.role = role;
  const { passwordHash, ...safeUser } = user;
  return res.status(200).json({ success: true, data: { user: safeUser } });
});

router.post('/users/broadcast', requireDemoAuth, (req, res) => {
  const { title, message } = req.body;
  DEMO_USERS.forEach((u) => {
    DEMO_NOTIFICATIONS.unshift({
      _id: `64c00000000000000000${String(DEMO_NOTIFICATIONS.length + 1).padStart(4, '0')}`,
      user: u._id,
      title: title || 'City Notice',
      message: message || '',
      type: 'BROADCAST',
      isRead: false,
      read: false,
      createdAt: new Date(),
    });
  });
  return res.status(200).json({ success: true, message: 'Broadcast sent to all city users' });
});

// -------------------------------------------------------------
// NOTIFICATIONS ENDPOINTS
// -------------------------------------------------------------
router.get('/notifications', requireDemoAuth, (req, res) => {
  const userNotifs = DEMO_NOTIFICATIONS.filter((n) => n.user === req.user._id || n.type === 'BROADCAST');
  return res.status(200).json({
    success: true,
    data: {
      notifications: userNotifs.map((n) => ({ ...n, isRead: n.isRead ?? n.read ?? false })),
      unreadCount: userNotifs.filter((n) => !n.isRead && !n.read).length,
    },
  });
});

router.post('/notifications', requireDemoAuth, (req, res) => {
  const { message, targetRole = 'ALL', type = 'BROADCAST', title } = req.body;
  const notif = {
    _id: `64c00000000000000000${String(DEMO_NOTIFICATIONS.length + 1).padStart(4, '0')}`,
    user: null,
    title: title || 'City Notice',
    message: message || '',
    type,
    isRead: false,
    read: false,
    createdAt: new Date(),
  };
  DEMO_NOTIFICATIONS.unshift(notif);
  return res.status(201).json({
    success: true,
    message: 'Notification broadcasted successfully',
    data: { notification: notif },
  });
});

router.patch('/notifications/read-all', requireDemoAuth, (req, res) => {
  DEMO_NOTIFICATIONS.forEach((n) => {
    if (n.user === req.user._id || n.type === 'BROADCAST') {
      n.read = true;
      n.isRead = true;
    }
  });
  return res.status(200).json({ success: true, message: 'All notifications marked as read' });
});

router.patch('/notifications/:id/read', requireDemoAuth, (req, res) => {
  const notif = DEMO_NOTIFICATIONS.find((n) => n._id === req.params.id);
  if (notif) {
    notif.read = true;
    notif.isRead = true;
  }
  return res.status(200).json({ success: true, message: 'Notification marked as read' });
});

// -------------------------------------------------------------
// UPLOAD ENDPOINT
// -------------------------------------------------------------
router.post('/upload', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Image uploaded successfully (Demo Storage)',
    data: {
      url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    },
  });
});

module.exports = router;

