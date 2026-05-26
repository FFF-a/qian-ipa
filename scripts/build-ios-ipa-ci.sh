#!/usr/bin/env bash
set -euo pipefail

DERIVED="${DERIVED:-$RUNNER_TEMP/DerivedData}"
ARCHIVE="${ARCHIVE:-$RUNNER_TEMP/App.xcarchive}"
OUT_IPA="${OUT_IPA:-office-manage-unsigned.ipa}"

echo "==> Patch Podfile (disable pod signing for CI)"
python3 <<'PY'
from pathlib import Path

podfile = Path("ios/Podfile")
text = podfile.read_text()
snippet = """    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
        config.build_settings['CODE_SIGNING_REQUIRED'] = 'NO'
      end
    end
"""
if "CODE_SIGNING_ALLOWED'] = 'NO'" not in text:
    text = text.replace("post_install do |installer|\n", "post_install do |installer|\n" + snippet + "\n")
    podfile.write_text(text)
PY

echo "==> Pod install"
cd ios
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
pod install

echo "==> Patch Xcode project signing"
PBXPROJ=$(find . -name project.pbxproj | head -1)
sed -i '' 's/DEVELOPMENT_TEAM = [^;]*;/DEVELOPMENT_TEAM = "";/g' "$PBXPROJ" || true
sed -i '' 's/CODE_SIGN_STYLE = Automatic;/CODE_SIGN_STYLE = Manual;/g' "$PBXPROJ" || true

WORKSPACE=$(find . -maxdepth 1 -name '*.xcworkspace' -print -quit)
SCHEME=$(xcodebuild -list -json -workspace "$WORKSPACE" | python3 -c "import json,sys;d=json.load(sys.stdin);s=[x for x in d['workspace']['schemes'] if 'test' not in x.lower()];print(s[0])")
echo "workspace=$WORKSPACE scheme=$SCHEME"

rm -rf "$DERIVED" "$ARCHIVE"

COMMON_FLAGS=(
  -workspace "$WORKSPACE"
  -scheme "$SCHEME"
  -destination "generic/platform=iOS"
  -derivedDataPath "$DERIVED"
  CODE_SIGNING_ALLOWED=NO
  CODE_SIGNING_REQUIRED=NO
  CODE_SIGN_IDENTITY="-"
  AD_HOC_CODE_SIGNING_ALLOWED=NO
  COMPILER_INDEX_STORE_ENABLE=NO
  ONLY_ACTIVE_ARCH=NO
)

build_ok=0
for CONFIG in Release Debug; do
  echo "==> xcodebuild archive configuration=$CONFIG"
  if xcodebuild \
    -configuration "$CONFIG" \
    -archivePath "$ARCHIVE" \
    archive \
    "${COMMON_FLAGS[@]}"; then
    build_ok=1
    break
  fi
  echo "archive failed for $CONFIG, trying next..."
done

if [ "$build_ok" -ne 1 ]; then
  echo "==> archive failed, trying plain build"
  for CONFIG in Release Debug; do
    if xcodebuild \
      -configuration "$CONFIG" \
      build \
      "${COMMON_FLAGS[@]}"; then
      build_ok=1
      break
    fi
  done
fi

if [ "$build_ok" -ne 1 ]; then
  echo "ERROR: xcodebuild failed"
  exit 1
fi

cd "$GITHUB_WORKSPACE"

echo "==> Locate .app bundle"
APP_PATH=$(python3 <<'PY'
import glob
import os
import plistlib
import sys

derived = os.environ["DERIVED"]
archive = os.environ["ARCHIVE"]
target_bundle = "com.office.manage"

skip_parts = (
    "/pods/",
    "/uninstalledproducts/",
    "/intermediatebuildfilespath/",
    "/pods.build/",
    "/watchkit",
)

def bundle_id(app_path: str):
    plist_path = os.path.join(app_path, "Info.plist")
    if not os.path.isfile(plist_path):
        return None
    try:
        with open(plist_path, "rb") as fh:
            data = plistlib.load(fh)
        return data.get("CFBundleIdentifier")
    except Exception:
        return None

def score(path: str) -> tuple:
    prefer = 0
    lower = path.lower()
    bid = bundle_id(path) or ""
    name = os.path.basename(path)

    if bid == target_bundle:
        prefer -= 1000
    elif "office" in name.lower():
        prefer -= 200
    if "/products/applications/" in lower:
        prefer -= 100
    if "installationbuildproductslocation/applications/" in lower:
        prefer -= 100
    if "release-iphoneos" in lower:
        prefer -= 50
    if "debug-iphoneos" in lower:
        prefer -= 25
    if "iphoneos" in lower:
        prefer -= 10
    if any(part in lower for part in skip_parts):
        prefer += 500
    if "simulator" in lower or "iphonesimulator" in lower:
        prefer += 1000
    if name.startswith("EX") or name.startswith("React"):
        prefer += 300
    return (prefer, len(path), path)

roots = [archive, derived]
patterns = [
    "Products/Applications/*.app",
    "Build/Products/Release-iphoneos/*.app",
    "Build/Products/Debug-iphoneos/*.app",
    "Build/Products/*iphoneos/*.app",
    "Build/Products/*/*.app",
    "Build/Intermediates.noindex/ArchiveIntermediates/*/BuildProductsPath/*/*.app",
    "Build/Intermediates.noindex/ArchiveIntermediates/*/InstallationBuildProductsLocation/Applications/*.app",
]

seen: set[str] = set()
for root in roots:
    if not os.path.isdir(root):
        continue
    for pat in patterns:
        for path in glob.glob(os.path.join(root, pat)):
            if os.path.isdir(path) and path.endswith(".app"):
                seen.add(path)

    for dirpath, dirnames, filenames in os.walk(root):
        lower = dirpath.lower()
        if any(part in lower for part in skip_parts):
            dirnames[:] = []
            continue
        for dirname in dirnames:
            if dirname.endswith(".app"):
                seen.add(os.path.join(dirpath, dirname))

if not seen:
    print("DEBUG archive tree:", file=sys.stderr)
    if os.path.isdir(archive):
        for dirpath, dirnames, filenames in os.walk(archive):
            depth = dirpath[len(archive):].count(os.sep)
            if depth > 4:
                dirnames[:] = []
                continue
            print(" ", dirpath, dirnames[:10], file=sys.stderr)
    products = os.path.join(derived, "Build", "Products")
    if os.path.isdir(products):
        print("DEBUG derived products:", os.listdir(products), file=sys.stderr)
    sys.exit(1)

best = sorted(seen, key=score)[0]
print(f"DEBUG candidates ({len(seen)}):", *sorted(seen)[:8], sep="\n  ", file=sys.stderr)
print(best)
PY
)

if [ -z "$APP_PATH" ] || [ ! -d "$APP_PATH" ]; then
  echo "ERROR: .app not found after archive, trying plain build"
  cd ios
  rm -rf "$DERIVED"
  for CONFIG in Release Debug; do
    if xcodebuild \
      -configuration "$CONFIG" \
      build \
      "${COMMON_FLAGS[@]}"; then
      break
    fi
  done
  cd "$GITHUB_WORKSPACE"
  APP_PATH=$(python3 <<'PY'
import glob, os, sys
derived = os.environ["DERIVED"]
patterns = [
    "Build/Products/Release-iphoneos/*.app",
    "Build/Products/Debug-iphoneos/*.app",
    "Build/Products/*iphoneos/*.app",
]
for pat in patterns:
    for path in sorted(glob.glob(os.path.join(derived, pat))):
        if os.path.isdir(path) and "Office" in os.path.basename(path):
            print(path)
            sys.exit(0)
for pat in patterns:
    for path in sorted(glob.glob(os.path.join(derived, pat))):
        if os.path.isdir(path):
            print(path)
            sys.exit(0)
sys.exit(1)
PY
  )
fi

if [ -z "$APP_PATH" ] || [ ! -d "$APP_PATH" ]; then
  echo "ERROR: No .app bundle found"
  exit 1
fi

echo "Using app: $APP_PATH"
mkdir -p Payload
cp -R "$APP_PATH" "Payload/$(basename "$APP_PATH")"
rm -f "$OUT_IPA"
zip -qr "$OUT_IPA" Payload
ls -lh "$OUT_IPA"
