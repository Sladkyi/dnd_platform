from urllib.parse import parse_qs

from channels.middleware import BaseMiddleware

from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db import close_old_connections

class JWTAuthMiddleware(BaseMiddleware):
    """Authenticate WebSocket connections via JWT token in query params."""

    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode()
        token = parse_qs(query_string).get("token", [None])[0]
        scope["user"] = await self.get_user(token)
        return await super().__call__(scope, receive, send)

    @database_sync_to_async
    def get_user(self, token):
        if not token:
            return AnonymousUser()
        jwt_auth = JWTAuthentication()
        try:
            validated = jwt_auth.get_validated_token(token)
            user = jwt_auth.get_user(validated)
            close_old_connections()
            return user
        except Exception:
            return AnonymousUser()