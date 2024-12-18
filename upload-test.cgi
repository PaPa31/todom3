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
    log_debug "Script Name: $SCRIPT_NAME"
    log_debug "Server: $SERVER_SOFTWARE"
    log_debug "Gateway Interface: $GATEWAY_INTERFACE"
    log_debug "Server Protocol: $SERVER_PROTOCOL"
    [ "$DEBUG" = "true" ] && env > "/tmp/cgi-environment.log"
}

# Read input without loading full content into memory
read_input_stream() {
    temp_file=$(mktemp /tmp/upload-XXXXXX)
    dd bs=4k count=$((CONTENT_LENGTH / 4096 + 1)) 2>/dev/null > "$temp_file"
    echo "$temp_file"
}

# Extract boundary from headers
parse_boundary() {
    BOUNDARY=$(echo "$CONTENT_TYPE" | sed -n 's/.*boundary=\(.*\)/\1/p')
    [ -z "$BOUNDARY" ] && error_response "Boundary not found."
    log_debug "Extracted Boundary: $BOUNDARY"
}

# Extract filename from input
parse_filename() {
    local temp_file="$1"
    FILENAME=$(grep -A2 'name="filename"' "$temp_file" | tail -n1 | tr -d '\r')
    [ -z "$FILENAME" ] && error_response "Filename extraction failed."
    log_debug "Extracted Filename: $FILENAME"
}

sanitize_filename() {
    sanitized_path="$root_dir/$FILENAME"
    log_debug "Sanitized Path: $sanitized_path"

    # Validate path
    if ! echo "$sanitized_path" | grep -q "^$root_dir"; then
        error_response "Invalid file path."
    fi
}

# Extract file content from input
parse_file_content() {
    local temp_file="$1"
    local start_line=$(grep -n 'name="file"' "$temp_file" | cut -d: -f1)
    local end_line=$(grep -n -- "--$BOUNDARY--" "$temp_file" | cut -d: -f1)
    FILE_CONTENT=$(sed -n "$((start_line + 2)),$((end_line - 1))p" "$temp_file")
    [ "$DEBUG" = "true" ] && echo "$FILE_CONTENT" | tr -d '\r' > /tmp/cgi-file-content.txt
}

# Parse overwrite flag
parse_overwrite_flag() {
    local temp_file="$1"
    OVERWRITE=$(grep -A2 'name="overwrite"' "$temp_file" | tail -n1 | tr -d '\r')
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
log_debug "Content Length: $CONTENT_LENGTH"

measure_time server_info
log_debug "Elapsed Time (server_info): ${elapsed}s"

input_file=$(measure_time read_input_stream)
log_debug "Elapsed Time (read_input_stream): ${elapsed}s"

measure_time parse_boundary
log_debug "Elapsed Time (parse_boundary): ${elapsed}s"

measure_time parse_filename "$input_file"
log_debug "Elapsed Time (parse_filename): ${elapsed}s"

measure_time sanitize_filename
log_debug "Elapsed Time (sanitize_filename): ${elapsed}s"

measure_time parse_file_content "$input_file"
log_debug "Elapsed Time (parse_file_content): ${elapsed}s"

measure_time parse_overwrite_flag "$input_file"
log_debug "Elapsed Time (parse_overwrite_flag): ${elapsed}s"

measure_time write_file_to_disk
log_debug "Elapsed Time (write_file_to_disk): ${elapsed}s"

rm -f "$input_file"

main_timer_stop=$(awk '{print $1}' /proc/uptime)
all_time=$(echo "$main_timer_stop - $main_timer_start" | bc)
log_debug "Total Elapsed Time: ${all_time}s"
