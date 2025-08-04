# 🌐 Hoteleo Server

![Node.js](https://img.shields.io/badge/Node.js-v18+-green) 
![Express](https://img.shields.io/badge/Express-v5.x-lightgrey) 
![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-brightgreen)

Backend API for the **Hoteleo** hotel booking platform built with **Node.js**, **Express**, and **MongoDB**.  
Implements **MVC architecture**, **JWT authentication**, and **RESTful endpoints** for a scalable backend.

---

## 📂 Project Structure
```
HOTELEO-SERVER/
├── node_modules/
├── src/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   └── firebaseAdmin.js      # Firebase setup
│   ├── controllers/
│   │   └── roomController.js     # Room logic
│   ├── middleware/
│   │   ├── verifyFireBaseToken.js # Firebase token validation
│   │   └── verifyTokenEmail.js    # Email validation
│   ├── models/
│   │   └── Room.js               # Room schema
│   ├── routes/
│   │   └── roomRoutes.js         # Room endpoints
│   ├── app.js                    # Express app setup
│   └── index.js                  # Server entry point
├── .env                          # Environment variables
├── .gitignore
├── firebase-admin-key.json       # Firebase credentials
├── package.json
└── vercel.json                   # Deployment configuration
```

---

## 🚀 Features
- 🛠 **MVC Architecture**
- 🔑 **JWT Authentication**
- 🔥 **Firebase Integration**
- 🧾 **Request Validation**
- ⚠ **Error Handling**
- 🧪 **Testing Ready Setup**

---

## ⚡ Setup & Installation

1️⃣ **Install dependencies**
```bash
npm install
```

2️⃣ **Configure environment variables**
```bash
cp .env.example .env
# Update values in .env with your credentials
```

3️⃣ **Run the server**
```bash
npm start      # Production
npm run dev    # Development (Nodemon)
```

---

## 📡 API Endpoints

### 🏨 Rooms
| Endpoint            | Method | Description            |
|---------------------|--------|------------------------|
| `/`                 | POST   | Create a room          |
| `/rooms`            | GET    | Get all rooms          |
| `/rooms/:id`        | GET    | Get room details       |
| `/top-rated-room`   | GET    | Get most reviewed room |

### 📅 Bookings
| Endpoint                | Method | Description               |
|-------------------------|--------|---------------------------|
| `/book-room/:id`        | PATCH  | Book a room               |
| `/my-bookings`          | GET    | Get user bookings         |
| `/booking-date-update`  | PATCH  | Update booking date       |
| `/booking-cancel`       | DELETE | Cancel a booking          |

### ⭐ Reviews
| Endpoint             | Method | Description          |
|----------------------|--------|----------------------|
| `/latest-reviews`    | GET    | Get latest reviews   |
| `/review/:roomId`    | PATCH  | Add review to a room |

---

## 🔒 Security Measures
- 🔑 Environment variables for sensitive data
- ✅ Input validation for all endpoints
- ⏳ Rate limiting (**100 reqs/15min**)
- 🌐 CORS restrictions
- 🔐 HTTPS enforcement (in production)

---

## 🚢 Deployment (Vercel)
1. Configure `vercel.json`
2. Push to GitHub:
```bash
git push origin main
```
3. Deploy from Vercel dashboard

---

## 🤝 Contributing
1. Fork this repository
2. Create your feature branch  
   ```bash
   git checkout -b feature/YourFeature
   ```
3. Commit changes  
   ```bash
   git commit -m "Add YourFeature"
   ```
4. Push to branch  
   ```bash
   git push origin feature/YourFeature
   ```
5. Open a Pull Request

---

## 📜 License
This project is licensed under the **MIT License**.

---

### 📝 How to Use:
- Create a new file named `README.md`
- Paste this content
- Save the file — optimized for GitHub rendering
