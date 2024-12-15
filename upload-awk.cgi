#!/bin/sh

echo "Content-Type: application/json; charset=utf-8"
echo ""

# Read the entire input
CONTENT=$(cat)
#read CONTENT
echo "AWK with CAT" > /tmp/cgi-debug.log
echo "Debug: Full Content Received:" >> /tmp/cgi-debug.log
#echo "[$CONTENT]" >> /tmp/cgi-debug.log

root_dir="/www"  # Adjust based on actual document root

# Extract boundary
#BOUNDARY=$(echo "$CONTENT" | head -n 1 | tr -d '\r')
# Extract boundary using `awk`
BOUNDARY=$(echo "$CONTENT" | awk 'NR==1 { gsub(/\r$/, ""); print }')
echo "Debug: Extracted Boundary: [$BOUNDARY]" >> /tmp/cgi-debug.log

# Extract the filename segment
#FILENAME_SEGMENT=$(echo "$CONTENT" | grep -A2 "name=\"filename\"" | tr -d '\r')
#echo "Debug: Filename Segment: $FILENAME_SEGMENT" >> /tmp/cgi-debug.log

# Extract filename value (last line of the segment)
#FILENAME=$(echo "$FILENAME_SEGMENT" | tail -n 1)

# Extract the filename using `awk`
FILENAME=$(echo "$CONTENT" | awk -v boundary="$BOUNDARY" '
    $0 ~ boundary { getline; if ($0 ~ "name=\"filename\"") { getline; getline; print $0; exit } }' | tr -d '\r')

# Final validation
if [ -z "$FILENAME" ]; then
    echo "Debug: Filename is empty or extraction failed" >> /tmp/cgi-debug.log
else
    echo "Debug: Final Filename: $FILENAME" >> /tmp/cgi-debug.log
fi

# Start timing
START_TIMER=$(awk '{print $1}' /proc/uptime)
#START_TIME=$(date +%s)
#START_TIME=$(awk '{ print $1 }' /proc/uptime | cut -d. -f1)

#FILE_CONTENT=$(echo "$CONTENT" | awk -v boundary="$BOUNDARY" '
#    BEGIN { in_file=0; skip_next=0; first_line=1 }
#    $0 ~ "name=\"file\"" { in_file=1; skip_next=1; next }
#    skip_next { skip_next=0; next }  # Skip the Content-Type line
#    in_file && $0 ~ boundary { exit }
#    in_file {
#        if (first_line && $0 ~ /^[[:space:]]*$/) {
#            first_line=0; next  # Skip the first leading newline
#        }
#        first_line=0
#        print
#    }
#')

FILE_CONTENT=$(echo "$CONTENT" | sed -n "/name=\"file\"/,/$BOUNDARY/p" | sed '1,2d;$d' )

# End timing
END_TIMER=$(awk '{print $1}' /proc/uptime)
TIME_ELAPSED=$(echo "$END_TIMER - $START_TIMER" | bc)
#END_TIME=$(awk '{ print $1 }' /proc/uptime | cut -d. -f1)
#TIME_ELAPSED=$((END_TIME - START_TIME))
#END_TIME=$(date +%s)
#TIME_ELAPSED=$((END_TIME - START_TIME))

# this is how I caught `\r` (carriage return)
#echo -en "$FILE_CONTENT" | tr -d '\r' > /tmp/remove-return.txt

echo "Debug: Final File Content:" >> /tmp/cgi-debug.log
#echo "$FILE_CONTENT" >> /tmp/cgi-debug.log
#echo -n "$FILE_CONTENT" | hexdump -C >> /tmp/cgi-debug.log
echo "AWK Parsing Time: ${TIME_ELAPSED} s" >> /tmp/cgi-debug.log

# Extract the overwrite segment
#OVERWRITE_SEGMENT=$(echo "$CONTENT" | grep -A2 "name=\"overwrite\"" | tr -d '\r')
#echo "Debug: Owerwrite Segment: $OVERWRITE_SEGMENT" >> /tmp/cgi-debug.log

# Extract overwrite value (last line of the segment)
#OVERWRITE=$(echo "$OVERWRITE_SEGMENT" | tail -n 1)
# Extract overwrite value
OVERWRITE=$(echo "$CONTENT" | awk -v boundary="$BOUNDARY" '
    $0 ~ boundary { getline; if ($0 ~ "name=\"overwrite\"") { getline; getline; print $0; exit } }' | tr -d '\r')
echo "Debug: Extracted overwrite: $OVERWRITE" >> /tmp/cgi-debug.log

# Sanitize file path
sanitized_path="${root_dir}/${FILENAME}"
echo "Debug: sanitized_path=$sanitized_path" >> /tmp/cgi-debug.log

#if ! echo "$sanitized_path" | grep -q "^${root_dir}"; then
#    echo '{ "success": false, "message": "Invalid file path." }'
#    exit 1
#fi

if ! echo "$sanitized_path" | awk -v root="$root_dir" 'BEGIN { valid=1 } $0 !~ "^"root { valid=0 } END { exit !valid }'; then
    echo '{ "success": false, "message": "Invalid file path." }'
    exit 1
fi

if [ -f "$sanitized_path" ] && [ "$OVERWRITE" != "true" ]; then
    echo '{ "success": false, "fileExists": true, "message": "File already exists." }'
else
    # the only way to remove the redundand `\r`
    if printf "%s" "$FILE_CONTENT" | tr -d '\r' > "$sanitized_path"; then
    echo '{ "success": true, "message": "File saved successfully." }'
    else
    echo '{ "success": false, "message": "Failed to save the file." }'
    fi
fi