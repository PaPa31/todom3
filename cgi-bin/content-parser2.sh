#!/bin/sh

# Content placeholder
CONTENT='------WebKitFormBoundaryJDOCzZYPBan6hMP4
Content-Disposition: form-data; name="filename"

webdav/md/chron/2024-11/02-175847-1-1-1.md
------WebKitFormBoundaryJDOCzZYPBan6hMP4
Content-Disposition: form-data; name="file"; filename="webdav/md/chron/2024-11/02-175847-1-1-1.md"
Content-Type: text/plain; charset=utf-8

1  
1  
1
------WebKitFormBoundaryJDOCzZYPBan6hMP4
Content-Disposition: form-data; name="overwrite"

false
------WebKitFormBoundaryJDOCzZYPBan6hMP4--
'
echo "Debug: Full Content Received:" >> /tmp/cgi-debug.log
echo "$CONTENT" >> /tmp/cgi-debug.log

# Extract the boundary from the first line
BOUNDARY=$(echo "$CONTENT" | head -n 1 | tr -d '\r\n')
echo "Debug: Extracted Boundary: $BOUNDARY" >> /tmp/cgi-debug.log

# Extract and process file content dynamically
FILE_CONTENT=$(echo "$CONTENT" | awk -v boundary="$BOUNDARY" '
    BEGIN { in_file=0; skip_next=0 }
    $0 ~ "name=\"file\"" { in_file=1; skip_next=1; next }
    skip_next { skip_next=0; next }  # Skip the Content-Type line
    in_file && $0 ~ boundary { exit }
    in_file { print }
' | sed '/^$/d')  # Remove empty lines, if needed

echo "Debug: Final File Content:" >> /tmp/cgi-debug.log
echo "$FILE_CONTENT" >> /tmp/cgi-debug.log