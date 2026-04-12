from __future__ import annotations

from copy import deepcopy
import re
from typing import Any


STEP_COUNT = 16
TIME_SIGNATURE = "4/4"
OWNER = "uDOS-groovebox"


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "pattern"


def _sanitize_steps(steps: list[int], step_count: int) -> list[int]:
    cleaned = [1 if int(step) else 0 for step in steps[:step_count]]
    while len(cleaned) < step_count:
        cleaned.append(0)
    return cleaned


def _default_instrument(name: str, engine: str) -> str:
    lowered = name.lower()
    if engine == "sampler":
        if "snare" in lowered:
            return "drum-808-snare"
        if "hat" in lowered:
            return "drum-808-hihat"
        if "clap" in lowered:
            return "drum-808-clap"
        return "drum-808-kick"
    if "bass" in lowered:
        return "mono-bass"
    if "pad" in lowered:
        return "warm-pad"
    if "arp" in lowered:
        return "glass-arp"
    if "lead" in lowered:
        return "acid-lead"
    return "poly-synth"


def _default_midi_note(name: str, engine: str) -> int:
    lowered = name.lower()
    if engine == "sampler":
        if "snare" in lowered:
            return 38
        if "hat" in lowered:
            return 42
        if "clap" in lowered:
            return 39
        return 36
    if "bass" in lowered:
        return 36
    if "pad" in lowered:
        return 60
    if "arp" in lowered:
        return 72
    if "lead" in lowered:
        return 69
    return 57


def midi_note_to_frequency(note: int) -> float:
    return round(440.0 * (2 ** ((note - 69) / 12)), 3)


def _sanitize_arrangement(arrangement: list[dict[str, Any]] | None, bars: int) -> list[dict[str, Any]]:
    source = arrangement or [{"label": "A", "repeats": 1, "bars": bars}]
    valid_transitions = {"cut", "lift", "drop", "fill"}
    cleaned: list[dict[str, Any]] = []
    for index, section in enumerate(source, start=1):
        label = str(section.get("label") or f"S{index}")
        repeats = max(1, int(section.get("repeats") or 1))
        transition = str(section.get("transition") or "cut").lower()
        if transition not in valid_transitions:
            transition = "cut"
        cleaned.append({"label": label, "repeats": repeats, "bars": bars, "transition": transition})
    return cleaned


def _validate_tracks(tracks: list[dict[str, Any]], total_step_count: int) -> list[dict[str, Any]]:
    validated_tracks: list[dict[str, Any]] = []
    for index, track in enumerate(tracks, start=1):
        track_id = slugify(str(track.get("track_id") or track.get("name") or f"track-{index}"))
        engine = track.get("engine")
        if engine not in {"sampler", "synth", "stub-player"}:
            raise ValueError(f"invalid engine for track {track_id}")
        steps = track.get("steps")
        if not isinstance(steps, list) or len(steps) != total_step_count:
            raise ValueError(f"track {track_id} must contain exactly {total_step_count} steps")
        if any(step not in {0, 1} for step in steps):
            raise ValueError(f"track {track_id} steps must contain only 0 or 1")

        name = str(track.get("name") or track_id)
        instrument = str(track.get("instrument") or _default_instrument(name, engine))
        midi_note = int(track.get("midi_note") or _default_midi_note(name, engine))
        velocity = int(track.get("velocity") or (112 if engine == "sampler" else 96))
        phrases = _sanitize_phrases(track.get("phrases"), steps, total_step_count, velocity)

        validated_tracks.append(
            {
                **track,
                "track_id": track_id,
                "name": name,
                "engine": engine,
                "source": str(track.get("source") or "pattern-document"),
                "instrument": instrument,
                "midi_note": midi_note,
                "velocity": velocity,
                "steps": _sanitize_steps(steps, total_step_count),
                "phrases": phrases,
                "automation": _sanitize_automation(track.get("automation"), total_step_count),
            }
        )
    return validated_tracks


def _sanitize_sections(
    sections: list[dict[str, Any]] | None,
    arrangement: list[dict[str, Any]],
    base_tracks: list[dict[str, Any]],
    bars: int,
    steps_per_bar: int,
) -> list[dict[str, Any]]:
    section_step_count = bars * steps_per_bar
    section_map = {
        str(section.get("label") or ""): section
        for section in (sections or [])
        if str(section.get("label") or "").strip()
    }
    cleaned: list[dict[str, Any]] = []
    for section in arrangement:
        label = str(section["label"])
        source = section_map.get(label) or {}
        source_tracks = source.get("tracks") or base_tracks
        cleaned.append(
            {
                "label": label,
                "bars": bars,
                "tracks": _validate_tracks(
                    [
                        {
                            **deepcopy(track),
                            "steps": list(track["steps"]),
                            "phrases": deepcopy(track["phrases"]),
                            "automation": deepcopy(track["automation"]),
                        }
                        for track in source_tracks
                    ],
                    section_step_count,
                ),
            }
        )
    return cleaned


def _sanitize_timeline(
    timeline: list[dict[str, Any]] | None,
    arrangement: list[dict[str, Any]],
    sections: list[dict[str, Any]],
    bars: int,
) -> list[dict[str, Any]]:
    valid_section_labels = {section["label"] for section in sections}
    source = timeline or [
        {
            "section": section["label"],
            "transition": section.get("transition", "cut"),
        }
        for section in arrangement
        for _ in range(int(section["repeats"]))
    ]
    cleaned: list[dict[str, Any]] = []
    section_counts: dict[str, int] = {}
    for index, entry in enumerate(source, start=1):
        section_label = str(entry.get("section") or entry.get("label") or "")
        if section_label not in valid_section_labels:
            if not arrangement:
                continue
            section_label = arrangement[0]["label"]
        section_counts[section_label] = section_counts.get(section_label, 0) + 1
        transition = str(entry.get("transition") or "cut").lower()
        if transition not in {"cut", "lift", "drop", "fill"}:
            transition = "cut"
        cleaned.append(
            {
                "instance_id": str(entry.get("instance_id") or f"{slugify(section_label)}-{section_counts[section_label]}"),
                "label": str(entry.get("label") or f"{section_label} {section_counts[section_label]}"),
                "section": section_label,
                "transition": transition,
                "bars": int(entry.get("bars") or bars),
                "kind": str(entry.get("kind") or "section"),
                "timeline_index": index - 1,
            }
        )
    return cleaned


def _default_phrases_from_steps(steps: list[int]) -> list[dict[str, Any]]:
    phrases: list[dict[str, Any]] = []
    for step in steps:
        phrases.append(
            {
                "active": bool(step),
                "velocity": 96 if step else 0,
                "accent": False,
                "gate_steps": 1 if step else 0,
                "note_offset": 0,
                "symbol": "x" if step else ".",
            }
        )
    return phrases


def _sanitize_automation(automation: dict[str, list[float]] | None, step_count: int) -> dict[str, list[float]]:
    cleaned: dict[str, list[float]] = {}
    for lane_name, values in (automation or {}).items():
        lane: list[float] = []
        source = list(values[:step_count])
        last_value = source[-1] if source else 0.0
        for value in source:
            lane.append(max(0.0, min(1.0, float(value))))
        while len(lane) < step_count:
            lane.append(last_value)
        cleaned[lane_name] = lane
    return cleaned


def _sanitize_phrases(phrases: list[dict[str, Any]] | None, steps: list[int], step_count: int, base_velocity: int) -> list[dict[str, Any]]:
    source = phrases or _default_phrases_from_steps(steps)
    values: list[dict[str, Any]] = []
    for index in range(step_count):
        if index < len(source):
            phrase = source[index]
        else:
            phrase = {"active": False}
        active = bool(phrase.get("active", steps[index] if index < len(steps) else 0))
        symbol = str(phrase.get("symbol") or ("x" if active else "."))
        values.append(
            {
                "active": active,
                "velocity": int(phrase.get("velocity") or (base_velocity if active else 0)),
                "accent": bool(phrase.get("accent", symbol == "X")),
                "gate_steps": int(phrase.get("gate_steps") or (1 if active else 0)),
                "note_offset": int(phrase.get("note_offset") or 0),
                "symbol": symbol,
            }
        )
    return values


def validate_compiled_pattern(pattern: dict[str, Any]) -> dict[str, Any]:
    tracks = pattern.get("tracks")
    if not isinstance(tracks, list) or not tracks:
        raise ValueError("compiled pattern requires a non-empty tracks list")

    steps_per_bar = int(pattern.get("steps_per_bar") or STEP_COUNT)
    bars = int(pattern.get("bars") or 1)
    total_step_count = steps_per_bar * bars

    validated_tracks = _validate_tracks(tracks, total_step_count)

    exports = pattern.get("exports") or ["midi", "wav", "songscribe-pattern"]
    required_exports = {"midi", "wav"}
    if not required_exports.issubset(set(exports)):
        raise ValueError("compiled pattern exports must include midi and wav")

    arrangement = _sanitize_arrangement(pattern.get("arrangement"), bars)
    sections = _sanitize_sections(pattern.get("sections"), arrangement, validated_tracks, bars, steps_per_bar)
    timeline = _sanitize_timeline(pattern.get("timeline"), arrangement, sections, bars)

    return {
        "schema": "udos-groovebox-pattern/v0",
        "pattern_id": slugify(str(pattern.get("pattern_id") or pattern.get("title") or "pattern")),
        "title": str(pattern.get("title") or pattern.get("name") or "Untitled Groovebox Pattern"),
        "tempo": int(pattern.get("tempo") or 120),
        "source": str(pattern.get("source") or "markdown-spec"),
        "owner": str(pattern.get("owner") or OWNER),
        "time_signature": str(pattern.get("time_signature") or TIME_SIGNATURE),
        "swing": float(pattern.get("swing") or 0),
        "bars": bars,
        "arrangement": arrangement,
        "sections": sections,
        "timeline": timeline,
        "steps_per_bar": steps_per_bar,
        "exports": list(exports),
        "tracks": validated_tracks,
    }


def compile_pattern_document(parsed_spec: dict[str, Any]) -> dict[str, Any]:
    return validate_compiled_pattern(
        {
            "pattern_id": parsed_spec["title"],
            "title": parsed_spec["title"],
            "tempo": parsed_spec["tempo"],
            "bars": parsed_spec["bars"],
            "arrangement": parsed_spec.get("arrangement"),
            "sections": parsed_spec.get("sections"),
            "timeline": parsed_spec.get("timeline"),
            "steps_per_bar": parsed_spec["steps_per_bar"],
            "source": "markdown-spec",
            "exports": parsed_spec["supported_exports"],
            "tracks": [
                {
                    "track_id": track["name"],
                    "name": track["name"],
                    "engine": track["engine"],
                    "source": track["source"],
                    "instrument": _default_instrument(track["name"], track["engine"]),
                    "midi_note": _default_midi_note(track["name"], track["engine"]),
                    "velocity": 112 if track["engine"] == "sampler" else 96,
                    "steps": _sanitize_steps(track["steps"], parsed_spec["step_count"]),
                    "phrases": track.get("phrases"),
                    "automation": track.get("automation"),
                }
                for track in parsed_spec["tracks"]
            ],
        }
    )


def compile_pattern_from_document(document: dict[str, Any]) -> dict[str, Any]:
    return validate_compiled_pattern(
        {
            "pattern_id": document["pattern_id"],
            "title": document.get("name") or document["pattern_id"],
            "tempo": document["tempo"],
            "source": document.get("source") or "pattern-library",
            "owner": document.get("owner") or OWNER,
            "time_signature": document.get("time_signature") or TIME_SIGNATURE,
            "swing": document.get("swing") or 0,
            "bars": document.get("bars") or 1,
            "arrangement": document.get("arrangement"),
            "sections": document.get("sections"),
            "timeline": document.get("timeline"),
            "steps_per_bar": document.get("steps_per_bar") or STEP_COUNT,
            "exports": document.get("exports") or ["midi", "wav", "songscribe-pattern"],
            "tracks": [
                {
                    "track_id": track["track_id"],
                    "name": track.get("name") or track["track_id"],
                    "engine": track.get("engine") or ("sampler" if str(track.get("instrument", "")).startswith("drum-") else "synth"),
                    "source": document.get("source") or "pattern-library",
                    "instrument": track.get("instrument"),
                    "midi_note": track.get("midi_note"),
                    "steps": _sanitize_steps(track["steps"], int(document.get("bars") or 1) * int(document.get("steps_per_bar") or STEP_COUNT)),
                    "phrases": track.get("phrases"),
                    "automation": track.get("automation"),
                }
                for track in document["tracks"]
            ],
        }
    )


def build_pattern_document(parsed_spec: dict[str, Any]) -> dict[str, Any]:
    compiled = compile_pattern_document(parsed_spec)
    return {
        "pattern_id": compiled["pattern_id"],
        "name": compiled["title"],
        "tempo": compiled["tempo"],
        "time_signature": compiled["time_signature"],
        "swing": compiled["swing"],
        "bars": compiled["bars"],
        "arrangement": compiled["arrangement"],
        "sections": compiled["sections"],
        "timeline": compiled["timeline"],
        "steps_per_bar": compiled["steps_per_bar"],
        "tracks": [
            {
                "track_id": track["track_id"],
                "name": track["name"],
                "engine": track["engine"],
                "instrument": track["instrument"],
                "midi_note": track["midi_note"],
                "steps": track["steps"],
                "phrases": track["phrases"],
                "automation": track["automation"],
            }
            for track in compiled["tracks"]
        ],
        "source": compiled["source"],
        "owner": compiled["owner"],
        "exports": compiled["exports"],
    }
