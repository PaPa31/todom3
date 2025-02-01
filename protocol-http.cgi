#!/bin/sh

#read CONTENT

#echo "Content-Type: application/x-www-form-urlencoded; charset=UTF-8"
echo "Content-Type: application/json; charset=utf-8"
echo ""

# Log incoming request (for debugging)
echo "Action: $QUERY_STRING" > /tmp/cgi-debug.log

# Parse action and path from QUERY_STRING
action=$(echo "$QUERY_STRING" | sed -n 's/.*action=\([^&]*\).*/\1/p')
encoded_path=$(echo "$QUERY_STRING" | sed -n 's/.*path=\([^&]*\).*/\1/p')

# Decode the URL-encoded path
relative_path=$(printf '%b' "$(echo "$encoded_path" | sed 's/%/\\x/g')")

root_dir="/www"  # Adjust based on actual document root

# Resolve to absolute path within /www
absolute_path="${root_dir}/${relative_path}"

# Sanitize file path (prevent directory traversal)
if ! echo "$absolute_path" | grep -q "^${root_dir}"; then
  echo '{ "success": false, "message": "Invalid file path." }'
  exit 1
fi

echo "Resolved Path: $absolute_path" >> /tmp/cgi-debug.log

# Check if path exists and log permissions
if [ -e "$absolute_path" ]; then
  echo "Path exists: $absolute_path" >> /tmp/cgi-debug.log
  ls -ld "$absolute_path" >> /tmp/cgi-debug.log
else
  echo "Path does not exist: $absolute_path" >> /tmp/cgi-debug.log
fi

# Function to read raw input data
read_raw_content() {
  CONTENT=$(cat) # Read raw data from standard input
  #CONTENT=""
  #while IFS= read -r line; do
  #  CONTENT="${CONTENT}${line}"
  #done
  echo "Content length: ${#CONTENT}" >> /tmp/cgi-debug.log
  echo "Content length: $CONTENT_LENGTH" >> /tmp/cgi-debug.log

}

# Decode JSON values using jq or manual parsing
parse_json_field() {
  echo "$1" | sed -n "s/.*\"$2\":\"\([^\"]*\)\".*/\1/p"
}

# Decode URL-encoded values
urldecode() {
  printf '%b' "$(echo "$1" | sed 's/%/\\x/g')"
}


url_decode() {
    echo -e "$(echo "$1" | sed 's/%/\\x/g')"
}


case "$action" in
  save-file)
    # Read the entire input and log it
    CONTENT=$(cat)
    echo "Debug: Full Content Received:" >> /tmp/cgi-debug.log
    echo "$CONTENT" >> /tmp/cgi-debug.log

    # Extract boundary and log it
    BOUNDARY=$(echo "$CONTENT" | head -n 1 | tr -d '\r')
    echo "Debug: Extracted Boundary: $BOUNDARY" >> /tmp/cgi-debug.log

    # Extract the segment containing the filename and log it
    FILENAME_SEGMENT=$(echo "$CONTENT" | grep -A2 "name=\"filename\"" | tr -d '\r')
    echo "Debug: Filename Segment: $FILENAME_SEGMENT" >> /tmp/cgi-debug.log

    # Extract the filename value from the segment and log it
    FILENAME=$(echo "$FILENAME_SEGMENT" | tail -n 1)
    echo "Debug: Extracted Filename Value: $FILENAME" >> /tmp/cgi-debug.log

    # Final log for validation
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

    # Extract the overwrite segment
    OVERWRITE_SEGMENT=$(echo "$CONTENT" | grep -A2 "name=\"overwrite\"" | tr -d '\r')
    echo "Debug: Owerwrite Segment: $OVERWRITE_SEGMENT" >> /tmp/cgi-debug.log

    # Extract overwrite value (last line of the segment)
    OVERWRITE=$(echo "$OVERWRITE_SEGMENT" | tail -n 1)
    echo "Debug: Extracted overwrite: $OVERWRITE" >> /tmp/cgi-debug.log

    # Sanitize file path
    sanitized_path="${root_dir}/${FILENAME}"
    echo "Debug: sanitized_path=$sanitized_path" >> /tmp/cgi-debug.log

    if ! echo "$sanitized_path" | grep -q "^${root_dir}"; then
      echo '{ "success": false, "message": "Invalid file path." }'
      exit 1
    fi

    # Save or overwrite the file
    #if [ -f "$sanitized_path" ] && [ "$overwrite" != "true" ]; then
    #  echo '{ "success": false, "fileExists": true, "message": "File already exists." }'
    #else
    #  #if printf "%s" "$fileContent" > "$sanitized_path"; then
    #  if echo "$FILE_CONTENT" > "$sanitized_path"; then
    #    echo '{ "success": true, "message": "File saved successfully." }'
    #  else
    #    echo '{ "success": false, "message": "Failed to save the file." }'
    #  fi
    #fi

    # Save or overwrite the file
    if [ -f "$sanitized_path" ] && [ "$overwrite" != "true" ]; then
      echo '{ "success": false, "fileExists": true, "message": "File already exists." }'
    else
      if printf "%s" "$FILE_CONTENT" > "$sanitized_path"; then
        echo '{ "success": true, "message": "File saved successfully." }'
      else
        echo '{ "success": false, "message": "Failed to save the file." }'
      fi
    fi
    ;;

  create-folder)
    read_raw_content
    echo "Debug: CONTENT=$CONTENT" >> /tmp/cgi-debug.log
    directory=$(echo "$CONTENT" | sed -n 's/.*"directory":"\([^"]*\)".*/\1/p')
    folderName=$(echo "$CONTENT" | sed -n 's/.*"folderName":"\([^"]*\)".*/\1/p')

    targetPath="${root_dir}/${directory}/${folderName}"

    mkdir -p "$targetPath"
    [ $? -eq 0 ] && echo '{ "success": true, "message": "Folder created successfully." }' || echo '{ "success": false, "message": "Failed to create folder." }'
    ;;

  open-directory)
    echo "Debug: I inside the open-directory" >> /tmp/cgi-debug.log
    if [ -d "$absolute_path" ]; then
      # It's a directory, list contents
      echo '{ "success": true, "tree": ['
      first_entry=true
      for file in "$absolute_path"/*; do
        [ "$first_entry" = true ] && first_entry=false || echo ","
        echo -n '{"name": "'$(basename "$file")'", "isDirectory": '
        [ -d "$file" ] && echo -n "true" || echo -n "false"
        echo -n '}'
      done
      echo ']}'
    elif [ -f "$absolute_path" ]; then
      # It's a file, just leave this file as is
      cat "$absolute_path"
    else
      # Path is neither a file nor a directory, return an error
      echo '{ "success": false, "message": "Directory not found or inaccessible." }'
    fi
    ;;

  *)
    echo '{ "success": false, "message": "Unknown action." }'
    ;;
esac
