#!/bin/sh
#echo "Content-type: application/json"
echo "Content-type: text/plain"
echo ""

# Save raw binary data to a file
cat > "/www/webdav/md/chron/2024-12/$(basename "$QUERY_STRING")"


# Respond with success
#echo '{"success": true, "message": "Binary file saved successfully."}'
echo "File saved."
