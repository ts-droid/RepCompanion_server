#!/bin/bash
# Hourly backup script for RepCompanion 2
# This script creates timestamped backups of the project

# Configuration
PROJECT_DIR="/Users/thomassoderberg/.gemini/antigravity/scratch/Test/RepCompanion 2"
BACKUP_DIR="/Users/thomassoderberg/.gemini/antigravity/scratch/backups"
MAX_BACKUPS=24  # Keep last 24 hourly backups

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="RepCompanion2_$TIMESTAMP"

# Create backup (exclude node_modules and .git)
echo "Creating backup: $BACKUP_NAME..."
tar --exclude='node_modules' \
    --exclude='.git' \
    --exclude='dist' \
    --exclude='*.log' \
    -czf "$BACKUP_DIR/$BACKUP_NAME.tar.gz" \
    -C "$(dirname "$PROJECT_DIR")" \
    "$(basename "$PROJECT_DIR")"

if [ $? -eq 0 ]; then
    echo "✅ Backup created: $BACKUP_DIR/$BACKUP_NAME.tar.gz"
else
    echo "❌ Backup failed!"
    exit 1
fi

# Cleanup old backups (keep only the most recent MAX_BACKUPS)
echo "Cleaning up old backups..."
cd "$BACKUP_DIR"
ls -t RepCompanion2_*.tar.gz 2>/dev/null | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm -f

echo "Backup complete. Current backups:"
ls -lh "$BACKUP_DIR"/RepCompanion2_*.tar.gz 2>/dev/null | tail -5
