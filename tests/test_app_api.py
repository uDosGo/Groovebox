import os
import unittest
import wave
from pathlib import Path
from unittest import mock

from fastapi.testclient import TestClient

from app.main import app


class GrooveboxApiTest(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)
        self.repo_root = Path(__file__).resolve().parents[1]

    def tearDown(self) -> None:
        for relative_path in [
            "sessions/patterns/api-library-save.json",
            "sessions/compiled/api-session-save.json",
            "sessions/exports/demo.mid",
            "sessions/exports/demo.wav",
            "sessions/exports/demo.notation.txt",
            "sessions/exports/demo.mml.txt",
            "sessions/exports/demo.musicxml",
            "sessions/exports/wav-demo.wav",
        ]:
            path = self.repo_root / relative_path
            if path.exists():
                path.unlink()

    def test_health(self) -> None:
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")

    def test_pattern_library(self) -> None:
        response = self.client.get("/api/patterns")
        self.assertEqual(response.status_code, 200)
        payload = response.json()["library"]
        self.assertEqual(payload["owner"], "uDOS-groovebox")
        self.assertGreaterEqual(len(payload["patterns"]), 1)
        self.assertTrue(payload["patterns"][0]["available"])

    def test_pattern_detail(self) -> None:
        response = self.client.get("/api/patterns/demo-four-on-the-floor")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["summary"]["pattern_id"], "demo-four-on-the-floor")
        self.assertEqual(payload["document"]["owner"], "uDOS-groovebox")
        self.assertEqual(payload["compiled"]["pattern_id"], "demo-four-on-the-floor")
        self.assertEqual(payload["playback"]["transport"]["state"], "ready")

    def test_pattern_save(self) -> None:
        response = self.client.post(
            "/api/patterns/save",
            json={"name": "API Library Save", "markdown": "# API Library Save\n\n- bass: x...x...x...x..."},
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertTrue(payload["path"].startswith("sessions/patterns/"))
        self.assertEqual(payload["compiled"]["title"], "API Library Save")
        self.assertEqual(payload["compiled"]["pattern_id"], "api-library-save")

    def test_parse_spec(self) -> None:
        response = self.client.post(
            "/api/spec/parse",
            json={
                "markdown": "# Demo\n\n```songscribe\nTempo: 124\nTrack: drums sampler 808\nSteps: X...X...X...X...\n```"
            },
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["tempo"], 124)
        self.assertEqual(payload["bars"], 1)
        self.assertEqual(payload["tracks"][0]["engine"], "sampler")

    def test_parse_multibar_spec(self) -> None:
        response = self.client.post(
            "/api/spec/parse",
            json={"markdown": "---\ntitle: Long Demo\ntempo: 128\nbars: 2\narrangement: intro*1@lift,verse*2@drop\n---\n\n# Long Demo\n\n- drums: X...x...x...x...|x.o.x.x.^.x.v.x.\n- bass: x.......x.......|....x===....x...\n- bass.cutoff: 56789ABC56789ABC|89ABCDEF89ABCDEF\n- bass.level: BBBBAAAA99998888|88889999AAAABBBB\n"},
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["bars"], 2)
        self.assertEqual(payload["arrangement_bars"], 6)
        self.assertEqual(payload["arrangement"][0]["transition"], "lift")
        self.assertEqual(payload["step_count"], 32)
        self.assertEqual(len(payload["tracks"][0]["steps"]), 32)
        self.assertTrue(payload["tracks"][0]["phrases"][0]["accent"])
        self.assertEqual(payload["tracks"][0]["phrases"][24]["note_offset"], 7)
        self.assertEqual(payload["tracks"][1]["phrases"][20]["gate_steps"], 4)
        self.assertIn("cutoff", payload["tracks"][1]["automation"])
        self.assertAlmostEqual(payload["tracks"][1]["automation"]["cutoff"][0], 5 / 15)

    def test_playback_preview(self) -> None:
        response = self.client.post(
            "/api/playback/preview",
            json={"markdown": "# Demo\n\n- bass: x...x...x...x..."},
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["transport"]["state"], "ready")
        self.assertEqual(len(payload["channels"]), 1)
        self.assertEqual(payload["pattern"]["tracks"][0]["track_id"], "bass")
        self.assertGreaterEqual(len(payload["events"]), 4)

    def test_playback_preview_multibar(self) -> None:
        response = self.client.post(
            "/api/playback/preview",
            json={"markdown": "---\nbars: 2\narrangement: intro*1@lift,verse*2@drop\n---\n\n# Demo\n\n- bass: x...x...x...x...|....x...x...x...\n"},
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["transport"]["pattern_step_count"], 32)
        self.assertEqual(payload["transport"]["step_count"], 96)
        self.assertEqual(payload["transport"]["loop_bars"], 6)
        self.assertEqual(len(payload["pattern"]["tracks"][0]["steps"]), 32)
        self.assertEqual(payload["arrangement"][1]["label"], "verse")
        self.assertEqual(payload["events"][0]["arrangement_transition"], "lift")
        self.assertEqual(len(payload["channels"][0]["timeline_steps"]), 96)

    def test_playback_preview_explicit_timeline(self) -> None:
        response = self.client.post(
            "/api/playback/preview",
            json={"markdown": "---\nbars: 1\narrangement: intro*1@lift,verse*1@drop\ntimeline: intro@lift, verse@drop, intro@fill\n---\n\n# Demo\n\n- bass: x...x...x...x...\n"},
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(len(payload["timeline"]), 3)
        self.assertEqual(payload["timeline"][2]["section"], "intro")
        self.assertEqual(payload["timeline"][2]["transition"], "fill")
        self.assertEqual(payload["transport"]["step_count"], 48)
        self.assertEqual(payload["events"][-1]["timeline_instance_id"], "intro-2")

    def test_compile_spec(self) -> None:
        response = self.client.post(
            "/api/spec/compile",
            json={"markdown": "# Demo\n\n- drums: x...x...x...x..."},
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["schema"], "udos-groovebox-pattern/v0")
        self.assertEqual(payload["tracks"][0]["track_id"], "drums")
        self.assertEqual(payload["tracks"][0]["instrument"], "drum-808-kick")

    def test_compile_multibar_spec(self) -> None:
        response = self.client.post(
            "/api/spec/compile",
            json={"markdown": "---\nbars: 2\n---\n\n# Demo\n\n- drums: X...x...o...x...|x...^...x...v...\n- drums.level: DDDDDDDDDDDDDDDD|CCCCCCCCCCCCCCCC\n"},
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["bars"], 2)
        self.assertEqual(payload["steps_per_bar"], 16)
        self.assertEqual(len(payload["tracks"][0]["steps"]), 32)
        self.assertEqual(payload["tracks"][0]["phrases"][0]["symbol"], "X")
        self.assertEqual(payload["tracks"][0]["phrases"][28]["note_offset"], -5)
        self.assertIn("level", payload["tracks"][0]["automation"])
        self.assertAlmostEqual(payload["tracks"][0]["automation"]["level"][0], 13 / 15)

    def test_compile_spec_preserves_section_fence(self) -> None:
        markdown = """---
title: Section Demo
tempo: 120
bars: 1
arrangement: intro*1, verse*1
---

# Section Demo

- bass: x...............
- bass.cutoff: 3333333333333333

```groovebox-sections
{
  "sections": [
    {
      "label": "intro",
      "tracks": [
        {
          "track_id": "bass",
          "name": "bass",
          "engine": "synth",
          "source": "groovebox-sections",
          "steps": [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          "phrases": [{"active": true, "velocity": 96, "accent": false, "gate_steps": 1, "note_offset": 0, "symbol": "x"}, {"active": false, "velocity": 0, "accent": false, "gate_steps": 0, "note_offset": 0, "symbol": "."}, {"active": false, "velocity": 0, "accent": false, "gate_steps": 0, "note_offset": 0, "symbol": "."}, {"active": false, "velocity": 0, "accent": false, "gate_steps": 0, "note_offset": 0, "symbol": "."}, {"active": false, "velocity": 0, "accent": false, "gate_steps": 0, "note_offset": 0, "symbol": "."}, {"active": false, "velocity": 0, "accent": false, "gate_steps": 0, "note_offset": 0, "symbol": "."}, {"active": false, "velocity": 0, "accent": false, "gate_steps": 0, "note_offset": 0, "symbol": "."}, {"active": false, "velocity": 0, "accent": false, "gate_steps": 0, "note_offset": 0, "symbol": "."}, {"active": false, "velocity": 0, "accent": false, "gate_steps": 0, "note_offset": 0, "symbol": "."}, {"active": false, "velocity": 0, "accent": false, "gate_steps": 0, "note_offset": 0, "symbol": "."}, {"active": false, "velocity": 0, "accent": false, "gate_steps": 0, "note_offset": 0, "symbol": "."}, {"active": false, "velocity": 0, "accent": false, "gate_steps": 0, "note_offset": 0, "symbol": "."}, {"active": false, "velocity": 0, "accent": false, "gate_steps": 0, "note_offset": 0, "symbol": "."}, {"active": false, "velocity": 0, "accent": false, "gate_steps": 0, "note_offset": 0, "symbol": "."}, {"active": false, "velocity": 0, "accent": false, "gate_steps": 0, "note_offset": 0, "symbol": "."}, {"active": false, "velocity": 0, "accent": false, "gate_steps": 0, "note_offset": 0, "symbol": "."}],
          "automation": {"cutoff": [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2]}
        }
      ]
    },
    {
      "label": "verse",
      "tracks": [
        {
          "track_id": "bass",
          "name": "bass",
          "engine": "synth",
          "source": "groovebox-sections",
          "steps": [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          "phrases": [{"active": false, "velocity": 0, "accent": false, "gate_steps": 0, "note_offset": 0, "symbol": "."}, {"active": false, "velocity": 0, "accent": false, "gate_steps": 0, "note_offset": 0, "symbol": "."}, {"active": false, "velocity": 0, "accent": false, "gate_steps": 0, "note_offset": 0, "symbol": "."}, {"active": false, "velocity": 0, "accent": false, "gate_steps": 0, "note_offset": 0, "symbol": "."}, {"active": true, "velocity": 108, "accent": true, "gate_steps": 1, "note_offset": 7, "symbol": "^"}, {"active": false, "velocity": 0, "accent": false, "gate_steps": 0, "note_offset": 0, "symbol": "."}, {"active": false, "velocity": 0, "accent": false, "gate_steps": 0, "note_offset": 0, "symbol": "."}, {"active": false, "velocity": 0, "accent": false, "gate_steps": 0, "note_offset": 0, "symbol": "."}, {"active": false, "velocity": 0, "accent": false, "gate_steps": 0, "note_offset": 0, "symbol": "."}, {"active": false, "velocity": 0, "accent": false, "gate_steps": 0, "note_offset": 0, "symbol": "."}, {"active": false, "velocity": 0, "accent": false, "gate_steps": 0, "note_offset": 0, "symbol": "."}, {"active": false, "velocity": 0, "accent": false, "gate_steps": 0, "note_offset": 0, "symbol": "."}, {"active": false, "velocity": 0, "accent": false, "gate_steps": 0, "note_offset": 0, "symbol": "."}, {"active": false, "velocity": 0, "accent": false, "gate_steps": 0, "note_offset": 0, "symbol": "."}, {"active": false, "velocity": 0, "accent": false, "gate_steps": 0, "note_offset": 0, "symbol": "."}, {"active": false, "velocity": 0, "accent": false, "gate_steps": 0, "note_offset": 0, "symbol": "."}],
          "automation": {"cutoff": [0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8]}
        }
      ]
    }
  ]
}
```
"""
        response = self.client.post("/api/spec/compile", json={"markdown": markdown})
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(len(payload["sections"]), 2)
        self.assertEqual(payload["sections"][1]["label"], "verse")
        self.assertEqual(payload["sections"][1]["tracks"][0]["phrases"][4]["symbol"], "^")

        playback = self.client.post("/api/playback/preview", json={"markdown": markdown}).json()
        self.assertEqual(playback["events"][1]["arrangement_section"], "verse")
        self.assertEqual(playback["events"][1]["step_index"], 20)

    def test_bootstrap_status(self) -> None:
        response = self.client.get("/api/bootstrap/status")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn("songscribe", payload)
        self.assertIn("configured", payload["songscribe"])
        self.assertIn("docker", payload)
        self.assertIn("cli_on_path", payload["docker"])
        self.assertIn("groovebox_startup", payload)
        self.assertIn("docker_launch_status", payload["groovebox_startup"])

    def test_songscribe_docker_info(self) -> None:
        response = self.client.get("/api/songscribe/docker")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn("can_control", payload)
        self.assertIn("compose_exists", payload)
        self.assertIn("loopback_ok", payload)

    def test_songscribe_docker_start_forbidden_when_disabled(self) -> None:
        with mock.patch.dict(os.environ, {"GROOVEBOX_DOCKER_CONTROL": "0"}, clear=False):
            response = self.client.post("/api/songscribe/docker/start")
            self.assertEqual(response.status_code, 403)

    def test_songscribe_status(self) -> None:
        response = self.client.get("/api/songscribe/status")
        self.assertEqual(response.status_code, 200)
        self.assertIn("configured", response.json())

    def test_songscribe_runtime_status(self) -> None:
        response = self.client.get("/api/songscribe/runtime")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn("preferred_mode", payload)
        self.assertIn("songscribe_repo_exists", payload)
        self.assertIn("port_3000_open", payload)

    def test_songscribe_runtime_start_local(self) -> None:
        with mock.patch("app.main.songscribe_runtime_start", return_value={"ok": True, "runtime_mode": "local", "status": "accepted"}) as start_mock:
            response = self.client.post("/api/songscribe/runtime/start")
            self.assertEqual(response.status_code, 200)
            payload = response.json()
            self.assertTrue(payload["ok"])
            self.assertEqual(payload["runtime_mode"], "local")
            start_mock.assert_called_once()

    def test_songscribe_runtime_start_docker(self) -> None:
        with mock.patch.dict(os.environ, {"GROOVEBOX_DOCKER_CONTROL": "1"}, clear=False):
            with mock.patch("app.main.songscribe_runtime_start", return_value={"ok": True, "runtime_mode": "docker", "status": "accepted"}) as start_mock:
                response = self.client.post("/api/songscribe/runtime/start?mode=docker")
                self.assertEqual(response.status_code, 200)
                payload = response.json()
                self.assertTrue(payload["ok"])
                self.assertEqual(payload["runtime_mode"], "docker")
                start_mock.assert_called_once()

    def test_songscribe_runtime_start_docker_forbidden_when_disabled(self) -> None:
        with mock.patch.dict(os.environ, {"GROOVEBOX_DOCKER_CONTROL": "0"}, clear=False):
            response = self.client.post("/api/songscribe/runtime/start?mode=docker")
            self.assertEqual(response.status_code, 403)

    def test_songscribe_runtime_stop_local(self) -> None:
        with mock.patch("app.main.songscribe_runtime_stop", return_value={"ok": True, "runtime_mode": "local", "status": "stopped"}) as stop_mock:
            response = self.client.post("/api/songscribe/runtime/stop")
            self.assertEqual(response.status_code, 200)
            payload = response.json()
            self.assertTrue(payload["ok"])
            self.assertEqual(payload["runtime_mode"], "local")
            stop_mock.assert_called_once()

    def test_songscribe_bridge(self) -> None:
        response = self.client.post(
            "/api/songscribe/bridge",
            json={"markdown": "# Demo\n\n```songscribe\nTempo: 124\nTrack: lead synth\nSteps: X...X...X...X...\n```"},
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["pattern"]["tracks"][0]["engine"], "synth")
        self.assertEqual(payload["playback"]["transport"]["state"], "ready")

    def test_midi_export(self) -> None:
        response = self.client.post(
            "/api/exports/midi",
            json={"markdown": "# Demo\n\n- drums: x...x...x...x...\n- drums.level: DDDDCCCCBBBBAAAA\n"},
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["schema"], "udos-groovebox-midi-export/v0")
        self.assertEqual(payload["format"], "midi-json")
        self.assertGreaterEqual(len(payload["tracks"][0]["events"]), 2)
        control_changes = [event for event in payload["tracks"][0]["events"] if event["type"] == "control_change"]
        self.assertTrue(control_changes)
        self.assertEqual(control_changes[0]["cc"], 7)

    def test_midi_file_export(self) -> None:
        response = self.client.post(
            "/api/exports/midi/file",
            json={"markdown": "# Demo\n\n- drums: x...x...x...x..."},
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["schema"], "udos-groovebox-midi-file/v0")
        self.assertEqual(payload["format"], "midi-file")
        self.assertTrue(payload["path"].endswith("demo.mid"))
        self.assertGreater(payload["bytes_written"], 0)
        midi_path = self.repo_root / payload["path"]
        if midi_path.exists():
            self.assertEqual(midi_path.read_bytes()[:4], b"MThd")

    def test_wav_file_export(self) -> None:
        response = self.client.post(
            "/api/exports/wav/file",
            json={"markdown": "# Wav Demo\n\n- bass: x...x...x...x..."},
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["schema"], "udos-groovebox-wav-file/v0")
        self.assertEqual(payload["format"], "wav-file")
        self.assertTrue(payload["path"].endswith("wav-demo.wav"))
        self.assertGreater(payload["bytes_written"], 0)
        wav_path = self.repo_root / payload["path"]
        if wav_path.exists():
            self.assertEqual(wav_path.read_bytes()[:4], b"RIFF")
            with wave.open(str(wav_path), "rb") as wav_file:
                self.assertEqual(wav_file.getnchannels(), 2)

    def test_notation_file_export(self) -> None:
        response = self.client.post(
            "/api/exports/notation/file",
            json={"markdown": "---\nbars: 2\narrangement: A*1@fill\n---\n\n# Demo\n\n- bass: X...o...|....x===\n- bass.cutoff: 56789ABC|89ABCDEF\n"},
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["schema"], "udos-groovebox-notation-file/v0")
        self.assertGreater(payload["bytes_written"], 0)
        notation_path = self.repo_root / payload["path"]
        if notation_path.exists():
            notation = notation_path.read_text(encoding="utf-8")
            self.assertIn("[section A transition=fill]", notation)
            self.assertIn("bass [mono-bass]: X...o.......x===|................", notation)
            self.assertIn("bass.cutoff:", notation)

    def test_mml_file_export(self) -> None:
        response = self.client.post(
            "/api/exports/mml/file",
            json={"markdown": "# Demo\n\n- lead: X...^...v...x...\n"},
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["schema"], "udos-groovebox-mml-file/v0")
        self.assertGreater(payload["bytes_written"], 0)
        mml_path = self.repo_root / payload["path"]
        if mml_path.exists():
            mml_text = mml_path.read_text(encoding="utf-8")
            self.assertIn("t120", mml_text)
            self.assertIn("g", mml_text)
            self.assertIn("f", mml_text)

    def test_musicxml_file_export(self) -> None:
        response = self.client.post(
            "/api/exports/musicxml/file",
            json={"markdown": "---\nbars: 1\narrangement: intro*1@lift,verse*1@fill\ntimeline: intro@lift, verse@fill\n---\n\n# Demo\n\n- lead: X...^...v...x...\n"},
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["schema"], "udos-groovebox-musicxml-file/v0")
        self.assertGreater(payload["bytes_written"], 0)
        musicxml_path = self.repo_root / payload["path"]
        if musicxml_path.exists():
            xml_text = musicxml_path.read_text(encoding="utf-8")
            self.assertIn("<score-partwise", xml_text)
            self.assertIn("<part-name>lead</part-name>", xml_text)
            self.assertIn("intro 1 (lift)", xml_text)
            self.assertIn("verse 1 (fill)", xml_text)

    def test_session_save(self) -> None:
        response = self.client.post(
            "/api/sessions/save",
            json={"name": "API Session Save", "markdown": "# Demo\n\n- drums: x...x...x...x..."},
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertTrue(payload["path"].startswith("sessions/compiled/"))
