#!/bin/bash

# Android Keystore Generation Script
# Generates a release keystore for Africoin Wallet

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Android Keystore Generation                             ║${NC}"
echo -e "${BLUE}║   Africoin Wallet - Africa Railways                       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Configuration
KEYSTORE_DIR="android/app"
KEYSTORE_FILE="africoin-release.keystore"
KEY_ALIAS="africoin"
KEYSTORE_PATH="$KEYSTORE_DIR/$KEYSTORE_FILE"

# Check if keystore already exists
if [ -f "$KEYSTORE_PATH" ]; then
    echo -e "${YELLOW}⚠️  Keystore already exists: $KEYSTORE_PATH${NC}"
    echo ""
    read -p "Do you want to overwrite it? (yes/no): " OVERWRITE
    if [ "$OVERWRITE" != "yes" ]; then
        echo "Aborted."
        exit 0
    fi
    echo ""
fi

# Create directory if it doesn't exist
mkdir -p "$KEYSTORE_DIR"

echo "This script will generate a release keystore for signing your Android app."
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Save the passwords securely!${NC}"
echo "You will need them for every release build."
echo "If you lose them, you cannot update your app on Google Play Store."
echo ""

# Prompt for passwords
read -sp "Enter keystore password (min 6 characters): " KEYSTORE_PASSWORD
echo ""
read -sp "Confirm keystore password: " KEYSTORE_PASSWORD_CONFIRM
echo ""

if [ "$KEYSTORE_PASSWORD" != "$KEYSTORE_PASSWORD_CONFIRM" ]; then
    echo -e "${RED}❌ Passwords do not match!${NC}"
    exit 1
fi

if [ ${#KEYSTORE_PASSWORD} -lt 6 ]; then
    echo -e "${RED}❌ Password must be at least 6 characters!${NC}"
    exit 1
fi

echo ""
read -sp "Enter key password (can be same as keystore password): " KEY_PASSWORD
echo ""
read -sp "Confirm key password: " KEY_PASSWORD_CONFIRM
echo ""

if [ "$KEY_PASSWORD" != "$KEY_PASSWORD_CONFIRM" ]; then
    echo -e "${RED}❌ Passwords do not match!${NC}"
    exit 1
fi

echo ""
echo "Generating keystore..."
echo ""

# Generate keystore
keytool -genkey -v \
    -keystore "$KEYSTORE_PATH" \
    -alias "$KEY_ALIAS" \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storepass "$KEYSTORE_PASSWORD" \
    -keypass "$KEY_PASSWORD" \
    -dname "CN=Benjamin Mpolokoso, OU=Africa Railways, O=Africa Railways, L=Portland, ST=Oregon, C=US"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Keystore generated successfully!${NC}"
    echo ""
    echo "Location: $KEYSTORE_PATH"
    echo "Alias: $KEY_ALIAS"
    echo ""
    
    # Verify keystore
    echo "Verifying keystore..."
    keytool -list -v -keystore "$KEYSTORE_PATH" -storepass "$KEYSTORE_PASSWORD" | head -20
    echo ""
    
    # Create key.properties file
    KEY_PROPS_FILE="android/key.properties"
    echo "Creating $KEY_PROPS_FILE..."
    cat > "$KEY_PROPS_FILE" <<EOF
storePassword=$KEYSTORE_PASSWORD
keyPassword=$KEY_PASSWORD
keyAlias=$KEY_ALIAS
storeFile=./app/$KEYSTORE_FILE
EOF
    
    echo -e "${GREEN}✅ key.properties created${NC}"
    echo ""
    
    # Update .gitignore
    if [ -f "android/.gitignore" ]; then
        if ! grep -q "*.keystore" android/.gitignore; then
            echo "*.keystore" >> android/.gitignore
            echo "*.jks" >> android/.gitignore
            echo "key.properties" >> android/.gitignore
            echo -e "${GREEN}✅ .gitignore updated${NC}"
        fi
    else
        cat > android/.gitignore <<EOF
*.keystore
*.jks
key.properties
EOF
        echo -e "${GREEN}✅ android/.gitignore created${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║   IMPORTANT: Save These Credentials Securely!             ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Keystore Password: $KEYSTORE_PASSWORD"
    echo "Key Password: $KEY_PASSWORD"
    echo "Key Alias: $KEY_ALIAS"
    echo ""
    echo -e "${YELLOW}⚠️  Store these in a password manager immediately!${NC}"
    echo -e "${YELLOW}⚠️  Backup the keystore file to a secure location!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Backup $KEYSTORE_PATH to secure cloud storage"
    echo "2. Save passwords in password manager"
    echo "3. Add credentials to Codemagic (see ANDROID_SIGNING_SETUP.md)"
    echo "4. Test release build: cd android && ./gradlew assembleRelease"
    echo ""
else
    echo -e "${RED}❌ Failed to generate keystore${NC}"
    exit 1
fi
