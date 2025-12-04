#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Load .env file
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Check if AWS_ACCOUNT_ID is set
if [ -z "$AWS_ACCOUNT_ID" ]; then
    echo -e "${RED}✗ AWS_ACCOUNT_ID is not set in .env${NC}"
    exit 1
fi

echo -e "${CYAN}Target account: ${AWS_ACCOUNT_ID}${NC}"

# Check current credentials
CURRENT_ACCOUNT=""
if aws sts get-caller-identity &>/dev/null; then
    CURRENT_ACCOUNT=$(aws sts get-caller-identity --query Account --output text 2>/dev/null || echo "")
fi

if [ -n "$CURRENT_ACCOUNT" ]; then
    echo -e "${CYAN}Current credentials: ${CURRENT_ACCOUNT}${NC}"
fi

# Compare accounts and authenticate if needed
NEEDS_AUTH=false

if [ -z "$CURRENT_ACCOUNT" ]; then
    echo -e "${YELLOW}No valid credentials found${NC}"
    NEEDS_AUTH=true
elif [ "$CURRENT_ACCOUNT" != "$AWS_ACCOUNT_ID" ]; then
    echo -e "${YELLOW}Account mismatch! Current: ${CURRENT_ACCOUNT}, Expected: ${AWS_ACCOUNT_ID}${NC}"
    NEEDS_AUTH=true
else
    echo -e "${GREEN}✓ Credentials valid for correct account${NC}"
fi

if [ "$NEEDS_AUTH" = true ]; then
    echo -e "${YELLOW}Starting AWS login for account ${AWS_ACCOUNT_ID}...${NC}"
    
    # Perform AWS login
    aws login
    
    # Verify login succeeded and is for the correct account
    NEW_ACCOUNT=$(aws sts get-caller-identity --query Account --output text 2>/dev/null || echo "")
    
    if [ -z "$NEW_ACCOUNT" ]; then
        echo -e "${RED}✗ AWS login failed${NC}"
        exit 1
    fi
    
    if [ "$NEW_ACCOUNT" != "$AWS_ACCOUNT_ID" ]; then
        echo -e "${RED}✗ Logged into wrong account: ${NEW_ACCOUNT} (expected: ${AWS_ACCOUNT_ID})${NC}"
        echo -e "${RED}  Please log into the correct AWS account${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ AWS login successful for account ${NEW_ACCOUNT}${NC}"
fi

# Export credentials as environment variables for CDK
echo -e "${YELLOW}Exporting credentials for CDK...${NC}"
eval "$(aws configure export-credentials --format env)"
echo -e "${GREEN}✓ Credentials exported${NC}"

# Run CDK deploy
echo -e "${YELLOW}Deploying to account ${AWS_ACCOUNT_ID}...${NC}"
npx cdk deploy "$@"
