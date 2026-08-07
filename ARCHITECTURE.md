# ARCHITECTURE.md

# AI Training Studio - Architecture

## Overview

AI Training Studio follows a modular architecture.

Business logic must remain independent from the user interface.

```
Electron
│
├── Main Process
│
├── Preload
│
└── Renderer
      │
      ├── Layout
      │
      ├── Pages
      │
      ├── Components
      │
      ├── Services
      │
      └── Editor
```

---

# Architecture Contract

- Electron remains the desktop platform.
- Plain JavaScript ES Modules remain the renderer technology unless explicitly approved otherwise.
- Tiptap remains the rich-text editor.
- Business services must remain independent from UI.
- Workspace owns renderer lifecycle only.
- Components should have explicit responsibilities.
- New features must integrate into the existing architecture instead of replacing it.
- Large rewrites are prohibited unless explicitly approved.
- Every sprint must leave the application in a releasable state.

---

# Folder Responsibilities

## components/

Reusable UI components.

Examples

- Sidebar
- Ribbon
- StatusBar
- Modals
- Buttons

Components must never contain business logic.

---

## pages/

Application pages.

Examples

- Dashboard
- Projects
- Workspace
- Books
- Images
- Settings

Pages assemble components.

---

## services/

Business logic only.

Examples

- ProjectService
- WorkspaceService
- ChapterService
- ExportService

Services must never manipulate the DOM.

---

## editor/

Everything related to Tiptap.

Editor components remain isolated.

---

## styles/

Global styles.

One responsibility per file.

Avoid duplicated CSS.

---

# Data Flow

User Action

↓

Component

↓

Service

↓

Storage

↓

UI Refresh

Business logic must never be embedded directly inside components.

---

# Layout

Only one application layout is allowed.

```
Sidebar

↓

Current Page

↓

Workspace

↓

Ribbon

↓

Editor

↓

Status Bar
```

No duplicated layouts.

No nested navigation.

---

# Dependencies

Allowed

Component → Service

Page → Component

Page → Service

Forbidden

Service → Component

Service → DOM

Service → CSS

---

# Naming

Components

PascalCase

Example

WorkspaceLayout.js

Services

PascalCase ending with Service

Example

ProjectService.js

CSS

kebab-case

Example

workspace-layout.css

---

# CSS

Prefer

- Flexbox
- CSS Grid
- CSS Variables

Avoid

- Fixed heights
- Absolute positioning for layouts
- Duplicate selectors

---

# Refactoring Rules

Before editing

- Search usages
- Search imports
- Search exports

After editing

- Remove dead code
- Remove unused imports
- Remove duplicate CSS

---

# Build Rules

The application must compile after every change.

Never leave the project in a broken state.

If a modification introduces uncertainty:

Stop.

Explain.

Propose an alternative.
