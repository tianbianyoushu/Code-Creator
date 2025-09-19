from __future__ import annotations

import base64
import uuid
from pathlib import Path

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AutoScore Demo API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sample assets ---------------------------------------------------------------

SAMPLE_PIANO_XML = Path(__file__).with_name("samples_piano.musicxml").read_text(encoding="utf-8")
SAMPLE_GUITAR_XML = Path(__file__).with_name("samples_guitar.musicxml").read_text(encoding="utf-8")

with Path(__file__).with_name("samples_piano.mid").open("rb") as fh:
    SAMPLE_PIANO_MIDI_B64 = base64.b64encode(fh.read()).decode("ascii")
with Path(__file__).with_name("samples_guitar.mid").open("rb") as fh:
    SAMPLE_GUITAR_MIDI_B64 = base64.b64encode(fh.read()).decode("ascii")

# Minimal PDF assets (generated offline via jsPDF for consistency)
SAMPLE_PIANO_PDF_B64 = (
    "JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlIC9DYXRhbG9nL1BhZ2VzIDIgMCBSL0xhbmcgKAo" 
    "vQXV0b1Njb3JlIERlbW8pPj4KZW5kb2JqCjIgMCBvYmoKPDwvVHlwZSAvUGFnZXMvQ291bnQgMS9LZH" 
    "MgWyAzIDAgUiBdPj4KZW5kb2JqCjMgMCBvYmoKPDwvVHlwZSAvUGFnZS9QYXJlbnQgMiAwIFIvTWVkaW" 
    "FCb3ggWzAgMCA1OTUgODQyXS9Db250ZW50cyA0IDAgUi9SZXNvdXJjZXMgPDwvRm9udCA8PC9GMCA1ID" 
    "AgUj4+Pj4+PgplbmRvYmoKNCAwIG9iago8PC9MZW5ndGggMTQ4Pj4Kc3RyZWFtCkJUIAovRjAgMjQgVGQK" 
    "VGoKMC4wIDU4Mi4wIFRkCk1DCi9GMCBUZgowLjAgNTc0LjAgVGQKKEF1dG9TY29yZSBEZW1vKSBUagpUag" 
    "pNQwovRjAgMTIgVGYKMC4wIDUzMi4wIFRkCihQaWFubyBkZW1vIGdlbmVyYXRlZCBwZGYpIFRqClRqCk1D" 
    "Ci9GMCAnIFRmCjAuMCA1MTIuMCBUZAooVGhpcyBwZGYgd2FzIGNyZWF0ZWQgYXMgYSBwbGFjZWhvbGRlci" 
    "EgKSBUagoKRVQKZW5kc3RyZWFtCmVuZG9iago1IDAgb2JqCjw8L1R5cGUgL0ZvbnQvU3VidHlwZSAvVHlwZ" 
    "TJcL0Jhc2VGb250IC9IZWx2ZXRpY2EtQm9sZC9FbmNvZGluZyAvV2luQW5zaUVuY29kaW5nPj4KZW5kb2Jq" 
    "CnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDg4MiAwMDAwMCBuIAowMDAwMDAwMTQ2ID" 
    "AwMDAwIG4gCjAwMDAwMDAzMDggMDAwMDAgbiAKMDAwMDAwMDM3MiAwMDAwMCBuIAowMDAwMDAwNjAwIDAwM" 
    "DAwIG4gCnRyYWlsZXIKPDwvU2l6ZSA2L1Jvb3QgMSAwIFIvSW5mbyA2IDAgUj4+CiUlRU9G"
)

SAMPLE_GUITAR_PDF_B64 = (
    "JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlIC9DYXRhbG9nL1BhZ2VzIDIgMCBSL0xhbmcgKAov" 
    "QXV0b1Njb3JlIERlbW8gR1VJVEFSKSk+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlIC9QYWdlcy9Db3VudC" 
    "AxL0tkcyBbIDMgMCBSIF0+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlIC9QYWdlL1BhcmVudCAyIDAgUi9N" 
    "ZWRpYUJveCBbMCAwIDU5NSA4NDJdL0NvbnRlbnRzIDQgMCBSL1Jlc291cmNlcyA8PC9Gb250IDw8L0YwID" 
    "UgMCBSID4+Pj4+PgplbmRvYmoKNCAwIG9iago8PC9MZW5ndGggMTUwPj4Kc3RyZWFtCkJUIAovRjAgMjQgV" 
    "GQKVGoKMC4wIDU4Mi4wIFRkCk1DCi9GMCBUZgowLjAgNTc0LjAgVGQKKEF1dG9TY29yZSBEZW1vIEdNSVIp" 
    "IFRqClRqCk1DCi9GMCAnIFRmCjAuMCA1MzIuMCBUZAooR2l0YXIgVEFCIGRlbW8gcGRmKSBUagoKRVQKZW5k" 
    "c3RyZWFtCmVuZG9iago1IDAgb2JqCjw8L1R5cGUgL0ZvbnQvU3VidHlwZSAvVHlwZTJcL0Jhc2VGb250IC9I" 
    "ZWx2ZXRpY2EtQm9sZC9FbmNvZGluZyAvV2luQW5zaUVuY29kaW5nPj4KZW5kb2JqCnhyZWYKMCA2CjAwMDAw" 
    "MDAwMDAgNjU1MzUgZiAKMDAwMDAwMDg4MiAwMDAwMCBuIAowMDAwMDAwMTQ0IDAwMDAwIG4gCjAwMDAwMDAz" 
    "MDYgMDAwMDAgbiAKMDAwMDAwMDM3MCAwMDAwMCBuIAowMDAwMDAwNjAyIDAwMDAwIG4gCnRyYWlsZXIKPDwv" 
    "U2l6ZSA2L1Jvb3QgMSAwIFIvSW5mbyA2IDAgUj4+CiUlRU9G"
)


# Helpers --------------------------------------------------------------------


def _make_data_url(mime: str, b64_value: str) -> str:
    return f"data:{mime};base64,{b64_value}"


def _get_assets(mode: str) -> dict[str, str]:
    mode = (mode or "piano").lower()
    if mode == "guitar":
        return {
            "mode": "guitar",
            "musicxml": SAMPLE_GUITAR_XML,
            "pdf": _make_data_url("application/pdf", SAMPLE_GUITAR_PDF_B64),
            "midi": _make_data_url("audio/midi", SAMPLE_GUITAR_MIDI_B64),
        }
    return {
        "mode": "piano",
        "musicxml": SAMPLE_PIANO_XML,
        "pdf": _make_data_url("application/pdf", SAMPLE_PIANO_PDF_B64),
        "midi": _make_data_url("audio/midi", SAMPLE_PIANO_MIDI_B64),
    }


# Routes ---------------------------------------------------------------------

@app.post("/api/process-audio")
async def process_audio(
    file: UploadFile = File(...),
    scoreMode: str = Form("piano"),
):
    assets = _get_assets(scoreMode)

    return {
        "jobId": uuid.uuid4().hex,
        "mode": assets["mode"],
        "musicXml": assets["musicxml"],
        "summary": {
            "durationSec": 16.0,
            "tempoBpm": 96,
            "pitchRange": {"min": "C4", "max": "A5"},
            "confidence": 0.82,
        },
        "downloads": [
            {
                "type": "pdf",
                "label": "PDF をダウンロード",
                "url": assets["pdf"],
                "filename": f"autoscore-demo-{assets['mode']}.pdf",
            },
            {
                "type": "musicxml",
                "label": "MusicXML をダウンロード",
                "url": _make_data_url(
                    "application/vnd.recordare.musicxml+xml",
                    base64.b64encode(assets["musicxml"].encode("utf-8")).decode("ascii"),
                ),
                "filename": f"autoscore-demo-{assets['mode']}.musicxml",
            },
            {
                "type": "midi",
                "label": "MIDI をダウンロード",
                "url": assets["midi"],
                "filename": f"autoscore-demo-{assets['mode']}.mid",
            },
        ],
    }


@app.get("/health")
async def health_check():
    return {"status": "ok"}
