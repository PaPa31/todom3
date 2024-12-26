#!/bin/sh
#echo "Content-type: application/json"
echo "Content-type: text/plain"
echo ""

# Decode URL-encoded query string
decode_url() {
  echo -e "$(echo "$1" | sed 's/+/ /g;s/%/\\x/g')"
}

# Extract and decode the filename from the query string
FILE_PATH=$(decode_url "$QUERY_STRING")

# Save raw binary data to a file
cat > "/www/$FILE_PATH"


# Respond with success
#echo '{"success": true, "message": "Binary file saved successfully."}'
echo "File saved as $FILE_PATH"