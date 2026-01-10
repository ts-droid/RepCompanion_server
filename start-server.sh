#!/bin/bash

# Auto-restart script for RepCompanion server
# This script ensures the server always runs and restarts automatically if it crashes

SERVER_DIR="/Users/thomassoderberg/.gemini/antigravity/scratch/test/RepCompanion 2"
LOG_FILE="/tmp/repcompanion-server.log"
PORT=5001

cd "$SERVER_DIR" || exit 1

# Kill any existing servers on port 5001
lsof -ti:$PORT | xargs kill -9 2>/dev/null

# Kill any other server processes in wrong directories
pkill -f "tsx watch.*Test/RepCompanion" 2>/dev/null
pkill -f "tsx watch.*scratch/RepCompanion" 2>/dev/null

echo "Starting RepCompanion server in: $SERVER_DIR"
echo "Log file: $LOG_FILE"
echo "Port: $PORT"
echo "PID: $$"
echo "---"

# Function to check if server is responding
check_server() {
    local response=$(curl -s -w "%{http_code}" http://localhost:$PORT/api/health -o /dev/null 2>&1)
    if [ "$response" = "200" ]; then
        return 0
    else
        return 1
    fi
}

# Function to monitor server health
monitor_server() {
    local pid=$1
    while kill -0 $pid 2>/dev/null; do
        sleep 30
        if ! check_server; then
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  Server health check failed (PID: $pid still running)" | tee -a "$LOG_FILE"
        fi
    done
}

# Start server with auto-restart
while true; do
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting server..." | tee -a "$LOG_FILE"
    
    # Start server in background with V3 enabled
    export USE_AI_V3=true
    export USE_AI_V3_ONBOARDING=true
    export GEMINI_MODEL=gemini-2.5-flash
    PORT=$PORT npm run dev >> "$LOG_FILE" 2>&1 &
    SERVER_PID=$!
    
    # Wait a bit for server to start
    sleep 5
    
    # Check if server is responding
    if check_server; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Server started successfully (PID: $SERVER_PID)" | tee -a "$LOG_FILE"
        
        # Start monitoring server health in background
        monitor_server $SERVER_PID &
        MONITOR_PID=$!
        
        # Wait for server process to exit
        wait $SERVER_PID
        EXIT_CODE=$?
        
        # Stop monitoring
        kill $MONITOR_PID 2>/dev/null
        
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️ Server exited with code $EXIT_CODE. Restarting in 3 seconds..." | tee -a "$LOG_FILE"
    else
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ Server failed to start. Restarting in 3 seconds..." | tee -a "$LOG_FILE"
        kill $SERVER_PID 2>/dev/null
    fi
    
    sleep 3
done

