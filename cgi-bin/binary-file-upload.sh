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

# Sanitize and validate the file path
# Only latin or digit in filename
# Remove ../ to prevent directory traversal
SANITIZED_PATH=$(echo "$FILE_PATH" | sed 's#[^a-zA-Z0-9._/-]##g' | sed 's#\.\./##g')
FULL_PATH="$BASE_DIR/$SANITIZED_PATH"

# Ensure the path starts with the base directory
case "$FULL_PATH" in
    "$BASE_DIR"*) ;; # OK
    *) echo "Error: Invalid file path"; exit 1 ;;
esac

# Ensure the target directory exists
DIR_PATH=$(dirname "$FULL_PATH")
if ! mkdir -p "$DIR_PATH"; then
    echo "Error: Failed to create directory $DIR_PATH"
    exit 1
fi

# Write the file and check for success
if ! cat > "$FULL_PATH"; then
    echo "Error: Failed to write file to $FULL_PATH"
    exit 1
fi

# Respond with success
echo "File saved as $FULL_PATH"