#!/bin/bash

# Uninstall auto-start for RepCompanion server

PLIST_FILE="com.repcompanion.server.plist"
PLIST_DEST="$HOME/Library/LaunchAgents/$PLIST_FILE"

echo "Uninstalling RepCompanion server auto-start..."

# Unload the service
launchctl unload "$PLIST_DEST" 2>/dev/null
echo "✅ Unloaded launchd service"

# Remove plist
rm -f "$PLIST_DEST"
echo "✅ Removed plist file"

echo ""
echo "Auto-start has been uninstalled."
