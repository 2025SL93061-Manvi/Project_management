FRONTEND MIGRATION PROMPT — Vanilla CSS → Tailwind CSS + shadcn/ui

CONTEXT
You are migrating the frontend of an existing application from vanilla CSS to Tailwind CSS with shadcn/ui components. The backend is completely out of scope — do not touch any backend files, API calls, routing logic, or data-fetching code under any circumstances.

STRICT RULES — NON-NEGOTIABLE

Zero functionality regression. Every feature, interaction, form, button, modal, dropdown, navigation, and data display must work identically before and after the migration. If it worked before, it must work after.
One page at a time. Migrate exactly one page or component per task. Do not proceed to the next until the current one is verified complete.
Before touching any file, list every interactive element and functional behavior on that page (clicks, submits, toggles, validations, conditionals, dynamic rendering). This becomes your checklist.
After migrating any file, go through the checklist line by line and confirm each item still works. Do not mark a page done unless every item is checked off.
Do not remove or rename any existing event handlers, props, state variables, API calls, or callback functions. You may only change how elements are styled — not how they behave.
Do not change any class names used by JavaScript logic (e.g. document.querySelector, classList, refs). If a class name is referenced in JS, keep it alongside the Tailwind classes.
Do not alter any data flow. Props, state, context, hooks, and API response handling must remain exactly as they are.
Backend is completely off-limits. No changes to any .java, .sql, .yml, .properties, .env, or API-related files. No changes to fetch/axios calls, endpoints, or request/response structures.


MIGRATION STANDARDS
Tailwind CSS

Use Tailwind utility classes exclusively for all new styling. Remove vanilla CSS only after the Tailwind equivalent is confirmed working.
Define all base/brand colors as CSS variables in the global stylesheet (e.g. --color-primary, --color-surface, --color-text-muted) and reference them in tailwind.config.js so they are available as utilities like bg-primary, text-muted.
Use Tailwind's responsive prefixes (sm:, md:, lg:) to preserve or improve responsive behavior.
Do not use arbitrary values (w-[347px]) unless there is no standard Tailwind equivalent.

shadcn/ui Components

Replace native HTML elements with the appropriate shadcn component where one exists: buttons → <Button>, inputs → <Input>, dialogs → <Dialog>, selects → <Select>, tables → <Table>, cards → <Card>, etc.
When replacing a native element with a shadcn component, ensure all existing props, event handlers, and refs are forwarded correctly to the shadcn component.
Do not use a shadcn component if it changes the DOM structure in a way that breaks existing JS behavior — flag it instead and ask before proceeding.
Extend shadcn component variants using cva if custom visual states are needed, rather than overriding with inline styles.

UX & Interactivity

All hover states, focus rings, active states, disabled states, and loading states must be visually present after migration — do not lose interactive feedback.
Preserve all existing animations and transitions, or improve them — never remove them silently.
Accessibility must be maintained: aria-* attributes, keyboard navigation, and focus management must remain intact.
Forms must preserve all validation behavior, error states, and submission handling exactly.

Design Tokens — Color Variables
Define the following in your global CSS (globals.css or equivalent) so the entire theme can be changed from one place:
css:root {
  --color-primary:       #your-value;
  --color-primary-hover: #your-value;
  --color-secondary:     #your-value;
  --color-background:    #your-value;
  --color-surface:       #your-value;
  --color-border:        #your-value;
  --color-text:          #your-value;
  --color-text-muted:    #your-value;
  --color-success:       #your-value;
  --color-warning:       #your-value;
  --color-error:         #your-value;
}
Map these into tailwind.config.js:
jstheme: {
  extend: {
    colors: {
      primary:    'var(--color-primary)',
      secondary:  'var(--color-secondary)',
      background: 'var(--color-background)',
      surface:    'var(--color-surface)',
      border:     'var(--color-border)',
      text:       'var(--color-text)',
      muted:      'var(--color-text-muted)',
      success:    'var(--color-success)',
      warning:    'var(--color-warning)',
      error:      'var(--color-error)',
    }
  }
}

EXECUTION ORDER
Migrate in this sequence — smallest/lowest-risk first:

Global setup: install Tailwind, configure tailwind.config.js, define CSS variables, install shadcn/ui.
Shared primitives: Button, Input, Badge, Card — replace globally used base elements first.
Layout components: Navbar, Sidebar, Footer.
Individual pages — one at a time, checklist-verified before moving on.
Final pass: remove all leftover vanilla CSS that has been fully replaced. Do not bulk-delete — remove file by file after confirming.


DELIVERABLE FORMAT FOR EACH PAGE
When working on each page, structure your response as:
PAGE: [PageName]
PRE-MIGRATION CHECKLIST:
  - [ ] interactive element / behavior 1
  - [ ] interactive element / behavior 2
  ...
CHANGES MADE:
  - replaced X with Y
  ...
POST-MIGRATION VERIFICATION:
  - [x] interactive element / behavior 1 — confirmed working
  - [x] interactive element / behavior 2 — confirmed working
STATUS: COMPLETE / BLOCKED (reason)
Do not move to the next page until STATUS is COMPLETE.

IF ANYTHING IS AMBIGUOUS
Stop and ask. Do not assume, guess, or silently skip anything. A question is always better than a broken feature.