# Android Play Store Deployment Guide for Edu AI

This guide will walk you through the process of building your **Edu AI** app for production and uploading it to the Google Play Store.

## 1. Prerequisites
- **Android Studio**: Ensure you have Android Studio installed.
- **Google Play Developer Account**: You need a developer account ($25 one-time fee) to publish apps.

## 2. Open Project in Android Studio
Run the following command in your project root:
```bash
npx cap open android
```
This will launch Android Studio with your project loaded.

## 3. Generate a Signed Upload Key
You need a digital signature to publish your app.

1. In Android Studio, go to **Build > Generate Signed Bundle / APK**.
2. Select **Android App Bundle** (AAB) and click **Next**.
3. Under **Key store path**, click **Create new...**.
4. Fill in the details:
   - **Key store path**: Choose a location (e.g., `C:\Users\rohit\upload-keystore.jks`). **Keep this file safe!**
   - **Password**: Create a strong password.
   - **Alias**: `upload` (or any name you prefer).
   - **Key Password**: Same as store password.
   - **Certificate**: Fill in your name/org details.
5. Click **OK**.
6. Back in the "Generate Signed Bundle" window, select your newly created keystore.
7. Click **Next**.
8. Select **release** as the build variant.
9. Click **Finish**.

Android Studio will build your app. Once done, it will show a notification. Click **Locate** to find the `.aab` file (usually in `android/app/release/app-release.aab`).

## 4. Prepare for Release in Google Play Console
1. Go to [Google Play Console](https://play.google.com/console).
2. Click **Create App**.
3. Fill in the App Name (**Edu AI**), default language, and type (App).
4. Select **Free** (or Paid).
5. Accept the declarations and click **Create App**.

## 5. Set Up Store Listing
Navigate to **Grow > Store presence > Main store listing**:
- **App Name**: Edu AI
- **Short Description**: Your AI-powered career assistant.
- **Full Description**: describe your app's features (Realtime updates, Career mentoring, Daily news, etc.).
- **Graphics**: Upload your app icon (512x512), feature graphic (1024x500), and phone screenshots.

## 6. Upload Your App Bundle
1. Go to **Release > Production**.
2. Click **Create new release**.
3. Under **App bundles**, drag and drop the `.aab` file you generated in Step 3.
4. Name your release (e.g., "1.0.0 Initial Release").
5. Add release notes.
6. Click **Next** and **Save**.

## 7. Review and Rollout
1. Go to **Release > Production**.
2. Click **Review release**.
3. Fix any errors/warnings reported by Google.
4. Click **Start rollout to Production**.

Your app will now be in review! This usually takes a few days.

## 8. Updating Your App
To update your app in the future:
1. Update your code.
2. Run `npm run build`.
3. Run `npx cap sync android`.
4. Increment the `versionCode` and `versionName` in `android/app/build.gradle`.
5. Repeat steps 3 (Generate Signed Bundle) and 6 (Upload to Console).

Good luck with your launch!
