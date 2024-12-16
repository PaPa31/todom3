#!/bin/sh

# Content-Type header for JSON response
echo "Content-Type: application/json; charset=utf-8"
echo ""

# Document root for file storage
root_dir="/www"  # Adjust as necessary

# Debugging options
DEBUG=true  # Toggle debugging
HEX=false   # Toggle hex debugging

# Timer function to measure execution time
measure_time() {
    local start=$(awk '{print $1}' /proc/uptime)
    "$@"  # Execute the passed command(s)
    local end=$(awk '{print $1}' /proc/uptime)
    echo $(echo "$end - $start" | bc)
}

# Debugging logs
DEBUG && echo "Upload Test Script Started" > /tmp/cgi-debug.log

# Function to log server information
server_info() {
    CURRENT_SERVER="$SERVER_SOFTWARE"
    DEBUG && echo "Server: $CURRENT_SERVER" >> /tmp/cgi-debug.log

    CUR_SER=$(echo "$CURRENT_SERVER" | grep -oE '^[^/]+')
    DEBUG && env > "/tmp/cgi-environment-$CUR_SER.log"

    CURRENT_CGI="$GATEWAY_INTERFACE"
    DEBUG && echo "Gateway Interface: $CURRENT_CGI" >> /tmp/cgi-debug.log

    SERV_PROTOCOL="$SERVER_PROTOCOL"
    DEBUG && echo "Server Protocol: $SERV_PROTOCOL" >> /tmp/cgi-debug.log
}

# Functions for handling upload
upload_cat() {
    DEBUG && echo "Upload Method: cat" >> /tmp/cgi-debug.log
    CONTENT=$(cat)
    DEBUG && echo "$CONTENT" | tr -d '\r' > /tmp/full-request-body.log
}

upload_dd_entire() {
    DEBUG && echo "Upload Method: dd (entire)" >> /tmp/cgi-debug.log
    CONTENT=$(dd bs=1 count="$CONTENT_LENGTH" 2>/dev/null)
    DEBUG && echo "$CONTENT" | tr -d '\r' > /tmp/full-request-body.log
}

upload_dd_chunked() {
    DEBUG && echo "Upload Method: dd (chunked)" >> /tmp/cgi-debug.log
    CONTENT=$(dd bs=4k count=$((CONTENT_LENGTH / 4096 + 1)) 2>/dev/null)
    DEBUG && echo "$CONTENT" | tr -d '\r' > /tmp/full-request-body.log
}

# Function to extract boundary from headers
parse_boundary() {
    BOUNDARY=$(echo "$CONTENT_TYPE" | sed -n 's/.*boundary=\(.*\)/\1/p')
    if [ -z "$BOUNDARY" ]; then
        echo '{"error": "Boundary not found."}'
        exit 1
    fi
    DEBUG && echo "Extracted Boundary: $BOUNDARY" >> /tmp/cgi-debug.log
}

# Function to parse and sanitize the filename
parse_filename() {
    FILENAME=$(echo "$CONTENT" | grep -A2 'name="filename"' | tail -n1 | tr -d '\r')
    if [ -z "$FILENAME" ]; then
        echo "Debug: Filename is empty or extraction failed" >> /tmp/cgi-debug.log
    else
        echo "Debug: Final Filename: $FILENAME" >> /tmp/cgi-debug.log
    fi

    sanitized_path="$root_dir/$FILENAME"
    echo "Debug: sanitized_path=$sanitized_path" >> /tmp/cgi-debug.log

    if ! echo "$sanitized_path" | grep -q "^$root_dir"; then
        echo '{"success": false, "message": "Invalid file path."}'
        exit 1
    fi
}

# Function to extract file content
parse_file_content() {
    FILE_CONTENT=$(echo "$CONTENT" | sed -n "/name=\"file\"/,/$BOUNDARY/p" | sed '1,2d;$d')
    DEBUG && echo "$FILE_CONTENT" | tr -d '\r' > /tmp/cgi-file-content.txt
}

# Function to extract overwrite flag
parse_overwrite_flag() {
    OVERWRITE=$(echo "$CONTENT" | grep -A2 'name="overwrite"' | tail -n1 | tr -d '\r')
    DEBUG && echo "Extracted Overwrite Flag: $OVERWRITE" >> /tmp/cgi-debug.log
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
DEBUG && echo "Content Length: $CONTENT_LENGTH_MY" >> /tmp/cgi-debug.log

elapsed=$(measure_time server_info)
DEBUG && echo "Elapsed Time (server_info): ${elapsed}s" >> /tmp/cgi-debug.log

elapsed=$(measure_time upload_cat)  # Replace upload_cat with another function if needed
DEBUG && echo "Elapsed Time (upload): ${elapsed}s" >> /tmp/cgi-debug.log

elapsed=$(measure_time parse_boundary)
DEBUG && echo "Elapsed Time (parse_boundary): ${elapsed}s" >> /tmp/cgi-debug.log

elapsed=$(measure_time parse_filename)
DEBUG && echo "Elapsed Time (parse_filename): ${elapsed}s" >> /tmp/cgi-debug.log

elapsed=$(measure_time parse_file_content)
DEBUG && echo "Elapsed Time (parse_file_content): ${elapsed}s" >> /tmp/cgi-debug.log

elapsed=$(measure_time parse_overwrite_flag)
DEBUG && echo "Elapsed Time (parse_overwrite_flag): ${elapsed}s" >> /tmp/cgi-debug.log

elapsed=$(measure_time write_file_to_disk)
DEBUG && echo "Elapsed Time (write_file_to_disk): ${elapsed}s" >> /tmp/cgi-debug.log

main_timer_stop=$(awk '{print $1}' /proc/uptime)
all_time=$(echo "$main_timer_start - $main_timer_stop" | bc)
DEBUG && echo "Total Elapsed Time: ${all_time}s" >> /tmp/cgi-debug.log

