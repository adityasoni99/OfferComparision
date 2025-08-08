"""
Simple file-based caching utilities.

Caching is opt-in via environment flags to avoid interfering with tests.
"""

from __future__ import annotations

import os
import json
import time
import hashlib
from typing import Any, Optional


def _ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def get_cache_dir(namespace: str = "default") -> str:
    base_dir = os.environ.get("OFFERCOMPARE_CACHE_DIR", os.path.join(os.getcwd(), ".cache"))
    path = os.path.join(base_dir, namespace)
    _ensure_dir(path)
    return path


def _stable_json_dumps(data: Any) -> str:
    return json.dumps(data, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def compute_hash(*parts: Any) -> str:
    hasher = hashlib.sha256()
    for part in parts:
        if isinstance(part, (bytes, bytearray)):
            hasher.update(part)
        else:
            hasher.update(_stable_json_dumps(part).encode("utf-8"))
    return hasher.hexdigest()


def cache_get(key: str, namespace: str = "default") -> Optional[Any]:
    path = os.path.join(get_cache_dir(namespace), f"{key}.json")
    if not os.path.exists(path):
        return None
    try:
        with open(path, "r", encoding="utf-8") as f:
            payload = json.load(f)
        # TTL check
        ttl = payload.get("ttl")
        created_at = payload.get("created_at", 0)
        if ttl is not None and ttl > 0:
            if time.time() - created_at > ttl:
                # Expired
                try:
                    os.remove(path)
                except OSError:
                    pass
                return None
        return payload.get("value")
    except Exception:
        return None


def cache_set(key: str, value: Any, namespace: str = "default", ttl_seconds: int = 0) -> None:
    path = os.path.join(get_cache_dir(namespace), f"{key}.json")
    payload = {
        "created_at": time.time(),
        "ttl": int(ttl_seconds or 0),
        "value": value,
    }
    try:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False)
    except Exception:
        # Best-effort cache write
        pass


def cached_call(namespace: str, ttl_seconds: int, key_parts: list[Any]):
    """
    Simple decorator-like helper; call as:
      cached = cached_call("llm", 86400, [provider, model, prompt])(lambda: call())
      result = cached()
    """

    key = compute_hash(*key_parts)

    def _wrapper(fn):
        def inner():
            cached_value = cache_get(key, namespace)
            if cached_value is not None:
                return cached_value
            value = fn()
            cache_set(key, value, namespace, ttl_seconds)
            return value

        return inner

    return _wrapper


