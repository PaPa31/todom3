# TODOm - inbrowser markdown editor & file manager

Works with files or with localStorage data.
Handle files via file:// or http protocols.

## Pre-defined Styles

You can use these pre-defined CSS styles:

### Tags and Classes

1. `iframe` with Youtube link as `src` attribute - youtube previewer (thumbnail image, description and play button). See below.
2. `div.gallery` - see below the IMG Gallery
3. `div.single-image` - arrange single image to center
4. `object` with SVG as `data` attribute - see below the Animated SVG
5. `details` > `summary` (with green/red color border)
6. `div.question` - right floating question block (as in ChatGPT)

## Built-ins Modules

### 1. Youtube Previewer

If you insert the standard Youtube shared block:

```html
<iframe
  width="560"
  height="315"
  src="https://www.youtube.com/embed/RvTEh9FhSz4?si=hMTZS1GE65Nqz9ev"
  title="YouTube video player"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  referrerpolicy="strict-origin-when-cross-origin"
  allowfullscreen
></iframe>
```

you will get an thumbnail image with description and Youtube play button.

### 2. IMG Gallery (Carusel)

If you insert a block like this:

```html
<ul class="gallery">
  <li><img src="/webdav/img/atmega-16/block-diagram.jpg" /></li>
  <li><img src="/webdav/img/atmega-16/atmega16-microcontroller.jpg" /></li>
</ul>
```

you will get an image gallery carusel as output.

You can create the above markup manually or using Extra Shell Scripts.

<details>
<summary>Extra Shell Script 1</summary>

1. create_html_image_tags.sh

The script generates multiple `<img>` tags wrapped in a `<ul>` with the class "gallery":

<details>
<summary>Script</summary>

```sh
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
```

</details>

Open your shell-terminal and Run the script with the path to the directory containing images:

```sh
create_html_image_tags.sh ~/static/public/img/russia-election
```

This script will sort the images by modification time in ascending order (oldest first) before generating the HTML tags. The script includes the parent directory name in the `src` attribute of the `<img>` tags. Adjust the `src` path within the script as needed to match your directory structure. For more details, run the script with `-h` or `--help` attribute.

</details>

### 3. Animated SVG

You can add an animated SVG using the `object` tag:

```html
<object
  type="image/svg+xml"
  data="../public/img/SVG/animated-clock.svg"
></object>
```

### 4. Single IMG

```html
<div class="single-image">
  <img src="../public/img/DMP-Group/iad-100xx-RDC-processor.jpg" />
</div>
```

### 5. Green/Red border `details` > `summary`

```html
<details>
  <summary>Hidden text</summary>

  You can see this text if you click on the "Hidden text" heading.
</details>
```

### 6. Right-floating question as ChatGPT

```html
<div class="question">
  And if I work with 1) old PATA CF-disks with 2) old Syslinux bootloaders that
  loads 3) an old Linux kernels?
</div>
```

### 7. md files viewable via CGI script

Now you can add `/md.sh?` to your md url and run like this:

```
http://192.168.0.77/md.sh?/webdav/md/chron/2025-04/05-080834-lpunpack-super-img.md
```

And you can see md content parsed as HTML.

### 8. dual-link

Now you can place "source of true" as a "dual-link":

```
<div class="data-ldr" data-ldr="/webdav/md/chron/2025-07/14-193805-ntfs-risky-for-linux.md">NTFS risky for Linux</div>
```

After this you can open link in two ways: 1) as extansible embedded content (iside a parent note) or 2) as standalone HTML page
