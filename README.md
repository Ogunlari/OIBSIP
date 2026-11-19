# OIBSIP Web Development Tasks

A collection of web development projects completed for the OIBSIP internship.
It includes three Level 1 front-end tasks and one Level 3 full-stack MERN app.

## Projects

### Level 1 — Front-end

- **ApexFlow Landing Page** (`level 1 task/WebDev-L1-LandingPage`)
  Responsive product landing page with hero, features, testimonials, CTA,
  and a separate get-started page.

- **Personal Portfolio** (`level 1 task/WebDev-L1-Portfolio`)
  Portfolio for Ogunlari Oladipupo with hero, skills, selected work,
  and contact sections.

- **Temperature Converter** (`level 1 task/WebDev-L1-TemperatureConverter`)
  Converts between Celsius, Fahrenheit, and Kelvin with input validation
  and instant results.

**Tech stack:** HTML5, CSS3, vanilla JavaScript (ES6+).

### Level 3 — Full-stack

- **SliceCraft Pizza Delivery** (`Level 3 task/WebDev-L3-PizzaDelivery`)
  MERN pizza ordering app with registration and login, email verification,
  forgot/reset password, menu browsing, custom pizza builder, cart, checkout,
  order tracking, admin dashboard, inventory alerts, and real-time updates.

**Tech stack:** React 18, React Router, Vite, Node.js, Express, MongoDB
(Mongoose), Socket.IO, JWT, bcryptjs, Zod, Nodemailer, Razorpay, Helmet,
and express-rate-limit.

## Getting Started

### Level 1

There is no build step.

1. Open the task's `index.html` in a browser, or
2. Serve the folder locally:

```bash
cd "level 1 task/WebDev-L1-LandingPage"
npx serve .
```

Repeat for the other Level 1 folders.

### Level 3

Prerequisites: Node.js 18+, npm, and a MongoDB database (local MongoDB or a
free MongoDB Atlas cluster). MongoDB is required — the app has no in-memory
store.

```bash
cd "Level 3 task/WebDev-L3-PizzaDelivery"
npm install
npm run install:all
```

Create `server/.env` and `client/.env` from the matching `.env.example` files:

```powershell
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
```

Configure `server/.env`:

- `MONGODB_URI` — required, for example `mongodb://127.0.0.1:27017/sliceraft`
  or an Atlas `mongodb+srv://...` URI.
- `JWT_SECRET` — a long random string.
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — Razorpay **test mode** keys from
  Dashboard → Settings → API Keys. In development, if these are omitted,
  checkout automatically uses a demo payment and marks the order paid without
  contacting Razorpay. Required in production.
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` — optional in development.
  If omitted, the server creates a real Ethereal test SMTP account and logs
  preview URLs (the registration and reset pages link to the preview). SMTP is
  required in production.
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_ALERT_EMAIL` — credentials for the
  separate admin login and low-stock alert recipient.

On first start the server seeds the pizza catalog and ingredient inventory. It
does not create sample users or orders.

Run the app:

```bash
npm run dev
```

- Client: http://localhost:5173
- API: http://localhost:5000

Other commands:

```bash
npm run build   # build the client
npm start       # run the server in production mode
```

Default admin account from `.env.example`:

- Email: `admin@sliceraft.local`
- Password: `Admin@12345`

Change these credentials and `JWT_SECRET` before deploying.
`.env`, `node_modules`, and `dist` are excluded via `.gitignore`.

Development uses demo payments automatically when Razorpay keys are missing;
no money is charged. Production has no mock fallback and requires Razorpay keys.
The server still refuses to start without `MONGODB_URI` (and, in production,
without SMTP/Razorpay keys).

## Screenshots

Screenshots are optional and are not included yet. Add them under each task
folder (for example, `screenshots/`) and reference them here.
