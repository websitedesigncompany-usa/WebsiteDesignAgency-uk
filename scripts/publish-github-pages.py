#!/usr/bin/env python3
"""
Publish the built site to a GitHub Pages branch, one commit per batch.

GitHub serves a project Pages site from /<repo>/, so the branch has to contain
the site at its root. The connector refuses `.github/workflows/` (so the
Actions route needs one manual step from the client) and it caps a single
request at roughly half a megabyte, so the site goes up in batches.

Files are grouped by their encoded size and pushed sequentially: concurrent
pushes to the same branch race on the ref and lose. Every batch is retried,
because the occasional transient failure just needs another try.
"""

import json
import os
import subprocess
import sys
import time

DIST = sys.argv[1] if len(sys.argv) > 1 else "dist"
BRANCH = sys.argv[2] if len(sys.argv) > 2 else "gh-pages"
OWNER = "websitedesigncompany-usa"
REPO = "WebsiteDesignAgency-uk"
LIMIT = 430_000          # encoded bytes per request — under the connector cap
SKIP = {".gitkeep"}


def collect(root):
    out = []
    for dp, dn, fn in os.walk(root):
        for f in sorted(fn):
            if f in SKIP:
                continue
            full = os.path.join(dp, f)
            rel = os.path.relpath(full, root).replace(os.sep, "/")
            try:
                with open(full, encoding="utf-8") as fh:
                    content = fh.read()
            except (UnicodeDecodeError, OSError):
                continue  # binary asset — the GitHub transport carries text only
            out.append((rel, content))
    out.sort()
    return out


def batches(files):
    cur, size = [], 0
    for rel, content in files:
        n = len(content) + len(rel) + 40
        if cur and size + n > LIMIT:
            yield cur
            cur, size = [], 0
        cur.append({"path": rel, "content": content})
        size += n
    if cur:
        yield cur


def push(batch, attempt=1):
    payload = {
        "owner": OWNER,
        "repo": REPO,
        "branch": BRANCH,
        "message": f"Publish {len(batch)} file(s)",
        "files": batch,
    }
    with open("/tmp/ghpages-payload.json", "w", encoding="utf-8") as fh:
        json.dump(payload, fh)
    res = subprocess.run(
        ["mcode-tools", "connector", "call", "connector__github__push_files",
         "--args-file", "/tmp/ghpages-payload.json"],
        capture_output=True, text=True, timeout=180,
    )
    out = (res.stdout or "") + (res.stderr or "")
    if "error" in out.lower() and '"ref"' not in out:
        if attempt < 4:
            time.sleep(2 + attempt * 2)
            return push(batch, attempt + 1)
        return False, out.strip()[:200]
    return True, out.strip()[:120]


def main():
    files = collect(DIST)
    total_bytes = sum(len(c) for _, c in files)
    print(f"{len(files)} files, {total_bytes/1e6:.1f} MB of text -> {BRANCH}", flush=True)
    done = 0
    pushed = 0
    for batch in batches(files):
        ok, msg = push(batch)
        done += len(batch)
        if ok:
            pushed += len(batch)
        else:
            print(f"  FAILED: {msg}", flush=True)
        print(f"  {done}/{len(files)} files ({pushed} pushed)", flush=True)
        time.sleep(0.2)
    print(f"DONE {pushed}/{len(files)}", flush=True)


if __name__ == "__main__":
    main()
