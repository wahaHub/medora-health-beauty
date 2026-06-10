#!/usr/bin/env python3
"""
Small deployment and log helper for Medora Health Beauty.

The production app is deployed on Vercel. Cloudflare fronts the domain for
DNS/CDN/security/R2, so the Cloudflare "deploy" action here is cache purge.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
STATE_DIR = ROOT / ".ops"
LAST_DEPLOYMENT_FILE = STATE_DIR / "last-vercel-deployment.txt"
DEFAULT_PROJECT = "medora-health-beauty"
DEFAULT_CF_ZONE_NAME = "medorabeauty.com"


def load_dotenv() -> None:
    env_path = ROOT / ".env"
    if not env_path.exists():
        return

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


def env(*names: str, default: str | None = None) -> str | None:
    for name in names:
        value = os.environ.get(name)
        if value:
            return value
    return default


def require_env(*names: str) -> str:
    value = env(*names)
    if value:
        return value
    joined = " or ".join(names)
    raise SystemExit(f"Missing required environment variable: {joined}")


def printable_cmd(cmd: list[str]) -> str:
    redacted: list[str] = []
    hide_next = False
    for part in cmd:
        if hide_next:
            redacted.append("***")
            hide_next = False
            continue
        redacted.append(part)
        if part in {"--token", "--cf-token", "--vercel-token"}:
            hide_next = True
    return " ".join(redacted)


def run(cmd: list[str], *, cwd: Path = ROOT, capture: bool = False) -> str:
    print(f"$ {printable_cmd(cmd)}", flush=True)
    if capture:
        result = subprocess.run(cmd, cwd=cwd, text=True, capture_output=True, check=False)
        if result.stdout:
            print(result.stdout, end="")
        if result.stderr:
            print(result.stderr, end="", file=sys.stderr)
        if result.returncode != 0:
            raise SystemExit(result.returncode)
        return result.stdout

    result = subprocess.run(cmd, cwd=cwd, check=False)
    if result.returncode != 0:
        raise SystemExit(result.returncode)
    return ""


def vercel_base_args(args: argparse.Namespace) -> list[str]:
    token = args.vercel_token or env("VERCEL_TOKEN")
    if not token:
        raise SystemExit("Missing VERCEL_TOKEN. Create one in Vercel Account Settings > Tokens.")

    cmd = ["npx", "vercel"]
    scope = args.vercel_scope or env("VERCEL_SCOPE")
    if scope:
        cmd += ["--scope", scope]
    cmd += ["--token", token]
    return cmd


def remember_deployment(output: str) -> str | None:
    urls = re.findall(r"https://[^\s]+", output)
    if not urls:
        return None
    deployment = urls[-1].rstrip()
    STATE_DIR.mkdir(exist_ok=True)
    LAST_DEPLOYMENT_FILE.write_text(deployment + "\n", encoding="utf-8")
    print(f"\nSaved latest deployment: {deployment}")
    return deployment


def get_deployment_arg(value: str | None) -> str:
    if value:
        return value
    if LAST_DEPLOYMENT_FILE.exists():
        return LAST_DEPLOYMENT_FILE.read_text(encoding="utf-8").strip()
    raise SystemExit(
        "Missing deployment URL/ID. Pass --deployment or run vercel-deploy first."
    )


def cmd_vercel_deploy(args: argparse.Namespace) -> None:
    if not args.skip_build:
        run(["npm", "run", "build"])

    cmd = vercel_base_args(args) + ["deploy", "--yes"]
    if args.prod:
        cmd.append("--prod")
    if args.archive:
        cmd += ["--archive", args.archive]
    output = run(cmd, capture=True)
    remember_deployment(output)


def cmd_vercel_list(args: argparse.Namespace) -> None:
    project = args.project or env("VERCEL_PROJECT", default=DEFAULT_PROJECT)
    cmd = vercel_base_args(args) + ["ls", project]
    if args.environment:
        cmd += ["--environment", args.environment]
    if args.status:
        cmd += ["--status", args.status]
    run(cmd)


def cmd_vercel_whoami(args: argparse.Namespace) -> None:
    cmd = vercel_base_args(args) + ["whoami"]
    run(cmd)


def cmd_vercel_build_logs(args: argparse.Namespace) -> None:
    deployment = get_deployment_arg(args.deployment)
    cmd = vercel_base_args(args) + ["inspect", deployment, "--logs"]
    run(cmd)


def cmd_vercel_runtime_logs(args: argparse.Namespace) -> None:
    deployment = get_deployment_arg(args.deployment)
    cmd = vercel_base_args(args) + ["logs", deployment]
    if args.json:
        cmd.append("--json")
    run(cmd)


def cf_request(
    method: str,
    path: str,
    *,
    token: str,
    body: dict[str, Any] | None = None,
    api_base: str = "https://api.cloudflare.com/client/v4",
) -> dict[str, Any]:
    data = None
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
    if body is not None:
        data = json.dumps(body).encode("utf-8")

    req = urllib.request.Request(
        api_base + path,
        data=data,
        headers=headers,
        method=method,
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        payload = error.read().decode("utf-8", errors="replace")
        raise SystemExit(f"Cloudflare API error {error.code}: {payload}") from error


def cf_token(args: argparse.Namespace) -> str:
    return args.cf_token or require_env("CLOUDFLARE_API_TOKEN", "CF_API_TOKEN")


def cf_zone_id(args: argparse.Namespace) -> str:
    explicit = args.cf_zone_id or env("CLOUDFLARE_ZONE_ID", "CF_ZONE_ID")
    if explicit:
        return explicit

    zone_name = args.cf_zone_name or env("CLOUDFLARE_ZONE_NAME", default=DEFAULT_CF_ZONE_NAME)
    token = cf_token(args)
    query = urllib.parse.urlencode({"name": zone_name})
    data = cf_request("GET", f"/zones?{query}", token=token)
    zones = data.get("result") or []
    if not zones:
        raise SystemExit(f"Could not find Cloudflare zone for {zone_name}. Set CF_ZONE_ID.")
    return zones[0]["id"]


def cmd_cf_zone(args: argparse.Namespace) -> None:
    token = cf_token(args)
    zone_id = cf_zone_id(args)
    data = cf_request("GET", f"/zones/{zone_id}", token=token)
    print(json.dumps(data.get("result", data), indent=2, ensure_ascii=False))


def cmd_cf_token_verify(args: argparse.Namespace) -> None:
    token = cf_token(args)
    data = cf_request("GET", "/user/tokens/verify", token=token)
    result = data.get("result") or {}
    status = result.get("status") or "unknown"
    token_id = result.get("id") or "unknown"
    print(f"Cloudflare token verified: status={status} id={token_id}")


def cmd_cf_zones(args: argparse.Namespace) -> None:
    token = cf_token(args)
    data = cf_request("GET", "/zones?per_page=100", token=token)
    zones = data.get("result") or []
    if not zones:
        print("No Cloudflare zones visible to this token.")
        return
    for zone in zones:
        print(f"{zone.get('name')} {zone.get('id')} status={zone.get('status')}")


def cmd_cf_dns(args: argparse.Namespace) -> None:
    token = cf_token(args)
    zone_id = cf_zone_id(args)
    data = cf_request("GET", f"/zones/{zone_id}/dns_records?per_page=100", token=token)
    for record in data.get("result", []):
        proxied = "proxied" if record.get("proxied") else "dns-only"
        print(f"{record.get('type'):6} {record.get('name'):32} {record.get('content')} ({proxied})")


def cmd_cf_purge(args: argparse.Namespace) -> None:
    if not args.everything and not args.url:
        raise SystemExit("Pass --everything or one/more --url values.")

    token = cf_token(args)
    zone_id = cf_zone_id(args)
    body: dict[str, Any]
    if args.everything:
        body = {"purge_everything": True}
    else:
        body = {"files": args.url}

    data = cf_request("POST", f"/zones/{zone_id}/purge_cache", token=token, body=body)
    print(json.dumps(data, indent=2, ensure_ascii=False))


def cmd_cf_security_events(args: argparse.Namespace) -> None:
    token = cf_token(args)
    zone_id = cf_zone_id(args)
    now = datetime.now(timezone.utc)
    start = now - timedelta(minutes=args.minutes)

    query = """
    query ListFirewallEvents($zoneTag: string, $filter: FirewallEventsAdaptiveFilter_InputObject, $limit: uint64) {
      viewer {
        zones(filter: { zoneTag: $zoneTag }) {
          firewallEventsAdaptive(filter: $filter, limit: $limit, orderBy: [datetime_DESC]) {
            action
            clientCountryName
            clientIP
            clientRequestHTTPHost
            clientRequestPath
            datetime
            source
            userAgent
          }
        }
      }
    }
    """
    body = {
        "query": query,
        "variables": {
            "zoneTag": zone_id,
            "limit": args.limit,
            "filter": {
                "datetime_geq": start.isoformat().replace("+00:00", "Z"),
                "datetime_leq": now.isoformat().replace("+00:00", "Z"),
            },
        },
    }
    data = cf_request(
        "POST",
        "/graphql",
        token=token,
        body=body,
    )
    if data.get("errors"):
        print(json.dumps(data, indent=2, ensure_ascii=False))
        raise SystemExit(1)

    zones = data.get("data", {}).get("viewer", {}).get("zones", [])
    events = zones[0].get("firewallEventsAdaptive", []) if zones else []
    if not events:
        print(f"No Cloudflare security events in the last {args.minutes} minutes.")
        return

    for event in events:
        print(
            f"{event.get('datetime')} {event.get('action'):10} "
            f"{event.get('clientIP')} {event.get('clientCountryName')} "
            f"{event.get('clientRequestHTTPHost')}{event.get('clientRequestPath')} "
            f"[{event.get('source')}]"
        )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Medora Health Beauty Vercel/Cloudflare ops helper"
    )
    parser.add_argument("--vercel-token", help="Defaults to VERCEL_TOKEN")
    parser.add_argument("--vercel-scope", help="Defaults to VERCEL_SCOPE")
    parser.add_argument("--cf-token", help="Defaults to CLOUDFLARE_API_TOKEN or CF_API_TOKEN")
    parser.add_argument("--cf-zone-id", help="Defaults to CLOUDFLARE_ZONE_ID or CF_ZONE_ID")
    parser.add_argument("--cf-zone-name", help=f"Defaults to {DEFAULT_CF_ZONE_NAME}")

    sub = parser.add_subparsers(dest="command", required=True)

    whoami = sub.add_parser("vercel-whoami", help="Verify the Vercel token")
    whoami.set_defaults(func=cmd_vercel_whoami)

    deploy = sub.add_parser("vercel-deploy", help="Build locally, then deploy to Vercel")
    deploy.add_argument("--prod", action=argparse.BooleanOptionalAction, default=True)
    deploy.add_argument("--skip-build", action="store_true", help="Skip local npm run build verification")
    deploy.add_argument("--archive", choices=["tgz"], help="Pass through to vercel deploy --archive")
    deploy.set_defaults(func=cmd_vercel_deploy)

    list_cmd = sub.add_parser("vercel-list", help="List Vercel deployments")
    list_cmd.add_argument("--project", default=DEFAULT_PROJECT)
    list_cmd.add_argument("--environment", choices=["production", "preview", "development"])
    list_cmd.add_argument("--status", help="READY, ERROR, BUILDING, etc.")
    list_cmd.set_defaults(func=cmd_vercel_list)

    build_logs = sub.add_parser("vercel-build-logs", help="Read Vercel build logs for a deployment")
    build_logs.add_argument("--deployment")
    build_logs.set_defaults(func=cmd_vercel_build_logs)

    runtime_logs = sub.add_parser("vercel-runtime-logs", help="Tail Vercel runtime logs for a deployment")
    runtime_logs.add_argument("--deployment")
    runtime_logs.add_argument("--json", action="store_true")
    runtime_logs.set_defaults(func=cmd_vercel_runtime_logs)

    cf_zone = sub.add_parser("cf-zone", help="Show Cloudflare zone details")
    cf_zone.set_defaults(func=cmd_cf_zone)

    cf_verify = sub.add_parser("cf-token-verify", help="Verify the Cloudflare API token")
    cf_verify.set_defaults(func=cmd_cf_token_verify)

    cf_zones = sub.add_parser("cf-zones", help="List Cloudflare zones visible to the token")
    cf_zones.set_defaults(func=cmd_cf_zones)

    cf_dns = sub.add_parser("cf-dns", help="List Cloudflare DNS records")
    cf_dns.set_defaults(func=cmd_cf_dns)

    purge = sub.add_parser("cf-purge", help="Purge Cloudflare CDN cache")
    purge.add_argument("--everything", action="store_true")
    purge.add_argument("--url", action="append", help="Purge a specific URL. Can be repeated.")
    purge.set_defaults(func=cmd_cf_purge)

    security = sub.add_parser("cf-security-events", help="Read recent Cloudflare security/firewall events")
    security.add_argument("--minutes", type=int, default=60)
    security.add_argument("--limit", type=int, default=20)
    security.set_defaults(func=cmd_cf_security_events)

    return parser


def main() -> None:
    load_dotenv()
    parser = build_parser()
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
