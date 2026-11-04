"""Notify IndexNow-enabled search engines of Legacy Kazakhstan page changes.

This script deliberately submits public site URLs only; it does not send secrets.
"""
import json
import os
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from urllib.parse import urlparse
import xml.etree.ElementTree as ET

HOST = "legacyrk.kz"
ORIGIN = f"https://{HOST}"
KEY_FILE = "0759d26fb5c8b24b7c51e1d8f3cb4986.txt"
INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow"
FULL_REFRESH_FILES = {"sitemap.xml", "robots.txt", KEY_FILE,
                      "scripts/notify_indexnow.py",
                      ".github/workflows/notify-indexnow.yml"}


def sitemap_urls():
    root = ET.parse("sitemap.xml").getroot()
    urls = []
    for item in root.iter():
        if item.tag.endswith("loc") and item.text:
            url = item.text.strip()
            parsed = urlparse(url)
            if parsed.scheme == "https" and parsed.netloc == HOST:
                urls.append(url)
    return sorted(set(urls))


def html_url(path):
    path = path.lstrip("/")
    if not path.endswith(".html"):
        return None
    if path == "index.html":
        return ORIGIN + "/"
    if path.endswith("/index.html"):
        return ORIGIN + "/" + path[:-len("index.html")]
    return ORIGIN + "/" + path


def changed_urls():
    all_urls = sitemap_urls()
    if os.environ.get("GITHUB_EVENT_NAME") != "push":
        return all_urls
    event_path = os.environ.get("GITHUB_EVENT_PATH")
    if not event_path:
        return all_urls
    event = json.loads(Path(event_path).read_text(encoding="utf-8"))
    commits = event.get("commits")
    if not commits:
        return all_urls
    changes = set()
    for commit in commits:
        for field in ("added", "modified", "removed"):
            changes.update(commit.get(field, []))
    if changes.intersection(FULL_REFRESH_FILES):
        return all_urls
    selected = sorted({url for p in changes if (url := html_url(p))})
    return selected


def main():
    key_path = Path(KEY_FILE)
    if key_path.read_text(encoding="utf-8").strip() != key_path.stem:
        raise RuntimeError("IndexNow verification key mismatch")
    urls = changed_urls()
    if not urls:
        print("No changed public HTML pages to notify.")
        return
    data = {
        "host": HOST,
        "key": key_path.stem,
        "keyLocation": ORIGIN + "/" + KEY_FILE,
        "urlList": urls,
    }
    request = Request(
        INDEXNOW_ENDPOINT,
        data=json.dumps(data).encode("utf-8"),
        headers={"Content-Type": "application/json; charset=utf-8",
                 "User-Agent": "LegacyKazakhstan-IndexNow/1.0"},
        method="POST",
    )
    print(f"Notifying IndexNow about {len(urls)} page(s)")
    try:
        with urlopen(request, timeout=35) as response:
            code = response.status
            print(f"IndexNow HTTP {code}")
    except HTTPError as exc:
        print(f"IndexNow HTTP {exc.code}: {exc.read(500)!r}")
        raise
    if code not in (200, 202):
        raise RuntimeError(f"Unexpected IndexNow HTTP status: {code}")


if __name__ == "__main__":
    main()
