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

measure_time_no_subshell() {
    local start=$(awk '{print $1}' /proc/uptime)
    "$@"
    local end=$(awk '{print $1}' /proc/uptime)
    elapsed=$(echo "$end - $start" | bc)
}

log_debug() {
    if [ "$DEBUG" = "true" ]; then
        echo "$@" >> /tmp/cgi-debug.log
    fi
}

# Debugging logs
[ "$DEBUG" = "true" ] && : > /tmp/cgi-debug.log  # Clear log on start
log_debug "Upload Test Script Started"

# Function to log server information
server_info() {
    CURRENT_SERVER="$SERVER_SOFTWARE"
    log_debug "Server: $CURRENT_SERVER"

    CUR_SER=$(echo "$CURRENT_SERVER" | grep -oE '^[^/]+')
    [ "$DEBUG" = "true" ] && env > "/tmp/cgi-environment-$CUR_SER.log"

    CURRENT_CGI="$GATEWAY_INTERFACE"
    log_debug "Gateway Interface: $CURRENT_CGI"

    SERV_PROTOCOL="$SERVER_PROTOCOL"
    log_debug "Server Protocol: $SERV_PROTOCOL"
}

# Functions for handling upload
upload_cat() {
    log_debug "Upload Method: cat"
    CONTENT=$(cat)
    #log_debug "Debug: Full Content Received:"
    #[ "$DEBUG" = "true" ] && echo "[$CONTENT]" >> /tmp/cgi-debug.log
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
    if [ -z "$BOUNDARY" ]; then
        echo '{"error": "Boundary not found."}'
        exit 1
    fi
    log_debug "Extracted Boundary: $BOUNDARY"
}

# Function to parse and sanitize the filename
parse_filename() {
    FILENAME=$(echo "$CONTENT" | grep -A2 'name="filename"' | tail -n1 | tr -d '\r')
    #FILENAME=$(echo "$CONTENT" | awk -v boundary="$BOUNDARY" '
    #$0 ~ boundary { getline; if ($0 ~ "name=\"filename\"") { getline; getline; print $0; exit } }' | tr -d '\r')

    if [ -z "$FILENAME" ]; then
        log_debug "Debug: Filename is empty or extraction failed"
    else
        log_debug "Debug: Final Filename: $FILENAME"
    fi

    sanitized_path="$root_dir/$FILENAME"
    log_debug "Debug: sanitized_path=$sanitized_path"

    if ! echo "$sanitized_path" | grep -q "^$root_dir"; then
        echo '{"success": false, "message": "Invalid file path."}'
        exit 1
    fi
}

# Function to extract file content
parse_file_content() {
    FILE_CONTENT=$(echo "$CONTENT" | sed -n "/name=\"file\"/,/$BOUNDARY/p" | sed '1,2d;$d')
    [ "$DEBUG" = "true" ] && echo "$FILE_CONTENT" | tr -d '\r' > /tmp/cgi-file-content.txt
}

# Function to extract overwrite flag
parse_overwrite_flag() {
    OVERWRITE=$(echo "$CONTENT" | grep -A2 'name="overwrite"' | tail -n1 | tr -d '\r')
    log_debug "Extracted Overwrite Flag: $OVERWRITE"
}

# Function to write the file to disk
write_file_to_disk() {
    if [ -f "$sanitized_path" ] && [ "$OVERWRITE" != "true" ]; then
        echo '{"success": false, "fileExists": true, "message": "File already exists."}'
    else
        if echo -n "$FILE_CONTENT" | tr -d '\r' > "$sanitized_path"; then
            echo '{"success": true, "message": "File saved successfully."}'
        else
            echo '{"success": false, "message": "Failed to save the file."}'
        fi
    fi
}

# Main script logic
CONTENT_LENGTH_MY="$CONTENT_LENGTH"
log_debug "Content Length: $CONTENT_LENGTH_MY"

measure_time_no_subshell server_info
log_debug "Elapsed Time (server_info): ${elapsed}s"

measure_time_no_subshell upload_cat
log_debug "Elapsed Time (upload): ${elapsed}s"

measure_time_no_subshell parse_boundary
log_debug "Elapsed Time (parse_boundary): ${elapsed}s"

measure_time_no_subshell parse_filename
log_debug "Elapsed Time (parse_filename): ${elapsed}s"

measure_time_no_subshell parse_file_content
log_debug "Elapsed Time (parse_file_content): ${elapsed}s"

measure_time_no_subshell parse_overwrite_flag
log_debug "Elapsed Time (parse_overwrite_flag): ${elapsed}s"

measure_time_no_subshell write_file_to_disk
log_debug "Elapsed Time (write_file_to_disk): ${elapsed}s"

main_timer_stop=$(awk '{print $1}' /proc/uptime)
all_time=$(echo "$main_timer_stop - $main_timer_start" | bc)
log_debug "Total Elapsed Time: ${all_time}s"

