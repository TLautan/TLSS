"""Add new fields to deals table

Revision ID: 21cbaa269087
Revises: d8dbff8c7da7
Create Date: 2025-07-07 10:22:23.394609

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '21cbaa269087'
down_revision: Union[str, Sequence[str], None] = 'd8dbff8c7da7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Create all ENUMs with raw, idempotent SQL.
    op.execute("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'deal_status') THEN CREATE TYPE deal_status AS ENUM ('in_progress', 'won', 'lost', 'cancelled'); END IF; END$$;")
    op.execute("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'deal_type') THEN CREATE TYPE deal_type AS ENUM ('direct', 'agency'); END IF; END$$;")
    op.execute("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'forecast_accuracy') THEN CREATE TYPE forecast_accuracy AS ENUM ('high', 'medium', 'low'); END IF; END$$;")
    
    # Add the columns, referring to the types by name.
    op.add_column('deals', sa.Column('status', postgresql.ENUM('in_progress', 'won', 'lost', 'cancelled', name='deal_status', create_type=False), nullable=True))
    op.add_column('deals', sa.Column('type', postgresql.ENUM('direct', 'agency', name='deal_type', create_type=False), nullable=True))
    op.add_column('deals', sa.Column('forecast_accuracy', postgresql.ENUM('high', 'medium', 'low', name='forecast_accuracy', create_type=False), nullable=True))
    op.add_column('deals', sa.Column('lead_source', sa.String(length=255), nullable=True))
    op.add_column('deals', sa.Column('product_name', sa.String(length=255), nullable=True))
    
    # Manually update the status column for existing rows to avoid null constraint violations if it's NOT NULL
    op.execute("UPDATE deals SET status = 'in_progress' WHERE status IS NULL")
    op.execute("UPDATE deals SET type = 'direct' WHERE type IS NULL")
    # Now alter the column to be NOT NULL
    op.alter_column('deals', 'status', nullable=False)
    op.alter_column('deals', 'type', nullable=False)

def downgrade() -> None:
    op.drop_column('deals', 'product_name')
    op.drop_column('deals', 'lead_source')
    op.drop_column('deals', 'forecast_accuracy')
    op.drop_column('deals', 'type')
    op.drop_column('deals', 'status')
    
    op.execute("DROP TYPE IF EXISTS forecast_accuracy;")
    op.execute("DROP TYPE IF EXISTS deal_type;")
    op.execute("DROP TYPE IF EXISTS deal_status;")