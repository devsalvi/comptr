"""
AWS Cognito authentication utilities
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from jwt import PyJWKClient
import logging
from typing import Dict

from app.config import settings

logger = logging.getLogger(__name__)
security = HTTPBearer()


class CognitoAuth:
    def __init__(self):
        self.region = settings.COGNITO_REGION
        self.user_pool_id = settings.COGNITO_USER_POOL_ID
        self.app_client_id = settings.COGNITO_APP_CLIENT_ID
        self.jwks_url = f"https://cognito-idp.{self.region}.amazonaws.com/{self.user_pool_id}/.well-known/jwks.json"
        self.jwks_client = None

        if self.user_pool_id:
            self.jwks_client = PyJWKClient(self.jwks_url)

    def verify_token(self, token: str) -> Dict:
        """Verify JWT token from Cognito"""
        if not self.jwks_client:
            logger.warning("Cognito not configured, skipping authentication")
            return {"sub": "mock-user", "email": "mock@example.com"}

        try:
            # Get signing key
            signing_key = self.jwks_client.get_signing_key_from_jwt(token)

            # Decode and verify token
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                audience=self.app_client_id,
                options={"verify_exp": True}
            )

            return payload

        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        except jwt.InvalidTokenError as e:
            logger.error(f"Invalid token: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token"
            )
        except Exception as e:
            logger.error(f"Token verification error: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication failed"
            )


cognito_auth = CognitoAuth()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Dict:
    """
    Dependency to extract and verify current user from JWT token
    Returns user claims from Cognito
    """
    token = credentials.credentials
    user_claims = cognito_auth.verify_token(token)
    return user_claims


async def get_current_agent(
    user: Dict = Depends(get_current_user)
) -> Dict:
    """
    Dependency to ensure user is an authorized agent
    Can add additional role checks here
    """
    # Check if user has agent role (implement based on your Cognito groups)
    if "cognito:groups" in user:
        if "Agents" not in user["cognito:groups"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )

    return user
