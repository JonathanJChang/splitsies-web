# Changelog

All notable changes to Splitsies will be documented in this file.

## [1.2.1] - 2024-12-30

### Fixed
- **Mobile Edit/Delete Buttons** - Fixed broken mobile interactions where buttons required multiple taps
- **Edit Mode Layout** - Fixed buttons getting pushed off-screen during editing on mobile
- **Single Edit Mode** - Only one item can be edited at a time; starting new edit cancels previous
- **Click-Outside-to-Cancel** - Tapping outside edit areas now cancels active edits
- **Event Propagation** - Fixed conflicts between mobile touch handlers and edit interactions

### Changed
- **Mobile Button Scaling** - Reduced button enlargement from 36px to 32px for smoother transitions
- **Edit Layout Spacing** - Tighter gaps and fixed-width controls for better mobile fit
- **Hover Effects** - Desktop-only hover scaling to prevent mobile touch conflicts

### Technical
- Enhanced event handling with proper `stopPropagation()` for edit containers
- Improved mobile detection and touch interaction patterns
- Better flex layout management for edit mode components

---

## [1.2.0] - 2024-12-30

### Added
- **Weighted Shares System** - Revolutionary feature allowing proportional expense splitting
- **Shares Input Controls** - Mobile-friendly +/- buttons for selecting shares (1-10)
- **Weighted Calculations** - Smart algorithm calculates splits based on shares, not just equal division
- **Shares Display** - Shows share indicators (×2, ×3) next to contributor names when > 1
- **Splits Context** - "Who Pays Whom" section displays shares for full transparency
- **Share Validation** - Ensures shares are whole numbers between 1-10

### Changed
- **Summary Statistics** - Updated to show "Per Share" cost and "Total Shares" instead of per-person
- **Export Headers** - Updated export summaries to reflect weighted share calculations
- **Mobile UX** - Enhanced mobile touch interactions for better usability
- **Input Consistency** - All form inputs now have matching heights and styling
- **Terminology** - Changed "Weight" to "Shares" for clearer user understanding

### Technical
- Completely rebuilt calculation engine for weighted splitting
- Added mobile-optimized number input controls with +/- buttons
- Enhanced data persistence to include share information
- Improved mobile touch detection and interaction patterns

---

## [1.1.1] - 2024-12-30

### Added
- **Mobile Touch UX** - Two-tap system for edit/delete buttons on mobile devices

### Changed
- Removed PDF export functionality (kept JPG export only)
- Export button styling matches "New Session" button for consistency
- Improved mobile UX - first tap shows buttons, second tap performs action

### Removed
- PDF export functionality and jsPDF dependency

---

## [1.1.0] - 2024-12-30

### Added
- **JPG Export** - Create high-quality image exports for sharing with timestamps
- **Export Button** - Gray-styled button positioned beside "New Session"

### Changed
- Mobile-responsive export button layout
- Updated to v1.1.0

---

## [1.0.0] - 2024-12-30

### Added
- **Expense Splitting Calculator** - Fair splits when people contribute different amounts
- **Live Calculations** - Real-time totals, per-person amounts, and debt settlements
- **Itemized Contributions** - Track individual items with descriptions
- **Smart Name Handling** - Combine contributions for duplicate names
- **Item Management** - Add, edit, and delete expense items
- **Person Management** - Edit names and remove people
- **Data Persistence** - Save data across sessions with localStorage
- **Input Validation** - Amount limits, decimal places, description logic
- **Mobile-First Design** - Responsive layout optimized for mobile
- **Professional Branding** - Custom money bag icon and "Splitsies" name
- **PWA Ready** - Install as app on mobile devices

### Features
- Prevents negative amounts and limits to 2 decimal places
- Optional item descriptions (defaults to 'miscellaneous')
- Combines matching items for same person
- Hover-to-reveal edit/delete buttons
- Fixed summary bar at bottom
- Monotone design with clean gray palette

---

## Links

- **Live Demo**: [https://jonathanjchang.github.io/splitsies-web](https://jonathanjchang.github.io/splitsies-web)
- **Repository**: [https://github.com/JonathanJChang/splitsies-web](https://github.com/JonathanJChang/splitsies-web)
