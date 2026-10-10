# 🏛️ NMAMIT Smart Event & Venue Clearance Hub

A centralized, responsive web platform designed for **NMAM Institute of Technology (Nitte)** to streamline campus auditorium and seminar hall reservations, eliminate scheduling conflicts, automate institutional credential authorization, and manage estate clearance workflows.

---

## 🌟 Key Features

1. **🔐 Authorized Institutional Login**
   - Pattern-matching authorization for student credentials (`*@nmamit.in` with USN prefix).
   - Domain verification for academic faculty and staff (`*@nmamit.edu.in`).
   - Estate administrator clearance role (`admin@nmamit.edu.in`).
   - Rejection of external/unauthorized email domains.

2. **📋 Role-Based Booking & Clearance Workflow**
   - **Students & Staff**: Can submit reservation requests for campus venues. Requests start in `Pending` status. Neither students nor staff can self-approve.
   - **Estate Admin Exclusive Approval**: Only the authorized Estate Administrator can approve or decline reservations.

3. **🛡️ Admin Double-Confirmation Modal**
   - Prevents accidental approval clicks by prompting an explicit confirmation popup before finalizing any venue booking.

4. **🟢 Real-Time Free Venues Explorer**
   - Search any date and time window to immediately see which campus halls are **🟢 Free & Available** vs. **🔴 Occupied**.
   - 1-click booking pre-fills selected venue and time slot.

5. **⚡ Instant Venue Slot Reopening**
   - When an event is cancelled or postponed, its time slot is immediately released and marked free for other departments or student clubs to reserve.

6. **🖨️ Official Estate Clearance Pass**
   - Generates a print-ready, formatted institutional clearance pass with unique Reservation Reference, authorized digital stamp, and security checklist for campus security.

---

## 🏢 Supported Campus Venues

- **Sambhram Auditorium** (Capacity: 1,200 | AC, 4K Projector, PA System)
- **Sadananda Open Air Theatre** (Capacity: 3,500 | Open Air Stage, High-Power Lighting)
- **Shambhavi Seminar Hall** (Capacity: 250 | AC, Video Conferencing)
- **Central Computing Facility (CCF)** (Capacity: 300 | 1 Gbps LAN, Workstations, AC)
- **B.C. Alva Indoor Stadium** (Capacity: 800 | Synthetic Badminton Courts, Basketball Arena)
- **College Main Ground** (Capacity: 4,000 | Cricket Pitch, Athletics Track)

---

## 🚀 Getting Started

### Prerequisites
No Node.js or complex package installations required! This project is built using pure **HTML5**, **CSS3**, and **Vanilla JavaScript**.

### Running Locally
1. Clone or download this repository:
   ```bash
   git clone https://github.com/<your-username>/nmamit-venue-hub.git
   cd nmamit-venue-hub