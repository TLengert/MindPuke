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
- **Floating Overlay Sidebar:** Persistent sidebar with side-switcher (Left/Right) and collapse functionality.
- **Node Context Menu:** Custom right-click menu system for Canvas (New Thought, Center View) and Nodes (Color Picker, Copy, Delete).
- **Node Coloring:** Nodes now support custom border and glow colors via the context menu.
- **Focus Mode (Zen Mode):** Automatic sidebar hiding during canvas panning to enable distraction-free mapping.
- **Pin Logic:** Ability to lock the sidebar in place to disable Focus Mode auto-hiding.
- **Glowing Recovery Handle:** A persistent 20px edge handle with a pulsing purple glow for quick sidebar recovery when in Focus Mode.
- **Theme Evolution (Preset Colors):** Selecting OLED Dark, Ocean Blue, or Neon Pink now globally enforces color themes on all nodes and edges (batch overrides exist to quickly unify a map).
- **Kinde Authentication:** Full `<KindeProvider>` wrapping enforcing strict auth-guards over the primary MindPuke canvas.
- **OLED Login Interface:** A glassmorphic splash login matching the application `#000000` to `#0a0a0a` gradient.
- **Auth-Bound Isolation:** Custom Zustand local persistence bindings that explicitly partition the browser's `localStorage` via a `mindpuke-v1-${user.id}` key mapping. User data stays securely available for their subsequent sessions without wiping.
- **Export Ownership Signatures:** `mindpuke-map.json` download files now include the native Kinde `ownerId` encoded dynamically. Uploads perform strict validation against the active session to prevent loading maps from other accounts.
- **Save Warnings:** `beforeunload` browser warnings and strict Logout confirmation dialogs if `unexportedChanges` exists.

### Changed
- Updated global canvas styles to support 100vw/100vh true full-screen.
- Refined background with a premium OLED radial gradient (`#0a0a0a` to `#000000`).
- Updated dot grid to a dark-grey (`#1A1A1A`).
- Polished node UI with subtle borders (`border-zinc-800`) and a dynamic purple glow on selection.
- Refactored `App.tsx`, `useStore.ts`, and components to support the new overlay-based smart sidebar logic.
- Node Color Context Menu is now contextually locked or disabled unless the map is running in 'Custom' theme mode.
