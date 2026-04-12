from __future__ import annotations

import io
import math
import wave
from xml.sax.saxutils import escape
from typing import Any

AUTOMATION_CC_MAP = {
    "cutoff": 74,
    "resonance": 71,
    "level": 7,
    "pan": 10,
}


def _varlen(value: int) -> bytes:
    buffer = value & 0x7F
    output = bytearray([buffer])
    value >>= 7
    while value:
        output.insert(0, (value & 0x7F) | 0x80)
        value >>= 7
    return bytes(output)


def _meta_text_event(meta_type: int, text: str) -> bytes:
    encoded = text.encode("utf-8")
    return bytes([0xFF, meta_type]) + _varlen(len(encoded)) + encoded


def _track_chunk(events: list[tuple[int, bytes]]) -> bytes:
    ordered = sorted(events, key=lambda item: item[0])
    body = bytearray()
    previous_tick = 0
    for tick, payload in ordered:
        body.extend(_varlen(max(0, tick - previous_tick)))
        body.extend(payload)
        previous_tick = tick
    body.extend(b"\x00\xFF\x2F\x00")
    return b"MTrk" + len(body).to_bytes(4, "big") + bytes(body)


def build_midi_export(pattern: dict[str, Any], playback: dict[str, Any]) -> dict[str, Any]:
    ticks_per_quarter = 480
    ticks_per_step = ticks_per_quarter // 4
    pattern_step_count = playback["transport"].get("pattern_step_count", playback["transport"]["step_count"])
    arrangement = playback.get("arrangement") or [{"label": "A", "repeats": 1, "bars": pattern["bars"]}]
    timeline = playback.get("timeline") or [
        {
            "instance_id": f"{section['label']}-{repeat_index + 1}",
            "section": section["label"],
            "transition": section.get("transition", "cut"),
            "bars": section["bars"],
        }
        for section in arrangement
        for repeat_index in range(int(section["repeats"]))
    ]
    sections = pattern.get("sections") or [
        {"label": section["label"], "bars": pattern["bars"], "tracks": pattern["tracks"]}
        for section in arrangement
    ]
    section_map = {section["label"]: section for section in sections}

    tracks: list[dict[str, Any]] = []
    for track in pattern["tracks"]:
        track_events = [event for event in playback["events"] if event["track_id"] == track["track_id"]]
        midi_events = []
        for event in track_events:
            start_tick = event["step_index"] * ticks_per_step
            duration_ticks = max(1, int(round(event["duration_seconds"] / playback["transport"]["step_duration_seconds"] * ticks_per_step)))
            midi_events.append(
                {
                    "type": "note_on",
                    "tick": start_tick,
                    "note": event["midi_note"],
                    "velocity": event["velocity"],
                }
            )
            midi_events.append(
                {
                    "type": "note_off",
                    "tick": start_tick + duration_ticks,
                    "note": event["midi_note"],
                    "velocity": 0,
                }
            )

        automation_events = []
        step_offset = 0
        for timeline_entry in timeline:
            section_steps = int(timeline_entry["bars"]) * pattern["steps_per_bar"]
            section_pattern = section_map.get(timeline_entry["section"]) or {"tracks": pattern["tracks"]}
            section_track = next((item for item in section_pattern["tracks"] if item["track_id"] == track["track_id"]), None)
            if section_track is None:
                step_offset += section_steps
                continue
            for lane_name, cc_number in AUTOMATION_CC_MAP.items():
                lane_values = section_track["automation"].get(lane_name)
                if not lane_values:
                    continue
                previous_value = None
                for step_index in range(min(pattern_step_count, len(lane_values), section_steps)):
                    value = max(0, min(127, round(lane_values[step_index] * 127)))
                    if value == previous_value:
                        continue
                    automation_events.append(
                        {
                            "type": "control_change",
                            "tick": (step_offset + step_index) * ticks_per_step,
                            "cc": cc_number,
                            "value": value,
                            "lane": lane_name,
                            "section": timeline_entry["section"],
                            "instance_id": timeline_entry["instance_id"],
                            "transition": timeline_entry.get("transition", "cut"),
                        }
                    )
                    previous_value = value
            step_offset += section_steps

        tracks.append(
            {
                "track_id": track["track_id"],
                "name": track["name"],
                "engine": track["engine"],
                "instrument": track["instrument"],
                "automation": track["automation"],
                "automation_events": automation_events,
                "events": sorted(midi_events + automation_events, key=lambda item: (item["tick"], item["type"] != "note_on")),
            }
        )

    return {
        "schema": "udos-groovebox-midi-export/v0",
        "format": "midi-json",
        "pattern_id": pattern["pattern_id"],
        "title": pattern["title"],
        "tempo": pattern["tempo"],
        "ticks_per_quarter": ticks_per_quarter,
        "tracks": tracks,
    }


def build_midi_file(pattern: dict[str, Any], playback: dict[str, Any]) -> bytes:
    export = build_midi_export(pattern, playback)
    ticks_per_quarter = export["ticks_per_quarter"]
    microseconds_per_quarter = int(60_000_000 / int(pattern["tempo"]))

    tempo_track = _track_chunk(
        [
            (0, b"\xFF\x51\x03" + microseconds_per_quarter.to_bytes(3, "big")),
            (0, _meta_text_event(0x03, "uDOS Groovebox")),
        ]
    )

    midi_tracks = [tempo_track]
    for channel_index, track in enumerate(export["tracks"][:15]):
        track_events: list[tuple[int, bytes]] = [(0, _meta_text_event(0x03, track["name"]))]
        channel = channel_index & 0x0F
        for event in track["events"]:
            if event["type"] == "control_change":
                payload = bytes([0xB0 | channel, event["cc"], event["value"]])
            elif event["type"] == "note_on":
                payload = bytes([0x90 | channel, event["note"], event["velocity"]])
            else:
                payload = bytes([0x80 | channel, event["note"], 0])
            track_events.append((event["tick"], payload))
        midi_tracks.append(_track_chunk(track_events))

    header = (
        b"MThd"
        + (6).to_bytes(4, "big")
        + (1).to_bytes(2, "big")
        + len(midi_tracks).to_bytes(2, "big")
        + ticks_per_quarter.to_bytes(2, "big")
    )
    return header + b"".join(midi_tracks)


def build_notation_export(pattern: dict[str, Any]) -> dict[str, Any]:
    lines = [
        f"# {pattern['title']}",
        f"tempo: {pattern['tempo']}",
        f"bars: {pattern['bars']}",
        f"time_signature: {pattern['time_signature']}",
        "",
    ]
    sections = pattern.get("sections") or [{"label": "A", "bars": pattern["bars"], "tracks": pattern["tracks"]}]
    for section in sections:
        arrangement_entry = next((item for item in pattern.get("arrangement", []) if item["label"] == section["label"]), None)
        transition = arrangement_entry.get("transition", "cut") if arrangement_entry else "cut"
        if len(sections) > 1 or transition != "cut":
            lines.extend(["", f"[section {section['label']} transition={transition}]"])
        for track in section["tracks"]:
            phrase_symbols = [
                f"{'|' if index > 0 and index % pattern['steps_per_bar'] == 0 else ''}{phrase['symbol']}"
                for index, phrase in enumerate(track["phrases"])
            ]
            lines.append(f"{track['name']} [{track['instrument']}]: {''.join(phrase_symbols)}")
            for lane_name, values in track["automation"].items():
                automation_symbols = [
                    f"{'|' if index > 0 and index % pattern['steps_per_bar'] == 0 else ''}{format(round(value * 15), 'X')}"
                    for index, value in enumerate(values)
                ]
                lines.append(f"{track['name']}.{lane_name}: {''.join(automation_symbols)}")
    notation = "\n".join(lines) + "\n"
    return {
        "schema": "udos-groovebox-notation/v0",
        "format": "plain-text",
        "pattern_id": pattern["pattern_id"],
        "title": pattern["title"],
        "notation": notation,
    }


def build_mml_export(pattern: dict[str, Any]) -> dict[str, Any]:
    mml_tracks: list[dict[str, Any]] = []
    sections = pattern.get("sections") or [{"label": "A", "bars": pattern["bars"], "tracks": pattern["tracks"]}]
    for section in sections:
        for track in section["tracks"]:
            tokens = [f"t{pattern['tempo']}", "l16"]
            for phrase in track["phrases"]:
                if not phrase["active"]:
                    tokens.append("r")
                    continue
                note_token = "c"
                if phrase["note_offset"] >= 7:
                    note_token = "g"
                elif phrase["note_offset"] <= -5:
                    note_token = "f"
                elif phrase["symbol"] == "o":
                    note_token = "d"
                tokens.append(note_token)
                for _ in range(max(0, phrase["gate_steps"] - 1)):
                    tokens.append("&")
                    tokens.append(note_token)
            track_name = track["name"] if len(sections) == 1 else f"{track['name']} [{section['label']}]"
            mml_tracks.append(
                {
                    "track_id": track["track_id"],
                    "name": track_name,
                    "mml": " ".join(tokens),
                }
            )
    return {
        "schema": "udos-groovebox-mml/v0",
        "format": "mml-text",
        "pattern_id": pattern["pattern_id"],
        "title": pattern["title"],
        "tracks": mml_tracks,
    }


def _midi_note_to_pitch(note: int) -> tuple[str, int, int]:
    note_names = [
        ("C", 0),
        ("C", 1),
        ("D", 0),
        ("D", 1),
        ("E", 0),
        ("F", 0),
        ("F", 1),
        ("G", 0),
        ("G", 1),
        ("A", 0),
        ("A", 1),
        ("B", 0),
    ]
    step, alter = note_names[note % 12]
    octave = (note // 12) - 1
    return step, alter, octave


def build_musicxml_export(pattern: dict[str, Any]) -> dict[str, Any]:
    arrangement = pattern.get("arrangement") or [{"label": "A", "repeats": 1, "bars": pattern["bars"], "transition": "cut"}]
    timeline = pattern.get("timeline") or [
        {
            "instance_id": f"{section['label']}-{repeat_index + 1}",
            "label": f"{section['label']} {repeat_index + 1}",
            "section": section["label"],
            "transition": section.get("transition", "cut"),
            "bars": section["bars"],
            "kind": "section",
        }
        for section in arrangement
        for repeat_index in range(int(section["repeats"]))
    ]
    sections = pattern.get("sections") or [{"label": "A", "bars": pattern["bars"], "tracks": pattern["tracks"]}]
    section_map = {section["label"]: section for section in sections}
    divisions = 4
    measures_per_instance = pattern["bars"]

    score_parts = []
    part_bodies = []
    for part_index, track in enumerate(pattern["tracks"], start=1):
        part_id = f"P{part_index}"
        score_parts.append(
            f'<score-part id="{part_id}"><part-name>{escape(track["name"])}</part-name></score-part>'
        )
        measures: list[str] = []
        measure_number = 1
        for timeline_entry in timeline:
            section = section_map.get(timeline_entry["section"])
            if not section:
                continue
            section_track = next((item for item in section["tracks"] if item["track_id"] == track["track_id"]), None)
            if not section_track:
                continue
            for bar_index in range(measures_per_instance):
                start = bar_index * pattern["steps_per_bar"]
                end = start + pattern["steps_per_bar"]
                phrases = section_track["phrases"][start:end]
                notes: list[str] = []
                step_index = 0
                while step_index < len(phrases):
                    phrase = phrases[step_index]
                    duration = max(1, int(phrase["gate_steps"]) if phrase["active"] else 1)
                    if phrase["active"]:
                        midi_note = int(track["midi_note"] + int(phrase["note_offset"]))
                        step, alter, octave = _midi_note_to_pitch(midi_note)
                        pitch = f"<pitch><step>{step}</step>{f'<alter>{alter}</alter>' if alter else ''}<octave>{octave}</octave></pitch>"
                        notes.append(
                            f"<note>{pitch}<duration>{duration}</duration><voice>1</voice></note>"
                        )
                        step_index += duration
                    else:
                        notes.append("<note><rest/><duration>1</duration><voice>1</voice></note>")
                        step_index += 1

                attributes = ""
                directions = ""
                if measure_number == 1:
                    attributes = (
                        f"<attributes><divisions>{divisions}</divisions><time><beats>4</beats><beat-type>4</beat-type></time>"
                        f"<clef><sign>G</sign><line>2</line></clef></attributes>"
                    )
                    directions += (
                        f"<direction placement=\"above\"><direction-type><metronome><beat-unit>quarter</beat-unit>"
                        f"<per-minute>{pattern['tempo']}</per-minute></metronome></direction-type></direction>"
                    )
                if bar_index == 0:
                    directions += (
                        f"<direction placement=\"above\"><direction-type><words>{escape(timeline_entry['label'])}"
                        f" ({escape(timeline_entry.get('transition', 'cut'))})</words></direction-type></direction>"
                    )
                measures.append(
                    f"<measure number=\"{measure_number}\">{attributes}{directions}{''.join(notes)}</measure>"
                )
                measure_number += 1
        part_bodies.append(f'<part id="{part_id}">{"".join(measures)}</part>')

    musicxml = (
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
        "<score-partwise version=\"3.1\">"
        f"<work><work-title>{escape(pattern['title'])}</work-title></work>"
        "<part-list>"
        f"{''.join(score_parts)}"
        "</part-list>"
        f"{''.join(part_bodies)}"
        "</score-partwise>"
    )
    return {
        "schema": "udos-groovebox-musicxml/v0",
        "format": "musicxml",
        "pattern_id": pattern["pattern_id"],
        "title": pattern["title"],
        "musicxml": musicxml,
    }


def _waveform_sample(phase: float, engine: str, instrument: str) -> float:
    if engine == "sampler":
        if "snare" in instrument or "clap" in instrument:
            return math.sin(phase * 17.0) * 0.35 + math.sin(phase * 31.0) * 0.2 + math.sin(phase * 47.0) * 0.12
        if "hat" in instrument:
            return math.sin(phase * 41.0) * 0.18 + math.sin(phase * 59.0) * 0.12 + math.sin(phase * 83.0) * 0.08
        return math.sin(phase) + math.sin(phase * 0.5) * 0.2
    if "bass" in instrument:
        return 0.58 * math.sin(phase) + 0.26 * math.sin(phase * 0.5) + 0.12 * math.sin(phase * 1.5)
    if "pad" in instrument:
        return 0.45 * math.sin(phase) + 0.25 * math.sin(phase * 1.01) + 0.15 * math.sin(phase * 2.0)
    if "lead" in instrument:
        return 0.5 * math.sin(phase) + 0.24 * math.sin(phase * 2.0) + 0.12 * math.sin(phase * 3.0)
    return 0.65 * math.sin(phase) + 0.2 * math.sin(phase * 2.0)


def _transition_gain(transition: str, progress: float) -> float:
    if transition == "lift":
        return 0.88 + (progress * 0.38)
    if transition == "drop":
        return 1.15 - (progress * 0.42)
    if transition == "fill":
        return 1.0 + (0.18 * math.sin(progress * math.pi * 4.0))
    return 1.0


def _transition_brightness(transition: str, progress: float) -> float:
    if transition == "lift":
        return 1.0 + (progress * 0.3)
    if transition == "drop":
        return 1.14 - (progress * 0.24)
    if transition == "fill":
        return 1.06 + (0.12 * math.sin(progress * math.pi * 6.0))
    return 1.0


def _instrument_pan(instrument: str, default_pan: float) -> float:
    lowered = instrument.lower()
    if "hat" in lowered:
        return min(0.9, default_pan + 0.32)
    if "snare" in lowered or "clap" in lowered:
        return max(-0.1, default_pan - 0.08)
    if "pad" in lowered:
        return min(0.75, default_pan + 0.18)
    if "bass" in lowered:
        return default_pan * 0.28
    return default_pan


def _voice_detune(instrument: str, transition: str) -> float:
    lowered = instrument.lower()
    if "pad" in lowered:
        return 1.008 if transition != "drop" else 1.004
    if "lead" in lowered:
        return 1.006
    if "bass" in lowered:
        return 0.997
    return 1.0


def build_wav_file(pattern: dict[str, Any], playback: dict[str, Any]) -> bytes:
    sample_rate = 22_050
    total_seconds = max(playback["transport"]["loop_duration_seconds"] + 0.25, 0.5)
    total_samples = int(total_seconds * sample_rate)
    left_samples = [0.0] * total_samples
    right_samples = [0.0] * total_samples

    for event in playback["events"]:
        start_index = int(event["time_seconds"] * sample_rate)
        duration_samples = max(1, int(event["duration_seconds"] * sample_rate))
        level = event["automation"].get("level", 0.85)
        cutoff = event["automation"].get("cutoff", 0.55)
        transition = event.get("arrangement_transition", "cut")
        amplitude = min(0.9, event["velocity"] / 127.0 * (0.62 if event["engine"] == "sampler" else 0.38) * max(0.15, level))
        instrument = event["instrument"].lower()
        detune = _voice_detune(instrument, transition)
        pan = _instrument_pan(instrument, ((event["automation"].get("pan", 0.5) * 2) - 1))
        left_gain = math.sqrt((1 - pan) / 2)
        right_gain = math.sqrt((1 + pan) / 2)
        for offset in range(duration_samples):
            sample_index = start_index + offset
            if sample_index >= total_samples:
                break
            t = offset / sample_rate
            phase = 2.0 * math.pi * event["frequency_hz"] * t
            progress = offset / duration_samples
            if event["engine"] == "sampler":
                envelope = math.exp(-7.5 * progress)
            elif "pad" in instrument:
                envelope = min(1.0, progress * 8.0) * math.exp(-2.2 * progress)
            else:
                envelope = math.exp(-4.4 * progress)
            brightness = (0.7 + cutoff * 0.6 + (0.12 if event["accent"] else 0.0)) * _transition_brightness(transition, progress)
            body = _waveform_sample(phase * brightness, event["engine"], instrument)
            if event["engine"] != "sampler":
                body = (body * 0.78) + (_waveform_sample((phase * detune) * brightness, event["engine"], instrument) * 0.22)
            sample_value = body * amplitude * envelope * _transition_gain(transition, progress)
            left_samples[sample_index] += sample_value * left_gain
            right_samples[sample_index] += sample_value * right_gain

    output = io.BytesIO()
    with wave.open(output, "wb") as wav_file:
        wav_file.setnchannels(2)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        frames = bytearray()
        for left_sample, right_sample in zip(left_samples, right_samples):
            left_clamped = max(-1.0, min(1.0, left_sample))
            right_clamped = max(-1.0, min(1.0, right_sample))
            frames.extend(int(left_clamped * 32767).to_bytes(2, "little", signed=True))
            frames.extend(int(right_clamped * 32767).to_bytes(2, "little", signed=True))
        wav_file.writeframes(bytes(frames))
    return output.getvalue()
