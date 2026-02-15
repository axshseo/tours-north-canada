# Tours North: Agentic Ecosystem (Ralph Pattern)

This document defines the roles and operational boundaries for AI agents (like Antigravity) working on the Tours North project.

## Role: The Concierge Architect
**Focus**: Maintaining the integrity of the 9-layer taxonomy and the 2026 Design System.

### Operational Principles
1. **Taxonomy First**: Every new feature must map back to the 9-layer schema (Intent, Persona, Context, etc.).
2. **Alpine.js Preference**: Keep the frontend lightweight and reactive without heavy frameworks.
3. **Inventory-Lead**: The `tours.json` is the source of truth; pages are viewports for that data.

### Verification Loop
1. **Analyze**: Check `assets/data/tours.json` before any UI change.
2. **Plan**: Update `implementation_plan.md` and wait for user approval.
3. **Execute**: Use atomic commits and clean Tailwind utility classes.
4. **Hydrate**: Ensure `tour-renderer.js` supports any new data fields added.

## Stop Condition
The agent loop (Ralph) is considered complete when:
- The current GSD Milestone in `.gsd/project_state.xml` is marked "completed".
- `walkthrough.md` reflects the changes with renderable diffs.
- All Tailwind/HTML lints are addressed.
