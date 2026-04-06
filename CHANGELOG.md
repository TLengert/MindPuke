# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2026-04-06

### Added
- Initialized React project with Vite and TypeScript.
- Integrated `@xyflow/react` for node-based canvas.
- Added `tailwindcss` (v4) for premium styling.
- Implemented `zustand` for centralized state management.
- Created 'Root' node as the starting point for Mind Maps.
- Configured pure black background (#000000) with dark-grey dot grid.
- Enabled snap-to-grid functionality.
- Added Lucide React for iconography.
- Added double-click listener on canvas to create new nodes at cursor position.
- Added custom `MindMapNode` component with inline text editing and auto-focus.
- Added a `+` button to nodes to easily create connected child nodes (150px gap).

### Changed
- Updated global canvas styles to support 100vw/100vh true full-screen.
- Refined background with a premium OLED radial gradient (`#0a0a0a` to `#000000`).
- Updated dot grid to a dark-grey (`#1A1A1A`).
- Polished node UI with subtle borders (`border-zinc-800`) and a dynamic purple glow on selection.
