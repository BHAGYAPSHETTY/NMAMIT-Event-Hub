/**
 * NMAMIT CampusSlot - Core Application Logic
 * Centralized Event & Venue Reservation Portal
 * 
 * Rules:
 *  1. Any student (*@nmamit.in) or staff (*@nmamit.edu.in) can login, but credentials must be authorized.
 *  2. Student & Staff can only book. Both start in PENDING state.
 *  3. ONLY Admin (admin@nmamit.edu.in) can approve or decline bookings.
 *  4. Cancelled or Postponed events immediately free up the venue slot.
 *  5. Admin approval requires a double-confirmation modal.
 *  6. Live Free Venues Explorer showing real-time available locations.
 */

// ==========================================
// 1. STATE & DATA STORE
// ==========================================

// Current logged-in user session (defaults to Student demo for immediate interactivity)
let currentUser = {
  role: 'student', // 'student' | 'staff' | 'admin'
  name: 'Adithya Rao',
  email: 'NNM23IS001@nmamit.in',
  department: 'Computer Science & Engineering',
  id: 'NNM23IS001',
  isAuthorized: true
};

// Variable holding ID of event awaiting double-confirmation
let pendingApprovalEventId = null;
let pendingPostponeEventId = null;

// Official NMAMIT Venues
const venuesData = [
  {
    id: 'sambhram',
    name: 'Sambhram Auditorium',
    capacity: 1500,
    type: 'Auditorium',
    facilities: ['Central AC', 'Dual 4K Projectors', 'Surround PA System', 'Stage Lighting', 'VIP Green Rooms'],
    description: 'Flagship university auditorium hosting major national conferences, convocations, and symposiums.',
    color: '#1e40af'
  },
  {
    id: 'sadananda-oat',
    name: 'Sadananda Open Air Theatre',
    capacity: 3000,
    type: 'Open Air',
    facilities: ['Gigantic Stage', 'Acoustic Canopy', 'High-Lumen Floodlights', 'Green Rooms'],
    description: 'Iconic open-air stadium stage for Incridea, cultural extravaganzas, and student celebrations.',
    color: '#7c3aed'
  },
  {
    id: 'bc-roy',
    name: 'B.C. Roy Seminar Hall',
    capacity: 250,
    type: 'Seminar Hall',
    facilities: ['AC', 'Interactive Podium', 'Overhead Projector', 'Tiered Seating'],
    description: 'Tiered academic seminar hall tailored for departmental guest lectures and workshops.',
    color: '#059669'
  },
  {
    id: 'phalguni',
    name: 'Phalguni Seminar Hall',
    capacity: 180,
    type: 'Seminar Hall',
    facilities: ['AC', 'Video Conferencing Suite', 'Smart Screen'],
    description: 'Modern conference space designed for Faculty Development Programs (FDPs) and research defense.',
    color: '#0891b2'
  },
  {
    id: 'shambhavi',
    name: 'Shambhavi Seminar Hall',
    capacity: 120,
    type: 'Conference Hall',
    facilities: ['Boardroom Setup', 'AC', 'Digital Mic Array'],
    description: 'Executive committee and syndicate room for academic council meetings.',
    color: '#d97706'
  },
  {
    id: 'ccf',
    name: 'Central Computing Facility (CCF)',
    capacity: 300,
    type: 'High-Tech Labs',
    facilities: ['1 Gbps LAN', 'Workstations', 'High-Power Backup', 'AC'],
    description: 'State-of-the-art computer labs for coding contests, hackathons, and online examinations.',
    color: '#dc2626'
  },
  {
    id: 'bc-alva',
    name: 'B.C. Alva Indoor Stadium',
    capacity: 800,
    type: 'Sports Complex',
    facilities: ['Synthetic Badminton Courts', 'Basketball Arena', 'Electronic Scoreboard'],
    description: 'Spacious indoor arena for inter-collegiate tournaments and sports meets.',
    color: '#ea580c'
  },
  {
    id: 'main-ground',
    name: 'College Main Ground',
    capacity: 4000,
    type: 'Outdoor Sports',
    facilities: ['Cricket Pitch', 'Running Tracks', 'Spectator Pavilion'],
    description: 'Primary athletics track and outdoor festival arena.',
    color: '#475569'
  }
];

// Initial Seed Events
let eventsData = [
  {
    id: 'EVT-101',
    title: 'IEEE International Conference on Smart Computing',
    venue: 'Sambhram Auditorium',
    date: '2026-10-12',
    startTime: '09:00',
    endTime: '13:00',
    category: 'Academic',
    organizer: 'Dr. Srinivas Rao',
    organizerEmail: 'srinivas.rao@nmamit.edu.in',
    role: 'staff',
    status: 'confirmed',
    attendees: 450,
    facilities: ['Central AC', '4K Projector', 'PA Sound System']
  },
  {
    id: 'EVT-102',
    title: 'Incridea 2026 Student Organizing Committee Briefing',
    venue: 'Sadananda Open Air Theatre',
    date: '2026-10-14',
    startTime: '16:00',
    endTime: '19:00',
    category: 'Cultural',
    organizer: 'Student Council Nitte',
    organizerEmail: '4nm21cs042@nmamit.in',
    facultyAdvisor: 'prof.rajesh@nmamit.edu.in',
    role: 'student',
    status: 'confirmed',
    attendees: 600,
    facilities: ['Gigantic Stage', 'PA Sound System']
  },
  {
    id: 'EVT-103',
    title: 'Cybersecurity Hands-on Workshop & Capture The Flag',
    venue: 'Central Computing Facility (CCF)',
    date: '2026-10-15',
    startTime: '10:00',
    endTime: '16:00',
    category: 'Technical',
    organizer: 'FOSS & Linux Club',
    organizerEmail: '4nm22is089@nmamit.in',
    facultyAdvisor: 'dr.shirva@nmamit.edu.in',
    role: 'student',
    status: 'pending',
    attendees: 120,
    facilities: ['1 Gbps LAN', 'Workstations', 'AC']
  },
  {
    id: 'EVT-104',
    title: 'Department of Mechanical Engg Board of Studies',
    venue: 'Shambhavi Seminar Hall',
    date: '2026-10-16',
    startTime: '10:30',
    endTime: '13:30',
    category: 'Academic',
    organizer: 'HOD Mechanical',
    organizerEmail: 'hod.mech@nmamit.edu.in',
    role: 'staff',
    status: 'confirmed',
    attendees: 35,
    facilities: ['AC', 'Digital Mic Array']
  },
  {
    id: 'EVT-105',
    title: 'RoboWars Arena Trials - Technext 2026',
    venue: 'B.C. Roy Seminar Hall',
    date: '2026-10-18',
    startTime: '14:00',
    endTime: '18:00',
    category: 'Technical',
    organizer: 'Robotics Club NMAMIT',
    organizerEmail: '4nm21me012@nmamit.in',
    facultyAdvisor: 'prof.rajesh@nmamit.edu.in',
    role: 'student',
    status: 'pending',
    attendees: 150,
    facilities: ['AC', 'Overhead Projector']
  },
  {
    id: 'EVT-106',
    title: 'Campus Placement Pre-Placement Talk: Google Cloud',
    venue: 'Sambhram Auditorium',
    date: '2026-10-20',
    startTime: '14:00',
    endTime: '17:30',
    category: 'Placement',
    organizer: 'Department of Training & Placement',
    organizerEmail: 'placement@nmamit.edu.in',
    role: 'staff',
    status: 'confirmed',
    attendees: 1200,
    facilities: ['Central AC', 'Dual 4K Projectors', 'Surround PA System']
  }
];

// Active Calendar View Configuration
let currentDate = new Date(2026, 9, 10); // Oct 10, 2026
let currentFilterVenue = 'all';
let currentCalMode = 'grid';

// ==========================================
// 2. INITIALIZATION & LIFECYCLE
// ==========================================

window.addEventListener('DOMContentLoaded', () => {
  // Load state from localStorage if exists
  const savedEvents = localStorage.getItem('nmamit_events');
  if (savedEvents) {
    try {
      eventsData = JSON.parse(savedEvents);
    } catch (e) {
      console.warn("Could not parse saved events, using defaults.", e);
    }
  }

  // Pre-fill booking date and free venue filters to default date
  const bookingDateInput = document.getElementById('bookingDate');
  const freeDateInput = document.getElementById('freeDateInput');
  const defaultDateStr = '2026-10-12';
  if (bookingDateInput) bookingDateInput.value = defaultDateStr;
  if (freeDateInput) freeDateInput.value = defaultDateStr;

  updateStats();
  renderCalendar();
  renderFreeVenuesExplorer();
  renderVenuesCatalog();
  renderApprovalsList();
  applyRoleUI();
  updateAuthHeaderWidget();
});

function saveState() {
  localStorage.setItem('nmamit_events', JSON.stringify(eventsData));
  updateStats();
}

// ==========================================
// 3. AUTHENTICATION & CREDENTIAL AUTHORIZATION
// ==========================================

/**
 * Validates institutional NMAMIT credentials.
 * Authorization criteria:
 *  - Students: must end with @nmamit.in and have a valid prefix
 *  - Staff: must end with @nmamit.edu.in
 *  - Admin: admin@nmamit.edu.in
 */
function verifyNMAMITAuthorization(email) {
  email = (email || '').trim().toLowerCase();
  
  if (email === 'admin@nmamit.edu.in') {
    return {
      isAuthorized: true,
      role: 'admin',
      name: 'Estate Administrator',
      dept: 'Central Estate & Facilities Office',
      idNumber: 'ADM-EST-01',
      title: 'Authorized Estate Administrator'
    };
  }

  if (email.endsWith('@nmamit.in')) {
    const prefix = email.split('@')[0];
    if (prefix.length < 3) {
      return { isAuthorized: false, error: 'Invalid USN or student credential format.' };
    }
    return {
      isAuthorized: true,
      role: 'student',
      name: prefix.toUpperCase(),
      dept: 'Student Body',
      idNumber: prefix.toUpperCase(),
      title: 'Authorized NMAMIT Student'
    };
  }

  if (email.endsWith('@nmamit.edu.in')) {
    const prefix = email.split('@')[0];
    return {
      isAuthorized: true,
      role: 'staff',
      name: prefix.charAt(0).toUpperCase() + prefix.slice(1).replace('.', ' '),
      dept: 'Academic Faculty / Staff',
      idNumber: 'FAC-' + Math.floor(100 + Math.random() * 900),
      title: 'Authorized NMAMIT Faculty/Staff'
    };
  }

  return { isAuthorized: false, error: 'Unauthorized domain! Only institutional emails (@nmamit.in or @nmamit.edu.in) are permitted.' };
}

function updateAuthHeaderWidget() {
  const container = document.getElementById('authHeaderWidget');
  if (!container) return;

  if (currentUser) {
    let roleBadgeClass = 'student';
    let roleLabel = 'STUDENT';
    if (currentUser.role === 'staff') { roleBadgeClass = 'staff'; roleLabel = 'FACULTY'; }
    if (currentUser.role === 'admin') { roleBadgeClass = 'admin'; roleLabel = 'ESTATE ADMIN'; }

    container.innerHTML = `
      <div class="auth-user-chip">
        <div class="auth-avatar">${currentUser.name.charAt(0)}</div>
        <div>
          <div style="font-weight:700; line-height:1.2;">${currentUser.name} <span style="color:#10b981; font-size:0.65rem;">● Authorized</span></div>
          <div style="font-size:0.65rem; color:var(--slate-400);">${currentUser.email} • <b>${roleLabel}</b></div>
        </div>
        <button type="button" onclick="logoutUser()" class="auth-btn-signout" title="Sign out of account">Sign Out</button>
      </div>
    `;
  } else {
    container.innerHTML = `
      <button type="button" onclick="openLoginModal()" class="auth-btn-signin">
        Sign In
      </button>
    `;
  }
}

function openLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.classList.remove('hidden');
}

function closeLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.classList.add('hidden');
}

function performDemoLogin(role) {
  if (role === 'student') {
    currentUser = {
      role: 'student',
      name: 'Adithya Rao',
      email: '4nm21cs042@nmamit.in',
      department: 'Computer Science & Engineering',
      id: '4NM21CS042',
      isAuthorized: true
    };
  } else if (role === 'staff') {
    currentUser = {
      role: 'staff',
      name: 'Prof. Rajesh K',
      email: 'prof.rajesh@nmamit.edu.in',
      department: 'Computer Science & Engineering',
      id: 'EMP-CS-401',
      isAuthorized: true
    };
  } else if (role === 'admin') {
    currentUser = {
      role: 'admin',
      name: 'Estate Administrator',
      email: 'admin@nmamit.edu.in',
      department: 'Central Estate & Facilities Office',
      id: 'ADM-EST-01',
      isAuthorized: true
    };
  }

  closeLoginModal();
  applyRoleUI();
  updateAuthHeaderWidget();
  renderApprovalsList();
  showToast(`Authorized as ${currentUser.name} (${currentUser.role.toUpperCase()})`);
}

function quickLogin(role) {
  performDemoLogin(role);
}

function handleLoginFormSubmit(e) {
  e.preventDefault();
  const emailInput = document.getElementById('loginEmail');
  const email = (emailInput ? emailInput.value : '').trim().toLowerCase();

  const authResult = verifyNMAMITAuthorization(email);

  if (!authResult.isAuthorized) {
    alert("Authorization Failed: " + authResult.error);
    return;
  }

  currentUser = {
    role: authResult.role,
    name: authResult.name,
    email: email,
    department: authResult.dept,
    id: authResult.idNumber,
    isAuthorized: true
  };

  closeLoginModal();
  applyRoleUI();
  updateAuthHeaderWidget();
  renderApprovalsList();
  showToast(`✅ Institutional authorization verified: ${currentUser.name}`);
}

function logoutUser() {
  currentUser = null;
  applyRoleUI();
  updateAuthHeaderWidget();
  renderApprovalsList();
  showToast("You have been signed out.");
}

function handleBookVenueClick() {
  if (!currentUser) {
    openLoginModal();
    showToast("Please sign in with your authorized NMAMIT credentials to book a venue.");
    return;
  }
  openBookingModal();
}

function applyRoleUI() {
  const badge = document.getElementById('currentRoleBadge');
  const statRoleDisplay = document.getElementById('statRoleDisplay');
  const adminNotice = document.getElementById('adminActiveRoleName');
  const authStatusText = document.getElementById('authStatusText');
  const authLiveDot = document.getElementById('authLiveDot');

  const roleBtns = ['student', 'staff', 'admin'];
  roleBtns.forEach(r => {
    const btn = document.getElementById(`roleBtn-${r}`);
    if (btn) {
      if (currentUser && currentUser.role === r) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
  });

  if (!currentUser) {
    if (badge) {
      badge.className = 'badge-role guest';
      badge.textContent = 'Guest (Browsing Only)';
    }
    if (authStatusText) authStatusText.textContent = 'Not Signed In';
    if (authLiveDot) authLiveDot.className = 'live-dot offline';
    if (statRoleDisplay) {
      statRoleDisplay.textContent = 'Guest Mode (Sign In to Book)';
      statRoleDisplay.className = 'stat-val-sm';
    }
    if (adminNotice) adminNotice.textContent = 'Guest (Browse Only)';
    return;
  }

  if (authLiveDot) authLiveDot.className = 'live-dot';
  if (authStatusText) authStatusText.textContent = 'Authorized:';

  if (badge) {
    badge.className = `badge-role ${currentUser.role}`;
    if (currentUser.role === 'student') {
      badge.textContent = 'Authorized Student (@nmamit.in)';
    } else if (currentUser.role === 'staff') {
      badge.textContent = 'Authorized Staff (@nmamit.edu.in)';
    } else {
      badge.textContent = 'Estate Admin (admin@nmamit.edu.in)';
    }
  }

  if (statRoleDisplay) {
    if (currentUser.role === 'student') {
      statRoleDisplay.textContent = 'Student Flow (Requires Admin Approval)';
      statRoleDisplay.className = 'stat-val-sm text-amber';
    } else if (currentUser.role === 'staff') {
      statRoleDisplay.textContent = 'Staff Flow (Requires Admin Approval)';
      statRoleDisplay.className = 'stat-val-sm text-purple';
    } else {
      statRoleDisplay.textContent = 'Estate Admin (Master Clearance Authority)';
      statRoleDisplay.className = 'stat-val-sm text-amber';
    }
  }

  if (adminNotice) {
    adminNotice.textContent = `${currentUser.name} (${currentUser.role.toUpperCase()})`;
  }

  const nameInput = document.getElementById('applicantName');
  const emailInput = document.getElementById('applicantEmail');
  if (nameInput) nameInput.value = currentUser.name;
  if (emailInput) {
    emailInput.value = currentUser.email;
    validateEmailDomain(currentUser.email);
  }
}

function validateEmailDomain(email) {
  email = (email || '').trim().toLowerCase();
  const statusEl = document.getElementById('emailDomainStatus');
  const alertBox = document.getElementById('domainAlertBox');
  const alertTitle = document.getElementById('domainAlertTitle');
  const alertDesc = document.getElementById('domainAlertDesc');
  const studentFields = document.getElementById('studentSpecificFields');
  const modalRoleTag = document.getElementById('modalRoleTag');
  const submitBtn = document.getElementById('submitBookingBtn');

  if (email.endsWith('@nmamit.in')) {
    if (statusEl) {
      statusEl.textContent = '✅ Authorized Student Credential (@nmamit.in)';
      statusEl.className = 'input-hint hint-success';
    }
    if (alertBox) alertBox.className = 'alert-box alert-info';
    if (alertTitle) alertTitle.textContent = 'Student Reservation Request (@nmamit.in)';
    if (alertDesc) alertDesc.textContent = 'Student club bookings are created in "Pending" status and must be approved exclusively by the Estate Administrator.';
    if (studentFields) studentFields.classList.remove('hidden');
    if (modalRoleTag) {
      modalRoleTag.textContent = 'Student (Awaiting Admin Clearance)';
      modalRoleTag.className = 'badge-role student';
    }
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit For Estate Admin Approval';
    }
  } else if (email.endsWith('@nmamit.edu.in')) {
    if (statusEl) {
      statusEl.textContent = '✅ Authorized Staff Credential (@nmamit.edu.in)';
      statusEl.className = 'input-hint hint-success';
    }
    if (alertBox) alertBox.className = 'alert-box alert-info';
    if (alertTitle) alertTitle.textContent = 'Staff Reservation Request (@nmamit.edu.in)';
    if (alertDesc) alertDesc.textContent = 'Staff requests are submitted in "Pending" status and require Estate Administrator approval before being confirmed.';
    if (studentFields) studentFields.classList.add('hidden');
    if (modalRoleTag) {
      modalRoleTag.textContent = 'Staff (Awaiting Admin Clearance)';
      modalRoleTag.className = 'badge-role staff';
    }
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit For Estate Admin Approval';
    }
  } else {
    if (statusEl) {
      statusEl.textContent = '❌ Unauthorized domain! Only @nmamit.in or @nmamit.edu.in permitted.';
      statusEl.className = 'input-hint hint-danger';
    }
    if (alertBox) alertBox.className = 'alert-box alert-danger';
    if (alertTitle) alertTitle.textContent = 'Access Restricted: Unauthorized Domain';
    if (alertDesc) alertDesc.textContent = 'Only verified NMAMIT email credentials are authorized to make reservations.';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Unauthorized Credential';
    }
  }
}

// ==========================================
// 4. VIEW & CALENDAR CONTROLS
// ==========================================

function switchView(viewName) {
  const views = ['calendar', 'freeVenues', 'venues', 'approvals'];
  views.forEach(v => {
    const el = document.getElementById(`view${capitalize(v)}`);
    const btn = document.getElementById(`tabBtn-${v}`);
    if (el) el.classList.toggle('hidden', v !== viewName);
    if (btn) btn.classList.toggle('active', v === viewName);
  });

  if (viewName === 'freeVenues') {
    renderFreeVenuesExplorer();
  }
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function navigateMonth(direction) {
  currentDate.setMonth(currentDate.getMonth() + direction);
  renderCalendar();
}

function goToCurrentMonth() {
  currentDate = new Date(2026, 9, 10);
  renderCalendar();
}

function setCalDisplayMode(mode) {
  currentCalMode = mode;
  const gridView = document.getElementById('calendarGridView');
  const timelineView = document.getElementById('calendarTimelineView');
  const gridBtn = document.getElementById('modeBtn-grid');
  const timelineBtn = document.getElementById('modeBtn-timeline');

  if (gridView) gridView.classList.toggle('hidden', mode !== 'grid');
  if (timelineView) timelineView.classList.toggle('hidden', mode !== 'timeline');
  if (gridBtn) gridBtn.classList.toggle('active', mode === 'grid');
  if (timelineBtn) timelineBtn.classList.toggle('active', mode === 'timeline');

  if (mode === 'timeline') {
    renderTimeline();
  }
}

function filterByVenue(venueName) {
  currentFilterVenue = venueName;
  document.querySelectorAll('.venue-pill').forEach(pill => {
    if (pill.getAttribute('data-venue') === venueName) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });

  renderCalendar();
  if (currentCalMode === 'timeline') renderTimeline();
}

// ==========================================
// 5. CALENDAR RENDERING ENGINE
// ==========================================

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const titleEl = document.getElementById('calendarMonthTitle');
  if (titleEl) titleEl.textContent = `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const container = document.getElementById('calendarCellsContainer');
  if (!container) return;
  container.innerHTML = '';

  // Previous month ghost cells
  for (let i = firstDay - 1; i >= 0; i--) {
    const dayNum = prevMonthDays - i;
    const cell = document.createElement('div');
    cell.className = 'cal-cell other-month';
    cell.innerHTML = `<span class="cell-num">${dayNum}</span>`;
    container.appendChild(cell);
  }

  // Active month cells
  for (let day = 1; day <= daysInMonth; day++) {
    const cellDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isToday = (year === 2026 && month === 9 && day === 10);

    const dayEvents = eventsData.filter(ev => {
      const matchDate = (ev.date === cellDate);
      const matchVenue = (currentFilterVenue === 'all' || ev.venue === currentFilterVenue);
      return matchDate && matchVenue;
    });

    const cell = document.createElement('div');
    cell.className = `cal-cell ${isToday ? 'is-today' : ''}`;

    let eventsHtml = '';
    dayEvents.forEach(ev => {
      let badgeClass = 'event-badge event-confirmed';
      let icon = '✓';

      if (ev.status === 'cancelled') {
        badgeClass = 'event-badge event-cancelled';
        icon = '✕';
      } else if (ev.status === 'pending') {
        badgeClass = 'event-badge event-pending';
        icon = '⏳';
      } else if (ev.role === 'staff') {
        badgeClass = 'event-badge event-staff';
        icon = '⭐';
      }

      eventsHtml += `
        <div onclick="openEventDetails('${ev.id}')" title="${ev.title} (${ev.venue}) - Status: ${ev.status.toUpperCase()}" class="${badgeClass}">
          <span>${icon}</span>
          <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${ev.startTime} ${ev.title}</span>
        </div>
      `;
    });

    const activeConfirmedEvents = dayEvents.filter(e => e.status !== 'cancelled');

    cell.innerHTML = `
      <div>
        <div class="cell-top">
          <span class="cell-num ${isToday ? 'today-circle' : ''}">${day}</span>
          <button type="button" onclick="quickBookDate('${cellDate}')" title="Book this date" class="cell-add-btn">+ Book</button>
        </div>
        <div class="cell-events">
          ${eventsHtml}
        </div>
      </div>
      ${activeConfirmedEvents.length === 0 ? '<span style="font-size:0.65rem; color:var(--emerald-600); font-weight:700;">🟢 Venues Free</span>' : ''}
    `;

    container.appendChild(cell);
  }
}

function renderTimeline() {
  const dateInput = document.getElementById('bookingDate');
  const timelineDate = (dateInput && dateInput.value) ? dateInput.value : '2026-10-12';
  const labelEl = document.getElementById('timelineActiveDate');
  if (labelEl) labelEl.textContent = `Schedule Date: ${timelineDate}`;

  const container = document.getElementById('timelineVenueRows');
  if (!container) return;
  container.innerHTML = '';

  venuesData.forEach(venue => {
    if (currentFilterVenue !== 'all' && venue.name !== currentFilterVenue) return;

    // Only active bookings block the slot (cancelled events free the venue)
    const dayBookings = eventsData.filter(e => e.date === timelineDate && e.venue === venue.name && e.status !== 'cancelled');

    let slotsHtml = '';
    if (dayBookings.length === 0) {
      slotsHtml = `
        <div style="flex:1; background:var(--emerald-50); border:1px solid #bbf7d0; color:var(--emerald-600); border-radius:var(--radius-md); padding:0.5rem 0.75rem; font-size:0.75rem; display:flex; align-items:center; justify-content:space-between;">
          <span>✅ All Slots Free (08:00 - 21:00)</span>
          <button type="button" onclick="quickBookVenue('${venue.name}', '${timelineDate}')" class="btn-primary" style="padding:0.25rem 0.6rem; font-size:0.7rem;">Reserve</button>
        </div>
      `;
    } else {
      dayBookings.forEach(bk => {
        const isPending = bk.status === 'pending';
        slotsHtml += `
          <div onclick="openEventDetails('${bk.id}')" style="background:${isPending ? 'var(--amber-50)' : 'var(--blue-50)'}; border:1px solid ${isPending ? '#fde68a' : '#bfdbfe'}; color:${isPending ? '#b45309' : '#1e40af'}; border-radius:var(--radius-md); padding:0.5rem 0.75rem; font-size:0.75rem; cursor:pointer;">
            <div style="font-weight:700;">${isPending ? '⏳ Pending Review' : '🔒 Reserved'} • ${bk.startTime} - ${bk.endTime}</div>
            <div style="font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:240px;">${bk.title}</div>
            <div style="font-size:0.68rem; color:var(--slate-500);">By: ${bk.organizer}</div>
          </div>
        `;
      });
    }

    const row = document.createElement('div');
    row.className = 'timeline-row';
    row.innerHTML = `
      <div class="venue-meta">
        <h4>${venue.name}</h4>
        <p>👥 ${venue.capacity} Seats • ${venue.type}</p>
      </div>
      <div style="flex:1; display:flex; flex-wrap:wrap; gap:0.5rem; align-items:center;">
        ${slotsHtml}
      </div>
    `;
    container.appendChild(row);
  });
}

// ==========================================
// 6. LIVE FREE VENUES EXPLORER
// ==========================================

function renderFreeVenuesExplorer() {
  const dateInput = document.getElementById('freeDateInput');
  const startInput = document.getElementById('freeStartTimeInput');
  const endInput = document.getElementById('freeEndTimeInput');
  const grid = document.getElementById('freeVenuesGrid');
  const summaryEl = document.getElementById('freeAvailabilitySummary');

  if (!grid) return;

  const targetDate = (dateInput && dateInput.value) ? dateInput.value : '2026-10-12';
  const targetStart = (startInput && startInput.value) ? startInput.value : '10:00';
  const targetEnd = (endInput && endInput.value) ? endInput.value : '13:00';

  grid.innerHTML = '';
  let freeCount = 0;
  let occupiedCount = 0;
  let pendingCount = 0;

  venuesData.forEach(venue => {
    // Check conflicts during this time window, IGNORING cancelled events
    const clashingBookings = eventsData.filter(ev => {
      if (ev.venue !== venue.name || ev.date !== targetDate || ev.status === 'cancelled') return false;
      return (targetStart < ev.endTime && targetEnd > ev.startTime);
    });

    const confirmedClash = clashingBookings.find(b => b.status === 'confirmed');
    const pendingClash = clashingBookings.find(b => b.status === 'pending');

    const card = document.createElement('div');
    const facilitiesBadges = venue.facilities.slice(0, 3).map(f => `<span class="f-badge">${f}</span>`).join(' ');

    if (confirmedClash) {
      occupiedCount++;
      card.className = 'free-venue-card status-occupied';
      card.innerHTML = `
        <div>
          <div class="venue-card-badge-row">
            <span class="status-badge-occupied">🔴 OCCUPIED</span>
            <span style="font-size:0.7rem; color:var(--slate-500); font-weight:700;">👥 ${venue.capacity} Capacity</span>
          </div>
          <h3 style="font-size:1.05rem; font-weight:800; color:var(--slate-900);">${venue.name}</h3>
          <p style="font-size:0.75rem; color:var(--slate-600); margin:0.35rem 0;">${venue.type}</p>
          
          <div style="background:var(--red-50); border:1px solid #fecaca; border-radius:var(--radius-sm); padding:0.6rem; margin:0.75rem 0; font-size:0.75rem; color:#991b1b;">
            <div style="font-weight:700;">Booked: "${confirmedClash.title}"</div>
            <div>Time: ${confirmedClash.startTime} - ${confirmedClash.endTime}</div>
            <div style="font-size:0.7rem; color:#7f1d1d;">By: ${confirmedClash.organizer}</div>
          </div>
        </div>

        <div style="border-top:1px solid var(--slate-200); padding-top:0.75rem; display:flex; align-items:center; justify-content:space-between;">
          <span style="font-size:0.7rem; color:var(--slate-400);">Slot Unavailable</span>
          <button type="button" onclick="openEventDetails('${confirmedClash.id}')" class="btn-secondary" style="font-size:0.72rem; padding:0.3rem 0.65rem;">View Event</button>
        </div>
      `;
    } else if (pendingClash) {
      pendingCount++;
      card.className = 'free-venue-card status-pending';
      card.innerHTML = `
        <div>
          <div class="venue-card-badge-row">
            <span class="status-badge-pending">⏳ PENDING CLEARANCE</span>
            <span style="font-size:0.7rem; color:var(--slate-500); font-weight:700;">👥 ${venue.capacity} Capacity</span>
          </div>
          <h3 style="font-size:1.05rem; font-weight:800; color:var(--slate-900);">${venue.name}</h3>
          <p style="font-size:0.75rem; color:var(--slate-600); margin:0.35rem 0;">${venue.type}</p>
          
          <div style="background:var(--amber-50); border:1px solid #fde68a; border-radius:var(--radius-sm); padding:0.6rem; margin:0.75rem 0; font-size:0.75rem; color:#b45309;">
            <div style="font-weight:700;">Requested: "${pendingClash.title}"</div>
            <div>Time: ${pendingClash.startTime} - ${pendingClash.endTime}</div>
            <div style="font-size:0.7rem;">Awaiting Estate Admin Decision</div>
          </div>
        </div>

        <div style="border-top:1px solid var(--slate-200); padding-top:0.75rem; display:flex; align-items:center; justify-content:space-between;">
          <span style="font-size:0.7rem; color:var(--amber-600); font-weight:700;">Decision Pending</span>
          <button type="button" onclick="openEventDetails('${pendingClash.id}')" class="btn-secondary" style="font-size:0.72rem; padding:0.3rem 0.65rem;">Inspect</button>
        </div>
      `;
    } else {
      freeCount++;
      card.className = 'free-venue-card status-free';
      card.innerHTML = `
        <div>
          <div class="venue-card-badge-row">
            <span class="status-badge-free">🟢 FREE & AVAILABLE</span>
            <span style="font-size:0.7rem; color:var(--slate-500); font-weight:700;">👥 ${venue.capacity} Capacity</span>
          </div>
          <h3 style="font-size:1.05rem; font-weight:800; color:var(--slate-900);">${venue.name}</h3>
          <p style="font-size:0.75rem; color:var(--slate-600); margin:0.35rem 0;">${venue.type}</p>
          
          <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:var(--radius-sm); padding:0.6rem; margin:0.75rem 0; font-size:0.75rem; color:#166534;">
            <div style="font-weight:700;">✅ 100% Free Slot Available</div>
            <div>No schedule collisions on this date and time.</div>
            <div style="margin-top:0.35rem;" class="facility-badges">${facilitiesBadges}</div>
          </div>
        </div>

        <div style="border-top:1px solid var(--slate-200); padding-top:0.75rem; display:flex; align-items:center; justify-content:space-between;">
          <span style="font-size:0.75rem; font-weight:700; color:var(--emerald-600);">Available to Reserve</span>
          <button type="button" onclick="bookFreeVenueSlot('${venue.name}', '${targetDate}', '${targetStart}', '${targetEnd}')" class="btn-primary" style="font-size:0.75rem; padding:0.35rem 0.75rem;">
            Book This Venue
          </button>
        </div>
      `;
    }

    grid.appendChild(card);
  });

  if (summaryEl) {
    summaryEl.innerHTML = `
      <div>📅 Selected: <b>${targetDate} (${targetStart} - ${targetEnd})</b></div>
      <div style="color:var(--emerald-600);">🟢 <b>${freeCount}</b> Free</div>
      <div style="color:var(--red-600);">🔴 <b>${occupiedCount}</b> Occupied</div>
      <div style="color:var(--amber-600);">⏳ <b>${pendingCount}</b> Pending Admin Review</div>
    `;
  }
}

function bookFreeVenueSlot(venueName, date, start, end) {
  if (!currentUser) {
    openLoginModal();
    showToast("Please sign in to complete your reservation.");
    return;
  }
  const venueEl = document.getElementById('bookingVenue');
  const dateEl = document.getElementById('bookingDate');
  const startEl = document.getElementById('bookingStartTime');
  const endEl = document.getElementById('bookingEndTime');

  if (venueEl) venueEl.value = venueName;
  if (dateEl) dateEl.value = date;
  if (startEl) startEl.value = start;
  if (endEl) endEl.value = end;

  openBookingModal();
}

// ==========================================
// 7. VENUE CATALOG & APPROVAL DESK
// ==========================================

function renderVenuesCatalog() {
  const grid = document.getElementById('venueCardsGrid');
  if (!grid) return;
  grid.innerHTML = '';

  venuesData.forEach(v => {
    const facilitiesBadges = v.facilities
      .map(f => `<span class="f-badge">${f}</span>`)
      .join(' ');

    const card = document.createElement('div');
    card.className = 'venue-card';
    card.innerHTML = `
      <div class="venue-card-body">
        <div class="venue-title-row">
          <h3>${v.name}</h3>
          <span class="tag-venue-type">${v.type}</span>
        </div>
        <p class="venue-desc">${v.description}</p>
        <div class="facility-badges">
          ${facilitiesBadges}
        </div>
      </div>
      <div class="venue-card-footer">
        <span class="venue-cap">👥 ${v.capacity.toLocaleString()} Capacity</span>
        <button type="button" onclick="quickBookVenue('${v.name}')" class="btn-dark" style="font-size:0.75rem; padding:0.4rem 0.75rem;">
          Select & Book
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderApprovalsList() {
  const container = document.getElementById('approvalsListContainer');
  const countBadge = document.getElementById('pendingCountBadge');
  const pendingEvents = eventsData.filter(e => e.status === 'pending');
  const isAdmin = (currentUser && currentUser.role === 'admin');

  if (countBadge) countBadge.textContent = pendingEvents.length;
  if (!container) return;

  if (pendingEvents.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:2.5rem; background:var(--slate-50); border:1px dashed var(--slate-300); border-radius:var(--radius-lg);">
        <span style="font-size:2rem; display:block; margin-bottom:0.5rem;">🎉</span>
        <div style="font-weight:700; color:var(--slate-700);">All Venue Clearances Up-To-Date</div>
        <p style="font-size:0.75rem; color:var(--slate-400); margin-top:0.25rem;">There are no pending student or staff booking requests awaiting review.</p>
      </div>
    `;
    return;
  }

  // Header notice explaining permissions
  let roleNoticeHtml = '';
  if (!isAdmin) {
    const roleTitle = currentUser ? (currentUser.role === 'staff' ? 'Staff / Faculty View' : 'Student View') : 'Guest View';
    roleNoticeHtml = `
      <div style="background:#eff6ff; border:1px solid #bfdbfe; color:#1e40af; padding:0.75rem 1rem; border-radius:var(--radius-md); font-size:0.75rem; margin-bottom:1rem; display:flex; align-items:center; gap:0.5rem;">
        <span style="font-size:1.1rem;">🔒</span>
        <span><b>${roleTitle} (Read-Only):</b> You can track request clearance status here. In NMAMIT, <b>both Staff and Student reservations must be approved exclusively by the Estate Administrator</b> before confirmation.</span>
      </div>
    `;
  } else {
    roleNoticeHtml = `
      <div style="background:#ecfdf5; border:1px solid #a7f3d0; color:#065f46; padding:0.75rem 1rem; border-radius:var(--radius-md); font-size:0.75rem; margin-bottom:1rem; display:flex; align-items:center; gap:0.5rem;">
        <span style="font-size:1.1rem;">🛡️</span>
        <span><b>Estate Administrator Authority Desk (${currentUser.name}):</b> You are the central authority. Review and approve or decline both student and staff venue requests below.</span>
      </div>
    `;
  }

  container.innerHTML = roleNoticeHtml;

  pendingEvents.forEach(ev => {
    const card = document.createElement('div');
    card.className = 'approval-card';
    
    // Action buttons only available for Admin
    let actionButtonsHtml = '';
    if (isAdmin) {
      actionButtonsHtml = `
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <button type="button" onclick="promptApproveEvent('${ev.id}')" class="btn-primary" style="background:var(--emerald-600); color:white; font-size:0.75rem; padding:0.45rem 0.85rem;" title="Approve with double confirmation">
            ✓ Approve & Reserve
          </button>
          <button type="button" onclick="rejectEvent('${ev.id}')" class="btn-secondary" style="font-size:0.75rem; color:var(--red-600); border-color:#fecaca;">
            ✕ Decline
          </button>
        </div>
      `;
    } else {
      actionButtonsHtml = `
        <div style="background:#fffbeb; border:1px solid #fde68a; color:#b45309; font-size:0.72rem; font-weight:700; padding:0.4rem 0.75rem; border-radius:var(--radius-sm); display:flex; align-items:center; gap:0.35rem;">
          <span>🔒 Awaiting Estate Admin Approval</span>
        </div>
      `;
    }

    const applicantBadge = ev.role === 'staff' 
      ? `<span class="badge-role staff" style="background:#f3e8ff; color:#6b21a8;">👨‍🏫 STAFF RESERVATION</span>`
      : `<span class="badge-role student" style="background:#fef3c7; color:#b45309;">🎓 STUDENT REQUEST</span>`;

    card.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:0.25rem;">
        <div style="display:flex; align-items:center; gap:0.5rem;">
          ${applicantBadge}
          <span style="font-size:0.75rem; font-weight:700; color:var(--slate-500);">${ev.category} Event</span>
          <span style="font-size:0.75rem; color:var(--slate-400);">• Ref: ${ev.id}</span>
        </div>
        <h4 style="font-size:1.05rem; font-weight:800; color:var(--slate-900);">${ev.title}</h4>
        <div style="font-size:0.8rem; color:var(--slate-600); display:flex; flex-wrap:wrap; gap:0.75rem;">
          <span>🏛️ <b>${ev.venue}</b></span>
          <span>📅 ${ev.date} (${ev.startTime} - ${ev.endTime})</span>
          <span>👥 ~${ev.attendees} Attendees</span>
        </div>
        <div style="font-size:0.72rem; color:var(--slate-500); background:var(--slate-50); padding:0.5rem; border-radius:var(--radius-sm); border:1px solid var(--slate-200); margin-top:0.25rem;">
          <b>Applicant:</b> ${ev.organizer} (${ev.organizerEmail}) ${ev.facultyAdvisor ? `| <b>Faculty Sponsor:</b> ${ev.facultyAdvisor}` : ''}
        </div>
      </div>

      ${actionButtonsHtml}
    `;
    container.appendChild(card);
  });
}

// Double Confirmation Modal Workflow for Admin Approval
function promptApproveEvent(id) {
  if (!currentUser || currentUser.role !== 'admin') {
    alert("Permission Denied: Only Estate Administrators (@nmamit.edu.in) can approve bookings!");
    return;
  }

  const ev = eventsData.find(e => e.id === id);
  if (!ev) return;

  pendingApprovalEventId = id;
  const summaryEl = document.getElementById('approvalTargetSummary');
  if (summaryEl) {
    summaryEl.innerHTML = `
      <div><b>Event:</b> ${ev.title}</div>
      <div><b>Venue:</b> <span style="color:var(--navy-primary); font-weight:700;">${ev.venue}</span></div>
      <div><b>Date & Time:</b> ${ev.date} (${ev.startTime} - ${ev.endTime})</div>
      <div><b>Organizer:</b> ${ev.organizer} (${ev.organizerEmail})</div>
      <div><b>Footfall:</b> ${ev.attendees} Attendees</div>
    `;
  }

  const modal = document.getElementById('confirmApprovalModal');
  if (modal) modal.classList.remove('hidden');
}

function closeConfirmModal() {
  pendingApprovalEventId = null;
  const modal = document.getElementById('confirmApprovalModal');
  if (modal) modal.classList.add('hidden');
}

function executeConfirmedApproval() {
  if (!pendingApprovalEventId) return;
  const ev = eventsData.find(e => e.id === pendingApprovalEventId);
  if (ev) {
    ev.status = 'confirmed';
    saveState();
    renderCalendar();
    renderFreeVenuesExplorer();
    renderApprovalsList();
    showToast(`✓ Event "${ev.title}" officially APPROVED by Estate Admin!`);
  }
  closeConfirmModal();
}

function rejectEvent(id) {
  if (!currentUser || currentUser.role !== 'admin') {
    alert("Permission Denied: Only Estate Administrators (@nmamit.edu.in) can decline bookings!");
    return;
  }

  const reason = prompt("Enter reason for declining the venue request:", "Conflicting with university examination schedule or maintenance");
  if (reason !== null) {
    eventsData = eventsData.filter(e => e.id !== id);
    saveState();
    renderCalendar();
    renderFreeVenuesExplorer();
    renderApprovalsList();
    showToast(`Request declined by Admin and removed from calendar.`);
  }
}

// ==========================================
// 8. CANCELLATION & POSTPONEMENT (VENUE FREEING)
// ==========================================

function cancelEvent(id) {
  const ev = eventsData.find(e => e.id === id);
  if (!ev) return;

  const confirmCancel = confirm(`Are you sure you want to cancel "${ev.title}"?\n\nThis will IMMEDIATELY free up ${ev.venue} on ${ev.date} for other users to book.`);
  if (!confirmCancel) return;

  ev.status = 'cancelled';
  saveState();
  renderCalendar();
  renderFreeVenuesExplorer();
  renderApprovalsList();
  closeEventDetailModal();
  showToast(`Event cancelled. ${ev.venue} slot on ${ev.date} is now OPEN and FREE!`);
}

function promptPostponeEvent(id) {
  const ev = eventsData.find(e => e.id === id);
  if (!ev) return;

  pendingPostponeEventId = id;
  const dateInput = document.getElementById('postponeDate');
  const startInput = document.getElementById('postponeStart');
  const endInput = document.getElementById('postponeEnd');

  if (dateInput) dateInput.value = ev.date;
  if (startInput) startInput.value = ev.startTime;
  if (endInput) endInput.value = ev.endTime;

  closeEventDetailModal();
  const modal = document.getElementById('postponeModal');
  if (modal) modal.classList.remove('hidden');
}

function closePostponeModal() {
  pendingPostponeEventId = null;
  const modal = document.getElementById('postponeModal');
  if (modal) modal.classList.add('hidden');
}

function handlePostponeSubmit(e) {
  e.preventDefault();
  if (!pendingPostponeEventId) return;

  const ev = eventsData.find(e => e.id === pendingPostponeEventId);
  if (!ev) return;

  const newDate = document.getElementById('postponeDate').value;
  const newStart = document.getElementById('postponeStart').value;
  const newEnd = document.getElementById('postponeEnd').value;

  if (newStart >= newEnd) {
    alert("Invalid time: End time must be after Start time.");
    return;
  }

  // Check if target slot is busy
  const clash = eventsData.find(other => {
    if (other.id === ev.id || other.venue !== ev.venue || other.date !== newDate || other.status === 'cancelled') return false;
    return (newStart < other.endTime && newEnd > other.startTime);
  });

  if (clash) {
    alert(`Cannot reschedule: ${ev.venue} is already booked on ${newDate} between ${clash.startTime} and ${clash.endTime} for "${clash.title}".`);
    return;
  }

  const oldDate = ev.date;
  ev.date = newDate;
  ev.startTime = newStart;
  ev.endTime = newEnd;

  saveState();
  closePostponeModal();
  renderCalendar();
  renderFreeVenuesExplorer();
  renderApprovalsList();
  showToast(`Event rescheduled to ${newDate}. Old slot on ${oldDate} is now FREE!`);
}

// ==========================================
// 9. REAL-TIME CONFLICT RADAR
// ==========================================

function runLiveConflictCheck() {
  const venueEl = document.getElementById('bookingVenue');
  const dateEl = document.getElementById('bookingDate');
  const startEl = document.getElementById('bookingStartTime');
  const endEl = document.getElementById('bookingEndTime');
  const banner = document.getElementById('conflictAlertBanner');
  const submitBtn = document.getElementById('submitBookingBtn');

  if (!venueEl || !dateEl || !startEl || !endEl || !banner) return;

  const venue = venueEl.value;
  const date = dateEl.value;
  const startTime = startEl.value;
  const endTime = endEl.value;

  if (!venue || !date || !startTime || !endTime) {
    banner.classList.add('hidden');
    return;
  }

  // Validate start vs end
  if (startTime >= endTime) {
    banner.className = 'alert-box alert-danger';
    banner.innerHTML = `<div>⚠️ <b>Invalid Time Range:</b> End time must be strictly after Start time.</div>`;
    banner.classList.remove('hidden');
    if (submitBtn) submitBtn.disabled = true;
    return;
  }

  // Overlap check IGNORING cancelled events (cancelled events free the venue)
  const conflicts = eventsData.filter(ev => {
    if (ev.venue !== venue || ev.date !== date || ev.status === 'cancelled') return false;
    return (startTime < ev.endTime && endTime > ev.startTime);
  });

  if (conflicts.length > 0) {
    const cl = conflicts[0];
    const footfallInput = document.getElementById('expectedFootfall');
    const reqFootfall = parseInt(footfallInput ? footfallInput.value : '100', 10) || 100;

    // Search alternative free venues
    const alternativeVenues = venuesData.filter(v => {
      if (v.name === venue || v.capacity < reqFootfall) return false;
      const altClashes = eventsData.filter(ev => ev.venue === v.name && ev.date === date && ev.status !== 'cancelled' && (startTime < ev.endTime && endTime > ev.startTime));
      return altClashes.length === 0;
    });

    let altHtml = '';
    if (alternativeVenues.length > 0) {
      altHtml = `<div style="margin-top:0.5rem; font-weight:600;">💡 <b>Recommended Alternate Free Venues:</b><div style="display:flex; flex-wrap:wrap; gap:0.35rem; margin-top:0.35rem;">` +
        alternativeVenues.map(alt => `<button type="button" onclick="selectAlternativeVenue('${alt.name}')" style="background:white; border:1px solid #fca5a5; padding:0.2rem 0.5rem; border-radius:4px; font-size:0.7rem; font-weight:700; color:#991b1b; cursor:pointer;">👉 ${alt.name} (${alt.capacity} cap)</button>`).join(' ') +
        `</div></div>`;
    }

    banner.className = 'alert-box alert-danger';
    banner.innerHTML = `
      <div>
        <div style="font-weight:800; display:flex; align-items:center; gap:0.35rem;">
          <span>🚨 Schedule Collision Detected!</span>
        </div>
        <div style="margin-top:0.25rem;">
          <b>${venue}</b> is already booked for <i>"${cl.title}"</i> from <b>${cl.startTime} to ${cl.endTime}</b> by ${cl.organizer}.
        </div>
        ${altHtml}
      </div>
    `;
    banner.classList.remove('hidden');
    if (submitBtn) submitBtn.disabled = true;
  } else {
    banner.className = 'alert-box alert-success';
    banner.innerHTML = `
      <div>
        <div style="font-weight:800; display:flex; align-items:center; gap:0.35rem;">
          <span>✅ Slot Available & Conflict-Free</span>
        </div>
        <div style="margin-top:0.2rem;">
          ${venue} has zero conflicts on ${date} between ${startTime} and ${endTime}.
        </div>
      </div>
    `;
    banner.classList.remove('hidden');
    if (submitBtn) submitBtn.disabled = false;
  }
}

function selectAlternativeVenue(venueName) {
  const venueEl = document.getElementById('bookingVenue');
  if (venueEl) venueEl.value = venueName;
  runLiveConflictCheck();
}

// ==========================================
// 10. BOOKING FORM SUBMISSION
// ==========================================

function openBookingModal() {
  if (!currentUser) {
    openLoginModal();
    return;
  }
  applyRoleUI();
  const modal = document.getElementById('bookingModal');
  if (modal) modal.classList.remove('hidden');
  runLiveConflictCheck();
}

function closeBookingModal() {
  const modal = document.getElementById('bookingModal');
  if (modal) modal.classList.add('hidden');
}

function quickBookDate(dateIso) {
  if (!currentUser) {
    openLoginModal();
    showToast("Please sign in to book a venue.");
    return;
  }
  const dateInput = document.getElementById('bookingDate');
  if (dateInput) dateInput.value = dateIso;
  openBookingModal();
}

function quickBookVenue(venueName, dateIso) {
  if (!currentUser) {
    openLoginModal();
    showToast("Please sign in to book a venue.");
    return;
  }
  const venueInput = document.getElementById('bookingVenue');
  const dateInput = document.getElementById('bookingDate');
  if (venueInput) venueInput.value = venueName;
  if (dateIso && dateInput) dateInput.value = dateIso;
  openBookingModal();
}

function handleBookingSubmit(e) {
  e.preventDefault();

  if (!currentUser) {
    openLoginModal();
    return;
  }

  const emailInput = document.getElementById('applicantEmail');
  const email = (emailInput ? emailInput.value : '').trim().toLowerCase();
  const isStudent = email.endsWith('@nmamit.in');
  const isStaff = email.endsWith('@nmamit.edu.in');

  if (!isStudent && !isStaff) {
    alert("Booking rejected! Institutional email ending in @nmamit.in or @nmamit.edu.in required.");
    return;
  }

  const newId = 'EVT-' + Math.floor(1000 + Math.random() * 9000);
  
  // Rule: Both Student and Staff bookings start in PENDING state awaiting Admin approval!
  // Only Admin direct bookings start in CONFIRMED state.
  const initialStatus = (currentUser.role === 'admin') ? 'confirmed' : 'pending';

  const newEvent = {
    id: newId,
    title: document.getElementById('eventTitle').value.trim(),
    venue: document.getElementById('bookingVenue').value,
    date: document.getElementById('bookingDate').value,
    startTime: document.getElementById('bookingStartTime').value,
    endTime: document.getElementById('bookingEndTime').value,
    category: document.getElementById('eventCategory').value,
    organizer: document.getElementById('applicantName').value.trim(),
    organizerEmail: email,
    role: isStudent ? 'student' : (currentUser.role === 'admin' ? 'admin' : 'staff'),
    status: initialStatus,
    attendees: parseInt(document.getElementById('expectedFootfall').value, 10) || 100,
    facultyAdvisor: isStudent ? document.getElementById('facultyAdvisorEmail').value.trim() : null,
    facilities: [
      document.getElementById('reqAC').checked ? 'Central AC' : null,
      document.getElementById('reqPA').checked ? 'PA Sound System' : null,
      document.getElementById('reqProj').checked ? '4K Projector' : null,
      document.getElementById('reqMics').checked ? 'Podium & Collar Mics' : null
    ].filter(Boolean)
  };

  eventsData.push(newEvent);
  saveState();
  closeBookingModal();
  renderCalendar();
  renderFreeVenuesExplorer();
  renderApprovalsList();

  if (currentUser.role === 'admin') {
    showToast(`Reservation created and confirmed directly by Admin!`);
  } else if (isStudent) {
    showToast(`Student request submitted! Status: PENDING until Estate Admin clearance.`);
  } else {
    showToast(`Staff reservation submitted! Status: PENDING until Estate Admin clearance.`);
  }

  // Open clearance pass preview after brief delay
  setTimeout(() => {
    openEventDetails(newId);
  }, 400);
}

// ==========================================
// 11. CLEARANCE PASS & PRINT MODAL
// ==========================================

function openEventDetails(eventId) {
  const ev = eventsData.find(e => e.id === eventId);
  if (!ev) return;

  const isApproved = ev.status === 'confirmed';
  const isCancelled = ev.status === 'cancelled';

  let statusStamp = '';
  if (isCancelled) {
    statusStamp = `<div class="pass-stamp cancelled">EVENT CANCELLED • SLOT FREE</div>`;
  } else if (isApproved) {
    statusStamp = `<div class="pass-stamp">AUTHORIZED • CLEARED</div>`;
  } else {
    statusStamp = `<div class="pass-stamp pending">PENDING ADMIN CLEARANCE</div>`;
  }

  const passHtml = `
    <div class="pass-slip">
      <div class="pass-header">
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <div class="brand-crest" style="width:34px; height:34px; font-size:1.1rem;">N</div>
          <div>
            <h4 style="font-weight:900; font-size:0.85rem; text-transform:uppercase;">NMAM Institute of Technology</h4>
            <p style="font-size:0.65rem; color:var(--slate-500);">Estate & Venue Clearance Slip • Nitte</p>
          </div>
        </div>
        <div>${statusStamp}</div>
      </div>

      <div class="pass-grid">
        <div>
          <span style="font-size:0.65rem; color:var(--slate-400); font-weight:700; text-transform:uppercase; display:block;">Booking Ref</span>
          <span style="font-family:monospace; font-weight:700; font-size:0.85rem;">${ev.id}</span>
        </div>
        <div>
          <span style="font-size:0.65rem; color:var(--slate-400); font-weight:700; text-transform:uppercase; display:block;">Venue Allocated</span>
          <span style="font-weight:800; color:var(--navy-primary); font-size:0.85rem;">${ev.venue}</span>
        </div>
        <div>
          <span style="font-size:0.65rem; color:var(--slate-400); font-weight:700; text-transform:uppercase; display:block;">Date & Time</span>
          <span style="font-weight:600;">${ev.date} (${ev.startTime} - ${ev.endTime})</span>
        </div>
        <div>
          <span style="font-size:0.65rem; color:var(--slate-400); font-weight:700; text-transform:uppercase; display:block;">Expected Footfall</span>
          <span style="font-weight:600;">${ev.attendees} Attendees</span>
        </div>
        <div style="grid-column: span 2;">
          <span style="font-size:0.65rem; color:var(--slate-400); font-weight:700; text-transform:uppercase; display:block;">Event Title</span>
          <span style="font-weight:800; font-size:0.95rem;">${ev.title}</span>
        </div>
        <div>
          <span style="font-size:0.65rem; color:var(--slate-400); font-weight:700; text-transform:uppercase; display:block;">Lead Organizer</span>
          <span style="font-weight:600;">${ev.organizer}</span>
          <span style="display:block; font-size:0.65rem; color:var(--slate-500);">${ev.organizerEmail}</span>
        </div>
        <div>
          <span style="font-size:0.65rem; color:var(--slate-400); font-weight:700; text-transform:uppercase; display:block;">Approval Route</span>
          <span style="font-weight:600;">${ev.role === 'staff' ? 'Staff Request (Admin Vetted)' : 'Student Club (Admin Vetted)'}</span>
          ${ev.facultyAdvisor ? `<span style="display:block; font-size:0.65rem; color:var(--slate-500);">Advisor: ${ev.facultyAdvisor}</span>` : ''}
        </div>
      </div>

      <div style="background:var(--slate-50); border:1px solid var(--slate-200); border-radius:var(--radius-sm); padding:0.5rem; margin-top:0.75rem; font-size:0.72rem;">
        <b>Equipment & Provisioning:</b>
        <span style="color:var(--slate-600);">${ev.facilities && ev.facilities.length > 0 ? ev.facilities.join(', ') : 'Standard classroom layout'}</span>
      </div>

      <div style="display:flex; align-items:center; justify-content:space-between; margin-top:0.75rem; padding-top:0.5rem; border-top:1px dashed var(--slate-300);">
        <div style="font-size:0.65rem; color:var(--slate-500);">
          Present at Security Checkpoint & Audi Console Desk.<br>
          Generated securely via NMAMIT SSO Portal.
        </div>
        <div style="width:48px; height:48px; background:var(--slate-100); border:1px solid var(--slate-400); display:flex; align-items:center; justify-content:center; font-family:monospace; font-size:0.55rem; font-weight:700; text-align:center;">
          [ QR PASS ]
        </div>
      </div>
    </div>
  `;

  // Render management actions (Cancel or Postpone)
  const actionsContainer = document.getElementById('eventManagementActions');
  if (actionsContainer) {
    const canManage = currentUser && (currentUser.role === 'admin' || currentUser.email === ev.organizerEmail);
    if (canManage && !isCancelled) {
      actionsContainer.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.5rem;">
          <span style="font-size:0.75rem; font-weight:700; color:var(--slate-700);">Change of Plans?</span>
          <div style="display:flex; gap:0.5rem;">
            <button type="button" onclick="promptPostponeEvent('${ev.id}')" class="btn-warning" style="font-size:0.75rem; padding:0.35rem 0.75rem;">
              📅 Postpone / Reschedule
            </button>
            <button type="button" onclick="cancelEvent('${ev.id}')" class="btn-danger" style="font-size:0.75rem; padding:0.35rem 0.75rem;">
              🚫 Cancel Event & Free Slot
            </button>
          </div>
        </div>
      `;
      actionsContainer.classList.remove('hidden');
    } else {
      actionsContainer.innerHTML = '';
      actionsContainer.classList.add('hidden');
    }
  }

  const contentArea = document.getElementById('passContentArea');
  const modal = document.getElementById('eventDetailModal');
  if (contentArea) contentArea.innerHTML = passHtml;
  if (modal) modal.classList.remove('hidden');
}

function closeEventDetailModal() {
  const modal = document.getElementById('eventDetailModal');
  if (modal) modal.classList.add('hidden');
}

// ==========================================
// 12. STATISTICS & TOAST NOTIFICATIONS
// ==========================================

function updateStats() {
  const venuesEl = document.getElementById('statVenues');
  const confirmedEl = document.getElementById('statConfirmed');
  const pendingEl = document.getElementById('statPending');

  if (venuesEl) venuesEl.textContent = `${venuesData.length} Locations`;

  const confirmedCount = eventsData.filter(e => e.status === 'confirmed').length;
  const pendingCount = eventsData.filter(e => e.status === 'pending').length;

  if (confirmedEl) confirmedEl.textContent = `${confirmedCount} Booked`;
  if (pendingEl) pendingEl.textContent = `${pendingCount} Requests`;
}

function showToast(msg) {
  const toast = document.getElementById('toastNotification');
  const msgEl = document.getElementById('toastMessage');
  if (!toast || !msgEl) return;

  msgEl.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}
