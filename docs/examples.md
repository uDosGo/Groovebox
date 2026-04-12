# Groovebox Examples

The initial examples focus on the smallest public artifacts needed to discuss
Groovebox as a first-class family repo.

## Included Examples

- `examples/basic-pattern.json`
  a minimal drum-machine style pattern with step and tempo metadata
- `examples/basic-songscribe-pattern.json`
  a bridge-backed pattern showing how Songscribe text can map into a Groovebox
  pattern document
- `examples/two-bar-pattern.json`
  a two-bar groove showing the extended transport, phrase symbols, and step-grid
  shape, including seeded automation lanes
- the browser UI includes a default markdown spec that exercises both the
  Songscribe, MML, phrase-symbol, automation, and arrangement lanes

## Example Design Rules

- keep every example text-first and diffable
- prefer portable identifiers over runtime-local state
- do not encode shell routing or Wizard-specific concerns into the examples
