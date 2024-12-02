#!/bin/sh

echo "Content-Type: application/json; charset=utf-8"
echo ""

# Read the entire input
CONTENT=$(cat)
echo "Debug: Full Content Received:" >> /tmp/cgi-debug.log
echo "$CONTENT" >> /tmp/cgi-debug.log

root_dir="/www"  # Adjust based on actual document root

# Extract boundary
BOUNDARY=$(echo "$CONTENT" | head -n 1 | tr -d '\r\n')
echo "Debug: Extracted Boundary: $BOUNDARY" >> /tmp/cgi-debug.log

# Extract the filename segment
FILENAME_SEGMENT=$(echo "$CONTENT" | grep -A2 "name=\"filename\"" | tr -d '\r')
echo "Debug: Filename Segment: $FILENAME_SEGMENT" >> /tmp/cgi-debug.log

# Log the filename segment line-by-line for clarity
#echo "Debug: Filename Segment Lines:" >> /tmp/cgi-debug.log
#echo "$FILENAME_SEGMENT" | while IFS= read -r line; do
#    echo "Line: $line" >> /tmp/cgi-debug.log
#done

# Extract filename value (last line of the segment)
FILENAME=$(echo "$FILENAME_SEGMENT" | tail -n 1)

# Final validation
if [ -z "$FILENAME" ]; then
    echo "Debug: Filename is empty or extraction failed" >> /tmp/cgi-debug.log
else
    echo "Debug: Final Filename: $FILENAME" >> /tmp/cgi-debug.log
fi

# Find start of file content
FILE_START=$(echo "$CONTENT" | grep -n "name=\"file\"" | cut -d ':' -f 1)

# Extract content from the line after 'name="file"' to the next boundary
FILE_CONTENT=$(echo "$CONTENT" | tail -n +$((FILE_START + 2)) | sed "/$BOUNDARY/,\$d")

# Trim leading and trailing whitespace (if any)
FILE_CONTENT=$(echo "$FILE_CONTENT" | sed '/^$/d')
echo "Debug: Final File Content:" >> /tmp/cgi-debug.log
echo "$FILE_CONTENT" >> /tmp/cgi-debug.log

# Extract the overwrite segment
OVERWRITE_SEGMENT=$(echo "$CONTENT" | grep -A2 "name=\"overwrite\"" | tr -d '\r')
echo "Debug: Owerwrite Segment: $OVERWRITE_SEGMENT" >> /tmp/cgi-debug.log

# Extract overwrite value (last line of the segment)
OVERWRITE=$(echo "$OVERWRITE_SEGMENT" | tail -n 1)
echo "Debug: Extracted overwrite: $OVERWRITE" >> /tmp/cgi-debug.log

#OVERWRITE_SEGMENT=$(echo "$CONTENT" | grep -A2 "name=\"overwrite\"" | tr -d '\r')
#OVERWRITE=$(echo "$OVERWRITE_SEGMENT" | tail -n 1)
#echo "Debug: Extracted OVERWRITE Value: $OVERWRITE" >> /tmp/cgi-debug.log

# Sanitize file path
sanitized_path="${root_dir}/${FILENAME}"
echo "Debug: sanitized_path=$sanitized_path" >> /tmp/cgi-debug.log

if ! echo "$sanitized_path" | grep -q "^${root_dir}"; then
    echo '{ "success": false, "message": "Invalid file path." }'
    exit 1
fi

if [ -f "$sanitized_path" ]; then
    if [ "$overwrite" = "true" ]; then
    # Overwrite the file
    if echo "$FILE_CONTENT" > "$sanitized_path"; then
        echo '{ "success": true, "message": "File overwritten successfully." }'
    else
        echo '{ "success": false, "message": "Failed to overwrite the file." }'
    fi
    else
    # Inform client the file exists
    echo '{ "success": false, "message": "File already exists.", "fileExists": true }'
    fi
else
    # Save the file as it doesn't exist
    if echo "$FILE_CONTENT" > "$sanitized_path"; then
    echo '{ "success": true, "message": "File saved successfully." }'
    else
    echo '{ "success": false, "message": "Failed to save the file." }'
    fi
fi