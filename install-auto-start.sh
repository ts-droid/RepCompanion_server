#!/bin/bash

# Install auto-start for RepCompanion server using launchd

PLIST_FILE="com.repcompanion.server.plist"
PLIST_SOURCE="/Users/thomassoderberg/.gemini/antigravity/scratch/test/RepCompanion 2/$PLIST_FILE"
PLIST_DEST="$HOME/Library/LaunchAgents/$PLIST_FILE"

echo "Installing RepCompanion server auto-start..."

# Copy plist to LaunchAgents
cp "$PLIST_SOURCE" "$PLIST_DEST"
echo "✅ Copied plist to $PLIST_DEST"

# Load the service
launchctl load "$PLIST_DEST" 2>/dev/null || launchctl load -w "$PLIST_DEST"
echo "✅ Loaded launchd service"

echo ""
echo "Server will now start automatically on system boot and restart if it crashes."
echo ""
echo "To uninstall:"
echo "  launchctl unload $PLIST_DEST"
echo "  rm $PLIST_DEST"
