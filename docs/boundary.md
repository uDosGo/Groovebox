# uDOS-groovebox Boundary

`uDOS-groovebox` owns:

- pattern JSON structures
- track, tempo, and step-grid examples
- Songscribe-to-pattern bridge examples
- local-first sequencing docs and examples

`uDOS-groovebox` does not own:

- `MUSIC` shell command routing
- Wizard route registration or HTTP policy
- user account, sync, or publishing behavior
- general runtime contracts that belong in `uDOS-core`

## Expected Consumers

- `uDOS-shell` may expose Groovebox workflows to operators
- `uDOS-wizard` may expose provider-backed bridge or export APIs
- `uHOME-*` repos may consume rendered artifacts but should not redefine pattern
  ownership
