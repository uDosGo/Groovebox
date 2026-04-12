from __future__ import annotations

from hashlib import sha1
from typing import Any

from app.patterns import midi_note_to_frequency


def build_playback_preview(pattern: dict[str, Any]) -> dict[str, Any]:
    title = pattern["title"]
    tempo = int(pattern["tempo"])
    step_duration_seconds = round(60 / tempo / 4, 6)
    session_id = sha1(f"{pattern['pattern_id']}:{tempo}".encode("utf-8")).hexdigest()[:12]

    pattern_step_count = int(pattern["bars"]) * int(pattern["steps_per_bar"])
    arrangement = pattern.get("arrangement") or [{"label": "A", "repeats": 1, "bars": pattern["bars"]}]
    timeline = pattern.get("timeline") or [
        {
            "instance_id": f"{section['label']}-{repeat_index + 1}",
            "label": f"{section['label']} {repeat_index + 1}",
            "section": section["label"],
            "transition": section.get("transition", "cut"),
            "bars": section["bars"],
            "kind": "section",
            "timeline_index": timeline_index,
        }
        for timeline_index, (section, repeat_index) in enumerate(
            (entry, repeat)
            for entry in arrangement
            for repeat in range(int(entry["repeats"]))
        )
    ]
    sections = pattern.get("sections") or [
        {"label": section["label"], "bars": pattern["bars"], "tracks": pattern["tracks"]}
        for section in arrangement
    ]
    section_map = {section["label"]: section for section in sections}
    arrangement_step_count = sum(int(entry["bars"]) * int(pattern["steps_per_bar"]) for entry in timeline)
    channel_map: dict[str, dict[str, Any]] = {}
    events = []
    timeline_start_step = 0
    for timeline_index, timeline_entry in enumerate(timeline):
        section_bars = int(timeline_entry["bars"])
        section_steps = section_bars * int(pattern["steps_per_bar"])
        section_pattern = section_map.get(timeline_entry["section"]) or {"tracks": pattern["tracks"]}
        section_transition = timeline_entry.get("transition", "cut")
        repeat_start = timeline_start_step
        for track in section_pattern["tracks"]:
                channel = channel_map.setdefault(
                    track["track_id"],
                    {
                        "channel": len(channel_map) + 1,
                        "track_id": track["track_id"],
                        "name": track["name"],
                        "engine": track["engine"],
                        "instrument": track["instrument"],
                        "midi_note": track["midi_note"],
                        "source": track["source"],
                        "active_steps": [offset for offset, phrase in enumerate(track["phrases"]) if phrase["active"]],
                        "timeline_steps": [0 for _ in range(arrangement_step_count)],
                        "meter": 0.0,
                        "status": "idle",
                        "automation_lanes": sorted(track["automation"].keys()),
                    },
                )
                active_steps = [offset for offset, phrase in enumerate(track["phrases"]) if phrase["active"]]
                channel["active_steps"] = active_steps
                channel["meter"] = round(len(active_steps) / max(1, section_steps), 2)
                channel["status"] = "ready" if active_steps else "idle"
                channel["automation_lanes"] = sorted(set(channel["automation_lanes"]) | set(track["automation"].keys()))
                for step_index in active_steps:
                    if step_index >= section_steps:
                        continue
                    phrase = track["phrases"][step_index]
                    global_step_index = repeat_start + step_index
                    channel["timeline_steps"][global_step_index] = 1
                    automation_snapshot = {
                        lane_name: values[step_index]
                        for lane_name, values in track["automation"].items()
                        if step_index < len(values)
                    }
                    velocity = min(127, int(phrase["velocity"]) + (8 if phrase["accent"] else 0))
                    note = int(track["midi_note"] + int(phrase["note_offset"]) + (step_index % 4 if track["engine"] == "synth" and phrase["note_offset"] == 0 else 0))
                    events.append(
                        {
                            "event_id": f"{track['track_id']}:{timeline_entry['instance_id']}:{step_index}",
                            "track_id": track["track_id"],
                            "track_name": track["name"],
                            "engine": track["engine"],
                            "instrument": track["instrument"],
                            "step_index": global_step_index,
                            "pattern_step_index": step_index,
                            "arrangement_section": timeline_entry["section"],
                            "arrangement_repeat": 0,
                            "arrangement_transition": section_transition,
                            "timeline_instance_id": timeline_entry["instance_id"],
                            "timeline_index": timeline_index,
                            "beat": round(global_step_index / 4, 2),
                            "time_seconds": round(global_step_index * step_duration_seconds, 6),
                            "duration_seconds": round(step_duration_seconds * max(0.5, min(4.0, phrase["gate_steps"])) * 0.92, 6),
                            "midi_note": note,
                            "frequency_hz": midi_note_to_frequency(note),
                            "velocity": velocity,
                            "accent": phrase["accent"],
                            "gate_steps": phrase["gate_steps"],
                            "note_offset": phrase["note_offset"],
                            "symbol": phrase["symbol"],
                            "automation": automation_snapshot,
                        }
                    )
        timeline_start_step += section_steps

    events.sort(key=lambda event: (event["step_index"], event["track_id"]))
    channels = sorted(channel_map.values(), key=lambda item: item["channel"])

    return {
        "session_id": session_id,
        "title": title,
        "tempo": tempo,
        "pattern": pattern,
        "arrangement": arrangement,
        "timeline": timeline,
        "sections": sections,
        "transport": {
            "state": "ready",
            "loop_bars": sum(int(entry["bars"]) for entry in timeline),
            "resolution": "1/16",
            "step_count": arrangement_step_count,
            "pattern_step_count": pattern_step_count,
            "steps_per_bar": pattern["steps_per_bar"],
            "step_duration_seconds": step_duration_seconds,
            "loop_duration_seconds": round(arrangement_step_count * step_duration_seconds, 6),
            "position_step": 0,
        },
        "channels": channels,
        "events": events,
        "engine_summary": {
            "synth": sum(1 for channel in channels if channel["engine"] == "synth"),
            "sampler": sum(1 for channel in channels if channel["engine"] == "sampler"),
            "stub_player": sum(1 for channel in channels if channel["engine"] == "stub-player"),
        },
    }
