#!/bin/sh

echo "Content-Type: application/json; charset=utf-8"
echo ""

# Read POST data
#env > /tmp/cgi-environment-2.log
CONTENT_LENGTH_MY=$CONTENT_LENGTH
echo "Debug: Full Content Received:" > /tmp/cgi-debug.log
echo "$CONTENT_LENGTH_MY" >> /tmp/cgi-debug.log

CONTENT=$(dd bs=1 count=$CONTENT_LENGTH_MY 2>/dev/null)
echo "Debug: Full Content Received:" >> /tmp/cgi-debug.log
echo "[$CONTENT]" >> /tmp/cgi-debug.log

root_dir="/www"  # Adjust based on actual document root

# Extract boundary
#BOUNDARY=$(echo "$HTTP_CONTENT_TYPE" | sed -n 's/.*boundary=\(.*\)/\1/p')
# Parse boundary
echo "Debug: CONTENT_TYPE: $CONTENT_TYPE" >> /tmp/cgi-debug.log
BOUNDARY=$(echo "$CONTENT_TYPE" | sed -n 's/.*boundary=\(.*\)/\1/p')
if [ -z "$BOUNDARY" ]; then
  echo '{"error": "Boundary not found."}'
  exit 1
fi
echo "Debug: Extracted Boundary: $BOUNDARY" >> /tmp/cgi-debug.log

# Parse and sanitize filename
FILENAME=$(echo "$CONTENT" | grep -A2 'name="filename"' | tail -n1 | tr -d '\r')

# Final validation
if [ -z "$FILENAME" ]; then
    echo "Debug: Filename is empty or extraction failed" >> /tmp/cgi-debug.log
else
    echo "Debug: Final Filename: $FILENAME" >> /tmp/cgi-debug.log
fi

echo "Debug: Sanitized Filename:" >> /tmp/cgi-debug.log
echo -n "$FILENAME" | hexdump -C >> /tmp/cgi-debug.log

# Parse file content
FILE_CONTENT=$(echo "$CONTENT" | sed -n "/name=\"file\"/,/$BOUNDARY/p" | sed '1,3d;$d' )
echo "Debug: Final File Content:" >> /tmp/cgi-debug.log

#echo -en "$FILE_CONTENT" | tr -d '\r' > /tmp/remove-return.txt

echo "[$FILE_CONTENT]" >> /tmp/cgi-debug.log
#echo -n "$FILE_CONTENT" | hexdump -C >> /tmp/cgi-debug.log

# Parse overwrite flag
OVERWRITE=$(echo "$CONTENT" | grep -A2 'name="overwrite"' | tail -n1 | tr -d '\r')
echo "Debug: Extracted overwrite: $OVERWRITE" >> /tmp/cgi-debug.log

echo "Debug: Sanitized OVERWRITE:" >> /tmp/cgi-debug.log
echo -n "$OVERWRITE" | hexdump -C >> /tmp/cgi-debug.log


# Sanitize file path
sanitized_path="${root_dir}/${FILENAME}"
echo "Debug: sanitized_path=$sanitized_path" >> /tmp/cgi-debug.log

if ! echo "$sanitized_path" | grep -q "^${root_dir}"; then
    echo '{ "success": false, "message": "Invalid file path." }'
    exit 1
fi

if [ -f "$sanitized_path" ] && [ "$OVERWRITE" != "true" ]; then
    echo '{ "success": false, "fileExists": true, "message": "File already exists." }'
else
    # the only way to remove the redundand `\r` that is added when extracting
    if echo -n "$FILE_CONTENT" | tr -d '\r' > "$sanitized_path"; then
    echo '{ "success": true, "message": "File saved successfully." }'
    else
    echo '{ "success": false, "message": "Failed to save the file." }'
    fi
fi




# Save file
#if [ "$OVERWRITE" = "true" ] || [ ! -f "$FILENAME" ]; then
#  echo "$FILE_CONTENT" > "$FILENAME"
#  echo '{"success": true}'   # JSON response
#else
#  echo '{"fileExists": true}'   # JSON response
#fi
