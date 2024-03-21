#!/bin/bash

declare -a PROJECT_FOLDERS=("/home/papa31/static/public/md" "/home/papa31/static/todom")
GITHUB_REPO_PRIVATE="git@github.com:PaPa31/md"
GITHUB_REPO_PUBLIC="git@github.com:PaPa31/todom"

LOGFILE="/home/papa31/logfile.log"
NOTIFICATION_TITLE="Synchronization Completed"

# Function to synchronize project folder with a GitHub repository
sync_project() {
  local project_folder="$1"
  local github_repo="$2"
  local repo_name="$3"

  cd "$project_folder" || return 1

  echo "Syncing repository in: $repo_name" >> "$LOGFILE"

  # Check if there are any changes in the working directory
  if [[ -n $(git status --short) ]]; then
    # Stage all changes, including file renames
    git add -A >> "$LOGFILE" 2>&1

    # Commit changes, with support for file renames
    git commit -am "Autocommit at $(date +'%Y-%m-%d %H:%M:%S')" >> "$LOGFILE" 2>&1

    # Check if the commit was successful
    if [[ $? -ne 0 ]]; then
      echo "Failed to commit changes in: $repo_name" >> "$LOGFILE"
      return 1
    fi

    # Push changes to remote repository
    echo "Pushing changes in: $repo_name" >> "$LOGFILE"
    git push "$github_repo" master >> "$LOGFILE" 2>&1

    # Check if the push was successful, and if not, log an error message
    if [[ $? -ne 0 ]]; then
      echo "Failed to push changes for repository in: $repo_name" >> "$LOGFILE"
      return 1
    fi
  else
    echo "No changes in repository: $repo_name" >> "$LOGFILE"
  fi

  # Perform git pull to merge remote changes
  echo "Pulling changes in: $repo_name" >> "$LOGFILE"
  git pull origin master >> "$LOGFILE" 2>&1

  # Check if the pull was successful, and if not, log an error message
  if [[ $? -ne 0 ]]; then
    echo "Failed to update the repository in: $repo_name" >> "$LOGFILE"
    return 1
  fi

  echo "Synchronized repository: $repo_name" >> "$LOGFILE"
}

# Function to display enhanced notification after synchronization
send_notification() {
  local sync_summary=""
  local changes_info=""

  # Check if there were changes committed during synchronization
  if grep -q "Autocommit" "$LOGFILE"; then
    sync_summary="Changes were synchronized successfully."

    # Extract commit messages and count the number of files changed
    changes_info+=$(grep "Autocommit" "$LOGFILE" | awk -F " at " '{ print $1" - "$2 }' | awk '{ sub(/\]$/, "", $NF); print $NF }' | paste -sd '; ')

  else
    sync_summary="No changes to synchronize."
  fi

  local message="Private Repository:\n$(grep "Private Repository" "$LOGFILE" | grep -v "No changes in repository")\n\nPublic Repository:\n$(grep "Public Repository" "$LOGFILE" | grep -v "No changes in repository")\n\n$sync_summary\n\n$changes_info"

  if command -v notify-send &>/dev/null; then
    notify-send "$NOTIFICATION_TITLE" "$message" -i emblem-default
  elif command -v zenity &>/dev/null; then
    zenity --info --title="$NOTIFICATION_TITLE" --text="$message"
  else
    echo -e "Notification: $NOTIFICATION_TITLE\n\n$message"
  fi
}

# Main script
{
  sleep 10

  > "$LOGFILE"

  # Sync private repository
  sync_project "${PROJECT_FOLDERS[0]}" "$GITHUB_REPO_PRIVATE" "Private Repository"

  # Sync public repository
  sync_project "${PROJECT_FOLDERS[1]}" "$GITHUB_REPO_PUBLIC" "Public Repository"

  echo "Synchronization completed." >> "$LOGFILE"

  send_notification

} 2>&1

exit 0
