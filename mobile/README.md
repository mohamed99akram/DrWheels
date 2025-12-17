# DrWheels Mobile App

Simplified Flutter mobile application for DrWheels platform.

## Features

- User authentication (login, register)
- Car marketplace browsing
- Car details view
- User profile management

## Setup

1. Install Flutter dependencies:
```bash
flutter pub get
```

2. Update API URL in `lib/services/api_service.dart`:
- For Android emulator: `http://10.0.2.2:4000/api`
- For iOS simulator: `http://localhost:4000/api`
- For physical device: Use your computer's IP address

3. Run the app:
```bash
flutter run
```

## Build

### Android
```bash
flutter build apk
```

### iOS
```bash
flutter build ios
```

## Technology Stack

- Flutter 3.0+
- Provider (state management)
- HTTP (API calls)
- Shared Preferences (local storage)
