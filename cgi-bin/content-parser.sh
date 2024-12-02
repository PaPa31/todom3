#!/bin/sh

# Content placeholder
CONTENT='------WebKitFormBoundarydmYZjIAUZ14rKb5d
Content-Disposition: form-data; name="filename"

webdav/md/chron/2024-12/02-102624-1-1.md
------WebKitFormBoundarydmYZjIAUZ14rKb5d
Content-Disposition: form-data; name="file"

1  
1
------WebKitFormBoundarydmYZjIAUZ14rKb5d
Content-Disposition: form-data; name="overwrite"

false
------WebKitFormBoundarydmYZjIAUZ14rKb5d--
'
echo "Debug: Full Content Received:" >> /tmp/cgi-debug.log
echo "$CONTENT" >> /tmp/cgi-debug.log

# Extract the boundary from the first line
BOUNDARY=$(echo "$CONTENT" | head -n 1 | tr -d '\r\n')
echo "Debug: Extracted Boundary: $BOUNDARY" >> /tmp/cgi-debug.log

# Find the line number of 'name="file"'
FILE_START=$(echo "$CONTENT" | grep -n "name=\"file\"" | cut -d ':' -f 1)
#FILE_START=$(echo "$CONTENT" | grep -n "name=\"file\"")
#echo "1: $FILE_START" >> /tmp/cgi-debug.log

#FILE_START=$(echo "$FILE_START" | cut -d ':' -f 1)
#echo "2: $FILE_START" >> /tmp/cgi-debug.log

# Extract content from the line after 'name="file"' to the next boundary
FILE_CONTENT=$(echo "$CONTENT" | tail -n +$((FILE_START + 2)) | sed "/$BOUNDARY/,\$d")
echo "Debug: File Content before last sed:" >> /tmp/cgi-debug.log
echo "$FILE_CONTENT" >> /tmp/cgi-debug.log

# Trim leading and trailing whitespace
FILE_CONTENT=$(echo "$FILE_CONTENT" | sed '/^$/d')

echo "Debug: Final File Content:" >> /tmp/cgi-debug.log
echo "$FILE_CONTENT" >> /tmp/cgi-debug.log