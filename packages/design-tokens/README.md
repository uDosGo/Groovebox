# @udos-groovebox/design-tokens (stub)

Placeholder workspace for **shared visual language** between:

- Groovebox static UI (`app/static/groovebox-ui.css`)
- Songscribe (`containers/songscribe/repo`, Tailwind + shadcn)

Next steps (when you start active UI convergence):

1. Export CSS variables or a Tailwind preset from one canonical JSON/TS file.
2. Import from Songscribe’s `tailwind.config` and from Groovebox (build step or
   copy-on-publish).
3. Document viewport-centred layout tokens (max width, rhythm, “focus” mode).

**Today:** Groovebox shell pulls Songscribe-aligned HSL tokens from
`app/static/songscribe-theme.css` (see `app/static/groovebox-ui.css` mappings).

See **`docs/groovebox-songscribe-convergence.md`**.
