"""Fix missing inventory columns

Revision ID: fix_inventory_20260721
Revises: 078a2d6bced9
"""

from typing import Sequence, Union

from alembic import op


revision: str = "fix_inventory_20260721"
down_revision: Union[str, Sequence[str], None] = "078a2d6bced9"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        ALTER TABLE menu_items
        ADD COLUMN IF NOT EXISTS stock_quantity INTEGER
        NOT NULL DEFAULT 0
        """
    )

    op.execute(
        """
        ALTER TABLE menu_items
        ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER
        NOT NULL DEFAULT 5
        """
    )

    op.execute(
        """
        ALTER TABLE menu_items
        ADD COLUMN IF NOT EXISTS is_available BOOLEAN
        NOT NULL DEFAULT TRUE
        """
    )


def downgrade() -> None:
    op.execute(
        """
        ALTER TABLE menu_items
        DROP COLUMN IF EXISTS is_available
        """
    )

    op.execute(
        """
        ALTER TABLE menu_items
        DROP COLUMN IF EXISTS low_stock_threshold
        """
    )

    op.execute(
        """
        ALTER TABLE menu_items
        DROP COLUMN IF EXISTS stock_quantity
        """
    )
