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
APP_PATH=$(python3 <<PY
import glob, os, sys

derived = os.environ["DERIVED"]
archive = os.environ["ARCHIVE"]
roots = [derived, archive]
patterns = [
    "Build/Products/Release-iphoneos/*.app",
    "Build/Products/Debug-iphoneos/*.app",
    "Build/Products/*iphoneos/*.app",
    "Build/Products/*/*.app",
    "Products/Applications/*.app",
]

seen = set()
for root in roots:
    if not os.path.isdir(root):
        continue
    for pat in patterns:
        for path in glob.glob(os.path.join(root, pat)):
            if os.path.isdir(path) and path.endswith(".app"):
                seen.add(path)

if not seen:
    products = os.path.join(derived, "Build", "Products")
    if os.path.isdir(products):
        print("Products dirs:", os.listdir(products), file=sys.stderr)
    sys.exit(1)

def score(path: str) -> tuple:
    prefer = 0
    if "Release-iphoneos" in path:
        prefer -= 10
    if "Debug-iphoneos" in path:
        prefer -= 5
    if "iphoneos" in path:
        prefer -= 3
    if "Simulator" in path or "iphonesimulator" in path:
        prefer += 100
    return (prefer, path)

print(sorted(seen, key=score)[0])
PY
)

echo "Using app: $APP_PATH"
mkdir -p Payload
cp -R "$APP_PATH" "Payload/$(basename "$APP_PATH")"
rm -f "$OUT_IPA"
zip -qr "$OUT_IPA" Payload
ls -lh "$OUT_IPA"
