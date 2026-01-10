#!/bin/bash

# Stop all RepCompanion servers
# This script kills all server processes to ensure clean state

echo "Stopping all RepCompanion servers..."

# Kill all tsx watch processes
pkill -f "tsx watch" 2>/dev/null

# Kill all node server processes
pkill -f "node.*server/index" 2>/dev/null

# Kill processes on port 5001
lsof -ti:5001 | xargs kill -9 2>/dev/null

# Kill any server processes in wrong directories
pkill -f "Test/RepCompanion.*server" 2>/dev/null
pkill -f "scratch/RepCompanion.*server" 2>/dev/null

sleep 2

# Verify
if lsof -ti:5001 > /dev/null 2>&1; then
    echo "⚠️  Warning: Port 5001 still in use"
    lsof -ti:5001
else
    echo "✅ All servers stopped. Port 5001 is free."
fi



