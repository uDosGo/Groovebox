from __future__ import annotations

import json
import re
from dataclasses import dataclass
from math import ceil
from typing import Any


FENCE_PATTERN = re.compile(r"```(?P<lang>[a-zA-Z0-9_-]*)\n(?P<body>.*?)```", re.DOTALL)
FRONTMATTER_PATTERN = re.compile(r"^---\n(?P<body>.*?)\n---\n", re.DOTALL)
TITLE_PATTERN = re.compile(r"^#\s+(?P<title>.+)$", re.MULTILINE)
TEMPO_PATTERN = re.compile(r"\btempo\s*:\s*(?P<tempo>\d+)\b", re.IGNORECASE)
MML_TEMPO_PATTERN = re.compile(r"\bt(?P<tempo>\d{2,3})\b", re.IGNORECASE)
TRACK_PATTERN = re.compile(r"^\s*Track\s*:\s*(?P<name>[^\n]+)$", re.MULTILINE)
STEPS_PATTERN = re.compile(r"^\s*Steps\s*:\s*(?P<steps>[^\n]+)$", re.MULTILINE)
LIST_TRACK_PATTERN = re.compile(r"^\s*-\s*(?P<name>[a-zA-Z0-9 _.:-]+)\s*:\s*(?P<body>.+)$", re.MULTILINE)
AUTOMATION_DEFAULTS = {
    "cutoff": 0.55,
    "resonance": 0.2,
    "level": 0.85,
    "pan": 0.5,
}


@dataclass
class TrackPreview:
    name: str
    engine: str
    source: str
    steps: list[int]
    phrases: list[dict[str, Any]]
    automation: dict[str, list[float]]


def _parse_frontmatter(markdown: str) -> dict[str, str]:
    match = FRONTMATTER_PATTERN.match(markdown)
    if not match:
        return {}
    payload: dict[str, str] = {}
    for line in match.group("body").splitlines():
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        payload[key.strip().lower()] = value.strip()
    return payload


def _parse_bars(frontmatter: dict[str, str]) -> int | None:
    raw_value = frontmatter.get("bars")
    if raw_value is None:
        return None
    try:
        value = int(raw_value)
    except ValueError:
        return None
    return value if value > 0 else None


def _parse_arrangement(frontmatter: dict[str, str], bars: int) -> list[dict[str, Any]]:
    raw_value = frontmatter.get("arrangement", "").strip()
    if not raw_value:
        return [{"label": "A", "repeats": 1, "bars": bars, "transition": "cut"}]
    sections: list[dict[str, Any]] = []
    valid_transitions = {"cut", "lift", "drop", "fill"}
    for index, token in enumerate(raw_value.split(","), start=1):
        item = token.strip()
        if not item:
            continue
        if "@" in item:
            item, transition_value = item.split("@", 1)
            transition = transition_value.strip().lower() or "cut"
        else:
            transition = "cut"
        if "*" in item:
            label, repeat_value = item.split("*", 1)
        elif ":" in item:
            label, repeat_value = item.split(":", 1)
        else:
            label, repeat_value = item, "1"
        label = label.strip() or f"S{index}"
        try:
            repeats = max(1, int(repeat_value.strip()))
        except ValueError:
            repeats = 1
        sections.append({"label": label, "repeats": repeats, "bars": bars, "transition": transition if transition in valid_transitions else "cut"})
    return sections or [{"label": "A", "repeats": 1, "bars": bars, "transition": "cut"}]


def _parse_timeline(frontmatter: dict[str, str], arrangement: list[dict[str, Any]], bars: int) -> list[dict[str, Any]] | None:
    raw_value = frontmatter.get("timeline", "").strip()
    if not raw_value:
        return None
    timeline: list[dict[str, Any]] = []
    section_counts: dict[str, int] = {}
    valid_transitions = {"cut", "lift", "drop", "fill"}
    for index, token in enumerate(raw_value.split(","), start=1):
        item = token.strip()
        if not item:
            continue
        if "@" in item:
            section_label, transition_value = item.split("@", 1)
            transition = transition_value.strip().lower() or "cut"
        else:
            section_label = item
            transition = "cut"
        section_label = section_label.strip() or arrangement[0]["label"]
        section_counts[section_label] = section_counts.get(section_label, 0) + 1
        timeline.append(
            {
                "instance_id": f"{re.sub(r'[^a-z0-9]+', '-', section_label.lower()).strip('-') or 'section'}-{section_counts[section_label]}",
                "label": f"{section_label} {section_counts[section_label]}",
                "section": section_label,
                "transition": transition if transition in valid_transitions else "cut",
                "bars": bars,
                "kind": "section",
                "timeline_index": index - 1,
            }
        )
    return timeline or None


def _normalize_steps(steps: list[int], step_length: int) -> list[int]:
    values = steps[:step_length]
    while len(values) < step_length:
        values.append(0)
    return values


def _inactive_phrase(symbol: str = ".") -> dict[str, Any]:
    return {
        "active": False,
        "velocity": 0,
        "accent": False,
        "gate_steps": 0,
        "note_offset": 0,
        "symbol": symbol,
    }


def _normalize_phrases(phrases: list[dict[str, Any]], step_length: int) -> list[dict[str, Any]]:
    values = phrases[:step_length]
    while len(values) < step_length:
        values.append(_inactive_phrase())
    return values


def _phrase_for_symbol(char: str) -> dict[str, Any]:
    if char in {"x", "1", "K", "S", "H", "C"}:
        return {"active": True, "velocity": 96, "accent": False, "gate_steps": 1, "note_offset": 0, "symbol": "x"}
    if char in {"X", "*", "#"}:
        return {"active": True, "velocity": 122, "accent": True, "gate_steps": 1, "note_offset": 0, "symbol": "X"}
    if char in {"o", "g"}:
        return {"active": True, "velocity": 58, "accent": False, "gate_steps": 1, "note_offset": 0, "symbol": "o"}
    if char == "^":
        return {"active": True, "velocity": 108, "accent": True, "gate_steps": 1, "note_offset": 7, "symbol": "^"}
    if char == "v":
        return {"active": True, "velocity": 88, "accent": False, "gate_steps": 1, "note_offset": -5, "symbol": "v"}
    return _inactive_phrase(char)


def _derive_automation_values(seed: str, step_length: int, default_value: float) -> list[float]:
    values: list[float] = []
    last_value = default_value
    for char in seed.strip():
        if char in {"|", " ", "\t", "\n", "\r", ","}:
            continue
        if char in {".", "-", "_"}:
            values.append(last_value)
            continue
        if char.upper() in "0123456789ABCDEF":
            last_value = int(char, 16) / 15
            values.append(last_value)
    if not values:
        values = [default_value] * step_length
    while len(values) < step_length:
        values.append(last_value)
    return values[:step_length]


def _derive_phrases(seed: str, step_length: int | None = None) -> list[dict[str, Any]]:
    cleaned = seed.strip()
    phrases: list[dict[str, Any]] = []
    last_active_index: int | None = None
    for char in cleaned:
        if char in {"|", " ", "\t", "\n", "\r"}:
            continue
        if char == "=":
            if last_active_index is not None:
                phrases[last_active_index]["gate_steps"] += 1
            phrases.append(_inactive_phrase("="))
            continue
        if char in {"x", "X", "*", "#", "1", "K", "S", "H", "C", "o", "g", "^", "v", "-", ".", "0", "_"}:
            phrases.append(_phrase_for_symbol(char))
            if phrases[-1]["active"]:
                last_active_index = len(phrases) - 1
    if not phrases:
        fallback_length = step_length or 16
        phrases = [_phrase_for_symbol("X" if index % 4 == 0 else ".") for index in range(fallback_length)]
    if step_length is None:
        inferred_bars = max(1, ceil(len(phrases) / 16))
        step_length = inferred_bars * 16
    return _normalize_phrases(phrases, step_length)


def _derive_steps(seed: str, step_length: int | None = None) -> list[int]:
    phrases = _derive_phrases(seed, step_length)
    return [1 if phrase["active"] else 0 for phrase in phrases]


def _engine_for_track(name: str, source: str) -> str:
    lowered = name.lower()
    if any(token in lowered for token in ("drum", "kick", "snare", "hat", "sample", "sampler")):
        return "sampler"
    if any(token in lowered for token in ("bass", "lead", "pad", "arp", "synth")):
        return "synth"
    if source == "mml":
        return "synth"
    return "stub-player"


def _phrases_for_track_block(body: str, start_index: int, end_index: int, fallback_seed: str, step_length: int | None) -> list[dict[str, Any]]:
    track_block = body[start_index:end_index]
    steps_match = STEPS_PATTERN.search(track_block)
    if steps_match:
        return _derive_phrases(steps_match.group("steps"), step_length)
    return _derive_phrases(fallback_seed + track_block, step_length)


def _collect_tracks(markdown: str, fences: list[dict[str, str]], step_length: int | None = None) -> list[TrackPreview]:
    tracks: list[TrackPreview] = []

    for fence in fences:
        lang = fence["lang"].lower()
        if lang == "groovebox-sections":
            continue
        body = fence["body"]
        track_matches = list(TRACK_PATTERN.finditer(body))
        matched = False
        for index, track_match in enumerate(track_matches):
            name = track_match.group("name").strip()
            next_start = track_matches[index + 1].start() if index + 1 < len(track_matches) else len(body)
            phrases = _phrases_for_track_block(body, track_match.end(), next_start, name, step_length)
            tracks.append(
                TrackPreview(
                    name=name,
                    engine=_engine_for_track(name, lang or "text"),
                    source=lang or "text",
                    steps=[1 if phrase["active"] else 0 for phrase in phrases],
                    phrases=phrases,
                    automation={},
                )
            )
            matched = True
        if not matched:
            phrases = _derive_phrases(body, step_length)
            default_name = f"{lang or 'markdown'}-{len(tracks) + 1}"
            tracks.append(
                TrackPreview(
                    name=default_name,
                    engine=_engine_for_track(default_name, lang or "text"),
                    source=lang or "text",
                    steps=[1 if phrase["active"] else 0 for phrase in phrases],
                    phrases=phrases,
                    automation={},
                )
            )

    if tracks:
        return tracks

    markdown_tracks: dict[str, TrackPreview] = {}
    track_order: list[str] = []
    markdown_step_length = step_length or 16
    for match in LIST_TRACK_PATTERN.finditer(markdown):
        name = match.group("name").strip()
        body = match.group("body").strip()
        if "." in name:
            track_name, lane_name = [part.strip() for part in name.rsplit(".", 1)]
            if lane_name in AUTOMATION_DEFAULTS and track_name in markdown_tracks:
                markdown_tracks[track_name].automation[lane_name] = _derive_automation_values(
                    body,
                    markdown_step_length,
                    AUTOMATION_DEFAULTS[lane_name],
                )
            continue
        phrases = _derive_phrases(body, step_length)
        markdown_tracks[name] = TrackPreview(
            name=name,
            engine=_engine_for_track(name, "markdown"),
            source="markdown",
            steps=[1 if phrase["active"] else 0 for phrase in phrases],
            phrases=phrases,
            automation={},
        )
        track_order.append(name)

    for name in track_order:
        tracks.append(markdown_tracks[name])

    if tracks:
        return tracks

    return [
        (lambda phrases: TrackPreview(
            name="main-pattern",
            engine="stub-player",
            source="markdown",
            steps=[1 if phrase["active"] else 0 for phrase in phrases],
            phrases=phrases,
            automation={},
        ))(_derive_phrases(markdown, step_length))
    ]


def _parse_section_fence(fences: list[dict[str, str]], total_steps: int) -> list[dict[str, Any]] | None:
    for fence in fences:
        if fence["lang"].lower() != "groovebox-sections":
            continue
        try:
            payload = json.loads(fence["body"])
        except json.JSONDecodeError:
            return None
        source_sections = payload.get("sections") if isinstance(payload, dict) else payload
        if not isinstance(source_sections, list):
            return None
        sections: list[dict[str, Any]] = []
        for index, section in enumerate(source_sections, start=1):
            if not isinstance(section, dict):
                continue
            label = str(section.get("label") or f"S{index}")
            source_tracks = section.get("tracks") or []
            tracks: list[dict[str, Any]] = []
            for track_index, track in enumerate(source_tracks, start=1):
                if not isinstance(track, dict):
                    continue
                seed_steps = _normalize_steps(track.get("steps") or [], total_steps)
                phrases = _normalize_phrases(
                    track.get("phrases")
                    or [
                        _phrase_for_symbol("x" if step else ".")
                        for step in seed_steps
                    ],
                    total_steps,
                )
                steps = _normalize_steps(
                    track.get("steps") or [1 if phrase["active"] else 0 for phrase in phrases],
                    total_steps,
                )
                tracks.append(
                    {
                        "name": str(track.get("name") or track.get("track_id") or f"track-{track_index}"),
                        "engine": str(track.get("engine") or "stub-player"),
                        "source": str(track.get("source") or "groovebox-sections"),
                        "steps": steps,
                        "phrases": phrases,
                        "automation": {
                            lane_name: _derive_automation_values("", total_steps, AUTOMATION_DEFAULTS[lane_name])
                            if not values
                            else (list(values[:total_steps]) + [values[-1]] * max(0, total_steps - len(values)))
                            for lane_name, values in (track.get("automation") or {}).items()
                            if lane_name in AUTOMATION_DEFAULTS and isinstance(values, list) and values
                        },
                    }
                )
            sections.append({"label": label, "tracks": tracks})
        return sections or None
    return None


def parse_markdown_spec(markdown: str) -> dict[str, Any]:
    frontmatter = _parse_frontmatter(markdown)
    title_match = TITLE_PATTERN.search(markdown)
    title = (
        frontmatter.get("title")
        or (title_match.group("title").strip() if title_match else None)
        or "Untitled Groovebox Spec"
    )
    tempo_match = TEMPO_PATTERN.search(markdown) or MML_TEMPO_PATTERN.search(markdown)
    tempo = int(frontmatter.get("tempo", tempo_match.group("tempo") if tempo_match else 120))

    fences = [
        {
            "lang": match.group("lang").strip() or "text",
            "body": match.group("body").strip(),
        }
        for match in FENCE_PATTERN.finditer(markdown)
    ]
    requested_bars = _parse_bars(frontmatter)
    requested_step_length = requested_bars * 16 if requested_bars else None
    tracks = _collect_tracks(markdown, fences, requested_step_length)
    max_track_steps = max((len(track.steps) for track in tracks), default=16)
    bars = requested_bars or max(1, ceil(max_track_steps / 16))
    total_steps = bars * 16
    arrangement = _parse_arrangement(frontmatter, bars)
    timeline = _parse_timeline(frontmatter, arrangement, bars)
    normalized_tracks = [
        {
            "name": track.name,
            "engine": track.engine,
            "source": track.source,
            "steps": _normalize_steps(track.steps, total_steps),
            "phrases": _normalize_phrases(track.phrases, total_steps),
            "automation": {
                lane_name: _derive_automation_values("", total_steps, AUTOMATION_DEFAULTS[lane_name])
                if not values
                else (values[:total_steps] + [values[-1]] * max(0, total_steps - len(values)))
                for lane_name, values in track.automation.items()
            },
        }
        for track in tracks
    ]
    sections = _parse_section_fence(fences, total_steps)

    return {
        "title": title,
        "tempo": tempo,
        "bars": bars,
        "arrangement": arrangement,
        "timeline": timeline,
        "sections": sections,
        "arrangement_bars": sum(section["bars"] * section["repeats"] for section in arrangement),
        "steps_per_bar": 16,
        "step_count": total_steps,
        "frontmatter": frontmatter,
        "fences": fences,
        "tracks": normalized_tracks,
        "supported_exports": ["midi", "wav", "songscribe-pattern"],
    }
