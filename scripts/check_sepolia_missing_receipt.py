#!/usr/bin/env python3
"""Read-only verification of a 32-byte Sepolia tx hash intended to be UNVERIFIABLE.

Zero signing, zero funds, no transaction submission. Exit nonzero on any unexpected
API success, shape, error, timeout or rate limit. Testing a definitely absent
receipt must never be confused with an INELIGIBLE, verifiable receipt.
"""
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from urllib.parse import quote
import json, re, sys

HASH = "0x" + ("0" * 63) + "1"
BASE = "https://eth-sepolia.blockscout.com/api/v2/transactions/"
assert re.fullmatch(r"0x[0-9a-f]{64}", HASH)
URL = BASE + quote(HASH, safe="")
req = Request(URL, headers={"User-Agent": "COVERDICT-ReadOnly-UNVERIFIABLE-Probe/1.0", "Accept": "application/json"})

def main():
    try:
        with urlopen(req, timeout=18) as response:
            body = response.read(200_000)
            result = json.loads(body.decode("utf-8"))
            if response.status != 200:
                raise RuntimeError(f"Unexpected 2xx status: {response.status}")
            # Conservative rule: do not use a fabricated candidate if API claims it exists.
            if isinstance(result, dict) and isinstance(result.get("hash"), str):
                raise RuntimeError(f"STOP: Blockscout returned a transaction hash: {result['hash']}")
            raise RuntimeError("STOP: Received HTTP 200 with unrecognized payload. Inspect manually before using as missing evidence.")
    except HTTPError as exc:
        payload = exc.read(1000).decode("utf-8", errors="replace")
        if exc.code != 404:
            raise RuntimeError(f"API returned HTTP {exc.code}, not confirmed missing receipt: {payload[:200]}") from exc
        print(f"PASS: Blockscout Sepolia confirmed nonexistent receipt: {HASH}")
        print(f"API returned HTTP 404: {payload[:300]}")
        print("This is not an on-chain GenLayer UNVERIFIABLE verdict. A separate wallet must submit the hash on an OPEN_FOR_CLAIMS program, then resolve_claim.")
        return 0

if __name__ == "__main__":
    sys.exit(main())
