from langchain_community.agent_toolkits import SQLDatabaseToolkit
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.utilities import SQLDatabase
from langchain_core.tools import Tool
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
import os
from dotenv import load_dotenv
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()
google_api_key = os.getenv("GOOGLE_API_KEY")
connection_string = os.getenv("CONNECTION_STRING")

llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=google_api_key)

def get_database_connection():
    """Get database connection with support for multiple database types"""
    if not connection_string:
        raise ValueError("CONNECTION_STRING environment variable is not set")
    
    try:
        # Create engine with connection pooling and error handling
        engine = create_engine(
            connection_string,
            pool_pre_ping=True,
            pool_recycle=300,
            echo=False
        )
        
        # Test the connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        
        logger.info(f"Successfully connected to database: {connection_string.split('://')[0]}")
        return SQLDatabase(engine)
        
    except SQLAlchemyError as e:
        logger.error(f"Database connection failed: {e}")
        raise Exception(f"Failed to connect to database: {e}")

# Initialize database connection
db = get_database_connection()

toolkit = SQLDatabaseToolkit(db=db, llm=llm)
tools = toolkit.get_tools()

list_tables_tool = next(tool for tool in tools if tool.name == "sql_db_list_tables")
get_schema_tool = next(tool for tool in tools if tool.name == "sql_db_schema")

#@tool
def db_query_tool(query: str) -> str:
    """
    Execute a SQL query against the database and get back the result.
    If the query is not correct, an error message will be returned.
    If an error is returned, rewrite the query, check the query, and try again.
    """
    result = db.run_no_throw(query)
    if not result:
        return "Error: Query failed. Please rewrite your query and try again."
    return result

query_tool = Tool(
        name="db_query_tool",
        description="Executes SQL query",
        func=db_query_tool,
    )