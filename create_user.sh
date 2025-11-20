#!/bin/bash
# Script to create a new Cognito user

USER_POOL_ID="us-east-1_QcMqBPp39"
EMAIL="$1"
NAME="$2"
TEMP_PASSWORD="${3:-TempPassword123!}"

if [ -z "$EMAIL" ] || [ -z "$NAME" ]; then
  echo "Usage: ./create_user.sh <email> <name> [temp_password]"
  echo "Example: ./create_user.sh agent1@example.com 'Agent One'"
  exit 1
fi

echo "Creating user: $EMAIL"

aws cognito-idp admin-create-user \
  --user-pool-id "$USER_POOL_ID" \
  --username "$EMAIL" \
  --user-attributes Name=email,Value="$EMAIL" Name=email_verified,Value=true Name=name,Value="$NAME" \
  --temporary-password "$TEMP_PASSWORD" \
  --message-action SUPPRESS \
  --region us-east-1

echo ""
echo "Adding user to Agents group..."

aws cognito-idp admin-add-user-to-group \
  --user-pool-id "$USER_POOL_ID" \
  --username "$EMAIL" \
  --group-name Agents \
  --region us-east-1

echo ""
echo "✅ User created successfully!"
echo "Email: $EMAIL"
echo "Temporary Password: $TEMP_PASSWORD"
echo "Group: Agents"
