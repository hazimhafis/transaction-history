# Changelog

## [Latest Changes]

### Added
- **Search and Filter Component**: Created `TransactionSearchFilter.tsx` component with search functionality and category filtering
  - Real-time search across transaction description, merchant, category, and reference fields
  - Category dropdown filter with visual icons for all transaction types
  - Active filters display with visual badges
  - Clear filters button for easy reset
- **Per-Transaction Authentication**: Enhanced `AuthContext` to remember authentication state per individual transaction
  - Users authenticate once per transaction and don't need to re-authenticate when viewing details
  - Authentication state preserved across navigation between history and detail screens
  - Secure session management with automatic cleanup on logout
- **Performance Optimizations**: 
  - Added 300ms debouncing to search input to reduce excessive filtering operations
  - Implemented `useMemo` for search query calculations to prevent unnecessary re-computations
  - Smart pagination that preserves loaded data during search operations

### Changed
- **Authentication Flow**: Updated `TransactionItem` and `TransactionDetailScreen` to use shared per-transaction authentication
- **Search Input**: Replaced Tamagui Input with React Native TextInput for better TypeScript compatibility
- **Pagination Logic**: Modified load more functionality to disable during active search/filter operations
- **Dependencies**: Pinned all Tamagui packages to exact version `1.126.13` to prevent version mismatches

### Fixed
- **Pagination State**: Fixed search functionality to preserve all loaded transaction data when clearing filters
- **Empty States**: Added contextual empty states for search results vs no transactions

### Technical Improvements
- Enhanced component separation with dedicated search/filter logic
- Improved error handling and user feedback
- Optimized rendering performance with memoization

---

## [Previous Changes]

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