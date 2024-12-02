#!/bin/sh

# Read the entire input
#CONTENT=$(cat)
CONTENT='------WebKitFormBoundarydmYZjIAUZ14rKb5d
Content-Disposition: form-data; name="filename"

webdav/md/chron/2024-12/02-102624-1-1.md
------WebKitFormBoundarydmYZjIAUZ14rKb5d
Content-Disposition: form-data; name="file"

1  
1  
1
------WebKitFormBoundarydmYZjIAUZ14rKb5d
Content-Disposition: form-data; name="overwrite"

false
------WebKitFormBoundarydmYZjIAUZ14rKb5d--
'
#echo "Debug: Full Content Received:" >> /tmp/cgi-debug.log
#echo "$CONTENT" >> /tmp/cgi-debug.log

# Extract boundary
#BOUNDARY=$(echo "$CONTENT" | head -n 1 | tr -d '\r')
BOUNDARY=$(echo "$CONTENT" | head -n 1 | tr -d '\r\n')
#echo "Debug: Extracted Boundary: $BOUNDARY" >> /tmp/cgi-debug.log

# Extract filename segment (from 'name=filename')
FILENAME_SEGMENT=$(echo "$CONTENT" | grep -A2 "name=\"filename\"" | tr -d '\r')
#echo "Debug: Filename Segment:" >> /tmp/cgi-debug.log
#echo "$FILENAME_SEGMENT" >> /tmp/cgi-debug.log

# Extract filename value (last line of the segment)
FILENAME=$(echo "$FILENAME_SEGMENT" | tail -n 1)
#echo "Debug: Extracted Filename Value: $FILENAME" >> /tmp/cgi-debug.log

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

OVERWRITE_SEGMENT=$(echo "$CONTENT" | grep -A2 "name=\"overwrite\"" | tr -d '\r')
OVERWRITE=$(echo "$OVERWRITE_SEGMENT" | tail -n 1)
echo "Debug: Extracted OVERWRITE Value: $OVERWRITE" >> /tmp/cgi-debug.log