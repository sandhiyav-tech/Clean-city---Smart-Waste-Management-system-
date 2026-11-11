import L from 'leaflet';
import { ReportStatus } from '../../types';

export const createStatusIcon = (status: ReportStatus) => {
  const colorMap: Record<ReportStatus, { bg: string; border: string; glow: string }> = {
    PENDING: { bg: '#f59e0b', border: '#d97706', glow: 'rgba(245, 158, 11, 0.4)' },
    ASSIGNED: { bg: '#3b82f6', border: '#2563eb', glow: 'rgba(59, 130, 246, 0.4)' },
    IN_PROGRESS: { bg: '#8b5cf6', border: '#7c3aed', glow: 'rgba(139, 92, 246, 0.4)' },
    COLLECTED: { bg: '#10b981', border: '#059669', glow: 'rgba(16, 185, 129, 0.4)' },
  };

  const c = colorMap[status] || colorMap.PENDING;

  const html = `
    <div style="
      position: relative;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        position: absolute;
        width: 32px;
        height: 32px;
        background: ${c.glow};
        border-radius: 50%;
        animation: pulse 2s infinite;
      "></div>
      <div style="
        position: relative;
        width: 24px;
        height: 24px;
        background: ${c.bg};
        border: 2px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="width: 8px; height: 8px; background: #ffffff; border-radius: 50%;"></div>
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-status-marker',
    html,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
};

export const depotIcon = L.divIcon({
  className: 'custom-depot-marker',
  html: `
    <div style="
      width: 34px;
      height: 34px;
      background: #1e293b;
      border: 3px solid #10b981;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
        <path d="M15 18H9"/>
        <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
        <circle cx="17" cy="18" r="2"/>
        <circle cx="7" cy="18" r="2"/>
      </svg>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -20],
});

export const pinPickerIcon = L.divIcon({
  className: 'custom-picker-marker',
  html: `
    <div style="
      transform: translate(-50%, -100%);
      display: flex;
      flex-direction: column;
      align-items: center;
    ">
      <div style="
        background: #ef4444;
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="width: 10px; height: 10px; background: white; border-radius: 50%;"></div>
      </div>
    </div>
  `,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});

