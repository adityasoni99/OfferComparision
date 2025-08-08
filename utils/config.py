"""
Configuration loader for OfferCompare Pro.

Reads environment variables and provides typed accessors.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class AppConfig:
    default_ai_provider: str | None
    enable_cache: bool
    cache_ttl_seconds: int


def get_config() -> AppConfig:
    provider = os.environ.get("DEFAULT_AI_PROVIDER")
    enable_cache = os.environ.get("OFFERCOMPARE_ENABLE_CACHE", "0").strip() in {"1", "true", "yes"}
    ttl = int(os.environ.get("OFFERCOMPARE_CACHE_TTL", "86400"))  # 1 day default
    return AppConfig(
        default_ai_provider=provider.lower() if provider else None,
        enable_cache=enable_cache,
        cache_ttl_seconds=ttl,
    )


