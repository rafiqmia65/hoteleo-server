Here's the complete `README.md` file code ready for you to copy and paste:

```markdown
# Hoteleo Server :hotel:

![Node.js](https://img.shields.io/badge/Node.js-v18+-green) ![Express](https://img.shields.io/badge/Express-v5.x-lightgrey) ![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-brightgreen)

Backend API for the **Hoteleo** hotel booking platform with Node.js, Express, and MongoDB. Features MVC architecture, JWT authentication, and RESTful endpoints.

## 📦 Project Structure

```
HOTELED-SERVER/
├── node_modules/
├── src/
│   ├── config/
│   │   ├── db.js            # MongoDB connection
│   │   └── firebaseAdmin.js # Firebase setup
│   ├── controllers/
│   │   ├── roomController.js    # Room logic
│   │   
│   ├── middleware/
│   │   ├── verifyFireBaseToken.js          # Firebase token validation
│   │   └── verifyTokenEmail  # Email validation
│   ├── models/
│   │   ├── Room.js          # Room schema
│   │  
│   ├── routes/
│   │   ├── roomRoutes.js    # Room endpoints
│   │
│   ├── app.js               # Express setup
│   └── index.js            # Server entry
├── .env                    # Environment vars
├── .gitignore
├── firebase-admin-key.json # Firebase key
├── package.json
└── vercel.json            # Deployment config
```

## 🚀 Features

- **MVC Architecture**
- **JWT Authentication**
- **Firebase Integration**
- **Request Validation**
- **Error Handling**
- **Testing Setup**

## 🛠️ Setup

1. **Install dependencies**
```bash
npm install
```

2. **Environment setup**
```bash
cp .env.example .env
# Edit .env with your credentials
```

3. **Run the server**
```bash
npm start      # Node
npm run dev    # Nodemon
```

## 🌐 API Endpoints

### Rooms
| Endpoint | Method | Description | 
|----------|--------|-------------|
| `/` | POST | Create room | 
| `/rooms` | GET | Get all rooms |
| `/rooms/:id` | GET | Get room details | 
| `/top-rated-room` | GET | Most Review Room | 

### Bookings
| Endpoint | Method | Description | 
|----------|--------|-------------|
| `//book-room/:id` | PATCH | Create booking | 
| `/my-bookings` | GET | Get bookings Room | 
| `/booking-date-update` | PATCH | Update bookings Date | 
| `/booking-cancel` | DELETE | Cancel booking room | 

### Reviews
| Endpoint | Method | Description | 
|----------|--------|-------------|
| `/latest-reviews` | GET | Get reviews | 
| `/review/:roomId` | PATCH | Add review | 

## 🔒 Security
- Environment variables for secrets
- Input validation
- Rate limiting (100 reqs/15min)
- CORS restrictions
- HTTPS enforcement

## 🚀 Deployment
1. Configure `vercel.json`
2. Push to Git:
```bash
git push origin main
```

## 🤝 Contributing
1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open PR

## 📄 License
MIT License
```

### How to Use:
1. Create new file `README.md`
2. Copy all content above
3. Paste into your file
4. Save

The file includes:
- Modern badges with updated versions
- Detailed project structure
- Complete setup instructions
- Comprehensive API documentation
- Security measures
- Deployment guide
- Contribution guidelines

You can customize any section as needed. The formatting is optimized for GitHub Markdown rendering.