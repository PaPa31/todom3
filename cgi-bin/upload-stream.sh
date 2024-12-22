#!/bin/sh

#exec 2>/tmp/cgi_debug.log
#set -x

# Content-Type header for JSON response
#echo "Content-Type: application/json; charset=utf-8"
#echo ""
#printf "Content-Type: text/html; charset=utf-8\r\n\r\n"

root_dir="/www/webdav/md/chron/2024-12"  # Adjust as necessary
DEBUG="true"

# Logging functions
log_debug() {
    [ "$DEBUG" = "true" ] && echo "$@" #>> /tmp/cgi-debug.log
}

error_response() {
    local message="$1"
    echo "{\"success\": false, \"message\": \"$message\"}"
    log_debug "Error: $message"
    exit 1
}

measure_time() {
    local start=$(awk '{print $1}' /proc/uptime)
    # Capture the output of the wrapped command
    output=$("$@")
    local end=$(awk '{print $1}' /proc/uptime)
    elapsed=$(echo "$end - $start" | bc)
    # Forward the output of the wrapped command
    echo "$output"
}

sanitize_filename() {
    sanitized_path="$root_dir/$1"
    if ! echo "$sanitized_path" | grep -q "^$root_dir"; then
        error_response "Invalid file path."
    fi
    echo "$sanitized_path"
}

handle_upload() {
    boundary=$(echo "$CONTENT_TYPE" | sed -n 's/.*boundary=\(.*\)/\1/p')
    [ -z "$boundary" ] && error_response "Boundary not found."

    IFS=""
    file_path=""
    file_content=""
    overwrite="false"
    while read -r line; do
    #log_debug $line
        case "$line" in
        *name=\"filename\")
            read -r file_path
            log_debug $file_path
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

upload_stream2() {
    upload_content=""
    bytes_read=0

    # Read the input from stdin, handling CONTENT_LENGTH to stop when done
    while IFS= read -r -n 4096 chunk && [ "$bytes_read" -lt "$CONTENT_LENGTH" ]; do
        log_debug $upload_content
        log_debug ${chunk}
        upload_content="${upload_content}${chunk}"
        bytes_read=$((bytes_read + ${#chunk}))
    done

    # Truncate to CONTENT_LENGTH in case it exceeded due to last read
    upload_content=$(echo "$upload_content" | head -c "$CONTENT_LENGTH")

    log_debug "Upload Method: stream"
    log_debug "Bytes Read: $bytes_read"
}


upload_stream() {
    total_bytes=0
    #CONTENT=""
    last_chunk=""
    final_data=""

    log_debug $CONTENT_LENGTH

    #cat > /tmp/upload_debug.raw
    #echo "Raw data size: $(wc -c < /tmp/upload_debug.raw)" >&2
    #hexdump -C /tmp/upload_debug.raw >&2

    while [ "$total_bytes" -lt "$CONTENT_LENGTH" ]; do
        # Read up to 1024 bytes
        chunk=$(head -c 1024) || break

        # Check if the chunk is empty (end of stream)
        #if [ -z "$chunk" ]; then
        #    break
        #fi
        # Break if no data is read
        [ -z "$chunk" ] && break

        #echo $chunk
        #CONTENT="$CONTENT$chunk"

        # Update total bytes
        #chunk_size=${#chunk}   # may be incorrect with binary data or special characters
        chunk_size=$(echo -n "$chunk" | wc -c)  # universal solution
        total_bytes=$((total_bytes + chunk_size))
        #total_bytes=$((total_bytes + ${#chunk}))

        # Save the last chunk for debugging
        #last_chunk="$chunk"
        #log_debug $last_chunk

        # Add chunk to final data
        final_data="$final_data$chunk"
    done

    # Remove trailing '\r' if present
    # Doesn't matter what command removes the last `\r`
    # join together the last command (printf or echo)
    # and the command that removing trailing "\r"
    # This is matter!
    #final_data=$(printf "%s" "$final_data" | tr -d '\r')  # replace sed 's/\r$//'

   echo -n "$final_data"

    # Eg 
    # ~~Verify total bytes match (after removing '\r')~~
    final_size=$(echo -n "$final_data" | wc -c)

    if [ "$final_size" -ne "$CONTENT_LENGTH" ]; then
        echo "{\"success\": false, \"message\": \"Incomplete or altered upload: expected $CONTENT_LENGTH bytes but processed $final_size bytes.\"}" #>&2
        exit 1
    fi

    log_debug "Upload Method: stream"
    log_debug "Bytes Read: $total_bytes"

    # Debug last chunk
    #last_chunk_size=$(printf "%s" "$last_chunk" | wc -c)
    #echo "Last chunk size: $last_chunk_size" >&2
    #echo "Last chunk (hex): $(printf "%s" "$last_chunk" | hexdump -C)" >&2

    # Truncate to CONTENT_LENGTH in case it exceeded due to last read
    #upload_content=$(echo "$upload_content" | head -c "$CONTENT_LENGTH")

    #if [ "$total_bytes" -ne "$CONTENT_LENGTH" ]; then
    #    error_response "Incomplete upload: expected $CONTENT_LENGTH bytes but read $total_bytes bytes."
    #fi

    #echo "$CONTENT" > /tmp/raw-upload-body.log  # Save for debugging
}


log_debug "Starting upload script"
#handle_upload

#upload_stream
measure_time upload_stream
log_debug "Elapsed Time (upload_stream): ${elapsed}s"
