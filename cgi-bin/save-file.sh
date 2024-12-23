#!/bin/sh
echo "Content-type: application/json"
echo ""

# Reading data from standard input (POST-request)
#read POST_DATA
echo $QUERY_STRING
POST_DATA=$(cat)
echo $POST_DATA

# Extracting variables from a POST-request
FILE_NAME=$(echo "$POST_DATA" | sed -n 's/.*"fileName":"\([^"]*\).*/\1/p')
FILE_CONTENT=$(echo "$POST_DATA" | sed -n 's/.*"fileContent":"\(.*\)"}$/\1/p')

# Writing to file
echo -en "$FILE_CONTENT" > "/www/webdav/md/chron/2024-12/$FILE_NAME"

# JSON response
echo '{"success": true, "message": "File saved successfully."}'

