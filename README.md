# BVM Smart Counter & Queue Management CRM

A comprehensive queue management system for BIRLA VISHVAKARMA MAHAVIDHYALAYA (BVM) to digitize manual queuing for student administrative tasks.

## 🚀 Features

### Student Interface
- **Dashboard** - Overview of upcoming bookings and quick actions
- **Counter Services** - Browse available counters by department
- **Slot Booking** - Multi-step booking wizard with real-time availability
- **My Bookings** - View current and historical bookings with QR codes
- **Emergency Queue** - Request urgent appointments with proof documents
- **Notifications** - Receive alerts for bookings and updates
- **Information Center** - Required documents guide

### Faculty Interface
- **Dashboard** - Stats overview and pending actions
- **View Bookings** - Filter by Today/Upcoming/Past
- **QR Scanner** - Verify student appointments
- **Emergency Management** - Approve/Reject urgent requests
- **Mark Attendance** - Complete or mark missed bookings

## 🛠 Tech Stack

- **Frontend:** React.js 18 + Vite
- **Backend:** Node.js + Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT-based sessions
- **QR Codes:** qrcode (backend) + qrcode.react (frontend)

## 📦 Complete Setup Guide (From Scratch)

### Prerequisites
Before starting, ensure you have the following installed:
- **Node.js 18+** - [Download from nodejs.org](https://nodejs.org/)
- **MongoDB** - [Download from mongodb.com](https://www.mongodb.com/try/download/community) OR use [MongoDB Atlas](https://www.mongodb.com/atlas) (cloud)

---

### Step 1: Install MongoDB (if not already installed)

**Option A: Local MongoDB**
1. Download MongoDB Community Server from the official website
2. Install with default settings
3. MongoDB will run automatically as a service on `localhost:27017`

**Option B: MongoDB Atlas (Cloud)**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster (free tier available)
3. Get your connection string and update `server/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bvm_queue_management
   ```

---

### Step 2: Install Backend Dependencies

Open a terminal and navigate to the project folder:

```bash
cd d:\Project\server
npm install
```

This will install: express, mongoose, bcryptjs, jsonwebtoken, cors, dotenv, multer, qrcode, dayjs

---

### Step 3: Seed the Database

Run the seed script to create default users and counters:

```bash
cd d:\Project\server
npm run seed
```

You should see:
```
Connected to MongoDB
Created student: 25ec443@bvmengineering.ac.in
Created faculty: 25ec407@bvmengineering.ac.in
Created faculty: 25ec457@bvmengineering.ac.in
Created faculty: 25ec460@bvmengineering.ac.in
Created counter: Admissions Counter
...
✅ Database seeded successfully!
```

---

### Step 4: Start the Backend Server

```bash
cd d:\Project\server
npm run dev
```

You should see:
```
Server running in development mode on port 5000
MongoDB Connected: localhost
```

**Keep this terminal running!**

---

### Step 5: Install Frontend Dependencies

Open a **NEW terminal** and run:

```bash
cd d:\Project\client
npm install
```

This will install: react, react-router-dom, axios, dayjs, qrcode.react, html5-qrcode, lucide-react

---

### Step 6: Start the Frontend Server

```bash
cd d:\Project\client
npm run dev
```

You should see:
```
VITE v5.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

### Step 7: Access the Application

Open your browser and go to: **http://localhost:5173**

You'll see the login page. Use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Student | 25ec443@bvmengineering.ac.in | password123 |
| Faculty | 25ec407@bvmengineering.ac.in | password123 |

---

### Quick Start Summary (TL;DR)

```bash
# Terminal 1 - Backend
cd d:\Project\server
npm install
npm run seed
npm run dev

# Terminal 2 - Frontend (new terminal)
cd d:\Project\client
npm install
npm run dev

# Open browser: http://localhost:5173
```

## 🔐 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Student | 25ec443@bvmengineering.ac.in | password123 |
| Faculty | 25ec407@bvmengineering.ac.in | password123 |
| Faculty | 25ec457@bvmengineering.ac.in | password123 |
| Faculty | 25ec460@bvmengineering.ac.in | password123 |
| Parent | Mobile: 9876543211 | OTP (see console) |

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/parent-login` - Request OTP
- `POST /api/auth/verify-otp` - Verify OTP
- `GET /api/auth/me` - Get current user

### Bookings
- `GET /api/slots?counterId=X&date=YYYY-MM-DD` - Get available slots
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user's bookings
- `DELETE /api/bookings/:id` - Cancel booking

### Faculty
- `GET /api/faculty/today-bookings` - Today's bookings
- `GET /api/faculty/upcoming-bookings` - Future bookings
- `POST /api/faculty/mark-completed/:id` - Mark complete
- `POST /api/faculty/mark-missed/:id` - Mark missed
- `POST /api/faculty/scan-qr` - Verify QR code

### Emergency Queue
- `POST /api/emergency-queue` - Submit request
- `GET /api/emergency-queue/pending` - Get pending (faculty)
- `POST /api/emergency-queue/:id/approve` - Approve
- `POST /api/emergency-queue/:id/reject` - Reject

## 📁 Project Structure

```
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React Context
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── styles/         # Global CSS
│   └── package.json
│
├── server/                 # Express Backend
│   ├── config/             # Database config
│   ├── controllers/        # Route handlers
│   ├── middleware/         # Auth middleware
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── seeds/              # Database seeding
│   ├── utils/              # Helper functions
│   └── package.json
│
└── README.md
```

## ⚙️ Configuration

### Environment Variables (server/.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bvm_queue_management
JWT_SECRET=your_secret_key
JWT_EXPIRE=24h
NODE_ENV=development
```

## 🔒 Key Technical Features

1. **Race Condition Prevention** - Atomic updates for slot bookings
2. **Timezone Handling** - UTC storage with IST conversion
3. **Fake Enquiry Protection** - 5-strike warning system
4. **Auto-rejection** - Emergency requests rejected at 5 PM
5. **QR Code Verification** - Secure booking verification

## 📄 License

This project is created for BVM Engineering College.
