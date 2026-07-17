from collections import defaultdict

from fastapi import WebSocket


class NotificationManager:
    def __init__(self):
        self.connections = defaultdict(list)

    async def connect(
        self,
        user_id: int,
        websocket: WebSocket,
    ):
        await websocket.accept()
        self.connections[user_id].append(websocket)

    def disconnect(
        self,
        user_id: int,
        websocket: WebSocket,
    ):
        if (
            user_id in self.connections
            and websocket in self.connections[user_id]
        ):
            self.connections[user_id].remove(websocket)

        if (
            user_id in self.connections
            and not self.connections[user_id]
        ):
            del self.connections[user_id]

    async def notify(
        self,
        user_id: int,
        payload: dict,
    ):
        sockets = list(
            self.connections.get(user_id, [])
        )

        dead_sockets = []

        for websocket in sockets:
            try:
                await websocket.send_json(payload)
            except Exception:
                dead_sockets.append(websocket)

        for websocket in dead_sockets:
            self.disconnect(
                user_id,
                websocket,
            )


notification_manager = NotificationManager()
