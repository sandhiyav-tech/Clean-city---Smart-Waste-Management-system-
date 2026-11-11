require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Report = require('../models/Report');
const Notification = require('../models/Notification');

const CHENNAI_REPORTS_DATA = [
  {
    title: 'Plastic bottles and packaging litter on promenade',
    description: 'Multiple bags of plastic bottles and food wrappers accumulating near the beach entrance.',
    location: {
      lat: 13.0499,
      lng: 80.2824,
      address: 'Marina Beach Promenade, Triplicane, Chennai',
    },
    wasteType: 'PLASTIC',
    status: 'PENDING',
    imageUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80',
    daysAgo: 1,
  },
  {
    title: 'Overflowing vegetable market organic waste bin',
    description: 'Discarded fruit peels and vegetable leaves spilling onto the pedestrian pathway.',
    location: {
      lat: 13.0405,
      lng: 80.2337,
      address: 'Ranganathan Street, T. Nagar, Chennai',
    },
    wasteType: 'ORGANIC',
    status: 'ASSIGNED',
    imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    daysAgo: 2,
  },
  {
    title: 'Discarded computer monitors and broken cables',
    description: 'E-waste dumped beside the transformer box outside the tech park.',
    location: {
      lat: 12.9698,
      lng: 80.2443,
      address: 'OMR Road, Thoraipakkam, Chennai',
    },
    wasteType: 'E-WASTE',
    status: 'IN_PROGRESS',
    imageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80',
    daysAgo: 2,
  },
  {
    title: 'Collected dry leaves and park debris cleared',
    description: 'Garden waste was piling up along the sidewalk; successfully cleared.',
    location: {
      lat: 13.0012,
      lng: 80.2565,
      address: 'Adyar River Park Walkway, Chennai',
    },
    wasteType: 'ORGANIC',
    status: 'COLLECTED',
    imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
    daysAgo: 3,
  },
  {
    title: 'Mixed household trash near residential junction',
    description: 'Several unsegregated waste bags left on the street corner overnight.',
    location: {
      lat: 13.085,
      lng: 80.2101,
      address: '2nd Avenue, Anna Nagar, Chennai',
    },
    wasteType: 'MIXED',
    status: 'PENDING',
    imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
    daysAgo: 1,
  },
  {
    title: 'Discarded paint cans and solvent containers',
    description: 'Chemical and paint cans dumped near the stormwater drain. Potential hazard.',
    location: {
      lat: 13.0067,
      lng: 80.2024,
      address: 'Guindy Industrial Estate, Chennai',
    },
    wasteType: 'HAZARDOUS',
    status: 'ASSIGNED',
    imageUrl: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=800&q=80',
    daysAgo: 3,
  },
  {
    title: 'Scrap metal rods and corrugated roofing sheets',
    description: 'Rusty construction iron rods dumped by the road shoulder posing danger to motorists.',
    location: {
      lat: 12.9815,
      lng: 80.218,
      address: 'Velachery 100 Feet Bypass Road, Chennai',
    },
    wasteType: 'METAL',
    status: 'IN_PROGRESS',
    imageUrl: 'https://images.unsplash.com/photo-1516992654410-9309d4587e94?auto=format&fit=crop&w=800&q=80',
    daysAgo: 2,
  },
  {
    title: 'Beach visitor food waste and disposable cups',
    description: 'Heavy litter around the beach stalls after Sunday evening crowd.',
    location: {
      lat: 12.9992,
      lng: 80.2678,
      address: "Elliot's Beach Promenade, Besant Nagar, Chennai",
    },
    wasteType: 'PLASTIC',
    status: 'COLLECTED',
    imageUrl: 'https://images.unsplash.com/photo-1526951521990-620dc14c214b?auto=format&fit=crop&w=800&q=80',
    daysAgo: 4,
  },
  {
    title: 'Fallen tree branches and temple flower garlands',
    description: 'Organic floral waste and pruning branches near temple tank periphery.',
    location: {
      lat: 13.0335,
      lng: 80.2687,
      address: 'North Mada Street, Mylapore, Chennai',
    },
    wasteType: 'ORGANIC',
    status: 'PENDING',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    daysAgo: 1,
  },
  {
    title: 'Cardboard cartons and plastic strapping bands',
    description: 'Commercial packaging refuse left on pavement outside wholesale shops.',
    location: {
      lat: 13.0612,
      lng: 80.242,
      address: 'Nungambakkam High Road, Chennai',
    },
    wasteType: 'PLASTIC',
    status: 'ASSIGNED',
    imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    daysAgo: 2,
  },
  {
    title: 'Broken fluorescent tube lights and electronics',
    description: 'Mercury tubes and defunct ballast units discarded in alleyway.',
    location: {
      lat: 13.0519,
      lng: 80.2212,
      address: 'Kodambakkam Station Road, Chennai',
    },
    wasteType: 'HAZARDOUS',
    status: 'IN_PROGRESS',
    imageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80',
    daysAgo: 3,
  },
  {
    title: 'Commercial food carton debris collected',
    description: 'Railway parcel area waste cleared and segregated.',
    location: {
      lat: 13.0788,
      lng: 80.2604,
      address: 'Gandhi Irwin Road, Egmore, Chennai',
    },
    wasteType: 'MIXED',
    status: 'COLLECTED',
    imageUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80',
    daysAgo: 5,
  },
  {
    title: 'Municipal bin overflow outside railway terminal',
    description: 'Large community bin spilling over with water bottles and snack packaging.',
    location: {
      lat: 13.0827,
      lng: 80.2755,
      address: 'EVR Periyar Salai, Chennai Central, Chennai',
    },
    wasteType: 'PLASTIC',
    status: 'PENDING',
    imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
    daysAgo: 0,
  },
  {
    title: 'Beverage aluminum cans and tin lids',
    description: 'Metal beverage cans thrown along the pedestrian walkway fence.',
    location: {
      lat: 13.056,
      lng: 80.258,
      address: 'Royapettah High Road, Chennai',
    },
    wasteType: 'METAL',
    status: 'ASSIGNED',
    imageUrl: 'https://images.unsplash.com/photo-1516992654410-9309d4587e94?auto=format&fit=crop&w=800&q=80',
    daysAgo: 2,
  },
  {
    title: 'Coconut shells and biodegradable tea cups',
    description: 'Heavy organic heap from roadside tender coconut and juice sellers.',
    location: {
      lat: 13.0592,
      lng: 80.2721,
      address: 'Triplicane High Road, Chennai',
    },
    wasteType: 'ORGANIC',
    status: 'COLLECTED',
    imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
    daysAgo: 6,
  },
  {
    title: 'Discarded printer toners and circuit boards',
    description: 'Office electronic spares left by service center back lane.',
    location: {
      lat: 13.0384,
      lng: 80.2516,
      address: 'TTK Road, Alwarpet, Chennai',
    },
    wasteType: 'E-WASTE',
    status: 'PENDING',
    imageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80',
    daysAgo: 1,
  },
  {
    title: 'Plastic carry bags entangled in storm grate',
    description: 'Grates blocked with polythene covers, causing water logging danger.',
    location: {
      lat: 12.9829,
      lng: 80.2625,
      address: 'Valmiki Street, Thiruvanmiyur, Chennai',
    },
    wasteType: 'PLASTIC',
    status: 'IN_PROGRESS',
    imageUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80',
    daysAgo: 2,
  },
  {
    title: 'Textile scraps and leather remnants',
    description: 'Tailoring and craft scrap bags dumped on open vacant plot.',
    location: {
      lat: 13.1098,
      lng: 80.2452,
      address: 'Perambur Barracks Road, Chennai',
    },
    wasteType: 'MIXED',
    status: 'COLLECTED',
    imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    daysAgo: 4,
  },
  {
    title: 'Vegetable crate plastics and rotting produce',
    description: 'Market yard runoff and mixed decomposing organics with plastic covers.',
    location: {
      lat: 12.9249,
      lng: 80.128,
      address: 'GST Road, Tambaram Sanatorium, Chennai',
    },
    wasteType: 'MIXED',
    status: 'ASSIGNED',
    imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
    daysAgo: 1,
  },
  {
    title: 'Iron nails and automobile repair scraps',
    description: 'Vehicle workshop waste discarded on service lane, hazardous to tires.',
    location: {
      lat: 13.0382,
      lng: 80.1565,
      address: 'Mount Poonamallee Road, Porur, Chennai',
    },
    wasteType: 'METAL',
    status: 'PENDING',
    imageUrl: 'https://images.unsplash.com/photo-1516992654410-9309d4587e94?auto=format&fit=crop&w=800&q=80',
    daysAgo: 0,
  },
];

async function seedDatabase() {
  console.log('[Seed] Starting CleanCity database seeding...');
  await connectDB();

  // 1. Clear existing collections
  await User.deleteMany({});
  await Report.deleteMany({});
  await Notification.deleteMany({});
  console.log('[Seed] Cleaned existing collections.');

  // 2. Hash passwords
  const salt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash('Admin@123', salt);
  const driverHash = await bcrypt.hash('Driver@123', salt);
  const citizenHash = await bcrypt.hash('Citizen@123', salt);

  // 3. Create demo users
  const admin = await User.create({
    name: 'Municipal Admin (Chennai)',
    email: 'admin@cleancity.com',
    passwordHash: adminHash,
    role: 'ADMIN',
    phone: '+91 98400 11223',
  });

  const driver = await User.create({
    name: 'Karthik Raja (EcoDriver #1)',
    email: 'driver@cleancity.com',
    passwordHash: driverHash,
    role: 'DRIVER',
    phone: '+91 97900 44556',
  });

  const driver2 = await User.create({
    name: 'Suresh Kumar (EcoDriver #2)',
    email: 'driver2@cleancity.com',
    passwordHash: driverHash,
    role: 'DRIVER',
    phone: '+91 98840 55667',
  });

  const citizen = await User.create({
    name: 'Ananya Sharma',
    email: 'citizen@cleancity.com',
    passwordHash: citizenHash,
    role: 'CITIZEN',
    phone: '+91 94440 77889',
  });

  const citizen2 = await User.create({
    name: 'Vikram Sundaram',
    email: 'vikram@cleancity.com',
    passwordHash: citizenHash,
    role: 'CITIZEN',
    phone: '+91 91760 88990',
  });

  console.log('[Seed] Created demo user accounts:');
  console.log('   - admin@cleancity.com   (Admin@123)   [ADMIN]');
  console.log('   - driver@cleancity.com  (Driver@123)  [DRIVER]');
  console.log('   - citizen@cleancity.com (Citizen@123) [CITIZEN]');

  // 4. Create ~20 reports with timestamps & realistic status audit trails
  const now = new Date();
  const createdReports = [];

  for (let i = 0; i < CHENNAI_REPORTS_DATA.length; i++) {
    const data = CHENNAI_REPORTS_DATA[i];
    const reportUser = i % 2 === 0 ? citizen : citizen2;
    const createdAt = new Date(now.getTime() - data.daysAgo * 24 * 60 * 60 * 1000 - (i * 37 * 60 * 1000));

    let assignedDriver = null;
    const statusHistory = [
      {
        status: 'PENDING',
        changedBy: reportUser._id,
        at: createdAt,
        note: 'Report created by citizen',
      },
    ];

    if (data.status === 'ASSIGNED' || data.status === 'IN_PROGRESS' || data.status === 'COLLECTED') {
      assignedDriver = i % 3 === 0 ? driver2._id : driver._id;
      const assignedAt = new Date(createdAt.getTime() + 45 * 60 * 1000);
      statusHistory.push({
        status: 'ASSIGNED',
        changedBy: admin._id,
        at: assignedAt,
        note: 'Assigned to driver for scheduled collection',
      });
    }

    if (data.status === 'IN_PROGRESS' || data.status === 'COLLECTED') {
      const inProgressAt = new Date(createdAt.getTime() + 90 * 60 * 1000);
      statusHistory.push({
        status: 'IN_PROGRESS',
        changedBy: assignedDriver,
        at: inProgressAt,
        note: 'Driver en route for collection',
      });
    }

    if (data.status === 'COLLECTED') {
      const collectedAt = new Date(createdAt.getTime() + 180 * 60 * 1000); // collected within ~3 hours
      statusHistory.push({
        status: 'COLLECTED',
        changedBy: assignedDriver,
        at: collectedAt,
        note: 'Waste successfully collected and loaded into municipal compactor',
      });
    }

    const report = await Report.create({
      user: reportUser._id,
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      location: data.location,
      wasteType: data.wasteType,
      status: data.status,
      assignedDriver,
      statusHistory,
      createdAt,
      updatedAt: statusHistory[statusHistory.length - 1].at,
    });

    createdReports.push(report);
  }

  console.log(`[Seed] Created ${createdReports.length} geolocated reports across Chennai.`);

  // 5. Seed sample notifications
  await Notification.create([
    {
      user: null, // Broadcast to all
      message: 'Welcome to CleanCity Chennai! Report waste hotspots in your ward to keep Chennai green.',
      type: 'BROADCAST',
      isRead: false,
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    },
    {
      user: citizen._id,
      message: 'Your report "Discarded computer monitors and broken cables" is now IN PROGRESS! Driver is en route.',
      type: 'STATUS_UPDATE',
      reportId: createdReports[2]._id,
      isRead: false,
      createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
    },
    {
      user: citizen._id,
      message: 'Great news! Your report "Collected dry leaves and park debris cleared" has been COLLECTED.',
      type: 'STATUS_UPDATE',
      reportId: createdReports[3]._id,
      isRead: true,
      createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
    },
    {
      user: driver._id,
      message: 'You have 4 new pickups assigned along the T. Nagar - Guindy corridor.',
      type: 'ASSIGNMENT',
      isRead: false,
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    },
  ]);

  console.log('[Seed] Created initial notifications.');
  console.log('[Seed] Database successfully seeded! Exiting process.');
  process.exit(0);
}

if (require.main === module) {
  seedDatabase().catch((err) => {
    console.error('[Seed Error]:', err);
    process.exit(1);
  });
}

module.exports = seedDatabase;

