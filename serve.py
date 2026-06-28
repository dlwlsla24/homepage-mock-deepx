#!/usr/bin/env python3
"""Tiny static dev server for the DEEPX mirror site.

Identical to `python -m http.server` but sends no-cache headers so the
browser never serves a stale helper script/stylesheet during iterative
development. (Plain http.server relies on Last-Modified, which browsers
cache heuristically — that caused old popup.js/i18n.js copies to keep
running after edits.)
"""
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8100
    directory = sys.argv[2] if len(sys.argv) > 2 else "."
    handler = partial(NoCacheHandler, directory=directory)
    httpd = ThreadingHTTPServer(("", port), handler)
    print(f"Serving {directory} on http://localhost:{port} (no-cache)")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
