#!/bin/sh

# Content-Type header for JSON response
echo "Content-Type: application/json; charset=utf-8"
echo ""

main_timer_start=$(awk '{print $1}' /proc/uptime)

# Document root for file storage
root_dir="/www"  # Adjust as necessary

# Debugging options
DEBUG="true"  # Toggle debugging
HEX="false"   # Toggle hex debugging

# Logging functions
log_debug() {
    [ "$DEBUG" = "true" ] && echo "$@" >> /tmp/cgi-debug.log
}

error_response() {
    local message="$1"
    echo "{\"success\": false, \"message\": \"$message\"}"
    log_debug "Error: $message"
    exit 1
}

# Measure time for function execution
measure_time() {
    local start=$(awk '{print $1}' /proc/uptime)
    "$@"
    local end=$(awk '{print $1}' /proc/uptime)
    elapsed=$(echo "$end - $start" | bc)
}

# Clear debug log on start
[ "$DEBUG" = "true" ] && : > /tmp/cgi-debug.log
log_debug "Upload Test Script Started"

# Server info logging
server_info() {
    log_debug "Server: $SERVER_SOFTWARE"
    log_debug "Gateway Interface: $GATEWAY_INTERFACE"
    log_debug "Server Protocol: $SERVER_PROTOCOL"
    [ "$DEBUG" = "true" ] && env > "/tmp/cgi-environment.log"
}

# File upload handling
upload_cat() {
    log_debug "Upload Method: cat"
    CONTENT=$(cat)
    [ "$DEBUG" = "true" ] && echo "$CONTENT" | tr -d '\r' > /tmp/full-request-body.log
}

upload_dd_entire() {
    log_debug "Upload Method: dd (entire)"
    CONTENT=$(dd bs=1 count="$CONTENT_LENGTH" 2>/dev/null)
    [ "$DEBUG" = "true" ] && echo "$CONTENT" | tr -d '\r' > /tmp/full-request-body.log
}

upload_dd_chunked() {
    log_debug "Upload Method: dd (chunked)"
    CONTENT=$(dd bs=4k count=$((CONTENT_LENGTH / 4096 + 1)) 2>/dev/null)
    [ "$DEBUG" = "true" ] && echo "$CONTENT" | tr -d '\r' > /tmp/full-request-body.log
}

# Function to extract boundary from headers
parse_boundary() {
    BOUNDARY=$(echo "$CONTENT_TYPE" | sed -n 's/.*boundary=\(.*\)/\1/p')
    [ -z "$BOUNDARY" ] && error_response "Boundary not found."
    log_debug "Extracted Boundary: $BOUNDARY"
}

# Parse and sanitize filename
parse_filename() {
    FILENAME=$(echo "$CONTENT" | grep -A2 'name="filename"' | tail -n1 | tr -d '\r')
    if [ -z "$FILENAME" ]; then
        log_debug "Filename is empty or extraction failed"
        error_response "Filename extraction failed."
    fi

    sanitized_path="$root_dir/$FILENAME"
    log_debug "Sanitized Path: $sanitized_path"

    # Validate path
    if ! echo "$sanitized_path" | grep -q "^$root_dir"; then
        error_response "Invalid file path."
    fi
}

# Parse file content
parse_file_content() {
    FILE_CONTENT=$(echo "$CONTENT" | sed -n "/name=\"file\"/,/$BOUNDARY/p" | sed '1,2d;$d')
    [ "$DEBUG" = "true" ] && echo "$FILE_CONTENT" | tr -d '\r' > /tmp/cgi-file-content.txt
}

# Parse overwrite flag
parse_overwrite_flag() {
    OVERWRITE=$(echo "$CONTENT" | grep -A2 'name="overwrite"' | tail -n1 | tr -d '\r')
    log_debug "Extracted Overwrite Flag: $OVERWRITE"
}

# Write file to disk
write_file_to_disk() {
    if [ -f "$sanitized_path" ] && [ "$OVERWRITE" != "true" ]; then
        error_response "File already exists and overwrite is disabled."
    fi

    if echo -n "$FILE_CONTENT" | tr -d '\r' > "$sanitized_path"; then
        echo '{"success": true, "message": "File saved successfully."}'
    else
        error_response "Failed to save the file."
    fi
}

# Main script logic
CONTENT_LENGTH_MY="$CONTENT_LENGTH"
log_debug "Content Length: $CONTENT_LENGTH_MY"

measure_time server_info
log_debug "Elapsed Time (server_info): ${elapsed}s"

measure_time upload_cat
log_debug "Elapsed Time (upload): ${elapsed}s"

measure_time parse_boundary
log_debug "Elapsed Time (parse_boundary): ${elapsed}s"

measure_time parse_filename
log_debug "Elapsed Time (parse_filename): ${elapsed}s"

measure_time parse_file_content
log_debug "Elapsed Time (parse_file_content): ${elapsed}s"

measure_time parse_overwrite_flag
log_debug "Elapsed Time (parse_overwrite_flag): ${elapsed}s"

measure_time write_file_to_disk
log_debug "Elapsed Time (write_file_to_disk): ${elapsed}s"

main_timer_stop=$(awk '{print $1}' /proc/uptime)
all_time=$(echo "$main_timer_stop - $main_timer_start" | bc)
log_debug "Total Elapsed Time: ${all_time}s"
