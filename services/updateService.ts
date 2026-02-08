
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

// Define the structure for update information
interface AppUpdateInfo {
    latestVersion: string;
    updateUrl: string;
    forceUpdate: boolean;
    releaseNotes?: string;
}

// Function to check for updates
export const checkForUpdates = async (currentVersion: string): Promise<AppUpdateInfo | null> => {
    try {
        // We will store version info in a collection called 'app_config' 
        // in a document called 'android_version'
        const versionDocRef = doc(db, 'app_config', 'android_version');
        const versionDoc = await getDoc(versionDocRef);

        if (versionDoc.exists()) {
            const data = versionDoc.data() as AppUpdateInfo;

            // Simple version comparison (assuming semantic versioning like "1.0.0")
            if (data.latestVersion !== currentVersion) {
                // Return update info if versions don't match
                // In a real app, you'd want a more robust semantic version comparison (e.g. semver)
                // but strict inequality works if you always increment.
                return data;
            }
        }
        return null;
    } catch (error) {
        console.error("Error checking for updates:", error);
        return null;
    }
};
