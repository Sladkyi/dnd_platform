# middleware/jwt_auth.py
from urllib.parse import parse_qs
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from rest_framework_simplejwt.authentication import JWTAuthentication
from channels.middleware.base import BaseMiddleware
from django.db import close_old_connections

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        query_string = parse_qs(scope["query_string"].decode())
        token = query_string.get("token", [None])[0]

        scope["user"] = await self.get_user(token)
        close_old_connections()
        return await super().__call__(scope, receive, send)

    @database_sync_to_async
    def get_user(self, token):
        if token is None:
            return AnonymousUser()
        try:
            validated_token = JWTAuthentication().get_validated_token(token)
            return JWTAuthentication().get_user(validated_token)
        except Exception:
            return AnonymousUser()
