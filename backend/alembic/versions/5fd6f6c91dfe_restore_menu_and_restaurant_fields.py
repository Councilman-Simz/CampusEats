"""restore menu and restaurant fields

Revision ID: 5fd6f6c91dfe
Revises: 6075de02b9f5
Create Date: 2026-07-15
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "5fd6f6c91dfe"
down_revision: Union[str, Sequence[str], None] = "6075de02b9f5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "menu_items",
        sa.Column(
            "image_url",
            sa.String(),
            nullable=True,
        ),
    )

    op.alter_column(
        "menu_items",
        "name",
        existing_type=sa.String(),
        nullable=False,
    )

    op.alter_column(
        "menu_items",
        "expires_at",
        existing_type=sa.String(),
        type_=sa.DateTime(),
        existing_nullable=True,
        postgresql_using="NULLIF(expires_at, '')::timestamp",
    )

    op.add_column(
        "restaurants",
        sa.Column(
            "status",
            sa.String(),
            nullable=False,
            server_default="pending",
        ),
    )

    op.add_column(
        "restaurants",
        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true(),
        ),
    )


def downgrade() -> None:
    op.drop_column(
        "restaurants",
        "is_active",
    )

    op.drop_column(
        "restaurants",
        "status",
    )

    op.alter_column(
        "menu_items",
        "expires_at",
        existing_type=sa.DateTime(),
        type_=sa.String(),
        existing_nullable=True,
        postgresql_using="expires_at::text",
    )

    op.alter_column(
        "menu_items",
        "name",
        existing_type=sa.String(),
        nullable=True,
    )

    op.drop_column(
        "menu_items",
        "image_url",
    )
