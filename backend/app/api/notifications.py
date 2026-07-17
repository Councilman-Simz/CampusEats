from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.notification_manager import notification_manager

router = APIRouter(
    prefix="/ws",
    tags=["Notifications"],
)


@router.websocket("/notifications/{user_id}")
async def notifications(
    websocket: WebSocket,
    user_id: int,
):
    await notification_manager.connect(
        user_id,
        websocket,
    )

    try:
        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:
        notification_manager.disconnect(
            user_id,
            websocket,
        )
