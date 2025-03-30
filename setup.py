from setuptools import setup, find_packages

setup(
    name="ai-analysis",
    version="0.1",
    packages=find_packages(),
    install_requires=[
        "fastapi==0.109.2",
        "uvicorn==0.27.1",
        "sqlalchemy==2.0.27",
        "pydantic==2.6.1",
        "psycopg2-binary==2.9.9",
        "python-dotenv==1.0.1",
        "alembic==1.13.1",
        "pytest==8.0.0",
        "httpx==0.26.0",
    ],
) 