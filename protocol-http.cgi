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
  create-folder)
    read_raw_content
    echo "Debug: CONTENT=$CONTENT" >> /tmp/cgi-debug.log
    directory=$(echo "$CONTENT" | sed -n 's/.*"directory":"\([^"]*\)".*/\1/p')
    folderName=$(echo "$CONTENT" | sed -n 's/.*"folderName":"\([^"]*\)".*/\1/p')
    #confirmFlag=$(echo "$CONTENT" | sed -n 's/.*"confirm":"\([^"]*\)".*/\1/p')
    confirmFlag=$(echo "$CONTENT" | sed -n 's/.*"confirm":\([^,}]*\).*/\1/p') # Extract confirmation flag

    targetPath="${root_dir}/${directory}/${folderName}"

    if [ -d "$targetPath" ]; then
      echo '{ "success": false, "message": "Folder already exists." }'
      exit 0
    fi

    parentDir=$(dirname "$targetPath")

    # If the parent directory doesn't exist, return EXTRA_DIRECTORY_CREATE_NEEDED
    if [ ! -d "$parentDir" ]; then
        echo '{ "success": false, "message": "EXTRA_DIRECTORY_CREATE_NEEDED" }'
        exit 0
    fi

    echo "Confirm flag received: $confirmFlag" >> /tmp/cgi-debug.log
    echo "Folder to create: $targetPath" >> /tmp/cgi-debug.log


    # If confirmation is required, check before creating the folder
    if [ "$confirmFlag" = "true" ]; then
        mkdir -p "$targetPath"
        if [ $? -eq 0 ]; then
            echo '{ "success": true, "message": "Folder created successfully." }'
        else
            echo '{ "success": false, "message": "Failed to create folder." }'
        fi
        exit 0
    fi

    # Default case (without confirmation, the folder is not created)
    echo '{ "success": false, "message": "EXTRA_DIRECTORY_CREATE_NEEDED" }'
    exit 0
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
