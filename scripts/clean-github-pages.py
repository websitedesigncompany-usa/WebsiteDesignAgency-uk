#!/usr/bin/env python3
"""
Clear the GitHub Pages branch of anything that is not the site.

The branch was created from `main`, so it also carries the platform source —
`src/`, `package.json`, the docs. GitHub would happily serve all of it next
to the site. The source is public on GitHub anyway, but a published site
should contain the site and nothing else.
"""

import json
import subprocess
import sys
import time

OWNER = "websitedesigncompany-usa"
REPO = "WebsiteDesignAgency-uk"
BRANCH = "gh-pages"
DIST = sys.argv[1] if len(sys.argv) > 1 else "dist"


def connector(args):
    res = subprocess.run(
        ["mcode-tools", "connector", "call", f"connector__github__{args[0]}",
         "--args", json.dumps(args[1])],
        capture_output=True, text=True, timeout=180,
    )
    out = (res.stdout or "") + (res.stderr or "")
    try:
        payload = json.loads(out)
        if isinstance(payload, list) and payload:
            return json.loads(payload[0]["text"])
    except Exception:
        pass
    return {"raw": out[:300]}


def site_files():
    import os
    out = set()
    for dp, dn, fn in os.walk(DIST):
        for f in fn:
            out.add(os.path.relpath(os.path.join(dp, f), DIST).replace(os.sep, "/"))
    return out


def main():
    keep = site_files()
    tree = connector(["get_repository_tree", {
        "owner": OWNER, "repo": REPO, "recursive": True, "tree_sha": BRANCH}])
    entries = tree.get("tree", []) if isinstance(tree, dict) else []
    blobs = {e["path"]: e["sha"] for e in entries if e.get("type") == "blob"}
    stale = sorted(p for p in blobs if p not in keep)
    print(f"{len(blobs)} files on the branch, {len(stale)} are not part of the site", flush=True)
    for p in stale:
        res = connector(["delete_file", {
            "owner": OWNER, "repo": REPO, "branch": BRANCH, "path": p,
            "message": f"Remove non-site file {p}"}])
        ok = "commit" in res or "sha" in res
        print(f"  {'deleted' if ok else 'FAILED '} {p}", flush=True)
        time.sleep(0.15)
    print("DONE", flush=True)


if __name__ == "__main__":
    main()
