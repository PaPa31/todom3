#!/bin/sh

# Content-Type header for JSON response
echo "Content-Type: application/json; charset=utf-8"
echo ""

main_timer_start=$(awk '{print $1}' /proc/uptime)

# test files:
# 1-byte 71739-bytes

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
    log_debug "Script Name: $SCRIPT_NAME"
    log_debug "Server: $SERVER_SOFTWARE"
    log_debug "Gateway Interface: $GATEWAY_INTERFACE"
    log_debug "Server Protocol: $SERVER_PROTOCOL"
    [ "$DEBUG" = "true" ] && env > "/tmp/cgi-environment.log"
}

# File upload handling
upload_cat() {
    #log_debug "Upload Method: cat"
    CONTENT=$(cat)  # 0.6s 0.11s
    #[ "$DEBUG" = "true" ] && echo "$CONTENT" | tr -d '\r' > /tmp/full-request-body.log
}

upload_dd_entire() {
    #log_debug "Upload Method: dd (entire)"
    CONTENT=$(dd bs=1 count="$CONTENT_LENGTH" 2>/dev/null) # 0.11s 8.71s
    #[ "$DEBUG" = "true" ] && echo "$CONTENT" | tr -d '\r' > /tmp/full-request-body.log
}

upload_dd_chunked() {
    #log_debug "Upload Method: dd (chunked)"
    CONTENT=$(dd bs=4k count=$((CONTENT_LENGTH / 4096 + 1)) 2>/dev/null)  # 0.06s 0.12s
    #[ "$DEBUG" = "true" ] && echo "$CONTENT" | tr -d '\r' > /tmp/full-request-body.log
}

# Function to extract boundary from headers
parse_boundary() {
    #BOUNDARY=$(echo "$CONTENT_TYPE" | awk '/boundary=/{print substr($0, index($0, "boundary=") + 9); exit}' <&0)  # 0.08s
    BOUNDARY=$(echo "$CONTENT_TYPE" | sed -n 's/.*boundary=\(.*\)/\1/p')  # 0.07s 0.07s
    [ -z "$BOUNDARY" ] && error_response "Boundary not found."
    #log_debug "Extracted Boundary: $BOUNDARY"
}

# Parse filename
parse_filename() {
    #FILENAME=$(echo "$CONTENT" | grep -A2 'name="filename"' | tail -n1 | tr -d '\r')  # 0.13s
    FILENAME=$(echo "$CONTENT" | awk -v RS="\r\n" '/Content-Disposition:.*name="filename"/ {getline; getline; print $0; exit}' <&0)  # 0.08s 0.22s
    #FILENAME=$(echo "$CONTENT" | awk '/name="filename"/{getline; getline; print $0}' | tr -d '\r')  # 0.11s
    [ -z "$FILENAME" ] && error_response "Filename extraction failed."
}

sanitize_filename() {
    sanitized_path="$root_dir/$FILENAME"
    #log_debug "Sanitized Path: $sanitized_path"

    # Validate path
    if ! echo "$sanitized_path" | grep -q "^$root_dir"; then
        error_response "Invalid file path."
    fi
}

# Parse file content
parse_file_content() {
    FILE_CONTENT=$(echo "$CONTENT" | sed -n "/name=\"file\"/,/$BOUNDARY/p" | sed '1,2d;$d')  # 0.14s  0.72s
    [ "$DEBUG" = "true" ] && echo "$FILE_CONTENT" | tr -d '\r' > /tmp/cgi-file-content.txt
}

# Parse overwrite flag
parse_overwrite_flag() {
    OVERWRITE=$(echo "$CONTENT" | grep -A2 'name="overwrite"' | tail -n1 | tr -d '\r')  # 0.13s 0.36s
    #log_debug "Extracted Overwrite Flag: $OVERWRITE"
}

# Write file to disk
write_file_to_disk() {
    if [ -f "$sanitized_path" ] && [ "$OVERWRITE" != "true" ]; then
        error_response "File already exists and overwrite is disabled."
    fi

    if echo -n "$FILE_CONTENT" | tr -d '\r' > "$sanitized_path"; then  # 0.07s 0.22s
        echo '{"success": true, "message": "File saved successfully."}'
    else
        error_response "Failed to save the file."
    fi
}


# Main script logic
log_debug "Content Length: $CONTENT_LENGTH"

measure_time server_info
log_debug "Elapsed Time (server_info): ${elapsed}s"

measure_time upload_cat
log_debug "Elapsed Time (upload): ${elapsed}s"

measure_time parse_boundary
log_debug "Elapsed Time (parse_boundary): ${elapsed}s"

measure_time parse_filename
log_debug "Elapsed Time (parse_filename): ${elapsed}s"

measure_time sanitize_filename
log_debug "Elapsed Time (sanitize_filename): ${elapsed}s"

measure_time parse_file_content
log_debug "Elapsed Time (parse_file_content): ${elapsed}s"

measure_time parse_overwrite_flag
log_debug "Elapsed Time (parse_overwrite_flag): ${elapsed}s"

measure_time write_file_to_disk
log_debug "Elapsed Time (write_file_to_disk): ${elapsed}s"

main_timer_stop=$(awk '{print $1}' /proc/uptime)
all_time=$(echo "$main_timer_stop - $main_timer_start" | bc)  # 1.29s 2.47s
log_debug "Total Elapsed Time: ${all_time}s"
