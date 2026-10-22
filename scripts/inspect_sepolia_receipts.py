#!/usr/bin/env python3
"""Find a real, public Sepolia receipt for a COVERDICT INELIGIBLE test.

This script reads Blockscout REST only. It sends no transactions and holds no keys.
It validates the exact JSON shape/size consumed by contracts/Coverdict.py.
The receiver or sender and timestamp should NOT match the demo program's policy.
"""
import json
import re
import sys
import urllib.request
from datetime import datetime, timezone

BASE = "https://eth-sepolia.blockscout.com/api/v2"
PROGRAM_ID = 2
INCIDENT_START = 1792635600
INCIDENT_END = 1792636200
DEMO_RECEIPT = "0xb7e186434d67e72c8e42c8eac3a60a3a45be7b5391245fb3668fe3ade125143a"
DEMO_RECIPIENT = "0xd6b8a3a5eb329410d9504784812b8569afa8c2af"
SENDER_A = "0x4c7cb73ac8f8999af21cfc9ff4cf2333a9508dcb"
SENDER_B = DEMO_RECIPIENT  # User's separate wallet B for the negative test
HEX64 = re.compile(r"0x[0-9a-fA-F]{64}\Z")
HEX40 = re.compile(r"0x[0-9a-fA-F]{40}\Z")

def get(path: str) -> object:
    req = urllib.request.Request(
        BASE + path,
        headers={"User-Agent": "Coverdict-ReadOnly-Acceptance/1.0", "Accept": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=18) as response:
        return json.loads(response.read(120_000).decode("utf-8"))

def iso_ts(value: str) -> int:
    dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if dt.tzinfo is None:
        raise ValueError("Timestamp must include timezone")
    return int(dt.timestamp())

def candidate(payload: dict) -> tuple[bool, str]:
    try:
        if payload.get("status") not in ("ok", "error"):
            return False, "missing status"
        h, origin, destination = payload["hash"], payload["from"]["hash"], payload["to"]["hash"]
        if not HEX64.fullmatch(h) or not HEX40.fullmatch(origin) or not HEX40.fullmatch(destination):
            return False, "invalid hash/address"
        value = payload["value"]
        if not isinstance(value, str) or not value.isdigit():
            return False, "invalid wei"
        t = iso_ts(payload["timestamp"])
        if h.lower() == DEMO_RECEIPT:
            return False, "already used in Program #2"
        if origin.lower() == SENDER_B.lower():
            return False, "transaction belongs to the prospective claimant"
        if not (t < INCIDENT_START or t > INCIDENT_END or destination.lower() != DEMO_RECIPIENT):
            return False, "matches program window/destination"
        if len(json.dumps(payload).encode("utf-8")) > 11_500:
            return False, "API JSON exceeds contract's 12k evidence size limit"
        return True, f"status={payload['status']} wei={value} timestamp={payload['timestamp']} from={origin} to={destination}"
    except (KeyError, TypeError, ValueError) as e:
        return False, type(e).__name__

def main():
    urls = ("/main-page/transactions", "/transactions?filter=validated")
    hashes = []
    for endpoint in urls:
        try:
            body = get(endpoint)
            items = body.get("items", []) if isinstance(body, dict) else []
            for item in items:
                if isinstance(item, dict) and HEX64.fullmatch(str(item.get("hash", ""))):
                    hashes.append(item["hash"])
            print(f"Discovered {len(items)} tx entries from {endpoint}", flush=True)
            if hashes: break
        except Exception as e:
            print(f"Discovery error at {endpoint}: {type(e).__name__}: {e}", flush=True)
    if not hashes:
        raise SystemExit("FAIL: No Sepolia transaction hashes discovered; no candidate may be invented.")
    for h in dict.fromkeys(hashes):
        try:
            p = get("/transactions/" + h)
            if not isinstance(p, dict): continue
            valid, why = candidate(p)
            if valid:
                print("VERIFIED PUBLIC NEGATIVE RECEIPT:", h)
                print(why)
                print("Claimant wallet for Studio test (not the transaction sender):", SENDER_B)
                print("GenLayer Studionet method: submit_claim(2, \"" + h + "\")")
                print("After SUBMITTED: resolve_claim(case_id)")
                print("Expected: DENIED / INELIGIBLE, award_credits=0, wallet B credits unchanged.")
                print("The proof is intentionally NOT eligible. Do not claim the tx belongs to wallet B.")
                return 0
            print("Skipped", h, why, flush=True)
        except Exception as e:
            print(f"Detail error for {h}: {type(e).__name__}: {e}", flush=True)
    raise SystemExit("FAIL: No real receipt met deterministic negative-test conditions. No fabricated success.")

if __name__ == "__main__":
    sys.exit(main())
