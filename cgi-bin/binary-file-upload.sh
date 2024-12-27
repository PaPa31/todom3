#!/bin/sh
echo "Content-type: text/plain"
echo ""

# Decode URL-encoded query string
decode_url() {
  echo -e "$(echo "$1" | sed 's/+/ /g;s/%/\\x/g')"
}

# Extract and decode the file path from the query string
FILE_PATH=$(decode_url "$QUERY_STRING")

# Define a base directory for uploads
BASE_DIR="/www"

# Sanitize and ensure the file path is under the allowed directory
SANITIZED_PATH=$(echo "$FILE_PATH" | sed 's#\.\./##g') # Remove ../ to prevent directory traversal
FULL_PATH="$BASE_DIR/$SANITIZED_PATH"

# Create the directory if it doesn't exist
DIR_PATH=$(dirname "$FULL_PATH")
mkdir -p "$DIR_PATH" || {
  echo "Failed to create directory: $DIR_PATH"
  exit 1
}

# Save raw binary data to the file
cat > "$FULL_PATH" || {
  echo "Failed to save file: $FULL_PATH"
  exit 1
}


# Respond with success
echo "File saved as $FULL_PATH"