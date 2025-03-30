"""initial

Revision ID: 001
Revises: 
Create Date: 2024-03-20 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Create technology_type table
    op.create_table(
        'technology_type',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_technology_type_id'), 'technology_type', ['id'], unique=False)
    op.create_index(op.f('ix_technology_type_name'), 'technology_type', ['name'], unique=True)

    # Create development_stage table
    op.create_table(
        'development_stage',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_development_stage_id'), 'development_stage', ['id'], unique=False)
    op.create_index(op.f('ix_development_stage_name'), 'development_stage', ['name'], unique=True)

    # Create region table
    op.create_table(
        'region',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('code', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_region_id'), 'region', ['id'], unique=False)
    op.create_index(op.f('ix_region_name'), 'region', ['name'], unique=True)
    op.create_index(op.f('ix_region_code'), 'region', ['code'], unique=True)

    # Create organization table
    op.create_table(
        'organization',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_organization_id'), 'organization', ['id'], unique=False)
    op.create_index(op.f('ix_organization_name'), 'organization', ['name'], unique=True)

    # Create person table
    op.create_table(
        'person',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_person_id'), 'person', ['id'], unique=False)
    op.create_index(op.f('ix_person_name'), 'person', ['name'], unique=True)

    # Create direction table
    op.create_table(
        'direction',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_direction_id'), 'direction', ['id'], unique=False)
    op.create_index(op.f('ix_direction_name'), 'direction', ['name'], unique=True)

    # Create research table
    op.create_table(
        'research',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('technology_type_id', sa.Integer(), nullable=True),
        sa.Column('development_stage_id', sa.Integer(), nullable=True),
        sa.Column('start_date', sa.Date(), nullable=True),
        sa.Column('source_link', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['development_stage_id'], ['development_stage.id'], ),
        sa.ForeignKeyConstraint(['technology_type_id'], ['technology_type.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_research_id'), 'research', ['id'], unique=False)
    op.create_index(op.f('ix_research_name'), 'research', ['name'], unique=False)

    # Create association tables
    op.create_table(
        'research_region',
        sa.Column('research_id', sa.Integer(), nullable=True),
        sa.Column('region_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['region_id'], ['region.id'], ),
        sa.ForeignKeyConstraint(['research_id'], ['research.id'], )
    )

    op.create_table(
        'research_organization',
        sa.Column('research_id', sa.Integer(), nullable=True),
        sa.Column('organization_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organization.id'], ),
        sa.ForeignKeyConstraint(['research_id'], ['research.id'], )
    )

    op.create_table(
        'research_person',
        sa.Column('research_id', sa.Integer(), nullable=True),
        sa.Column('person_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['person_id'], ['person.id'], ),
        sa.ForeignKeyConstraint(['research_id'], ['research.id'], )
    )

    op.create_table(
        'research_direction',
        sa.Column('research_id', sa.Integer(), nullable=True),
        sa.Column('direction_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['direction_id'], ['direction.id'], ),
        sa.ForeignKeyConstraint(['research_id'], ['research.id'], )
    )

def downgrade():
    # Drop association tables
    op.drop_table('research_direction')
    op.drop_table('research_person')
    op.drop_table('research_organization')
    op.drop_table('research_region')

    # Drop research table
    op.drop_index(op.f('ix_research_name'), table_name='research')
    op.drop_index(op.f('ix_research_id'), table_name='research')
    op.drop_table('research')

    # Drop reference tables
    op.drop_index(op.f('ix_direction_name'), table_name='direction')
    op.drop_index(op.f('ix_direction_id'), table_name='direction')
    op.drop_table('direction')

    op.drop_index(op.f('ix_person_name'), table_name='person')
    op.drop_index(op.f('ix_person_id'), table_name='person')
    op.drop_table('person')

    op.drop_index(op.f('ix_organization_name'), table_name='organization')
    op.drop_index(op.f('ix_organization_id'), table_name='organization')
    op.drop_table('organization')

    op.drop_index(op.f('ix_region_code'), table_name='region')
    op.drop_index(op.f('ix_region_name'), table_name='region')
    op.drop_index(op.f('ix_region_id'), table_name='region')
    op.drop_table('region')

    op.drop_index(op.f('ix_development_stage_name'), table_name='development_stage')
    op.drop_index(op.f('ix_development_stage_id'), table_name='development_stage')
    op.drop_table('development_stage')

    op.drop_index(op.f('ix_technology_type_name'), table_name='technology_type')
    op.drop_index(op.f('ix_technology_type_id'), table_name='technology_type')
    op.drop_table('technology_type') 