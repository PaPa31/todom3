#!/bin/sh
echo "Content-type: application/json"
echo ""

#echo "$QUERY_STRING"

# Temporary file to store input
#INPUT_FILE=$(mktemp)
# Save stdin to temporary file
#cat > "$INPUT_FILE"
CONTENT=$(cat)
#echo $CONTENT
# Extract fileName from QUERY_STRING
FILE_NAME=$(echo "$QUERY_STRING" | sed -n 's/.*fileName=\([^&]*\).*/\1/p')

# Debugging output
echo "Extracted fileName: $FILE_NAME"

BOUNDARY=$(echo "$CONTENT_TYPE" | sed -n 's/.*boundary=\(.*\)/\1/p')

echo "Extracted boundary: $BOUNDARY"

# Split multipart content into parts
#awk -v boundary="$BOUNDARY" '
#BEGIN {RS="--" boundary; FS="\r\n"}
#NR > 1 && $1 != "--" {
#    part=$0
#    if (match(part, /filename="([^"]+)"/, arr)) {
#        filename=arr[1]
#        content_start=index(part, "\r\n\r\n") + 4
#        content=substr(part, content_start)
#        # Remove trailing boundary marker or newline
#        sub(/\r\n--$/, "", content)
#        sub(/\r\n$/, "", content)

#        # Save the content to the appropriate file
#        output_path="/www/webdav/md/chron/2024-12/" filename
#        print content > output_path
#        close(output_path)
#    }
#}
#' "$INPUT_FILE"

# Simplee
#FILE_CONTENT=$(echo $CONTENT | sed -n "/$BOUNDARY/,\$p" | sed "1,2d;/$BOUNDARY/d")
#FILE_CONTENT=$(echo "$CONTENT" | sed -n "/name=\"file\"/,/$BOUNDARY/p" | sed '1,2d;$d' )
FILE_CONTENT=$(echo "$CONTENT" | sed -n "/name=\"file\"/,/$BOUNDARY/p" | sed '1,3d;$d' )
#echo $FILE_CONTENT | hexdump -C
echo -n "$FILE_CONTENT" | tr -d '\r' > "/www/webdav/md/chron/2024-12/$FILE_NAME"

# Cleanup
#rm -f "$INPUT_FILE"

# JSON response
echo '{"success": true, "message": "File uploaded successfully."}'

