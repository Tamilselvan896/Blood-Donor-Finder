# Blood Donor Finder — Backend

Express + MongoDB API built to match the frontend in `App.jsx`
(`API_BASE_URL = "http://localhost:5000/api"`).

## Setup

```bash
cd backend
npm install
cp .env.example .env    # then fill in MONGO_URI and JWT_SECRET
npm run dev              # nodemon, or `npm start` for plain node
```

You need a running MongoDB instance — either local (`mongodb://127.0.0.1:27017/...`)
or a MongoDB Atlas connection string in `MONGO_URI`.

## Folder structure

```
backend/
├── config/
│   └── db.js              # mongoose connection
├── controllers/
│   ├── authController.js  # register / login
│   ├── donorController.js # list + create donors
│   └── profileController.js
├── middleware/
│   └── auth.js            # protect (required) / optionalAuth
├── models/
│   ├── User.js             # login credentials + profile
│   └── Donor.js            # public donor listings
├── routes/
│   ├── authRoutes.js
│   ├── donorRoutes.js
│   └── profileRoutes.js
├── server.js
├── package.json
└── .env.example
```

## API Endpoints

| Method | Route                | Auth      | Description                                   |
|--------|-----------------------|-----------|------------------------------------------------|
| POST   | `/api/auth/register`  | Public    | Create account. Donors also get a Donor listing. |
| POST   | `/api/auth/login`     | Public    | Returns `{ token, user }`.                     |
| GET    | `/api/donors`         | Public    | List donors. Query: `bloodGroup`, `city`, `state`. |
| POST   | `/api/donors`         | Optional  | Register as a donor (Become Donor form).       |
| GET    | `/api/profile`        | Required  | Current logged-in user's profile.              |

All protected routes expect `Authorization: Bearer <token>`, which is exactly
what the `api` axios instance in `App.jsx` already sends via its interceptor.

## Notes / things you may want to extend

- **Blood requests / activity feed**: `Dashboard` reads `bloodRequests` and
  `recentActivities` from the `/donors` response. Both are stubbed as empty —
  add a `BloodRequest` model + controller if you want real data there.
- **Forgot password**: the frontend's `ForgotPassword` page doesn't call an
  API yet (it just shows a fake success state) — wire it up to a
  `/api/auth/forgot-password` route with an email service (e.g. Nodemailer)
  when you're ready.
- **CORS**: currently wide open (`cors()`), lock down `origin` before
  deploying to production.
- **Validation**: kept intentionally simple (required-field checks). Swap in
  `express-validator` or `zod` if you want stricter schema validation.
