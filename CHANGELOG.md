# Changelog

All notable changes to Splitsies will be documented in this file.

## [1.5.0] - 2025-01-02

### Added
- **Mobile Swipe Navigation** - Added touch gesture support for transaction details modal, allowing users to swipe left/right to navigate between contributors on mobile devices
- **Interactive Navigation Controls** - Added clickable previous/next contributor names in modal header for easy navigation on both web and mobile
- **Enhanced Accessibility** - Added proper ARIA labels, keyboard navigation, and screen reader support for contributor interaction elements

### Changed
- **Improved Edit Mode UX** - Added "Done" and "Cancel" buttons in edit mode with full revert functionality to prevent accidental data loss
- **Enhanced Contributor Clickability** - Added visual indicator (») and improved hover effects to make it clear that contributor names are clickable for transaction details
- **Fixed Modal Header** - Transaction details modal header now stays fixed at top while content scrolls, improving navigation and readability
- **Removed Visual Distractions** - Eliminated enlarging hover effects from contributor delete buttons for cleaner interface
- **Background Scroll Lock** - Prevents background scrolling when transaction details modal is open for better mobile experience
- **Streamlined Animations** - Removed excessive global animations that caused unwanted movement throughout the app
- **Enhanced Transaction Modal Layout** - Reordered sections with Balance Summary appearing above Share Details for better information hierarchy
- **Improved Balance Summary** - Added detailed breakdown showing Total contributed, Total paying (+), Total receiving (-), and emphasized Total cost in bold
- **Consistent Visual Emphasis** - Made "Total cost" bold in both Balance Summary and Share Details sections for clear visual hierarchy

### Fixed
- **Swipe Navigation Logic** - Corrected swipe direction behavior to match carousel expectations (swipe left reveals next contributor)
- **Navigation Layout** - Fixed uneven spacing in mobile navigation controls using CSS Grid for perfect alignment
- **Modal Content Organization** - Reordered transaction details sections for better information hierarchy and clarity

---

## [1.4.0] - 2025-01-02

### Added
- **Contributor Transaction Details Modal** - Click any contributor box to view comprehensive transaction breakdown including contributions, payments to/from others, and balance verification
- **Dark Mode Toggle** - Added dark mode option to three-dot menu with localStorage persistence across sessions
- **JSON Data Editor** - Advanced JSON editor in three-dot menu for bulk editing and importing contributor data with comprehensive validation and copy-to-clipboard functionality
- **Export Feedback System** - Clear notifications when attempting to export with no contributors or unsaved changes

### Changed
- **Static Contributors Display** - Removed hover and click expansion effects from contributor sections for cleaner, non-distracting interface
- **Auto-Reset Shares Counter** - Shares input automatically resets to 1 after adding a contributor for better workflow
- **Enhanced Light Mode Contrast** - Improved text readability with subtle contrast adjustments
- **Dark Mode Export Support** - JPG exports now properly reflect the current theme (light/dark)
- **Streamlined Transaction Modal** - Simplified contributor transaction details by removing redundant balance verification section and status messages for cleaner presentation

### Fixed
- **Dark Mode Background Coverage** - Fixed white space at bottom of page in dark mode
- **Export Validation Logic** - Corrected balance verification calculations in transaction details modal

---

## [1.3.2] - 2024-12-31

### Added
- **Export Save Notification** - Smart notification prompts users to save edits before exporting
- **Professional Notification System** - Slide-down notification with auto-dismiss and manual close

### Changed
- **Enhanced Export UX** - Export blocked when in edit mode to prevent data loss
- **Better User Guidance** - Clear instructions to save changes before exporting JPG

### Fixed
- **Data Protection** - Prevents accidental loss of unsaved edits during export
- **Export Workflow** - Ensures only clean, saved data is exported to JPG files

---

## [1.3.1] - 2024-12-31

### Added
- **Three-Dot Menu** - Moved Export and New Session actions to a professional dropdown menu in header
- **Click Outside to Close** - Menu closes when clicking elsewhere for better UX

### Changed
- **Cleaner Interface** - Removed prominent Export and New Session buttons from bottom
- **Intentional Actions** - Export and New Session now require deliberate menu access
- **Header Layout** - Added professional three-dot menu button in top-right corner

### Fixed
- **Accidental Clicks** - Eliminated risk of accidentally triggering Export or New Session
- **Visual Clutter** - Cleaner bottom section with just version tag

---

## [1.3.0] - 2024-12-31

### Added
- **Autocomplete Dropdown** - Smart name input with dropdown showing existing contributors as you type
- **Keyboard Navigation** - Arrow keys, Enter, and Escape support for dropdown selection
- **Click Outside to Close** - Intuitive dropdown behavior with proper event handling

### Changed
- **Enhanced Input UX** - Name field now filters and suggests existing contributors in real-time
- **Smart Content-Aware Layout** - App height adapts to content, eliminating unnecessary scrolling
- **Mobile Viewport Optimization** - Uses `100svh` on mobile to handle browser UI properly

### Fixed
- **Mobile Scroll Issue** - Completely eliminated scrolling when no contributors are present
- **Contributor Reselection** - Easy to add existing people without retyping full names
- **Mobile Browser UI** - Proper viewport handling prevents overflow on mobile devices

---

## [1.2.3] - 2024-12-31

### Added
- **Full-Width Layout** - App now uses entire screen width for better web experience
- **Internal Input Prefixes** - "Shares:" prefix inside shares input matching $ prefix style

### Changed
- **Optimized Grid Layout** - Restructured to clean 2x2 grid (Name|Amount, Description|Shares)
- **Better Space Utilization** - Removed fixed container width for improved desktop/tablet experience
- **Enhanced Input UX** - Shares input positioned beside amount input with internal labeling
- **Responsive Padding** - Smart padding adjusts from 40px (desktop) to 15px (mobile)

### Fixed
- **Dollar Input Cutoff** - Fixed $ input being cut off by giving proper grid space
- **Layout Proportions** - Better balance between all input fields in 2x2 arrangement

---

## [1.2.2] - 2024-12-30

### Added
- **Master Edit Mode** - Single button toggles editing for ALL contributors and items
- **Bulk Editing** - All entries automatically show edit inputs when edit mode is active
- **Right-Aligned Delete Buttons** - Consistent positioning for easy mobile access

### Changed
- **Simplified Editing** - No more individual edit buttons, just click master edit
- **Streamlined Interface** - Clean display mode vs comprehensive edit mode
- **Mobile-Optimized** - Removed complex hover states and touch handlers

### Removed
- Individual edit/delete buttons on each entry
- Complex mobile touch detection and hover effects
- Multi-tap mobile interactions

---

## [1.2.1] - 2024-12-30

### Fixed
- **Mobile Edit Buttons** - Fixed buttons requiring multiple taps on mobile devices
- **Edit Layout** - Fixed edit buttons getting cut off on small screens
- **Single Edit Mode** - Only one item can be edited at a time for cleaner experience
- **Touch Interactions** - Improved mobile tap responsiveness and button sizing

### Added
- **Click Outside to Cancel** - Tap anywhere outside edit area to cancel editing

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
