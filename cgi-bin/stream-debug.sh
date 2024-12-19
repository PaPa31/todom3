#!/bin/sh

# Content-Type header for JSON response
echo "Content-Type: application/json; charset=utf-8"
echo ""

root_dir="/www"  # Adjust as necessary
DEBUG="true"

#cat > /tmp/fff.log

# Logging functions
log_debug() {
    [ "$DEBUG" = "true" ] && echo "$@" >> /tmp/cgi-debug.log
}

error_response2() {
    local message="$1"
    echo "{\"success\": false, \"message\": \"$message\"}"
    log_debug "Error: $message"
    exit 1
}

sanitize_filename2() {
    sanitized_path="$root_dir/$1"
    if ! echo "$sanitized_path" | grep -q "^$root_dir"; then
        error_response "Invalid file path."
    fi
    echo "$sanitized_path"
}

sanitize_filename() {
    echo "$1" | sed 's/[^a-zA-Z0-9._-]/_/g'
}

error_response() {
    echo "{\"success\": false, \"message\": \"$1\"}" >&2
    exit 1
}

handle_upload() {
    while IFS= read -r line; do
        echo "$line" >> /tmp/stream_debug.log
    done
}

handle_upload4() {
    boundary=${CONTENT_TYPE#*boundary=}
    [ -z "$boundary" ] && error_response "Boundary not found."

    IFS=""
    file_path=""
    overwrite="false"
    tmp_file=$(mktemp /tmp/upload.XXXXXX)

    while read -r line; do
        case "$line" in
        *"name=\"filename\"")
            read -r file_path
            file_path=$(echo "$file_path" | tr -d '\r')
            ;;
        *"name=\"file\"")
            read -r line
            while read -r line && [ "$line" != "--$boundary--" ]; do
                echo "$line" >> "$tmp_file"
            done
            ;;
        *"name=\"overwrite\"")
            read -r overwrite
            overwrite=$(echo "$overwrite" | tr -d '\r' | tr '[:upper:]' '[:lower:]')
            ;;
        esac
    done

    file_path=$(sanitize_filename "$file_path")

    if [ -f "$file_path" ] && [ "$overwrite" != "true" ]; then
        echo '{"success": false, "fileExists": true}'
        exit 0
    fi

    if ! mv "$tmp_file" "$file_path"; then
        error_response "Failed to save the file."
    else
        echo '{"success": true, "message": "File saved successfully."}'
    fi
}


handle_upload3() {
    boundary=$(echo "$CONTENT_TYPE" | sed -n 's/.*boundary=\(.*\)/\1/p')
    [ -z "$boundary" ] && error_response "Boundary not found."

    IFS=""
    file_path=""
    file_content=""
    overwrite="false"
    in_file_content=false

    while read -r line; do
        # Detecting form-data fields based on the boundary
        if [[ "$line" == "--$boundary"* ]]; then
            in_file_content=false
            continue
        fi

        case "$line" in
        *"name=\"filename\"")
            read -r file_path
            file_path=$(echo "$file_path" | tr -d '\r')
            ;;
        *"name=\"file\"")
            in_file_content=true
            ;;
        *"name=\"overwrite\"")
            read -r overwrite
            overwrite=$(echo "$overwrite" | tr -d '\r')
            ;;
        esac

        if $in_file_content && [[ "$line" != "--$boundary--" ]]; then
            # Append content to the file
            file_content="$file_content$line"$'\n'
        fi
    done

    # Sanitize filename to prevent directory traversal or invalid characters
    file_path=$(sanitize_filename "$file_path")

    if [ -z "$file_path" ]; then
        error_response "Filename is missing."
    fi

    if [ -f "$file_path" ] && [ "$overwrite" != "true" ]; then
        echo '{"success": false, "fileExists": true}'
        exit 0
    fi

    # Write the file content to the target path
    echo -n "$file_content" > "$file_path"
    if [ $? -eq 0 ]; then
        echo '{"success": true, "message": "File saved successfully."}'
    else
        error_response "Failed to save the file."
    fi
}

handle_upload2() {
    boundary=$(echo "$CONTENT_TYPE" | sed -n 's/.*boundary=\(.*\)/\1/p')
    [ -z "$boundary" ] && error_response "Boundary not found."
    log_debug "Boundary: $boundary"

    IFS=""
    file_path=""
    file_content=""
    overwrite="false"
    while read -r line; do
        case "$line" in
        *"name=\"filename\"")
            read -r file_path
            file_path=$(echo "$file_path" | tr -d '\r')
            ;;
        *"name=\"file\"")
            read -r line
            while read -r line && [ "$line" != "--$boundary--" ]; do
                file_content="$file_content$line"
            done
            ;;
        *"name=\"overwrite\"")
            read -r overwrite
            overwrite=$(echo "$overwrite" | tr -d '\r')
            ;;
        esac
    done

    file_path=$(sanitize_filename "$file_path")

    if [ -f "$file_path" ] && [ "$overwrite" != "true" ]; then
        echo '{"success": false, "fileExists": true}'
        exit 0
    fi

    echo -n "$file_content" > "$file_path"
    if [ $? -eq 0 ]; then
        echo '{"success": true, "message": "File saved successfully."}'
    else
        error_response "Failed to save the file."
    fi
}

log_debug "Starting upload script"
handle_upload
