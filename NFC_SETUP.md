# NFC Scanning Setup Guide

## Overview

The app now supports full NFC tag scanning for product verification using `react-native-nfc-manager`. This feature allows users to tap their device against NFC-enabled products to verify authenticity.

## Requirements

### Device Requirements
- **iOS**: iPhone 7 or newer with NFC capability
- **Android**: Device with NFC hardware (most modern Android phones)
- **Web**: NFC is NOT available on web browsers

### Build Requirements
- Must use **native builds** (Expo Go, EAS Build, or custom dev client)
- NFC does NOT work in web browsers or web-based previews

### Configuration
Add NFC permissions to your `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-nfc-manager",
        {
          "nfcPermission": "App uses NFC to verify product authenticity"
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "NFCReaderUsageDescription": "This app requires NFC to verify product authenticity"
      }
    },
    "android": {
      "permissions": [
        "android.permission.NFC"
      ]
    }
  }
}
```

## How It Works

### 1. NFC Tag Reading
The app can read two types of NFC data:

**Option A: NDEF Text Records (Recommended)**
- Store verification IDs as text in NDEF format
- Example: `VRF-ABC123-XYZ789`
- Most flexible and readable
- Uses `Ndef.text.decodePayload()` for parsing

**Option B: Tag ID (Hardware ID)**
- Uses the NFC tag's unique hardware identifier
- String format returned by react-native-nfc-manager
- Always available on all NFC tags

### 2. Verification Process
1. User taps "NFC Scan" button
2. App checks if NFC is supported and enabled
3. User holds device near NFC tag
4. App reads tag data (NDEF message or UID)
5. Verification ID is sent to Supabase database
6. Results displayed (verified or counterfeit)

## Implementation Details

### Database Integration
NFC scans are logged to the `verification_logs` table with:
- `scan_method`: "NFC"
- `verification_id`: The scanned tag data
- `is_authentic`: Verification result
- Timestamp and user information

### Supported Tag Formats
- **NDEF Text Records**: Full text strings for verification IDs
- **Tag UID/Serial**: Hexadecimal hardware identifier
- **Multiple Scan Protection**: Prevents reuse of counterfeit tags

## Testing

### On Physical Devices
1. Enable NFC in device settings:
   - **iOS**: Settings → (NFC is always on)
   - **Android**: Settings → Connected Devices → Connection Preferences → NFC

2. Run the app on your device using:
   ```bash
   npx expo start
   # Then scan QR code with Expo Go or development build
   ```

3. Test with any NFC tag:
   - Contactless payment cards (careful, may trigger payment apps)
   - NFC stickers/tags (best for testing)
   - NFC-enabled keycards

### Test NFC Tags
For testing, you can purchase:
- NTAG213/215/216 tags (most common)
- NFC stickers
- NFC cards

Write verification IDs to tags using apps like:
- **iOS**: NFC Tools
- **Android**: NFC Tools, TagWriter

## Platform Limitations

### Web Platform
- NFC is completely unavailable on web browsers
- App shows helpful error message
- Users directed to use QR codes or manual entry instead

### iOS
- Background NFC reading requires special entitlements
- App must be in foreground to scan
- Some older iPhone models may have limited NFC capabilities

### Android
- More flexible NFC permissions
- Can scan in foreground and background (with proper permissions)
- Most modern Android devices support NFC

## Error Handling

The app handles these scenarios gracefully:
- NFC not supported on device
- NFC disabled in settings
- Failed to read tag data
- Invalid verification IDs
- Network errors during verification

## Future Enhancements

Potential improvements:
- Write NFC tags directly from admin panel
- Encrypted tag data for extra security
- Batch scanning for multiple products
- Offline verification cache
