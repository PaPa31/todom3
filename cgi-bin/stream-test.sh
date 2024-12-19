#!/bin/sh

# Output HTTP header
echo "Content-Type: text/html; charset=utf-8"
echo ""

#cat >> /tmp/stream_debug.log

 Stream and log input in real time
while IFS= read -r line; do
    echo "$line" >> /tmp/stream_debug.log
done