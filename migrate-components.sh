#!/bin/bash

# Component Migration Script for Bridger Western Wiki
# This script helps migrate HTML pages to use the component system

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Bridger Western Wiki Component Migration Tool ===${NC}"

# Check if we're in the right directory
if [ ! -f "style.css" ]; then
    echo -e "${RED}Error: Must run from project root directory${NC}"
    exit 1
fi

# Create backup directory
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo -e "${YELLOW}Creating backups in: $BACKUP_DIR${NC}"

# Function to migrate a single HTML file
migrate_file() {
    local file="$1"
    local relative_path="${file#./}"
    
    echo -e "\n${GREEN}Migrating: $relative_path${NC}"
    
    # Create backup
    cp "$file" "$BACKUP_DIR/"
    
    # Calculate path depth for correct JS path
    local depth=$(echo "$relative_path" | grep -o '/' | wc -l)
    local js_path=""
    
    if [ "$depth" -eq 0 ]; then
        js_path="/js/components.js"
    else
        js_path=$(printf '../%.0s' $(seq 1 $depth))"js/components.js"
    fi
    
    # Create temporary file
    local temp_file="${file}.tmp"
    
    # Process the file
    awk -v js_path="$js_path" '
    BEGIN { in_nav = 0; in_footer = 0; nav_replaced = 0; footer_replaced = 0; }
    
    # Detect navigation section
    /<!-- Header \/ Nav -->/ || /<header>/ {
        if (!nav_replaced) {
            print "    <!-- Navigation will be loaded here -->"
            print "    <div id=\"nav-container\"></div>"
            in_nav = 1
            nav_replaced = 1
            next
        }
    }
    
    # Skip old nav content
    in_nav && /<\/header>/ {
        in_nav = 0
        next
    }
    in_nav { next }
    
    # Detect footer section
    /<!-- Footer -->/ || /<footer>/ {
        if (!footer_replaced) {
            print "    <!-- Footer will be loaded here -->"
            print "    <div id=\"footer-container\"></div>"
            in_footer = 1
            footer_replaced = 1
            next
        }
    }
    
    # Skip old footer content
    in_footer && /<\/footer>/ {
        in_footer = 0
        next
    }
    in_footer { next }
    
    # Add component loader before closing body tag
    /<\/body>/ {
        if (nav_replaced || footer_replaced) {
            print "    "
            print "    <!-- Load components -->"
            print "    <script src=\"" js_path "\"></script>"
        }
        print $0
        next
    }
    
    # Default: print the line
    { print $0 }
    ' "$file" > "$temp_file"
    
    # Replace original file
    mv "$temp_file" "$file"
    
    # Check if migration was successful
    if grep -q "nav-container" "$file" && grep -q "footer-container" "$file"; then
        echo -e "  ${GREEN}✓ Successfully migrated${NC}"
    else
        echo -e "  ${YELLOW}⚠ Manual check needed${NC}"
    fi
}

# Function to show usage
show_help() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --all          Migrate all HTML files"
    echo "  --file FILE    Migrate specific file"
    echo "  --dir DIR      Migrate all HTML files in directory"
    echo "  --help         Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 --all                    # Migrate all HTML files"
    echo "  $0 --file index.html        # Migrate specific file"
    echo "  $0 --dir stands/            # Migrate all files in stands directory"
}

# Parse arguments
if [ $# -eq 0 ]; then
    show_help
    exit 0
fi

case "$1" in
    --all)
        echo -e "${YELLOW}Finding all HTML files...${NC}"
        find . -name "*.html" ! -path "./backups/*" ! -name "test-components.html" | while read -r file; do
            migrate_file "$file"
        done
        ;;
    --file)
        if [ -z "$2" ]; then
            echo -e "${RED}Error: --file requires a filename${NC}"
            exit 1
        fi
        if [ ! -f "$2" ]; then
            echo -e "${RED}Error: File '$2' not found${NC}"
            exit 1
        fi
        migrate_file "$2"
        ;;
    --dir)
        if [ -z "$2" ]; then
            echo -e "${RED}Error: --dir requires a directory${NC}"
            exit 1
        fi
        if [ ! -d "$2" ]; then
            echo -e "${RED}Error: Directory '$2' not found${NC}"
            exit 1
        fi
        echo -e "${YELLOW}Finding HTML files in '$2'...${NC}"
        find "$2" -name "*.html" | while read -r file; do
            migrate_file "$file"
        done
        ;;
    --help)
        show_help
        ;;
    *)
        echo -e "${RED}Error: Unknown option '$1'${NC}"
        show_help
        exit 1
        ;;
esac

echo -e "\n${GREEN}=== Migration Complete ===${NC}"
echo -e "${YELLOW}Backups saved in: $BACKUP_DIR${NC}"
echo -e "${YELLOW}Please test the migrated pages to ensure everything works correctly.${NC}"
echo -e "${YELLOW}See COMPONENT_MIGRATION.md for troubleshooting and manual steps.${NC}"