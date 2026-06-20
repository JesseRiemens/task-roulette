# Planning Guide

A task roulette app where users can create a list of tasks, spin the wheel to randomly select one, and share task lists via URL encoding - making task selection fun and collaborative.

**Experience Qualities**:
1. **Playful** - The roulette spin animation should feel exciting and unpredictable, building anticipation before revealing the selected task
2. **Effortless** - Adding, editing, reordering, and sharing tasks should be intuitive with minimal friction or cognitive load
3. **Polished** - Every interaction should feel smooth with thoughtful animations and clear visual feedback

**Complexity Level**: Light Application (multiple features with basic state)
- The app manages a dynamic list of tasks with CRUD operations, URL state synchronization, and animated task selection, but doesn't require complex routing or multi-view architecture

## Essential Features

**Task List Management**
- Functionality: Users can add, edit, delete, and reorder tasks in their list
- Purpose: Provides full control over the task pool for the roulette
- Trigger: Add button, inline editing, delete icons, and drag handles
- Progression: Click add → Enter task text → Task appears in list → Can drag to reorder → Click edit to modify → Click delete to remove
- Success criteria: All CRUD operations work smoothly, drag-and-drop feels natural, changes immediately reflect in URL

**Roulette Spin Animation**
- Functionality: Randomly selects a task with an animated spinning effect
- Purpose: Makes task selection engaging and adds excitement to the process
- Trigger: "Spin" button click
- Progression: Click spin → Button animates → Number counter rapidly cycles through indices → Counter slows down → Final task revealed with emphasis → Task highlights in list
- Success criteria: Animation feels satisfying, selection is truly random, visual feedback is clear

**URL Encoding System**
- Functionality: Encodes task list into URL query parameter with efficient compression
- Purpose: Enables sharing task lists with others and bookmarking specific configurations
- Trigger: Any task list modification automatically updates URL
- Progression: User modifies list → Encoder compresses data → URL updates → User copies URL → Others paste and see same task list
- Success criteria: URL updates instantly, encoding is compact, decoding is reliable, copy button provides clear feedback

**Task Order Manipulation**
- Functionality: Drag-and-drop reordering of tasks
- Purpose: Users can organize tasks by priority or preference
- Trigger: Click and drag task handle
- Progression: Hover over handle → Cursor changes → Drag task → Other tasks shift → Release → New order saved to URL
- Success criteria: Drag feels responsive, visual feedback during drag, smooth reordering animation

**Copy URL Feature**
- Functionality: One-click copying of current state URL to clipboard
- Purpose: Easy sharing of task lists
- Trigger: Copy URL button
- Progression: Click button → URL copied to clipboard → Toast confirmation appears
- Success criteria: Copy works reliably, user receives immediate feedback

## Edge Case Handling

- **Empty Task List**: Display empty state with prompt to add first task, disable spin button
- **Single Task**: Allow spin but show immediate result since there's only one option
- **Duplicate Tasks**: Allow duplicates since users might want multiple entries for weighted selection
- **Very Long Tasks**: Text truncates in list view with tooltip showing full content
- **Invalid URL Encoding**: Gracefully handle corrupt URLs by resetting to empty state with error toast
- **URL Length Limits**: Warn user if task list approaches browser URL limits (~2000 chars)
- **Rapid Spins**: Prevent spinning while animation in progress, disable button during spin

## Design Direction

The design should evoke a sense of playful sophistication - like a game show meets a productivity tool. It should feel fun and slightly retro (inspired by classic game show aesthetics) while maintaining modern polish and usability.

## Color Selection

A vibrant, energetic palette inspired by game shows and casino aesthetics, with bold primaries and electric accents.

- **Primary Color**: Deep Purple `oklch(0.35 0.15 300)` - Represents sophistication and mystery, anchoring the roulette theme
- **Secondary Colors**: Rich Navy `oklch(0.25 0.08 260)` for backgrounds and subtle contrast; Soft Lavender `oklch(0.85 0.08 300)` for secondary actions
- **Accent Color**: Electric Cyan `oklch(0.75 0.15 200)` - Eye-catching highlight for the spin button and active states, creating excitement
- **Foreground/Background Pairings**: 
  - Background (Deep Navy #1a1525): White text (#FFFFFF) - Ratio 14.2:1 ✓
  - Primary (Deep Purple #5b2d91): White text (#FFFFFF) - Ratio 6.8:1 ✓
  - Accent (Electric Cyan #2dd4bf): Deep Navy (#1a1525) - Ratio 8.1:1 ✓
  - Card (Darker Navy #0f0b1a): White text (#FFFFFF) - Ratio 16.5:1 ✓

## Font Selection

Typography should feel bold and confident, with a modern geometric sans-serif that suggests precision and fun - Space Grotesk brings personality with its distinctive letterforms while maintaining excellent readability.

- **Typographic Hierarchy**:
  - H1 (App Title): Space Grotesk Bold/36px/tight letter spacing (-0.02em)
  - H2 (Section Headers): Space Grotesk Semibold/24px/tight letter spacing (-0.01em)
  - Body (Task Text): Space Grotesk Regular/16px/normal letter spacing
  - Button (CTAs): Space Grotesk Medium/16px/slight letter spacing (0.01em)
  - Caption (Helper Text): Space Grotesk Regular/14px/normal letter spacing

## Animations

Animations should emphasize the excitement of the spin while keeping interface interactions snappy and responsive - the roulette spin is the star moment with dramatic build-up, while other interactions use subtle motion to confirm actions.

- **Roulette Spin**: Rapid number cycling (blur effect) that gradually decelerates with ease-out curve, final number scales up with bounce
- **Task List Actions**: Smooth slide-in for new tasks (200ms), fade-out with scale for deletions (150ms), fluid drag-and-drop with spring physics
- **Button States**: Micro-interactions on hover (subtle scale 1.02, 100ms), press feedback (scale 0.98), pulse effect on spin button when idle
- **URL Copy Feedback**: Button icon morphs to checkmark with success color (300ms), toast slides in from top

## Component Selection

- **Components**: 
  - Button (shadcn) - Primary spin button with custom styling for electric accent, secondary buttons for add/copy
  - Input (shadcn) - Task entry field with focus states
  - Card (shadcn) - Container for task list and roulette display
  - Toast (sonner) - Notifications for copy success and errors
  - ScrollArea (shadcn) - For long task lists
  - Dialog (shadcn) - For editing tasks inline
  
- **Customizations**: 
  - Custom TaskItem component with drag handle, edit button, and delete button
  - Custom RouletteDisplay component with animated number counter
  - Custom DragHandle icon component using phosphor-icons
  
- **States**: 
  - Spin button: Idle (pulsing glow), Hover (scale up, brighter), Active (scale down), Disabled (muted, no interaction)
  - Task items: Default, Hover (background highlight), Dragging (elevated shadow, reduced opacity), Selected (border glow after spin)
  - Input: Empty (placeholder), Focused (border glow), Error (red border with shake)
  
- **Icon Selection**: 
  - Plus (add task), X (delete), PencilSimple (edit), ArrowsOutCardinal (drag handle), Copy (copy URL), Sparkle (spin button decoration)
  
- **Spacing**: 
  - Container padding: p-8 on desktop, p-4 on mobile
  - Task list gap: gap-2 for tight density
  - Section spacing: space-y-6 between major sections
  - Button padding: px-6 py-3 for primary, px-4 py-2 for secondary
  
- **Mobile**: 
  - Stack layout vertically on mobile (roulette display on top, task list below)
  - Increase touch targets for drag handles and delete buttons (min 44px)
  - Spin button becomes full-width sticky button at bottom
  - Task input becomes full-width with larger text
  - Reduce padding throughout (p-4 → p-3, gap-6 → gap-4)
