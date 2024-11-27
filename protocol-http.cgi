#!/bin/sh
echo "Content-Type: application/json; charset=UTF-8"
echo ""

# Log incoming request (for debugging)
echo "Action: $QUERY_STRING" >> /tmp/cgi-debug.log

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
  CONTENT=""
  while IFS= read -r line; do
    CONTENT="${CONTENT}${line}"
  done
}

# Decode JSON values using jq or manual parsing
parse_json_field() {
  echo "$1" | sed -n "s/.*\"$2\":\"\([^\"]*\)\".*/\1/p"
}

# Decode URL-encoded values
url_decode() {
  printf '%b' "$(echo "$1" | sed 's/%/\\x/g')"
}

case "$action" in
  save-file)
    # Read raw input
    read_raw_content
    echo "Debug: CONTENT=$CONTENT" >> /tmp/cgi-debug.log
    echo "Content-Length: $CONTENT_LENGTH" >> /tmp/cgi-debug.log
    echo "$CONTENT" | head -c 100 >> /tmp/cgi-debug.log

    fileName=$(parse_json_field "$CONTENT" "fileName")
    fileContent=$(parse_json_field "$CONTENT" "fileContent")
    overwrite=$(parse_json_field "$CONTENT" "overwrite")

    echo "Debug: overwrite=$overwrite" >> /tmp/cgi-debug.log

    # Decode URL-encoded values
    fileName=$(url_decode "$fileName")
    fileContent=$(url_decode "$fileContent")

    # Decode URL-encoded content and replace + with space
    fileContent=$(echo "$fileContent" | sed 's/+/ /g' )

    echo "Debug: Decoded fileName=$fileName" >> /tmp/cgi-debug.log
    echo "Debug: Decoded fileContent=$fileContent" >> /tmp/cgi-debug.log

    # Sanitize file path
    sanitized_path="${root_dir}/${fileName}"
    if ! echo "$sanitized_path" | grep -q "^${root_dir}"; then
      echo '{ "success": false, "message": "Invalid file path." }'
      exit 1
    fi

      # Save or overwrite the file
      if [ -f "$sanitized_path" ] && [ "$overwrite" != "true" ]; then
        echo '{ "success": false, "fileExists": true, "message": "File already exists." }'
      else
        if printf "%s" "$fileContent" > "$sanitized_path"; then
          echo '{ "success": true, "message": "File saved successfully." }'
        else
          echo '{ "success": false, "message": "Failed to save the file." }'
        fi
      fi
    else
      echo '{ "success": false, "message": "Invalid action." }'
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
