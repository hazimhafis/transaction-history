# Changelog

### Added
- Implemented a global `AuthProvider` context (`hooks/AuthContext.tsx`) to manage authentication state and session timeout across the app.
- Added automatic session timeout (1 minute) with auto-logout and redirect to login when expired.
- Protected `TransactionHistoryScreen` and `TransactionDetailScreen` using the `useAuth` hook to ensure only authenticated users can access them.
- Updated `App.tsx` to wrap protected screens with `AuthProvider` and handle logout globally.

### Changed
- Moved session timeout logic from individual screens to a centralized context for better maintainability and consistency.
- Reduced authentication timeout from 5 minutes to 1 minute (`AUTH_TIMEOUT` in `authService.ts`).

### Fixed
- Ensured users are redirected to the login screen when their session expires, regardless of which protected screen they are on. 