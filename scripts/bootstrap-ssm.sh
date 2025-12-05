#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}=== Hermod SSM Bootstrap ===${NC}"
echo -e "${CYAN}Creates SSM parameters from .env file${NC}\n"

# Load .env file
if [ ! -f .env ]; then
    echo -e "${RED}✗ .env file not found${NC}"
    echo -e "${YELLOW}Create a .env file with:${NC}"
    echo "  AWS_ACCOUNT_ID=your-account-id"
    echo "  AWS_REGION=eu-central-1"
    echo "  GITHUB_CONNECTION_ARN=arn:aws:codestar-connections:..."
    echo "  GITHUB_REPO=owner/repo"
    echo "  GITHUB_BRANCH=main  (optional, defaults to main)"
    exit 1
fi

export $(grep -v '^#' .env | xargs)

# Validate required variables
missing=()
[ -z "$AWS_ACCOUNT_ID" ] && missing+=("AWS_ACCOUNT_ID")
[ -z "$GITHUB_CONNECTION_ARN" ] && missing+=("GITHUB_CONNECTION_ARN")
[ -z "$GITHUB_REPO" ] && missing+=("GITHUB_REPO")

if [ ${#missing[@]} -ne 0 ]; then
    echo -e "${RED}✗ Missing required variables in .env:${NC}"
    for var in "${missing[@]}"; do
        echo "  - $var"
    done
    exit 1
fi

# Defaults
AWS_REGION=${AWS_REGION:-eu-central-1}
GITHUB_BRANCH=${GITHUB_BRANCH:-main}

echo -e "${CYAN}Configuration:${NC}"
echo "  Account ID: $AWS_ACCOUNT_ID"
echo "  Region: $AWS_REGION"
echo "  GitHub Repo: $GITHUB_REPO"
echo "  GitHub Branch: $GITHUB_BRANCH"
echo "  Connection ARN: ${GITHUB_CONNECTION_ARN:0:50}..."
echo ""

# Function to create or update SSM parameter
put_parameter() {
    local name=$1
    local value=$2
    local description=$3
    
    if aws ssm get-parameter --name "$name" --region "$AWS_REGION" &>/dev/null; then
        echo -e "${YELLOW}Updating${NC} $name"
        aws ssm put-parameter \
            --name "$name" \
            --value "$value" \
            --type String \
            --overwrite \
            --description "$description" \
            --region "$AWS_REGION" \
            >/dev/null
    else
        echo -e "${GREEN}Creating${NC} $name"
        aws ssm put-parameter \
            --name "$name" \
            --value "$value" \
            --type String \
            --description "$description" \
            --region "$AWS_REGION" \
            >/dev/null
    fi
}

echo -e "${YELLOW}Creating SSM parameters...${NC}\n"

put_parameter "/hermod/config/account-id" "$AWS_ACCOUNT_ID" "AWS Account ID for Hermod deployment"
put_parameter "/hermod/config/github-connection-arn" "$GITHUB_CONNECTION_ARN" "CodeStar connection ARN for GitHub"
put_parameter "/hermod/config/github-repo" "$GITHUB_REPO" "GitHub repository for Hermod"
put_parameter "/hermod/config/github-branch" "$GITHUB_BRANCH" "GitHub branch to deploy from"

echo -e "\n${GREEN}✓ SSM parameters created successfully${NC}"
echo -e "${CYAN}You can now deploy the pipeline:${NC}"
echo "  ./scripts/deploy.sh HermodPipeline"

