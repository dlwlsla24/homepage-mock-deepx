#!/usr/bin/env python3
"""Static mirror of https://deepx.ai/ — downloads HTML, CSS, JS, fonts, images
and rewrites all absolute URLs to local relative paths for a faithful offline copy."""

import os, re, sys, hashlib, urllib.parse, urllib.request, mimetypes

ROOT = "https://deepx.ai/"
OUT = os.path.dirname(os.path.abspath(__file__))
HDRS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    "Accept": "*/*",
}

# host -> local subdir
HOST_DIRS = {
    "cdn.deepx.ai": "cdn",
    "deepx.ai": "site",
    "www.deepx.ai": "site",
    "fonts.googleapis.com": "fonts/css",
    "fonts.gstatic.com": "fonts/files",
    "unpkg.com": "vendor",
    "www.googletagmanager.com": "vendor/gtm",
}

downloaded = {}   # url -> local relative path (from OUT)
queue = []
seen = set()

def fetch(url):
    req = urllib.request.Request(url, headers=HDRS)
    with urllib.request.urlopen(req, timeout=60) as r:
        ctype = r.headers.get("Content-Type", "")
        return r.read(), ctype

def ext_from(url, ctype):
    path = urllib.parse.urlparse(url).path
    e = os.path.splitext(path)[1].lower()
    if e and len(e) <= 6:
        return e
    guess = mimetypes.guess_extension((ctype or "").split(";")[0].strip()) or ""
    if "css" in ctype: return ".css"
    if "javascript" in ctype: return ".js"
    if "woff2" in ctype: return ".woff2"
    return guess or ".bin"

def local_path_for(url, ctype=""):
    """Map a remote URL to a local relative path under OUT."""
    p = urllib.parse.urlparse(url)
    host = p.netloc
    base = HOST_DIRS.get(host, "ext/" + re.sub(r"[^a-z0-9.-]", "_", host))
    path = p.path
    if not path or path.endswith("/"):
        path += "index" + ext_from(url, ctype)
    # google fonts css endpoint has no extension
    if host == "fonts.googleapis.com":
        h = hashlib.md5((url).encode()).hexdigest()[:8]
        return f"{base}/font_{h}.css"
    if not path.startswith("/"):
        path = "/" + path
    # routes without a file extension -> save as a directory index
    stem_ext = os.path.splitext(path)[1]
    if not stem_ext:
        path = path.rstrip("/") + "/index.html"
    rel = base + path
    if p.query:
        # keep query out of filename but make unique if needed
        stem, e = os.path.splitext(rel)
        h = hashlib.md5(p.query.encode()).hexdigest()[:6]
        rel = f"{stem}.{h}{e}" if e else f"{stem}.{h}"
    rel = rel.lstrip("/")
    return rel

def save(rel, data):
    full = os.path.join(OUT, rel.replace("/", os.sep))
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "wb") as f:
        f.write(data)

def rel_from(from_rel, to_rel):
    """Relative link from the directory of from_rel to to_rel."""
    frm_dir = os.path.dirname(from_rel)
    r = os.path.relpath(to_rel, frm_dir if frm_dir else ".")
    return r.replace(os.sep, "/")

URL_RE_CSS = re.compile(r"url\(\s*['\"]?([^'\")]+?)['\"]?\s*\)")
IMPORT_RE = re.compile(r"@import\s+(?:url\()?['\"]([^'\")]+)['\"]\)?")

def absolutize(base_url, link):
    link = link.strip()
    if link.startswith("data:") or link.startswith("#") or link.startswith("mailto:") \
       or link.startswith("tel:") or link.startswith("javascript:"):
        return None
    return urllib.parse.urljoin(base_url, link)

EXCLUDE_RE = re.compile(r"/wp-json/|/feed/?$|/comments/feed|xmlrpc\.php|/oembed/|/wp-login|/wp-admin|\?rest_route=")

def want(url):
    host = urllib.parse.urlparse(url).netloc
    if host not in HOST_DIRS:
        return False
    if EXCLUDE_RE.search(url):
        return False
    return True

def process_css(css_text, css_url, css_rel):
    """Download url()/@import targets in CSS, rewrite to local relative paths."""
    def repl_url(m):
        raw = m.group(1)
        au = absolutize(css_url, raw)
        if not au or not want(au):
            return m.group(0)
        local = ensure(au)
        if not local:
            return m.group(0)
        return f"url({rel_from(css_rel, local)})"
    def repl_import(m):
        raw = m.group(1)
        au = absolutize(css_url, raw)
        if not au or not want(au):
            return m.group(0)
        local = ensure(au, is_css=True)
        if not local:
            return m.group(0)
        return f'@import "{rel_from(css_rel, local)}"'
    css_text = IMPORT_RE.sub(repl_import, css_text)
    css_text = URL_RE_CSS.sub(repl_url, css_text)
    return css_text

def ensure(url, is_css=False):
    """Download url (and its sub-assets) once; return its local rel path."""
    url = url.split("#")[0]
    if url in downloaded:
        return downloaded[url]
    if url in seen:
        return downloaded.get(url)
    seen.add(url)
    try:
        data, ctype = fetch(url)
        _ = ctype
    except Exception as e:
        print(f"  ! fail {url} :: {e}")
        return None
    rel = local_path_for(url, ctype)
    downloaded[url] = rel
    if is_css or "css" in ctype or rel.endswith(".css"):
        try:
            text = data.decode("utf-8", "replace")
            text = process_css(text, url, rel)
            save(rel, text.encode("utf-8"))
        except Exception as e:
            print(f"  ! css parse {url} :: {e}")
            save(rel, data)
    else:
        save(rel, data)
    print(f"  + {rel}")
    return rel

# ---------------- HTML ----------------
def main():
    print("Fetching root HTML...")
    html, _ = fetch(ROOT)
    html = html.decode("utf-8", "replace")

    # Attributes that hold URLs we want to localize
    # handle href, src, content (og:image), data-src, poster, and srcset specially
    def repl_attr(m):
        attr, quote, val = m.group("attr"), m.group("q"), m.group("val")
        # 'content' is used by many meta tags; only localize true URLs
        if attr == "content" and not re.match(r'https?://|/[^/]', val):
            return m.group(0)
        au = absolutize(ROOT, val)
        if not au or not want(au):
            return m.group(0)
        is_css = attr == "href" and (".css" in val or "fonts.googleapis" in au)
        local = ensure(au, is_css=is_css)
        if not local:
            return m.group(0)
        return f'{attr}={quote}{local}{quote}'

    attr_re = re.compile(
        r'(?P<attr>href|src|data-src|data-lazy-src|poster|content)=(?P<q>["\'])(?P<val>[^"\']+)(?P=q)')
    # srcset (comma separated url size)
    def repl_srcset(m):
        attr, quote, val = m.group("attr"), m.group("q"), m.group("val")
        parts = []
        for piece in val.split(","):
            piece = piece.strip()
            if not piece:
                continue
            bits = piece.split()
            u = bits[0]
            au = absolutize(ROOT, u)
            if au and want(au):
                local = ensure(au)
                if local:
                    bits[0] = local
            parts.append(" ".join(bits))
        return f'{attr}={quote}{", ".join(parts)}{quote}'
    srcset_re = re.compile(r'(?P<attr>srcset|data-srcset|imagesrcset)=(?P<q>["\'])(?P<val>[^"\']+)(?P=q)')

    # inline style="...url(...)"
    def repl_inline_style(m):
        quote, val = m.group("q"), m.group("val")
        def u(mm):
            au = absolutize(ROOT, mm.group(1))
            if au and want(au):
                local = ensure(au)
                if local:
                    return f"url({local})"
            return mm.group(0)
        return f'style={quote}{URL_RE_CSS.sub(u, val)}{quote}'
    style_re = re.compile(r'style=(?P<q>["\'])(?P<val>[^"\']*url\([^"\']*)(?P=q)')

    html = srcset_re.sub(repl_srcset, html)
    html = attr_re.sub(repl_attr, html)
    html = style_re.sub(repl_inline_style, html)

    # inline <style> blocks may contain url()
    def repl_style_block(m):
        inner = m.group(1)
        inner2 = process_css(inner, ROOT, "index.html")
        return m.group(0).replace(inner, inner2)
    html = re.sub(r"<style[^>]*>(.*?)</style>", repl_style_block, html, flags=re.S)

    # The original declares UTF-8 only ~2KB into <head> (past the browser's
    # 1024-byte sniff window) and relies on an HTTP charset header. When served
    # by a plain static server that omits that header, the page mis-decodes.
    # Inject an early <meta charset> so the clone renders correctly anywhere.
    if "charset=utf-8" not in html[:1024].lower():
        html = re.sub(r"(<head[^>]*>)", r'\1<meta charset="utf-8">', html, count=1)

    # Re-attach the accessible header stylesheet (kept in a separate file).
    if 'href="header.css"' not in html:
        html = re.sub(r"(<head[^>]*>)", r'\1<link rel="stylesheet" href="header.css">',
                      html, count=1)

    # Re-attach the scroll-reveal stylesheet (furiosa-style fade/rise on scroll).
    if 'href="reveal.css"' not in html:
        html = re.sub(r"(<head[^>]*>)", r'\1<link rel="stylesheet" href="reveal.css">',
                      html, count=1)

    # Re-attach the event popup stylesheet (dark seminar announcement modal).
    if 'href="popup.css"' not in html:
        html = re.sub(r"(<head[^>]*>)", r'\1<link rel="stylesheet" href="popup.css">',
                      html, count=1)

    # Re-attach the accessible header controller. Injected right after the
    # opening <body> tag (not at the end) so the header paints with the first
    # content instead of popping in after the whole page parses. It still runs
    # before i18n.js, so __DEEPX_HEADER_PRESENT__ is set in time.
    if 'src="header.js"' not in html:
        html = re.sub(r"(<body[^>]*>)", r'\1<script src="header.js"></script>',
                      html, count=1)

    # Re-attach the fullscreen intro hero video (rebellions.ai-style). Injected
    # as the first child of the site wrapper so it paints above all content.
    # The mp4 lives in assets/ (outside this script's download scope) and is
    # preserved across re-runs.
    if 'id="dpx-hero-video"' not in html:
        hero = (
            '<section id="dpx-hero-video" aria-label="DEEPX intro video">'
            '<video class="dpx-hero-video__media" autoplay muted loop playsinline '
            'preload="auto" poster="cdn/wp-content/uploads/2026/06/10165752/'
            '2026-0610-DEEPX-Main-Tokyo-Physical-AI-Expo-2026-Web-PC-Thumnail-Banner.png">'
            '<source src="assets/hero.webm" type="video/webm">'
            '<source src="assets/hero.mp4" type="video/mp4"></video>'
            '<div class="dpx-hero-video__overlay"></div>'
            '<button type="button" class="dpx-hero-video__scroll" '
            'aria-label="Scroll to content">'
            '<span class="dpx-hero-video__scroll-line"></span></button></section>'
        )
        html = re.sub(r'(<div[^>]*class="jupiterx-site"[^>]*>)',
                      r"\1" + hero, html, count=1)

    # Re-attach the scroll-reveal controller (before i18n so dictionaries apply
    # to revealed nodes too; it only toggles classes, never replaces markup).
    if 'src="reveal.js"' not in html and "</body>" in html:
        html = html.replace("</body>", '<script src="reveal.js"></script></body>', 1)

    # Re-attach the event popup controller (before i18n so its inserted text is
    # picked up and translated by the KO/EN dictionary).
    if 'src="popup.js"' not in html and "</body>" in html:
        html = html.replace("</body>", '<script src="popup.js"></script></body>', 1)

    # Re-attach the KO/EN i18n layer (kept in a separate file, not overwritten).
    if 'src="i18n.js"' not in html and "</body>" in html:
        html = html.replace("</body>", '<script src="i18n.js"></script></body>', 1)

    with open(os.path.join(OUT, "index.html"), "w", encoding="utf-8") as f:
        f.write(html)
    print(f"\nDone. {len(downloaded)} assets saved.")

if __name__ == "__main__":
    main()
