#!/bin/sh
echo "Content-type: application/json; charset=utf-8"
echo ""
#echo "Test script executed"
#env
#cat
#cat > /tmp/script_env.log

#CONTENT=$(cat)
    #CONTENT=$(cat)
#echo $CONTENT

while IFS= read -r line; do
    echo "$line"
done

echo "==================="

#echo "Content-Type: text/html"
#echo ""
#echo "<html><body>ЛОСЬ!</body></html>"

BOUNDARY=$(echo "$CONTENT_TYPE" | sed -n 's/.*boundary=\(.*\)/\1/p')
echo $BOUNDARY
FILENAME=$(echo $CONTENT | grep -m1 'Content-Disposition:' | sed -n 's/.*filename="\(.*\)"/\1/p')
echo $FILENAME
FILE_CONTENT=$(echo $CONTENT | sed -n "/$BOUNDARY/,\$p" | sed "1,2d;/$BOUNDARY/d")
echo $FILE_CONTENT
echo "$FILE_CONTENT" > "/www/webdav/md/chron/2024-12/$FILENAME"