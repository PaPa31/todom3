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
echo "Resolved Path: $absolute_path" >> /tmp/cgi-debug.log

# Check if path exists and log permissions
if [ -e "$absolute_path" ]; then
  echo "Path exists: $absolute_path" >> /tmp/cgi-debug.log
  ls -ld "$absolute_path" >> /tmp/cgi-debug.log
else
  echo "Path does not exist: $absolute_path" >> /tmp/cgi-debug.log
fi

case "$action" in
  save-file)
    read CONTENT
    fileName=$(echo "$CONTENT" | sed -n 's/.*"fileName":"\([^"]*\)".*/\1/p')
    fileContent=$(echo "$CONTENT" | sed -n 's/.*"fileContent":"\([^"]*\)".*/\1/p')
    overWrite=$(echo "$CONTENT" | grep -q '"overwrite": *true' && echo true || echo false)

    targetPath="${root_dir}/${fileName}"

    if [ "$overWrite" = false ] && [ -f "$targetPath" ]; then
      echo '{ "success": false, "message": "File already exists." }'
    else
      echo "$fileContent" > "$targetPath" && echo '{ "success": true, "message": "File saved successfully." }' || echo '{ "success": false, "message": "Failed to save the file." }'
    fi
    ;;
    
  create-folder)
    read CONTENT
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
