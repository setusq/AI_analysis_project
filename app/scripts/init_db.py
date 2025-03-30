from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.references import (
    TechnologyType, DevelopmentStage, Region,
    Organization, Person, Direction
)

def init_db():
    db = SessionLocal()
    try:
        # Create technology types
        technology_types = [
            TechnologyType(name="Artificial Intelligence"),
            TechnologyType(name="Machine Learning"),
            TechnologyType(name="Deep Learning"),
            TechnologyType(name="Natural Language Processing"),
            TechnologyType(name="Computer Vision"),
            TechnologyType(name="Robotics"),
            TechnologyType(name="Edge Computing"),
            TechnologyType(name="Cloud Computing"),
        ]
        for tech_type in technology_types:
            db.add(tech_type)

        # Create development stages
        development_stages = [
            DevelopmentStage(name="Research"),
            DevelopmentStage(name="Development"),
            DevelopmentStage(name="Testing"),
            DevelopmentStage(name="Production"),
            DevelopmentStage(name="Maintenance"),
        ]
        for stage in development_stages:
            db.add(stage)

        # Create regions
        regions = [
            Region(name="North America", code="NA"),
            Region(name="Europe", code="EU"),
            Region(name="Asia Pacific", code="APAC"),
            Region(name="Latin America", code="LATAM"),
            Region(name="Middle East", code="ME"),
            Region(name="Africa", code="AF"),
        ]
        for region in regions:
            db.add(region)

        # Create organizations
        organizations = [
            Organization(name="Google"),
            Organization(name="Microsoft"),
            Organization(name="Amazon"),
            Organization(name="Apple"),
            Organization(name="Meta"),
            Organization(name="OpenAI"),
            Organization(name="DeepMind"),
            Organization(name="IBM"),
        ]
        for org in organizations:
            db.add(org)

        # Create people
        people = [
            Person(name="John Doe"),
            Person(name="Jane Smith"),
            Person(name="Alex Johnson"),
            Person(name="Sarah Williams"),
            Person(name="Michael Brown"),
            Person(name="Emily Davis"),
            Person(name="David Wilson"),
            Person(name="Lisa Anderson"),
        ]
        for person in people:
            db.add(person)

        # Create directions
        directions = [
            Direction(name="Healthcare"),
            Direction(name="Finance"),
            Direction(name="Education"),
            Direction(name="Transportation"),
            Direction(name="Manufacturing"),
            Direction(name="Retail"),
            Direction(name="Energy"),
            Direction(name="Agriculture"),
        ]
        for direction in directions:
            db.add(direction)

        db.commit()
        print("Database initialized successfully!")

    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db() 