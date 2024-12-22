#!/bin/sh
#exec 2>/tmp/cgi_debug.log
#set -x

#printf "Content-Type: text/html; charset=utf-8\r\n\r\n"

# Output HTTP header
echo "Content-Type: text/html; charset=utf-8"
echo ""

#cat >> /tmp/stream_debug.log

# Stream and log input in real time
#while IFS= read -r line; do
#    echo "$line" #>> /tmp/stream_debug.log
#done
total_bytes=0
while [ "$total_bytes" -lt "$CONTENT_LENGTH" ]; do
    chunk=$(head -c 1024) || break
    [ -z "$chunk" ] && break
    echo "$chunk" #>> /tmp/raw_upload_debug.log
done