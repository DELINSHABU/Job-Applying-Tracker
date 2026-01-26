# Job Application Tracker

A web-based application to track job applications with cloud storage and cross-device access.

## Features

✨ **User Authentication**
- Sign up and login with email/password OR Google
- Secure Firebase authentication
- Personal accounts with private data

☁️ **Cloud Storage**
- Data stored in Firebase Firestore
- Access your applications from any device
- Automatic cloud sync
- No data loss - everything is backed up

📋 **Job Tracking**
- Track company names, positions, and contact information
- Monitor application status (Pending, Callback, Replied, Rejected)
- Record important dates and details
- Add notes for each application
- Filter and search functionality

📊 **Dashboard**
- Real-time statistics
- Visual status indicators
- Clean, modern interface

💾 **Data Management**
- Export to XML format for backup
- Import XML to restore or transfer data
- Duplicate detection on import

## Quick Start

### 1. Set Up Firebase

Follow the detailed guide in [FIREBASE_SETUP.md](FIREBASE_SETUP.md) to:
1. Create a Firebase project
2. Enable Authentication and Firestore
3. Configure your app with Firebase credentials

### 2. Run the Application

Serve the app over HTTP:

```bash
# Using Python 3
python3 -m http.server 8000
```

Then open: `http://localhost:8000`

### 3. Create an Account

1. Click "🔐 Login / Sign Up"
2. Choose your sign-in method:
   - **Email/Password**: Switch to "Sign Up" tab and create account
   - **Google Sign-In**: Click "Continue with Google"
3. Start tracking your job applications!

## How It Works

**User Authentication**
- Each user creates their own account with email/password
- All data is private and secure per user
- Firebase handles authentication securely

**Cloud Storage**
- Job applications are stored in Firebase Firestore
- Data structure: `users/{userId}/jobs/{jobId}`
- Real-time sync across all devices
- Secure access with Firestore rules

**Cross-Device Access**
- Login from any device with your credentials
- All your data loads automatically
- Changes sync instantly to the cloud

## Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Authentication**: Firebase Authentication (Email/Password)
- **Database**: Firebase Firestore (NoSQL)
- **Hosting**: Self-hosted or Firebase Hosting

## File Structure

```
├── index.html           # Main HTML file
├── script.js            # Application logic
├── styles.css           # Styling
├── firebase-config.js   # Firebase configuration (you need to configure this)
├── FIREBASE_SETUP.md    # Complete Firebase setup guide
└── README.md            # This file
```

## Security

- ✅ Email/password authentication
- ✅ Firestore security rules ensure data privacy
- ✅ Each user can only access their own data
- ✅ Secure Firebase SDK implementation
- ✅ No API keys exposed in client code (except Firebase public config)

## Firestore Data Structure

```
users (collection)
  └── {userId}
      └── jobs (collection)
          └── {jobId}
              ├── companyName
              ├── position
              ├── status
              ├── platform
              ├── dates
              └── ... (other fields)
```

## Free Tier Usage

Firebase offers a generous free tier that's more than enough for personal use:
- **Authentication**: 50,000 monthly active users
- **Firestore**: 50,000 reads/day, 20,000 writes/day, 1 GB storage

You'll likely never exceed the free limits for personal job tracking.

## Troubleshooting

See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for detailed troubleshooting steps.

Common issues:
- **"Firebase is not configured"**: Update `firebase-config.js` with your credentials
- **Can't sign in**: Check Firebase Console → Authentication is enabled
- **Google Sign-In fails**: See [GOOGLE_SIGNIN_TROUBLESHOOTING.md](GOOGLE_SIGNIN_TROUBLESHOOTING.md)
- **Data not loading**: Verify Firestore rules are set up correctly

## Contributing

Feel free to fork and improve this project!

## License

MIT License - free to use for personal or commercial projects.
