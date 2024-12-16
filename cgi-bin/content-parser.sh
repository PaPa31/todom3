#!/bin/sh

echo "Content-Type: application/json; charset=utf-8"
echo ""

# Simulate incoming POST content
CONTENT='------WebKitFormBoundaryyiJnvEr2Xm6vAaAa
Content-Disposition: form-data; name="filename"

webdav/md/chron/2024-12/13-173843-3.md
------WebKitFormBoundaryyiJnvEr2Xm6vAaAa
Content-Disposition: form-data; name="file"; filename="webdav/md/chron/2024-12/13-173843-3.md"
Content-Type: text/plain; charset=utf-8

3



------WebKitFormBoundaryyiJnvEr2Xm6vAaAa
Content-Disposition: form-data; name="overwrite"

false
------WebKitFormBoundaryyiJnvEr2Xm6vAaAa--'

# Debug
echo "Debug: Full Content Received:" > /tmp/cgi-debug.log
echo "[$CONTENT]" >> /tmp/cgi-debug.log

# Extract boundary
#BOUNDARY=$(echo "$HTTP_CONTENT_TYPE" | sed -n 's/.*boundary=\(.*\)/\1/p')
# Parse boundary
#echo "Debug: CONTENT_TYPE: $CONTENT_TYPE" >> /tmp/cgi-debug.log
#BOUNDARY=$(echo "$CONTENT_TYPE" | sed -n 's/.*boundary=\(.*\)/\1/p')
BOUNDARY=$(echo "$CONTENT" | head -n 1 | tr -d '\r\n')

if [ -z "$BOUNDARY" ]; then
  echo '{"error": "Boundary not found."}'
  exit 1
fi
echo "Debug: Extracted Boundary: $BOUNDARY" >> /tmp/cgi-debug.log

# Parse filename
FILENAME=$(echo "$CONTENT" | grep -A2 'name="filename"' | tail -n1)

# Final validation
if [ -z "$FILENAME" ]; then
    echo "Debug: Filename is empty or extraction failed" >> /tmp/cgi-debug.log
else
    echo "Debug: Final Filename: $FILENAME" >> /tmp/cgi-debug.log
fi

# Parse file content
FILE_CONTENT=$(echo "$CONTENT" | sed -n "/name=\"file\"/,/$BOUNDARY/p" | sed '1,2d;$d')
echo "Debug: Final File Content:" >> /tmp/cgi-debug.log
echo "[$FILE_CONTENT]" >> /tmp/cgi-debug.log

# Parse overwrite flag
OVERWRITE=$(echo "$CONTENT" | grep -A1 'name="overwrite"' | tail -n1)
echo "Debug: Extracted overwrite: $OVERWRITE" >> /tmp/cgi-debug.log

