import json
import unittest
from pathlib import Path

from app.exports import build_midi_export
from app.pattern_library import get_pattern, load_library
from app.patterns import compile_pattern_from_document
from app.playback import build_playback_preview


REPO_ROOT = Path(__file__).resolve().parents[1]


def load_json(relative_path: str) -> dict:
    return json.loads((REPO_ROOT / relative_path).read_text(encoding="utf-8"))


class GrooveboxArtifactTest(unittest.TestCase):
    def test_pattern_library_owns_patterns(self) -> None:
        library = load_json("src/pattern-library.json")
        self.assertEqual(library["owner"], "uDOS-groovebox")
        self.assertGreaterEqual(len(library["patterns"]), 1)

    def test_pattern_library_module_loads_seeded_example(self) -> None:
        library = load_library()
        self.assertEqual(library["library_path"], "src/pattern-library.json")
        self.assertEqual(library["patterns"][0]["document_path"], "examples/basic-pattern.json")
        self.assertEqual(library["patterns"][0]["track_count"], 2)

    def test_pattern_library_module_returns_pattern_document(self) -> None:
        pattern = get_pattern("demo-four-on-the-floor")
        self.assertEqual(pattern["document"]["name"], "Demo Four On The Floor")
        self.assertEqual(pattern["summary"]["available"], True)

    def test_basic_pattern_has_consistent_track_counts(self) -> None:
        pattern = load_json("examples/basic-pattern.json")
        self.assertEqual(pattern["owner"], "uDOS-groovebox")
        self.assertEqual(len(pattern["tracks"]), 2)
        self.assertTrue(all(len(track["steps"]) == 16 for track in pattern["tracks"]))

    def test_songscribe_bridge_example_declares_bridge_owner(self) -> None:
        pattern = load_json("examples/basic-songscribe-pattern.json")
        self.assertEqual(pattern["songscribe"]["bridge_owner"], "uDOS-groovebox")
        self.assertEqual(pattern["source"], "songscribe")

    def test_two_bar_pattern_uses_extended_step_grid(self) -> None:
        pattern = load_json("examples/two-bar-pattern.json")
        self.assertEqual(pattern["bars"], 2)
        self.assertEqual(pattern["steps_per_bar"], 16)
        self.assertTrue(all(len(track["steps"]) == 32 for track in pattern["tracks"]))
        self.assertIn("automation", pattern["tracks"][1])
        self.assertEqual(len(pattern["tracks"][1]["automation"]["cutoff"]), 32)

    def test_section_specific_pattern_material_drives_playback_and_export(self) -> None:
        document = {
            "pattern_id": "section-song",
            "name": "Section Song",
            "tempo": 120,
            "bars": 1,
            "steps_per_bar": 16,
            "arrangement": [
                {"label": "intro", "repeats": 1, "bars": 1},
                {"label": "verse", "repeats": 1, "bars": 1},
            ],
            "tracks": [
                {
                    "track_id": "bass",
                    "name": "bass",
                    "engine": "synth",
                    "instrument": "mono-bass",
                    "midi_note": 36,
                    "steps": [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    "phrases": [{"active": index == 0, "velocity": 96 if index == 0 else 0, "accent": False, "gate_steps": 1 if index == 0 else 0, "note_offset": 0, "symbol": "x" if index == 0 else "."} for index in range(16)],
                    "automation": {"cutoff": [0.2] * 16},
                }
            ],
            "sections": [
                {
                    "label": "intro",
                    "tracks": [
                        {
                            "track_id": "bass",
                            "name": "bass",
                            "engine": "synth",
                            "instrument": "mono-bass",
                            "midi_note": 36,
                            "steps": [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                            "phrases": [{"active": index == 0, "velocity": 96 if index == 0 else 0, "accent": False, "gate_steps": 1 if index == 0 else 0, "note_offset": 0, "symbol": "x" if index == 0 else "."} for index in range(16)],
                            "automation": {"cutoff": [0.2] * 16},
                        }
                    ],
                },
                {
                    "label": "verse",
                    "tracks": [
                        {
                            "track_id": "bass",
                            "name": "bass",
                            "engine": "synth",
                            "instrument": "mono-bass",
                            "midi_note": 36,
                            "steps": [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                            "phrases": [{"active": index == 4, "velocity": 122 if index == 4 else 0, "accent": index == 4, "gate_steps": 1 if index == 4 else 0, "note_offset": 7 if index == 4 else 0, "symbol": "^" if index == 4 else "."} for index in range(16)],
                            "automation": {"cutoff": [0.8] * 16},
                        }
                    ],
                },
            ],
            "exports": ["midi", "wav", "songscribe-pattern"],
        }

        compiled = compile_pattern_from_document(document)
        playback = build_playback_preview(compiled)
        midi_export = build_midi_export(compiled, playback)

        self.assertEqual(len(compiled["sections"]), 2)
        self.assertEqual(playback["events"][0]["arrangement_section"], "intro")
        self.assertEqual(playback["events"][0]["step_index"], 0)
        self.assertEqual(playback["events"][1]["arrangement_section"], "verse")
        self.assertEqual(playback["events"][1]["step_index"], 20)
        self.assertAlmostEqual(playback["events"][1]["automation"]["cutoff"], 0.8)

        control_changes = [event for event in midi_export["tracks"][0]["automation_events"] if event["lane"] == "cutoff"]
        self.assertEqual(control_changes[0]["section"], "intro")
        self.assertEqual(control_changes[0]["value"], round(0.2 * 127))
        self.assertEqual(control_changes[1]["section"], "verse")
        self.assertEqual(control_changes[1]["tick"], 16 * 120)
        self.assertEqual(control_changes[1]["value"], round(0.8 * 127))


if __name__ == "__main__":
    unittest.main()
