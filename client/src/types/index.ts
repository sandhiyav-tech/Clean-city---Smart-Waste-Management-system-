export type Role = 'CITIZEN' | 'ADMIN' | 'DRIVER';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  createdAt: string;
  updatedAt?: string;
}

export type WasteType = 'ORGANIC' | 'PLASTIC' | 'METAL' | 'E-WASTE' | 'HAZARDOUS' | 'MIXED';

export type ReportStatus = 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COLLECTED';

export interface LocationCoordinates {
  lat: number;
  lng: number;
  address: string;
}

export interface StatusHistoryItem {
  _id?: string;
  status: ReportStatus;
  changedBy?: {
    _id: string;
    name: string;
    role: string;
  };
  at: string;
  note?: string;
}

export interface Report {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  title: string;
  description: string;
  imageUrl?: string;
  location: LocationCoordinates;
  wasteType: WasteType;
  status: ReportStatus;
  assignedDriver?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  } | null;
  statusHistory: StatusHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  _id: string;
  user?: string | null;
  message: string;
  type: 'STATUS_UPDATE' | 'ASSIGNMENT' | 'BROADCAST' | 'SYSTEM';
  reportId?: {
    _id: string;
    title: string;
    status: ReportStatus;
  } | null;
  isRead: boolean;
  createdAt: string;
}

export interface SystemStats {
  totalReports: number;
  statusBreakdown: {
    PENDING: number;
    ASSIGNED: number;
    IN_PROGRESS: number;
    COLLECTED: number;
  };
  wasteTypeBreakdown: {
    ORGANIC: number;
    PLASTIC: number;
    METAL: number;
    'E-WASTE': number;
    HAZARDOUS: number;
    MIXED: number;
  };
  avgCollectionHours: number;
  reportsPerDay: Array<{
    date: string;
    label: string;
    count: number;
  }>;
  users: {
    total: number;
    byRole: {
      CITIZEN: number;
      DRIVER: number;
      ADMIN: number;
    };
  };
}

export interface OptimizedRouteResult {
  orderedStops: Array<any>;
  totalDistanceKm: number;
  estimatedMinutes: number;
  polyline: [number, number][];
}

