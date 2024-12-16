#!/bin/sh

echo "Content-Type: application/json; charset=utf-8"
echo ""

# Timer function
measure_time() {
    local start=$(awk '{print $1}' /proc/uptime)
    "$@"  # Execute the passed command(s)
    local end=$(awk '{print $1}' /proc/uptime)
    echo $(echo "$end - $start" | bc)
}

main_timer_start=$(awk '{print $1}' /proc/uptime)

root_dir="/www"  # Adjust based on actual document root

# Debug variables to show/hide DEBUG output data
DEBUG=true   # Change to false to stop other disk writes
HEX=false    # Change to true when debugging with small files

# Test Name
DEBUG && echo "GENERIC TEST" > /tmp/cgi-debug.log

server_info() {
    # We need to explore all the important features of the server
    # I have two CGI web-servers: 'lighttpd' and 'mini_httpd'
    # From CGI_ENVIRONMENTS: 'SERVER_SOFTWARE=lighttpd/1.4.26' and 'SERVER_SOFTWARE=mini_httpd/1.19 19dec2003'
    CURRENT_SERVER=$SERVER_SOFTWARE
    DEBUG && echo "Server: $CURRENT_SERVER" >> /tmp/cgi-debug.log

    # Remember the server name to change the testing options
    CUR_SER=$(echo $CURRENT_SERVER | grep -oE '^[^/]+')

    # Save CGI ENVIRONMENT VARIABLES to saparate file
    DEBUG && env > /tmp/cgi-environment-"$CUR_SER".log

    # Gateway Interface
    # CGI_ENVIRONMENTS: 'GATEWAY_INTERFACE=CGI/1.1' for two my web-servers
    CURRENT_CGI=$GATEWAY_INTERFACE
    DEBUG && echo "Gateway Interface: $CURRENT_CGI" >> /tmp/cgi-debug.log

    # Server Protocol
    # CGI_ENVIRONMENTS: lighttpd-'SERVER_PROTOCOL=HTTP/1.1' and mini_httpd-'SERVER_PROTOCOL=HTTP/1.0'
    SERV_PROTOCOL=$SERVER_PROTOCOL
    DEBUG && echo "Server Protocol: $SERV_PROTOCOL" >> /tmp/cgi-debug.log
}



# Upload functions
# Read POST data   (where this comment goes)?

upload_cat() {
    # Read the entire input
    CONTENT=$(cat)
    DEBUG && echo "Upload: CAT entire" > /tmp/cgi-debug.log

    # Save everything received via stdin to a file
    cat > /tmp/full-request-body.log
}

upload_dd_entire() {
    # Read the entire request body
    DEBUG && echo "Upload: DD entire" >> /tmp/cgi-debug.log
    CONTENT=$(dd bs=1 count=$CONTENT_LENGTH_MY 2>/dev/null)

    # Save CONTENT to separate file
    DEBUG && echo -en "$CONTENT" | tr -d '\r' > /tmp/cgi-full-request-body.log
}

upload_dd_chunked() {
    # Read using buffered reads
    DEBUG && echo "DD chunked" >> /tmp/cgi-debug.log
    CONTENT=$(dd bs=4k count=$(($CONTENT_LENGTH_MY / 4096 + 1)) 2>/dev/null)

    # Save CONTENT to separate file
    DEBUG && echo -en "$CONTENT" | tr -d '\r' > /tmp/cgi-full-request-body.log
}

parse_boundary() {
    # Parse boundary
    echo "Debug: CONTENT_TYPE: $CONTENT_TYPE" >> /tmp/cgi-debug.log
    BOUNDARY=$(echo "$CONTENT_TYPE" | sed -n 's/.*boundary=\(.*\)/\1/p')
    if [ -z "$BOUNDARY" ]; then
    echo '{"error": "Boundary not found."}'
    exit 1
    fi
    echo "Debug: Extracted Boundary: $BOUNDARY" >> /tmp/cgi-debug.log
}

parse_filename() {
    # Parse and sanitize filename
    FILENAME=$(echo "$CONTENT" | grep -A2 'name="filename"' | tail -n1 | tr -d '\r')
    # Final validation
    if [ -z "$FILENAME" ]; then
        echo "Debug: Filename is empty or extraction failed" >> /tmp/cgi-debug.log
    else
        echo "Debug: Final Filename: $FILENAME" >> /tmp/cgi-debug.log
    fi

    # Sanitize file path
    sanitized_path="${root_dir}/${FILENAME}"
    echo "Debug: sanitized_path=$sanitized_path" >> /tmp/cgi-debug.log
    if ! echo "$sanitized_path" | grep -q "^${root_dir}"; then
        echo '{ "success": false, "message": "Invalid file path." }'
        exit 1
    fi
}

parse_file_content() {
    # Parse file content
    FILE_CONTENT=$(echo "$CONTENT" | sed -n "/name=\"file\"/,/$BOUNDARY/p" | sed '1,2d;$d' )

    #DEBUG && echo "Debug: Final File Content:" >> /tmp/cgi-debug.log
    #DEBUG && echo "[$FILE_CONTENT]" >> /tmp/cgi-debug.log
    #DEBUG && HEX && echo -n "$FILE_CONTENT" | hexdump -C >> /tmp/cgi-debug.log

    # Save CONTENT to separate file
    DEBUG && echo -en "$FILE_CONTENT" | tr -d '\r' > /tmp/cgi-file-content.txt
}

parse_overwrite_flag() {
    # Parse overwrite flag
    OVERWRITE=$(echo "$CONTENT" | grep -A2 'name="overwrite"' | tail -n1 | tr -d '\r')
    DEBUG && echo "Debug: Extracted overwrite: $OVERWRITE" >> /tmp/cgi-debug.log

    DEBUG && HEX && echo "Debug: Sanitized OVERWRITE:" >> /tmp/cgi-debug.log
    DEBUG && HEX && echo -n "$OVERWRITE" | hexdump -C >> /tmp/cgi-debug.log
}

write_file_to_disk() {
    # Save file: JSON long message
    if [ -f "$sanitized_path" ] && [ "$OVERWRITE" != "true" ]; then
        echo '{ "success": false, "fileExists": true, "message": "File already exists." }'
    else
        # the only way to remove the redundand `\r`
        if echo -n "$FILE_CONTENT" | tr -d '\r' > "$sanitized_path"; then
            echo '{ "success": true, "message": "File saved successfully." }'
        else
            echo '{ "success": false, "message": "Failed to save the file." }'
        fi
    fi

    # Save file: JSON short message
    #if [ "$OVERWRITE" = "true" ] || [ ! -f "$sanitized_path" ]; then
    #  echo "$FILE_CONTENT" > "$sanitized_path"
    #  echo '{"success": true}'   # JSON response
    #else
    #  echo '{"fileExists": true}'   # JSON response
    #fi
}


# Main logic
CONTENT_LENGTH_MY=$CONTENT_LENGTH
DEBUG && echo "Debug: Script Name: $SCRIPT_NAME" >> /tmp/cgi-debug.log
DEBUG && echo "Debug: Content Length: $CONTENT_LENGTH_MY" >> /tmp/cgi-debug.log
DEBUG && echo "$CONTENT_LENGTH_MY" >> /tmp/cgi-debug.log

elapsed=$(measure_time server_info)
DEBUG && echo "Elapsed Time (server_info): ${elapsed} seconds" >> /tmp/cgi-debug.log

elapsed=$(measure_time upload_cat) # we can replace 'upload_cat' with others
DEBUG && echo "Elapsed Time (upload_cat): ${elapsed} seconds" >> /tmp/cgi-debug.log

elapsed=$(measure_time parse_boundary)
DEBUG && echo "Elapsed Time (parse_boundary): ${elapsed} seconds" >> /tmp/cgi-debug.log

elapsed=$(measure_time parse_filename)
DEBUG && echo "Elapsed Time (parse_filename): ${elapsed} seconds" >> /tmp/cgi-debug.log

elapsed=$(measure_time parse_file_content)
DEBUG && echo "Elapsed Time (parse_file_content): ${elapsed} seconds" >> /tmp/cgi-debug.log

elapsed=$(measure_time parse_overwrite_flag)
DEBUG && echo "Elapsed Time (parse_overwrite_flag): ${elapsed} seconds" >> /tmp/cgi-debug.log

elapsed=$(measure_time write_file_to_disk)
DEBUG && echo "Elapsed Time (write_file_to_disk): ${elapsed} seconds" >> /tmp/cgi-debug.log


main_timer_stop=$(awk '{print $1}' /proc/uptime)
all_time=$(echo "$main_timer_start - $main_timer_stop" | bc)
echo "All Elapsed Time: ${all_time} seconds" >> /tmp/cgi-debug.log