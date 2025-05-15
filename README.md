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
  <li><img src="../public/img/cf-inside/cf-corsair-2GB-01.png" /></li>
  <li><img src="../public/img/cf-inside/cf-corsair-2GB-02.png" /></li>
  <li><img src="../public/img/cf-inside/cf-corsair-2GB-03.png" /></li>
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
#!/bin/bash

# Usage:
# "create_html_image_tags.sh /home/papa31/static/public/img/vortex86/btplug asc" (or desc)

#set -x

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
if [[ "$1" == "--help" || "$1" == "-h" ]]; then
  show_help
  exit 0
fi

# Default to the current directory if none is provided
IMG_DIR=${1:-.}

# Check if the provided argument is a directory
if [ ! -d "$IMG_DIR" ]; then
  echo "Error: $IMG_DIR is not a directory"
  show_help
  exit 1
fi

# Determine the sorting order, default to ascending (asc)
ORDER=${2:-asc}
SORT_TYPE=${3:-mtime} # Default sort type is modification time

# Convert the IMG_DIR to its absolute path
abs_img_dir=$(realpath "$IMG_DIR")

# Extract the path after the "img" directory
parent_dir=$(echo "$abs_img_dir" | sed 's#.*/img/##')

# Function to generate HTML tags
generate_html_tags() {
  local img_list=$1
  for img in $img_list; do
    img_path="$IMG_DIR/$img"
    if [ -f "$img_path" ]; then
      filename=$(basename "$img_path")
      echo "  <li><img src=\"../public/img/$parent_dir/$filename\" /></li>"
    fi
  done
}

# Begin the HTML output
echo '<ul class="gallery">'

# Sorting and looping through each image file in the directory
if [ "$SORT_TYPE" == "name" ]; then
  if [ "$ORDER" == "asc" ]; then
    generate_html_tags "$(ls "$IMG_DIR" | sort)"
  else
    generate_html_tags "$(ls "$IMG_DIR" | sort -r)"
  fi
else
  if [ "$ORDER" == "asc" ]; then
    generate_html_tags "$(ls -rt "$IMG_DIR")"
  else
    generate_html_tags "$(ls -t "$IMG_DIR")"
  fi
fi

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

### 7. Markdown Parse On The Fly

✅ Markdown files viewable via Lighttpd and md-viewer.html

> 😊 You've already done a fantastic job getting Markdown viewing working through Lighttpd with client-side rendering — that's a big achievement on such a limited system.

To see the **rendered Markdown document directly in the browser** when opening a URL like:

```
http://192.168.0.77/webdav/md/chron/2025-04/05-080834-lpunpack-super-img.md
```

#### Step 0: Get rewrite module

> First you need to configure opkg parameters to download updates from the OpenWrt 10.03 (2010) repository: `https://archive.openwrt.org/backfire/10.03/x86/packages/`.

To download and install `mod_rewrite`, run:

```
opkg update
opkg install lighttpd-mod-rewrite
```

#### 🔧 Step 1: Enable the mod_rewrite module

In `/etc/lighttpd/lighttpd.conf`, add `mod_rewrite` to this section:

```
server.modules = (
    "mod_alias",
    "mod_cgi",
    "mod_webdav",
    "mod_access",
    "mod_setenv",
    "mod_rewrite"        # ← ✅ Add this line
)
```

#### 🧱 Step 2: Keep your rewrite rule at the end

Make sure this is **present near the bottom** of the config:

```
# Alias for raw Markdown files (bypass rewrite)
alias.url += (
  "/raw/webdav/md" => "/www/webdav/md"
)

# ✅ Rewrite .md URLs to Markdown viewer
url.rewrite-once = (
  "^/webdav/md/(.+\.md)$" => "/todom3/md-viewer.html"
)
```

#### 🔄 Step 3: Restart Lighttpd

```
/etc/init.d/lighttpd restart
```

Other useful commands:

```
ps | grep lighttpd      # to see if Lighttpd is running

lighttpd -f /etc/lighttpd/lighttpd.conf -t      # to check the syntax of the config-file
```

#### 🧪 Step 4: Test it

Open this in the browser:

```
http://192.168.0.77/webdav/md/chron/2025-04/05-080834-lpunpack-super-img.md
```

You should see it **rendered as HTML**, without changing the URL.

#### ❌ But ...

This is great for browsers, but bad for your `fetch()` call — it expects **raw Markdown**, but receives **HTML** instead.

That is, if I run this from my Todom app:

```
<div data-ldr="http://192.168.0.77/webdav/md/chron/2025-04/05-080834-lpunpack-super-img.md">lpunpack</div>

# or

# see in /home/papa31/markdown-loader-snippets-2.js

```

#### Workaround `md` → `mdv`

Simply replace this:

```
# Alias for raw Markdown files (bypass rewrite)
alias.url += (
  "/raw/webdav/md" => "/www/webdav/md"
)

# ✅ Rewrite .md URLs to Markdown viewer
url.rewrite-once = (
  "^/webdav/md/(.+\.md)$" => "/todom3/md-viewer.html"
)
```

with this:

```
# ✅ Rewrite .md URLs to Markdown viewer
url.rewrite-once = (
  "^/webdav/mdv/(.+\.md)$" => "/todom3/md-viewer.html"
)

# Alias for raw Markdown files (bypass rewrite)
alias.url += (
  "/raw/webdav/mdv" => "/www/webdav/md"
)
```

and now you can simply change `md` to `mdv` inside the url and run this:

```
http://192.168.0.77/webdav/mdv/chron/2025-04/05-080834-lpunpack-super-img.md
```
