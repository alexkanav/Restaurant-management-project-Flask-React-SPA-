def static_key(key: str):
    """Return a key builder function for FastAPI-Cache."""

    def builder(*args, **kwargs):
        return key

    return builder
