from fastapi import Response

from fastapi_app.core.config import config


def set_auth_cookie(response: Response, token: str):
    c = config.AUTH_COOKIE
    response.set_cookie(
        key=c.key,
        value=token,
        httponly=c.httponly,
        secure=c.secure,
        samesite=c.samesite,
        path="/",
        domain=c.domain,
        max_age=c.max_age,
    )


def clear_auth_cookie(response: Response):
    c = config.AUTH_COOKIE
    response.delete_cookie(
        key=c.key,
        httponly=c.httponly,
        secure=c.secure,
        samesite=c.samesite,
        path="/",
        domain=c.domain,
    )
