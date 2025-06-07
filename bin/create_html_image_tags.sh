#!/bin/sh

# Universal version compatible with BusyBox ash (OpenWrt) and modern shells

# Function to display help
show_help() {
  echo "Usage: $0 <directory> [asc|desc] [mtime|name]"
  echo
  echo "Generate HTML image tags for images in the specified directory."
  echo
  echo "  <directory>      Directory containing images (default: current directory)"
  echo "  [asc|desc]       Sorting order (default: asc)"
  echo "  [mtime|name]     Sorting type (modification time or name, default: mtime)"
  echo
  echo "Examples:"
  echo "  $0 ."
  echo "  $0 /path/to/images desc mtime"
  echo "  $0 /path/to/images asc name"
}

# Check for help flag
case "$1" in
  -h|--help)
    show_help
    exit 0
    ;;
esac

# Default to the current directory if none is provided
IMG_DIR="${1:-.}"

# Check if the provided argument is a directory
if [ ! -d "$IMG_DIR" ]; then
  echo "Error: $IMG_DIR is not a directory"
  show_help
  exit 1
fi

# Determine sorting order and type
ORDER="${2:-asc}"
SORT_TYPE="${3:-mtime}"

# Get absolute path without realpath (portable)
abs_img_dir=$(cd "$IMG_DIR" 2>/dev/null && pwd)

# Detect base path after public/img, webdav/img, or img
case "$abs_img_dir" in
  */public/img/*)
    parent_dir=${abs_img_dir#*/public/img/}
    base_url="/public/img"
    ;;
  */webdav/img/*)
    parent_dir=${abs_img_dir#*/webdav/img/}
    base_url="/webdav/img"
    ;;
  */img/*)
    parent_dir=${abs_img_dir#*/img/}
    base_url="/img"
    ;;
  *)
    parent_dir="$(basename "$abs_img_dir")"
    base_url="/img"
    ;;
esac

# change absolute path to relative
# because `/todom*` is working directory
# base_url="..$base_url"

# Function to generate HTML tags
is_image() {
  case "$1" in
    *.jpg|*.jpeg|*.png|*.gif|*.webp|*.bmp|*.svg|*.tiff|*.ico) return 0 ;;
    *) return 1 ;;
  esac
}

generate_html_tags() {
  for img in "$@"; do
    if [ -f "$IMG_DIR/$img" ] && is_image "$img"; then
      echo "  <li><img src=\"$base_url/$parent_dir/$img\" /></li>"
    fi
  done
}

# Begin the HTML output
echo '<ul class="gallery">'

# Collect image list
if [ "$SORT_TYPE" = "name" ]; then
  list=$(ls "$IMG_DIR" | sort)
  [ "$ORDER" = "desc" ] && list=$(echo "$list" | sort -r)
else
  [ "$ORDER" = "asc" ] && list=$(ls -rt "$IMG_DIR") || list=$(ls -t "$IMG_DIR")
fi

# Call function with list
generate_html_tags $list

# End the HTML output
echo '</ul>'
