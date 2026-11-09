import time
from collections import defaultdict
from fastapi import Request, HTTPException, status

class InMemoryRateLimiter:
    """
    Sliding-window IP rate limiter.
    Default: 20 requests per minute per IP.
    """
    def __init__(self, max_requests: int = 20, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.ip_history = defaultdict(list)

    def check_rate_limit(self, request: Request):
        # Extract real client IP address, supporting X-Forwarded-For behind reverse proxies
        xff = request.headers.get("x-forwarded-for", "").strip()
        if xff:
            client_ip = xff.split(",")[0].strip()
        elif request.client and request.client.host:
            client_ip = request.client.host.strip()
        else:
            client_ip = "unknown"

        now = time.time()
        window_start = now - self.window_seconds

        # Prune older entries
        self.ip_history[client_ip] = [
            timestamp for timestamp in self.ip_history[client_ip] if timestamp > window_start
        ]

        if len(self.ip_history[client_ip]) >= self.max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Maximum 20 requests per minute allowed.",
            )

        self.ip_history[client_ip].append(now)

    def reset(self):
        """Used in test environments"""
        self.ip_history.clear()

# Global instance for the application
rate_limiter = InMemoryRateLimiter(max_requests=20, window_seconds=60)

