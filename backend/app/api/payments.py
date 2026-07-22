import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.models.menu_item import MenuItem
from app.models.order_item import OrderItem
from app.models.order import Order
from app.models.user import User
from app.schemas.payment import (
    CheckoutSessionCreate,
    CheckoutSessionResponse,
)

router = APIRouter(
    prefix="/payments",
    tags=["Payments"],
)

stripe.api_key = settings.STRIPE_SECRET_KEY


@router.post(
    "/checkout-session",
    response_model=CheckoutSessionResponse,
)
def create_checkout_session(
    payment_data: CheckoutSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = (
        db.query(Order)
        .filter(
            Order.id == payment_data.order_id,
            Order.user_id == current_user.id,
        )
        .first()
    )

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found.",
        )

    if order.payment_status == "paid":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This order has already been paid.",
        )

    try:
        session = stripe.checkout.Session.create(
            mode="payment",
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": "usd",
                        "product_data": {
                            "name": f"Savora Order #{order.id}",
                        },
                        "unit_amount": int(
                            round(float(order.total) * 100)
                        ),
                    },
                    "quantity": 1,
                }
            ],
            success_url=(
                f"{settings.STRIPE_SUCCESS_URL}"
                f"?session_id={{CHECKOUT_SESSION_ID}}"
            ),
            cancel_url=(
                f"{settings.STRIPE_CANCEL_URL}"
                f"?order_id={order.id}"
            ),
            metadata={
                "order_id": str(order.id),
                "user_id": str(current_user.id),
            },
        )
    except stripe.StripeError as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(error),
        ) from error

    order.stripe_session_id = session.id
    order.payment_method = "stripe"
    order.payment_status = "pending"

    db.commit()

    return CheckoutSessionResponse(
        checkout_url=session.url,
        session_id=session.id,
    )

@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: Session = Depends(get_db),
):
    payload = await request.body()
    signature = request.headers.get("stripe-signature")

    if not signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Stripe signature.",
        )

    try:
        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=signature,
            secret=settings.STRIPE_WEBHOOK_SECRET,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid webhook payload.",
        ) from error
    except stripe.SignatureVerificationError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid webhook signature.",
        ) from error

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]

        metadata = session["metadata"] if "metadata" in session else None

        if metadata is not None:
            try:
                order_id = metadata["order_id"]
            except KeyError:
                order_id = None
        else:
            order_id = None

        if order_id:
            order = (
                db.query(Order)
                .filter(Order.id == int(order_id))
                .first()
            )

            if order and order.payment_status != "paid":
                order_items = (
                    db.query(OrderItem)
                    .filter(OrderItem.order_id == order.id)
                    .all()
                )

                try:
                    for order_item in order_items:
                        menu_item = (
                            db.query(MenuItem)
                            .filter(
                                MenuItem.id
                                == order_item.menu_item_id
                            )
                            .with_for_update()
                            .first()
                        )

                        if menu_item is None:
                            raise RuntimeError(
                                f"Menu item "
                                f"{order_item.menu_item_id} "
                                "was not found."
                            )

                        quantity = order_item.quantity or 0
                        current_stock = (
                            menu_item.stock_quantity or 0
                        )

                        if current_stock < quantity:
                            raise RuntimeError(
                                f"Insufficient stock for "
                                f"{menu_item.name}."
                            )

                        menu_item.stock_quantity = (
                            current_stock - quantity
                        )
                        menu_item.is_available = (
                            menu_item.stock_quantity > 0
                        )

                    payment_intent = (
                        session["payment_intent"]
                        if "payment_intent" in session
                        else None
                    )

                    order.payment_status = "paid"
                    order.payment_method = "stripe"
                    order.status = "confirmed"
                    order.stripe_session_id = session["id"]
                    order.stripe_payment_intent_id = (
                        str(payment_intent)
                        if payment_intent
                        else None
                    )

                    db.commit()
                    db.refresh(order)

                except Exception:
                    db.rollback()
                    raise

    return {"received": True}
