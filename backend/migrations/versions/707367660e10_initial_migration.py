"""Initial migration

Revision ID: 707367660e10
Revises:
Create Date: 2025-12-20 22:51:36.797123
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "707367660e10"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # -------------------------------------------------
    # USERS: add role safely (nullable -> backfill -> not null)
    # -------------------------------------------------
    with op.batch_alter_table("users") as batch_op:
        batch_op.add_column(sa.Column("role", sa.String(length=20), nullable=True))

    # backfill existing users
    op.execute("UPDATE users SET role = 'student' WHERE role IS NULL")

    with op.batch_alter_table("users") as batch_op:
        batch_op.alter_column("role", nullable=False)
        batch_op.drop_constraint("users_email_key", type_="unique")
        batch_op.create_index("ix_users_email", ["email"], unique=True)
        batch_op.create_index("ix_users_role", ["role"], unique=False)

        # remove deprecated columns
        batch_op.drop_column("class_name")
        batch_op.drop_column("school")
        batch_op.drop_column("bio")
        batch_op.drop_column("city")
        batch_op.drop_column("profile_pic_url")
        batch_op.drop_column("age")
        batch_op.drop_column("interests")
        batch_op.drop_column("user_type")

    # -------------------------------------------------
    # ACTIVITIES (new table)
    # -------------------------------------------------
    op.create_table(
        "activities",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(length=150), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("category", sa.String(length=80)),
        sa.Column("time_spent", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime()),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id")),
    )
    op.create_index("ix_activities_user_id", "activities", ["user_id"])

    # -------------------------------------------------
    # STUDENT PROFILES
    # -------------------------------------------------
    op.create_table(
        "student_profiles",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False, unique=True),
        sa.Column("grade", sa.String(length=10)),
        sa.Column("section", sa.String(length=5)),
        sa.Column("school", sa.String(length=255)),
        sa.Column("age", sa.Integer()),
    )

    # -------------------------------------------------
    # TEACHER PROFILES
    # -------------------------------------------------
    op.create_table(
        "teacher_profiles",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False, unique=True),
        sa.Column("department", sa.String(length=100)),
        sa.Column("designation", sa.String(length=100)),
        sa.Column("experience_years", sa.Integer()),
    )

    # -------------------------------------------------
    # LEGACY / EXISTING TABLE ADJUSTMENTS
    # -------------------------------------------------
    op.drop_table("activity")

    with op.batch_alter_table("books") as batch_op:
        batch_op.create_index("ix_books_uploaded_by", ["uploaded_by"])

    with op.batch_alter_table("chat_logs") as batch_op:
        batch_op.alter_column("user_message", nullable=True)
        batch_op.create_index("ix_chat_logs_user_id", ["user_id"])

    with op.batch_alter_table("goals") as batch_op:
        batch_op.create_index("ix_goals_user_id", ["user_id"])

    with op.batch_alter_table("quiz_results") as batch_op:
        batch_op.alter_column(
            "summary_data",
            type_=sa.Text(),
            existing_type=postgresql.JSON(astext_type=sa.Text()),
            nullable=True,
        )
        batch_op.create_index("ix_quiz_results_user_id", ["user_id"])


def downgrade():
    # -------------------------------------------------
    # REVERT QUIZ RESULTS
    # -------------------------------------------------
    with op.batch_alter_table("quiz_results") as batch_op:
        batch_op.drop_index("ix_quiz_results_user_id")
    
    # Explicit cast USING clause (Postgres requires this)
    op.execute(
        """
        ALTER TABLE quiz_results
        ALTER COLUMN summary_data
        TYPE JSON
        USING summary_data::json
        """
    )
    


    # -------------------------------------------------
    # REVERT GOALS / CHAT / BOOKS
    # -------------------------------------------------
    with op.batch_alter_table("goals") as batch_op:
        batch_op.drop_index("ix_goals_user_id")

    with op.batch_alter_table("chat_logs") as batch_op:
        batch_op.drop_index("ix_chat_logs_user_id")
        batch_op.alter_column("user_message", nullable=False)

    with op.batch_alter_table("books") as batch_op:
        batch_op.drop_index("ix_books_uploaded_by")

    # -------------------------------------------------
    # DROP NEW TABLES
    # -------------------------------------------------
    op.drop_table("teacher_profiles")
    op.drop_table("student_profiles")
    op.drop_table("activities")

    # -------------------------------------------------
    # RESTORE LEGACY ACTIVITY TABLE
    # -------------------------------------------------
    op.create_table(
        "activity",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(length=150), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("time_spent", sa.Integer(), nullable=False),
        sa.Column("category", sa.String(length=80)),
        sa.Column("created_at", postgresql.TIMESTAMP()),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id")),
    )

    # -------------------------------------------------
    # USERS: restore old schema
    # -------------------------------------------------
    with op.batch_alter_table("users") as batch_op:
        batch_op.drop_index("ix_users_role")
        batch_op.drop_index("ix_users_email")
        batch_op.create_unique_constraint("users_email_key", ["email"])

        batch_op.add_column(sa.Column("user_type", sa.String(length=50), nullable=False))
        batch_op.add_column(sa.Column("interests", sa.Text()))
        batch_op.add_column(sa.Column("age", sa.Integer()))
        batch_op.add_column(sa.Column("profile_pic_url", sa.Text()))
        batch_op.add_column(sa.Column("city", sa.String(length=100)))
        batch_op.add_column(sa.Column("bio", sa.Text()))
        batch_op.add_column(sa.Column("school", sa.String(length=255)))
        batch_op.add_column(sa.Column("class_name", sa.String(length=10)))

        batch_op.drop_column("role")
