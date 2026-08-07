# AGENTS.md
# AI Training Studio

> Development rules for all coding agents working on this repository.

---

# Mission

AI Training Studio is a professional Electron application dedicated to creating high-quality educational content with AI assistance.

The application produces:

- Books
- Training courses
- SCORM modules
- Quizzes
- AI-generated illustrations
- PDF exports
- DOCX exports

The primary objective is **stability**.

No regression is acceptable.

---

# Tech Stack

- Electron
- Electron Forge
- JavaScript ES2023
- HTML5
- CSS3
- Tiptap
- Node.js
- Git

---

# Golden Rules

Always analyze the project before making changes.

Never modify files blindly.

Always identify dependencies first.

Never break an existing feature.

Always keep the project compilable.

---

# Architecture

Renderer

↓

Application Layout

↓

Sidebar

↓

Page

↓

Workspace

↓

Ribbon

↓

Editor

↓

Status Bar

Only one application layout must exist.

Never duplicate layouts.

Never duplicate navigation.

---

# Protected Components

The following files are considered business logic.

Avoid modifying them unless explicitly requested.

- ProjectService
- WorkspaceService
- ChapterService
- ExportService
- preload.js
- Electron IPC
- RichEditor
- Tiptap configuration

---

# UI Philosophy

Inspired by

- Cursor
- Visual Studio Code
- Notion
- Microsoft Office
- Adobe Creative Cloud

Characteristics

- Professional
- Minimal
- Fast
- Responsive
- Dark Theme

---

# Sidebar Rules

The Sidebar is permanent.

It contains

- Logo
- Application title
- Navigation
- Footer

Requirements

- Fixed width
- Independent scrolling
- Never hidden
- Never duplicated
- Never clipped

---

# Workspace Rules

Workspace layout

Explorer

↓

Editor

↓

AI Panel

Requirements

- Three columns
- Responsive
- Flexible
- Full height

---

# Ribbon Rules

Ribbon is always visible.

No horizontal scrolling.

Buttons grouped logically.

Professional appearance.

---

# Status Bar

Always visible.

Displays

- Current project
- Save state
- Chapter count
- Version

---

# CSS Rules

Never use

```css
height:650px;
```

Never use

```css
margin-left:200px;
```

Never use

```css
position:absolute;
```

Prefer

```css
display:flex;
display:grid;
gap
min-width:0;
min-height:0;
overflow:hidden;
```

---

# Refactoring Rules

Before modifying code

- Search dependencies
- Search imports
- Search exports
- Search CSS usage

After modifying

- Remove dead code
- Remove unused CSS
- Remove unused imports
- Remove duplicated logic

---

# Git Workflow

One feature = one commit.

Always verify

```bash
git status
```

before starting.

Always ensure the application still starts after modifications.

---

# Development Workflow

For every task

1. Analyze
2. Plan
3. Identify impacted files
4. Implement
5. Verify
6. Test
7. Summarize

Never skip analysis.

---

# If a Risk Exists

If a modification may introduce regressions

STOP

Explain the risk.

Suggest a safer alternative.

Do not continue automatically.

---

# Code Quality

Follow

- SOLID
- DRY
- KISS

Write readable code.

Avoid unnecessary comments.

Favor modularity.

---

# Final Objective

Transform AI Training Studio into a professional application comparable to Cursor, VS Code and Notion while preserving all existing functionality.