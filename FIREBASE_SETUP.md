# Firebase Authentication Setup Guide

To enable the Email and Google Sign-In features, you need to configure a Firebase project and add your API keys.

## 1. Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **"Add project"** and give it a name (e.g., "enhance-ai").
3. Disable Google Analytics for this project (simplifies setup).
4. Click **"Create project"**.

## 2. Enable Authentication
1. On the Project Overview page, click **"Authentication"** (or "Build" > "Authentication").
2. Click **"Get started"**.
3. **Email/Password**:
   - Click "Email/Password".
   - Toggle "Enable".
   - Click "Save".
4. **Google Sign-In**:
   - Click "Add new provider".
   - Select "Google".
   - Toggle "Enable".
   - Set the support email to your email.
   - Click "Save".

## 3. Get API Config
1. Click the **Project Settings** (gear icon next to "Project Overview").
2. Scroll down to the "Your apps" section.
3. Click the **Web** icon (`</>`).
4. Enter an App nickname (e.g., "Enhance Web").
5. Click **"Register app"**.
6. You will see a `firebaseConfig` object like:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."
   };
   ```

## 4. Add to Environment Variables
Open your `.env` file (create one in the root folder if it doesn't exist) and paste the values following this format key-by-key:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> **Note**: Do not include quotes `""` or checks `;` in the `.env` file values.

## 5. Restart Application
Restart your development server to load the new environment variables:
```bash
npm run dev
```

Your authentication system should now be fully functional!
