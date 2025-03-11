#!/bin/sh

echo "Content-type: text/plain"
echo ""

# Decode URL-encoded query string
decode_url() {
  echo -e "$(echo "$1" | sed 's/+/ /g;s/%/\\x/g')"
}

# Extract and decode the file path (remove everything after `&`)
RAW_QUERY=$(echo "$QUERY_STRING" | cut -d '&' -f1)
FILE_PATH=$(decode_url "$RAW_QUERY")

# Define base directories
BASE_DIR="/www"
TEMP_DIR="/tmp/file_uploads"
mkdir -p "$TEMP_DIR"

# Sanitize and validate the file path
SANITIZED_PATH=$(echo "$FILE_PATH" | sed 's#[^a-zA-Z0-9._/-]##g' | sed 's#\.\./##g')
FULL_PATH="$BASE_DIR/$SANITIZED_PATH"

# Generate a stable temp file path (preserve structure, remove special chars)
TEMP_FILE="$TEMP_DIR/$(echo "$SANITIZED_PATH" | sed 's#/#_#g').tmp"

# Ensure the path starts with the base directory
case "$FULL_PATH" in
    "$BASE_DIR"*) ;; # OK
    *) echo "Error: Invalid file path"; exit 1 ;;
esac

# Extract metadata from query string
EXTRA_FLAG=""
case "$QUERY_STRING" in
    *"overwrite=true"*) EXTRA_FLAG="overwrite" ;;
    *"dircreate=true"*) EXTRA_FLAG="dircreate" ;;
esac

# 🚀 Second Request: Process Confirmation (overwrite or directory creation)
if [ -n "$EXTRA_FLAG" ]; then
    if [ -f "$TEMP_FILE" ]; then
        if [ "$EXTRA_FLAG" = "overwrite" ]; then
            mv "$TEMP_FILE" "$FULL_PATH"
            echo "File successfully overwritten"
        elif [ "$EXTRA_FLAG" = "dircreate" ]; then
            mkdir -p "$(dirname "$FULL_PATH")"
            mv "$TEMP_FILE" "$FULL_PATH"
            echo "Directory created and file saved"
        fi
        exit 0
    else
        echo "Error: Temporary file not found (Expected: $TEMP_FILE)"
        ls -l "$TEMP_DIR"  # Debugging: Show files in temp dir
        exit 1
    fi
fi

# 🚀 First Request: Check if overwrite or directory creation is needed
if [ -e "$FULL_PATH" ]; then
    cat > "$TEMP_FILE"
    if [ -f "$TEMP_FILE" ]; then
        echo "EXTRA_OVERWRITE_NEEDED"
    else
        echo "Error: Failed to write temporary file $TEMP_FILE"
    fi
    exit 0
elif [ ! -d "$(dirname "$FULL_PATH")" ]; then
    cat > "$TEMP_FILE"
    if [ -f "$TEMP_FILE" ]; then
        echo "EXTRA_DIRCREATE_NEEDED"
    else
        echo "Error: Failed to write temporary file $TEMP_FILE"
    fi
    exit 0
fi

# 🚀 Normal Save: Write the file immediately
if ! cat > "$FULL_PATH"; then
    echo "Error: Failed to write file"
    exit 1
fi

echo "File saved as $FULL_PATH"
exit 0
