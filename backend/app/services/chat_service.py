import re

from sqlalchemy.orm import Session

from app.ai.semantic_search import semantic_search
from app.models.menu_item import MenuItem


def extract_max_price(message: str) -> float | None:
    patterns = [
        r"under\s*\$?\s*(\d+(?:\.\d+)?)",
        r"below\s*\$?\s*(\d+(?:\.\d+)?)",
        r"less than\s*\$?\s*(\d+(?:\.\d+)?)",
        r"maximum\s*\$?\s*(\d+(?:\.\d+)?)",
        r"max\s*\$?\s*(\d+(?:\.\d+)?)",
        r"\$(\d+(?:\.\d+)?)",
    ]

    lowered = message.lower()

    for pattern in patterns:
        match = re.search(pattern, lowered)

        if match:
            return float(match.group(1))

    return None


def build_response_text(
    message: str,
    items: list[MenuItem],
    max_price: float | None,
) -> str:
    if not items:
        if max_price is not None:
            return (
                f"I couldn't find a close match under "
                f"${max_price:.2f}. Try increasing your budget "
                "or using a broader food description."
            )

        return (
            "I couldn't find a close menu match. Try describing "
            "a food type, dietary preference, or budget."
        )

    item_names = ", ".join(item.name for item in items[:3])

    if max_price is not None:
        return (
            f"I found {len(items)} meal option"
            f"{'' if len(items) == 1 else 's'} under "
            f"${max_price:.2f}. Top matches include {item_names}."
        )

    return (
        f"I found {len(items)} meal option"
        f"{'' if len(items) == 1 else 's'} that match your request. "
        f"Top matches include {item_names}."
    )


def chat_with_menu(
    db: Session,
    message: str,
    limit: int = 5,
) -> dict:
    clean_message = message.strip()

    semantic_results = semantic_search(
        db=db,
        query=clean_message,
        limit=max(limit * 2, 10),
    )

    max_price = extract_max_price(clean_message)

    if max_price is not None:
        filtered_results = [
            item
            for item in semantic_results
            if item.price is not None
            and float(item.price) <= max_price
        ]
    else:
        filtered_results = semantic_results

    final_results = filtered_results[:limit]

    return {
        "reply": build_response_text(
            message=clean_message,
            items=final_results,
            max_price=max_price,
        ),
        "items": final_results,
    }
