<script>
// ======= DATA =======
let reports = [
  { id: 1, location: "Anna Nagar, 5th Ave", type: "Household Waste", severity: "critical", status: "Pending", time: "2h ago", x: 28, y: 28 },
  { id: 2, location: "T.Nagar, Usman Road", type: "Organic Waste", severity: "moderate", status: "In Progress", time: "4h ago", x: 55, y: 55 },
  { id: 3, location: "Adyar, Beach Road", type: "Construction Debris", severity: "minor", status: "Resolved", time: "6h ago", x: 70, y: 65 },
  { id: 4, location: "Perambur, Market St", type: "Household Waste", severity: "critical", status: "Pending", time: "1h ago", x: 60, y: 25 },
  { id: 5, location: "Tambaram, Main Rd", type: "Electronic Waste", severity: "moderate", status: "In Progress", time: "3h ago", x: 30, y: 80 },
  { id: 6, location: "Velachery, OMR", type: "Medical Waste", severity: "critical", status: "Pending", time: "30m ago", x: 72, y: 82 },
  { id: 7, location: "Mylapore, Tank St", type: "Organic Waste", severity: "minor", status: "Resolved", time: "8h ago", x: 50, y: 70 },
  { id: 8, location: "Kodambakkam", type: "Household Waste", severity: "moderate", status: "Pending", time: "5h ago", x: 40, y: 45 },
];

let notifications = [
  { id: 1, type: "alert", icon: "🚨", title: "Critical Report: Velachery", body: "A critical garbage accumulation has been reported near OMR. Immediate action required.", time: "5m ago", unread: true },
  { id: 2, type: "warn", icon: "⚠️", title: "Truck #T-04 Delayed", body: "Collection truck T-04 is running 45 minutes behind schedule on Route B.", time: "18m ago", unread: true },
  { id: 3, type: "ok", icon: "✅", title: "Route Completed: Anna Nagar", body: "Truck T-02 has successfully completed the Anna Nagar collection route.", time: "1h ago", unread: true },
  { id: 4, type: "info", icon: "📊", title: "Daily Summary Ready", body: "31 reports resolved today. East Chennai zone still under 50% coverage.", time: "2h ago", unread: true },
  { id: 5, type: "alert", icon: "🚨", title: "Critical: Perambur Market", body: "Overflow waste detected near Perambur Market Street. Health hazard risk.", time: "3h ago", unread: true },
  { id: 6, type: "ok", icon: "✅", title: "Adyar Beach Road Cleared", body: "Construction debris at Adyar Beach Road has been cleared successfully.", time: "5h ago", unread: false },
  { id: 7, type: "info", icon: "🔧", title: "System Maintenance", body: "Route optimizer updated with new traffic data for Chennai roads.", time: "8h ago", unread: false },
];

let pinnedLocation = null;

// ======= TIME =======
function updateTime() {
  const now = new Date();
  document.getElementById('currentTime').textContent = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST';
}
setInterval(updateTime, 1000); updateTime();

// ======= NAVIGATION =======
const pageTitles = { dashboard: 'Dashboard', report: 'Report Garbage', reports: 'All Reports', routes: 'Route Optimizer', notifications: 'Notifications' };

function showPage(name, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  if (el) el.classList.add('active');
  document.getElementById('pageTitle').textContent = pageTitles[name] || name;
  if (name === 'dashboard') renderDashboard();
  if (name === 'reports') renderReportsTable();
  if (name === 'routes') renderRouteOptimizer();
  if (name === 'notifications') renderNotifications();
}

// ======= DASHBOARD =======
function renderDashboard() {
  renderMapPins('dashMap', 'dashRouteLines', true);
  renderWeekChart();
  renderRecentActivity();
}

function renderMapPins(mapId, routeId, showRoute) {
  const map = document.getElementById(mapId);
  // remove existing pins
  map.querySelectorAll('.map-pin').forEach(p => p.remove());

  const colors = { critical: '#f85149', moderate: '#d29922', minor: '#3fb950' };
  reports.filter(r => r.status !== 'Resolved').forEach(r => {
    const pin = document.createElement('div');
    pin.className = 'map-pin';
    pin.style.cssText = `left:${r.x}%;top:${r.y}%`;
    pin.title = r.location;
    pin.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="${colors[r.severity]}"/></svg>`;
    map.appendChild(pin);
  });

  if (showRoute && routeId) {
    const svg = document.getElementById(routeId);
    const pts = reports.filter(r => r.status !== 'Resolved').map(r => `${r.x},${r.y}`);
    svg.innerHTML = pts.length > 1 ? `<polyline points="${pts.join(' ')}" fill="none" stroke="#58a6ff" stroke-width="0.8" stroke-dasharray="3,2" opacity="0.5"/>` : '';
  }
}

function renderWeekChart() {
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const data = [
    { critical: [4,7,3,8,5,2,6], moderate: [8,5,9,6,7,4,5], minor: [6,4,7,5,8,3,7] }
  ];
  const chart = document.getElementById('weekChart');
  chart.innerHTML = '';
  const maxVal = 20;
  days.forEach((d, i) => {
    const total = data[0].critical[i] + data[0].moderate[i] + data[0].minor[i];
    const col = document.createElement('div');
    col.className = 'bar-col';
    col.innerHTML = `
      <div class="bar" style="height:${(data[0].critical[i]/maxVal)*100}%;background:var(--red)" data-val="${data[0].critical[i]}"></div>
      <div class="bar" style="height:${(data[0].moderate[i]/maxVal)*100}%;background:var(--yellow)" data-val="${data[0].moderate[i]}"></div>
      <div class="bar" style="height:${(data[0].minor[i]/maxVal)*100}%;background:var(--green)" data-val="${data[0].minor[i]}"></div>
      <div class="bar-label">${d}</div>`;
    chart.appendChild(col);
  });
}

function renderRecentActivity() {
  const el = document.getElementById('recentActivity');
  const recent = [...reports].reverse().slice(0, 5);
  el.innerHTML = recent.map(r => `
    <div style="display:flex;align-items:center;gap:10px;font-size:13px">
      <div style="width:8px;height:8px;border-radius:50%;background:${r.severity==='critical'?'var(--red)':r.severity==='moderate'?'var(--yellow)':'var(--green)'};flex-shrink:0"></div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${r.location}</div>
        <div style="font-size:11px;color:var(--muted)">${r.type}</div>
      </div>
      <div style="text-align:right">
        <div class="tag tag-${r.status==='Pending'?'red':r.status==='In Progress'?'yellow':'green'}">${r.status}</div>
        <div style="font-size:10px;color:var(--muted);margin-top:3px">${r.time}</div>
      </div>
    </div>
  `).join('');
}

function refreshMap() {
  renderMapPins('dashMap', 'dashRouteLines', true);
  showToast('🗺️ Map refreshed', 'green');
}

// ======= REPORT FORM =======
function initReportMap() {
  const map = document.getElementById('reportMap');
  map.addEventListener('click', function(e) {
    const rect = map.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
    const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
    pinnedLocation = { x: parseFloat(x), y: parseFloat(y) };
    map.querySelectorAll('.user-pin').forEach(p => p.remove());
    const pin = document.createElement('div');
    pin.className = 'map-pin user-pin';
    pin.style.cssText = `left:${x}%;top:${y}%`;
    pin.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#3fb950"/></svg>`;
    map.appendChild(pin);
    document.getElementById('pinnedCoords').innerHTML = `<span style="color:var(--green)">📍 Location pinned at (${x}%, ${y}%)</span>`;
    document.getElementById('pinHint').textContent = 'Location pinned!';
  });
}

function submitReport() {
  const loc = document.getElementById('repLocation').value.trim();
  const sev = document.getElementById('repSeverity').value;
  const type = document.getElementById('repType').value;
  const desc = document.getElementById('repDesc').value.trim();

  if (!loc) { showToast('⚠️ Please enter a location', 'yellow'); return; }

  const newReport = {
    id: reports.length + 1,
    location: loc,
    type,
    severity: sev,
    status: 'Pending',
    time: 'Just now',
    x: pinnedLocation ? pinnedLocation.x : Math.random() * 80 + 10,
    y: pinnedLocation ? pinnedLocation.y : Math.random() * 70 + 15,
  };

  reports.unshift(newReport);
  notifications.unshift({
    id: notifications.length + 1,
    type: sev === 'critical' ? 'alert' : 'warn',
    icon: sev === 'critical' ? '🚨' : '⚠️',
    title: `New Report: ${loc}`,
    body: `A ${sev} ${type.toLowerCase()} issue has been reported. Awaiting assignment.`,
    time: 'Just now',
    unread: true,
  });

  // Update badges
  const pending = reports.filter(r => r.status === 'Pending').length;
  document.getElementById('pendingBadge').textContent = pending;
  document.getElementById('statPending').textContent = pending;
  document.getElementById('statTotal').textContent = reports.length;
  const unread = notifications.filter(n => n.unread).length;
  document.getElementById('notifBadge').textContent = unread;

  showToast('✅ Report submitted successfully!', 'green');
  clearForm();
  pinnedLocation = null;
  document.getElementById('pinnedCoords').textContent = 'No location pinned yet';
  document.getElementById('pinHint').textContent = 'Click on the map to pin location';
  document.getElementById('reportMap').querySelectorAll('.user-pin').forEach(p => p.remove());
}

function clearForm() {
  ['repLocation','repDesc','repName','repContact'].forEach(id => document.getElementById(id).value = '');
}

// ======= REPORTS TABLE =======
function renderReportsTable() {
  filterReports();
}

function filterReports() {
  const statusF = document.getElementById('filterStatus').value;
  const sevF = document.getElementById('filterSeverity').value;
  let filtered = reports;
  if (statusF) filtered = filtered.filter(r => r.status === statusF);
  if (sevF) filtered = filtered.filter(r => r.severity === sevF);

  document.getElementById('reportCount').textContent = `Showing ${filtered.length} of ${reports.length} reports`;

  const tbody = document.getElementById('reportsTable');
  tbody.innerHTML = filtered.map(r => `
    <tr>
      <td style="color:var(--muted);font-size:12px">#${r.id}</td>
      <td><div style="font-weight:500">${r.location}</div></td>
      <td style="color:var(--muted);font-size:12px">${r.type}</td>
      <td><span class="tag tag-${r.severity==='critical'?'red':r.severity==='moderate'?'yellow':'green'}">${r.severity}</span></td>
      <td><span class="tag tag-${r.status==='Pending'?'red':r.status==='In Progress'?'yellow':'green'}">${r.status}</span></td>
      <td style="color:var(--muted);font-size:12px">${r.time}</td>
      <td>
        <div style="display:flex;gap:6px">
          ${r.status === 'Pending' ? `<button class="btn btn-secondary" onclick="updateStatus(${r.id},'In Progress')" style="font-size:11px;padding:4px 8px">Assign</button>` : ''}
          ${r.status === 'In Progress' ? `<button class="btn btn-primary" onclick="updateStatus(${r.id},'Resolved')" style="font-size:11px;padding:4px 8px">Resolve</button>` : ''}
          ${r.status === 'Resolved' ? `<span style="color:var(--green);font-size:12px">✓ Done</span>` : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

function updateStatus(id, newStatus) {
  const r = reports.find(r => r.id === id);
  if (r) {
    r.status = newStatus;
    const pending = reports.filter(r => r.status === 'Pending').length;
    document.getElementById('pendingBadge').textContent = pending;
    document.getElementById('statPending').textContent = pending;
    filterReports();
    showToast(`Report #${id} → ${newStatus}`, newStatus === 'Resolved' ? 'green' : 'blue');
  }
}

// ======= ROUTE OPTIMIZER =======
const routePoints = [
  { name: 'Depot (Start)', x: 50, y: 50, type: 'depot' },
  { name: 'Anna Nagar', x: 28, y: 28 },
  { name: 'Perambur', x: 62, y: 22 },
  { name: 'T.Nagar', x: 55, y: 55 },
  { name: 'Adyar', x: 70, y: 65 },
  { name: 'Tambaram', x: 30, y: 80 },
  { name: 'Velachery', x: 72, y: 82 },
  { name: 'Kodambakkam', x: 40, y: 45 },
];

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function nearestNeighbor(points) {
  const visited = new Set();
  const route = [points[0]];
  visited.add(0);
  while (visited.size < points.length) {
    const last = route[route.length - 1];
    let nearest = null, nearestDist = Infinity, nearestIdx = -1;
    points.forEach((p, i) => {
      if (!visited.has(i)) {
        const d = dist(last, p);
        if (d < nearestDist) { nearestDist = d; nearest = p; nearestIdx = i; }
      }
    });
    route.push(nearest);
    visited.add(nearestIdx);
  }
  route.push(points[0]); // return to depot
  return route;
}

function renderRouteOptimizer() {
  const route = nearestNeighbor(routePoints);
  const svg = document.getElementById('routeSvg');

  // Draw route
  const pathPts = route.map(p => `${p.x},${p.y}`).join(' ');
  svg.innerHTML = `
    <defs>
      <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
        <path d="M0,0 L0,6 L6,3 z" fill="#3fb950"/>
      </marker>
    </defs>
    <polyline points="${pathPts}" fill="none" stroke="#3fb950" stroke-width="1.2" marker-mid="url(#arrow)" opacity="0.8"/>
  `;

  // Draw nodes
  routePoints.forEach((p, i) => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', p.x);
    circle.setAttribute('cy', p.y);
    circle.setAttribute('r', p.type === 'depot' ? '3' : '2');
    circle.setAttribute('fill', p.type === 'depot' ? '#58a6ff' : '#f85149');
    circle.setAttribute('stroke', '#0d1117');
    circle.setAttribute('stroke-width', '0.5');
    svg.appendChild(circle);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', p.x + 3);
    text.setAttribute('y', p.y - 3);
    text.setAttribute('fill', '#8b949e');
    text.setAttribute('font-size', '4');
    text.textContent = p.name.split(' ')[0];
    svg.appendChild(text);
  });

  // Calculate total distance
  let totalDist = 0;
  for (let i = 0; i < route.length - 1; i++) totalDist += dist(route[i], route[i + 1]);
  const kmDist = (totalDist * 0.18).toFixed(1);
  const stops = routePoints.length - 1;
  const timeMin = Math.round(totalDist * 0.8 + stops * 4);

  document.getElementById('routeDist').textContent = kmDist;
  document.getElementById('routeStops').textContent = stops;
  document.getElementById('routeTime').textContent = timeMin;

  // Stop list
  const stopEl = document.getElementById('stopList');
  stopEl.innerHTML = route.slice(0, -1).map((p, i) => `
    <div style="display:flex;align-items:center;gap:10px;font-size:13px">
      <div style="width:22px;height:22px;border-radius:50%;background:${i===0?'var(--blue)':'var(--surface2)'};border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;color:${i===0?'#fff':'var(--muted)'}">${i+1}</div>
      <div style="flex:1">${p.name}</div>
      ${i>0?`<div style="font-size:11px;color:var(--muted)">${(dist(route[i-1],p)*0.18).toFixed(1)}km</div>`:''}
    </div>
  `).join('');

  // Truck list
  document.getElementById('truckList').innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;font-size:13px">
      <div style="width:8px;height:8px;border-radius:50%;background:var(--green)"></div>
      <div style="flex:1">Truck T-01 — Route A (4 stops)</div>
      <span class="tag tag-green">Active</span>
    </div>
    <div style="display:flex;align-items:center;gap:10px;font-size:13px">
      <div style="width:8px;height:8px;border-radius:50%;background:var(--yellow)"></div>
      <div style="flex:1">Truck T-02 — Route B (4 stops)</div>
      <span class="tag tag-yellow">En Route</span>
    </div>
    <div style="display:flex;align-items:center;gap:10px;font-size:13px">
      <div style="width:8px;height:8px;border-radius:50%;background:var(--muted)"></div>
      <div style="flex:1">Truck T-03 — Standby</div>
      <span class="tag tag-blue">Standby</span>
    </div>
  `;
}

function optimizeRoute() {
  document.getElementById('routeDist').textContent = '—';
  document.getElementById('routeStops').textContent = '—';
  document.getElementById('routeTime').textContent = '—';
  setTimeout(() => {
    renderRouteOptimizer();
    showToast('⚡ Route optimized successfully!', 'green');
  }, 800);
}

// ======= NOTIFICATIONS =======
function renderNotifications() {
  const list = document.getElementById('notifList');
  list.innerHTML = notifications.map(n => `
    <div class="notif-item ${n.unread ? 'unread' : ''}" onclick="markRead(${n.id})">
      <div class="notif-icon ${n.type}"><span>${n.icon}</span></div>
      <div style="flex:1">
        <div class="notif-title">${n.title}${n.unread ? ' <span style="display:inline-block;width:6px;height:6px;background:var(--green);border-radius:50%;margin-left:4px;vertical-align:middle"></span>' : ''}</div>
        <div class="notif-body">${n.body}</div>
      </div>
      <div class="notif-time">${n.time}</div>
    </div>
  `).join('');
  updateUnreadCount();
}

function markRead(id) {
  const n = notifications.find(n => n.id === id);
  if (n) { n.unread = false; renderNotifications(); updateUnreadCount(); }
}

function markAllRead() {
  notifications.forEach(n => n.unread = false);
  renderNotifications();
  document.getElementById('notifBadge').textContent = '0';
  showToast('All notifications marked as read', 'blue');
}

function clearNotifs() {
  notifications = [];
  renderNotifications();
  document.getElementById('notifBadge').textContent = '0';
  showToast('Notifications cleared', 'muted');
}

function updateUnreadCount() {
  const count = notifications.filter(n => n.unread).length;
  document.getElementById('unreadCount').textContent = `${count} unread`;
  document.getElementById('notifBadge').textContent = count || '0';
}

// ======= TOAST =======
function showToast(msg, type) {
  const colors = { green: 'var(--green)', yellow: 'var(--yellow)', red: 'var(--red)', blue: 'var(--blue)', muted: 'var(--muted)' };
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span style="color:${colors[type]||colors.green};font-size:16px">●</span> <span>${msg}</span>`;
  document.getElementById('toastContainer').appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ======= INIT =======
initReportMap();
renderDashboard();
</script>