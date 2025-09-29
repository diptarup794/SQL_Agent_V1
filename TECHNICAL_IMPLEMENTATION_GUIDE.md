# 🔧 Technical Implementation Guide

## 📋 Table of Contents

1. [Core Implementation Details](#core-implementation-details)
2. [Agent Implementation Patterns](#agent-implementation-patterns)
3. [State Management Implementation](#state-management-implementation)
4. [Tool Integration Patterns](#tool-integration-patterns)
5. [Error Handling Implementation](#error-handling-implementation)
6. [LLM Integration Patterns](#llm-integration-patterns)
7. [Database Integration](#database-integration)
8. [Workflow Orchestration](#workflow-orchestration)
9. [Performance Optimization](#performance-optimization)
10. [Testing Strategies](#testing-strategies)

---

## 🏗️ Core Implementation Details

### 1. **Project Structure**
```
app/
├── staff/                    # AI Agent implementations
│   ├── agent_node.py        # Main agent logic
│   ├── tool_node.py         # Tool-based nodes
│   └── few_shot/            # Few-shot learning examples
│       └── examples.json
├── toolkit/                 # Database tools
│   └── tool.py             # Database connection and tools
├── utilities/               # Shared utilities
│   └── func.py             # State definition
├── workflow/                # Workflow orchestration
│   └── flow.py             # LangGraph workflow definition
├── llmops/                  # LLM operations and monitoring
│   └── langfuse.py         # Langfuse integration
└── mermaid/                 # Visualization tools
    └── vis.py              # Mermaid diagram generation
```

### 2. **Dependencies and Requirements**
```python
# Core LangChain and LangGraph
langchain==0.3.20
langchain-community==0.3.19
langchain-core==0.3.43
langgraph==0.3.5
langgraph-checkpoint==2.0.18

# LLM Integration
langchain-google-genai==2.0.10

# Database Support
sqlalchemy>=2.0.0
pymysql>=1.0.0
psycopg2-binary>=2.9.0

# Utilities
python-dotenv>=1.0.0
pydantic>=2.0.0
```

---

## 🤖 Agent Implementation Patterns

### 1. **Base Agent Pattern**
```python
from langgraph.types import Command
from typing import Literal
from utilities.func import State

def agent_node(state: State) -> Command[Literal["next_node"]]:
    """
    Standard agent node implementation pattern
    """
    # 1. Extract required data from state
    question = state["question"]
    input_data = state["input_field"]
    
    # 2. Process with LLM
    response = llm_agent.invoke({
        "input": input_data,
        "context": question
    })
    
    # 3. Parse and clean response
    result = parse_response(response)
    
    # 4. Update state and route to next node
    return Command(
        update={"output_field": result},
        goto="next_node"
    )
```

### 2. **Tool Node Pattern**
```python
def tool_node(state: State) -> Command[Literal["next_agent_node"]]:
    """
    Standard tool node implementation pattern
    """
    # 1. Extract input from state
    input_data = state["input_field"]
    
    # 2. Execute tool operation
    result = tool.invoke(input_data)
    
    # 3. Update state with results
    state_data = {
        "question": state["question"],
        "tool_result": result,
        # ... other state fields
    }
    
    # 4. Route to next agent
    return Command(
        update=state_data,
        goto="next_agent_node"
    )
```

### 3. **Conditional Routing Pattern**
```python
def conditional_agent_node(state: State) -> Command[Literal["success_node", "retry_node"]]:
    """
    Agent with conditional routing based on results
    """
    # Process input
    result = process_input(state)
    
    # Determine next node based on result
    if result_is_valid(result):
        goto = "success_node"
        update_data = {"result": result}
    else:
        goto = "retry_node"
        update_data = {"error": result, "retry_count": state.get("retry_count", 0) + 1}
    
    return Command(
        update=update_data,
        goto=goto
    )
```

---

## 📊 State Management Implementation

### 1. **State Definition**
```python
from typing import Annotated, List, Dict
from typing_extensions import TypedDict
from langgraph.graph.message import AnyMessage, add_messages

class State(TypedDict):
    # Input data
    question: str                           # Original user question
    
    # Discovery phase
    list_tables: str                        # Available tables string
    table_target: List[str]                 # Selected table names
    
    # Schema phase
    schema: List[str]                       # Table schema information
    
    # Selection phase
    column_target: Dict[str, List[str]]     # Table -> columns mapping
    
    # Generation phase
    generation: str | None                  # Generated SQL query
    
    # Validation phase
    verify_valid: str                       # Validation result
    
    # Execution phase
    data: str                               # Query execution results
    error: str | None                       # Error messages
    
    # Output phase
    answer: str                             # Final natural language answer
    
    # System fields
    valid: str                              # Overall validation status
    messages: Annotated[list[AnyMessage], add_messages]  # Chat history
```

### 2. **State Update Patterns**
```python
# Simple state update
return Command(
    update={"field_name": new_value},
    goto="next_node"
)

# Multiple field update
return Command(
    update={
        "field1": value1,
        "field2": value2,
        "field3": value3
    },
    goto="next_node"
)

# Conditional state update
update_data = {}
if condition:
    update_data["success_field"] = success_value
else:
    update_data["error_field"] = error_value

return Command(
    update=update_data,
    goto=next_node
)
```

### 3. **State Validation**
```python
def validate_state(state: State) -> bool:
    """Validate state before processing"""
    required_fields = ["question"]
    
    for field in required_fields:
        if field not in state or not state[field]:
            return False
    
    return True

def sanitize_state(state: State) -> State:
    """Clean and sanitize state data"""
    sanitized = state.copy()
    
    # Remove None values
    sanitized = {k: v for k, v in sanitized.items() if v is not None}
    
    # Clean string fields
    if "question" in sanitized:
        sanitized["question"] = sanitized["question"].strip()
    
    return sanitized
```

---

## 🛠️ Tool Integration Patterns

### 1. **Database Tool Implementation**
```python
from langchain_community.utilities import SQLDatabase
from langchain_core.tools import Tool
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

class DatabaseTool:
    def __init__(self, connection_string: str):
        self.connection_string = connection_string
        self.db = self._create_connection()
    
    def _create_connection(self) -> SQLDatabase:
        """Create database connection with error handling"""
        try:
            engine = create_engine(
                self.connection_string,
                pool_pre_ping=True,
                pool_recycle=300,
                echo=False
            )
            
            # Test connection
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            
            return SQLDatabase(engine)
            
        except SQLAlchemyError as e:
            raise Exception(f"Database connection failed: {e}")
    
    def list_tables(self) -> str:
        """Get list of all tables"""
        try:
            tables = self.db.get_usable_table_names()
            return ", ".join(tables)
        except Exception as e:
            return f"Error listing tables: {e}"
    
    def get_schema(self, table_name: str) -> str:
        """Get schema for specific table"""
        try:
            schema = self.db.get_table_info([table_name])
            return schema
        except Exception as e:
            return f"Error getting schema for {table_name}: {e}"
    
    def execute_query(self, query: str) -> str:
        """Execute SQL query safely"""
        try:
            result = self.db.run_no_throw(query)
            return result if result else "No results returned"
        except Exception as e:
            return f"Query execution error: {e}"
```

### 2. **Tool Wrapper Pattern**
```python
def create_tool_wrapper(tool_func, name: str, description: str) -> Tool:
    """Create LangChain Tool wrapper"""
    return Tool(
        name=name,
        description=description,
        func=tool_func
    )

# Usage
list_tables_tool = create_tool_wrapper(
    db_tool.list_tables,
    "list_tables",
    "Get list of all database tables"
)

get_schema_tool = create_tool_wrapper(
    db_tool.get_schema,
    "get_schema", 
    "Get schema for a specific table"
)

query_tool = create_tool_wrapper(
    db_tool.execute_query,
    "execute_query",
    "Execute SQL query against database"
)
```

---

## ⚠️ Error Handling Implementation

### 1. **Multi-Level Error Handling**
```python
import logging
from typing import Optional, Tuple

logger = logging.getLogger(__name__)

class AgentError(Exception):
    """Base exception for agent errors"""
    pass

class LLMError(AgentError):
    """LLM-related errors"""
    pass

class DatabaseError(AgentError):
    """Database-related errors"""
    pass

class ValidationError(AgentError):
    """Validation errors"""
    pass

def safe_agent_execution(agent_func, state: State, max_retries: int = 3) -> Command:
    """Execute agent with error handling and retry logic"""
    for attempt in range(max_retries):
        try:
            return agent_func(state)
        except LLMError as e:
            logger.warning(f"LLM error on attempt {attempt + 1}: {e}")
            if attempt == max_retries - 1:
                return fallback_to_mock_llm(state)
        except DatabaseError as e:
            logger.error(f"Database error: {e}")
            return Command(
                update={"error": f"Database error: {e}"},
                goto="error_handler_node"
            )
        except ValidationError as e:
            logger.warning(f"Validation error: {e}")
            return Command(
                update={"error": f"Validation error: {e}"},
                goto="retry_node"
            )
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return Command(
                update={"error": f"Unexpected error: {e}"},
                goto="error_handler_node"
            )
    
    # If all retries failed
    return Command(
        update={"error": "Max retries exceeded"},
        goto="error_handler_node"
    )
```

### 2. **Graceful Degradation**
```python
def get_llm_with_fallback():
    """Get LLM with fallback to mock"""
    try:
        # Try to get real LLM
        if google_api_key and google_api_key != "your_google_api_key_here":
            return ChatGoogleGenerativeAI(
                model="gemini-2.0-flash",
                google_api_key=google_api_key
            )
    except Exception as e:
        logger.warning(f"Failed to initialize Gemini: {e}")
    
    # Fallback to mock LLM
    logger.info("Using mock LLM for demo purposes")
    return create_mock_llm()

def create_mock_llm():
    """Create mock LLM for demo purposes"""
    from langchain_core.language_models.base import BaseLanguageModel
    from langchain_core.outputs import LLMResult, Generation
    
    class MockLLM(BaseLanguageModel):
        def _generate(self, messages, stop=None, run_manager=None, **kwargs):
            response_text = "Mock response: This is a demo without API key"
            return LLMResult(generations=[[Generation(text=response_text)]])
        
        def _llm_type(self):
            return "mock"
        
        def invoke(self, input, config=None, **kwargs):
            class MockResponse:
                def __init__(self):
                    self.content = "Mock response: This is a demo without API key"
                def text(self):
                    return self.content
            return MockResponse()
        
        # Implement other required methods...
    
    return MockLLM()
```

### 3. **Retry Mechanisms**
```python
import time
import random
from functools import wraps

def retry_with_backoff(max_retries: int = 3, base_delay: float = 1.0):
    """Decorator for retry with exponential backoff"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_retries - 1:
                        raise e
                    
                    # Exponential backoff with jitter
                    delay = base_delay * (2 ** attempt) + random.uniform(0, 1)
                    logger.warning(f"Attempt {attempt + 1} failed: {e}. Retrying in {delay:.2f}s")
                    time.sleep(delay)
            
            return None
        return wrapper
    return decorator

@retry_with_backoff(max_retries=3, base_delay=1.0)
def execute_with_retry(query: str) -> str:
    """Execute query with retry logic"""
    return db.run_no_throw(query)
```

---

## 🧠 LLM Integration Patterns

### 1. **Prompt Template Management**
```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field

class AgentPrompt:
    def __init__(self, template: str, output_parser=None):
        self.template = template
        self.prompt = ChatPromptTemplate.from_template(template)
        self.output_parser = output_parser
    
    def create_agent(self, llm):
        """Create agent with prompt and parser"""
        if self.output_parser:
            return self.prompt | llm | self.output_parser
        else:
            return self.prompt | llm
    
    def invoke(self, llm, **kwargs):
        """Invoke agent with parameters"""
        agent = self.create_agent(llm)
        return agent.invoke(kwargs)

# Example usage
interpreter_prompt = AgentPrompt("""
You are an input prompt analyzer designed to identify user requirements.

Question: {input}
Available tables: {tables}

Return JSON format: {{"table_target": ["table1", "table2"]}}
""")

selector_prompt = AgentPrompt("""
Your task is to identify and retrieve column names from specified tables.

Question: {todo}
Tables: {input}
Schema: {schema}

Return JSON format: {{"column_target": {{"table1": ["col1", "col2"]}}}}
""", PydanticOutputParser(pydantic_object=Column))
```

### 2. **Few-Shot Learning Implementation**
```python
import json
import os

class FewShotManager:
    def __init__(self, examples_file: str):
        self.examples_file = examples_file
        self.examples = self._load_examples()
    
    def _load_examples(self) -> list:
        """Load few-shot examples from file"""
        try:
            with open(self.examples_file, "r", encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            logger.warning(f"Examples file not found: {self.examples_file}")
            return []
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in examples file: {e}")
            return []
    
    def get_relevant_examples(self, question: str, max_examples: int = 3) -> list:
        """Get relevant examples for a question"""
        # Simple keyword matching (could be improved with embeddings)
        question_lower = question.lower()
        relevant_examples = []
        
        for example in self.examples:
            if any(keyword in question_lower for keyword in example.get("keywords", [])):
                relevant_examples.append(example)
                if len(relevant_examples) >= max_examples:
                    break
        
        return relevant_examples
    
    def format_examples_for_prompt(self, examples: list) -> str:
        """Format examples for prompt inclusion"""
        formatted = []
        for example in examples:
            formatted.append(f"""
Question: {example['question']}
SQL: {example['sql']}
Explanation: {example['explanation']}
""")
        return "\n".join(formatted)

# Usage
few_shot_manager = FewShotManager("app/staff/few_shot/examples.json")
examples = few_shot_manager.get_relevant_examples(question)
formatted_examples = few_shot_manager.format_examples_for_prompt(examples)
```

### 3. **LLM Response Processing**
```python
def process_llm_response(response, expected_format: str = "text") -> dict:
    """Process LLM response based on expected format"""
    try:
        if expected_format == "json":
            # Extract JSON from response
            text = response.text()
            # Clean up common formatting issues
            text = text.replace("```json", "").replace("```", "").strip()
            return json.loads(text)
        elif expected_format == "boolean":
            # Extract boolean value
            text = response.text().strip().lower()
            return text in ["true", "yes", "1", "valid"]
        else:
            # Return as text
            return response.text()
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON response: {e}")
        return {"error": f"JSON parsing failed: {e}"}
    except Exception as e:
        logger.error(f"Failed to process response: {e}")
        return {"error": f"Response processing failed: {e}"}
```

---

## 🗄️ Database Integration

### 1. **Connection Management**
```python
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.exc import SQLAlchemyError
from contextlib import contextmanager

class DatabaseManager:
    def __init__(self, connection_string: str):
        self.connection_string = connection_string
        self.engine = None
        self._initialize_engine()
    
    def _initialize_engine(self):
        """Initialize database engine with proper configuration"""
        try:
            self.engine = create_engine(
                self.connection_string,
                pool_pre_ping=True,      # Test connections before use
                pool_recycle=300,        # Recycle connections every 5 minutes
                pool_size=10,            # Connection pool size
                max_overflow=20,         # Additional connections
                echo=False,              # Disable SQL logging
                connect_args={
                    "check_same_thread": False  # For SQLite
                } if "sqlite" in self.connection_string else {}
            )
            
            # Test connection
            self.test_connection()
            logger.info(f"Database connection established: {self.connection_string.split('://')[0]}")
            
        except SQLAlchemyError as e:
            logger.error(f"Database connection failed: {e}")
            raise Exception(f"Failed to connect to database: {e}")
    
    def test_connection(self):
        """Test database connection"""
        with self.engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    
    @contextmanager
    def get_connection(self):
        """Get database connection with automatic cleanup"""
        conn = None
        try:
            conn = self.engine.connect()
            yield conn
        except SQLAlchemyError as e:
            if conn:
                conn.rollback()
            raise e
        finally:
            if conn:
                conn.close()
    
    def get_table_info(self) -> dict:
        """Get comprehensive table information"""
        with self.get_connection() as conn:
            inspector = inspect(conn)
            tables = inspector.get_table_names()
            
            table_info = {}
            for table in tables:
                columns = inspector.get_columns(table)
                foreign_keys = inspector.get_foreign_keys(table)
                indexes = inspector.get_indexes(table)
                
                table_info[table] = {
                    "columns": [
                        {
                            "name": col["name"],
                            "type": str(col["type"]),
                            "nullable": col["nullable"],
                            "primary_key": col.get("primary_key", False)
                        }
                        for col in columns
                    ],
                    "foreign_keys": foreign_keys,
                    "indexes": indexes
                }
            
            return table_info
```

### 2. **Query Execution with Safety**
```python
class SafeQueryExecutor:
    def __init__(self, db_manager: DatabaseManager):
        self.db_manager = db_manager
        self.dangerous_keywords = [
            "DROP", "DELETE", "INSERT", "UPDATE", "ALTER", 
            "CREATE", "TRUNCATE", "EXEC", "EXECUTE"
        ]
    
    def is_safe_query(self, query: str) -> bool:
        """Check if query is safe to execute"""
        query_upper = query.upper().strip()
        
        # Check for dangerous keywords
        for keyword in self.dangerous_keywords:
            if keyword in query_upper:
                return False
        
        # Check for multiple statements
        if ";" in query and query.count(";") > 1:
            return False
        
        return True
    
    def execute_query(self, query: str) -> dict:
        """Execute query safely"""
        if not self.is_safe_query(query):
            return {
                "success": False,
                "error": "Query contains dangerous operations and cannot be executed"
            }
        
        try:
            with self.db_manager.get_connection() as conn:
                result = conn.execute(text(query))
                
                if result.returns_rows:
                    rows = result.fetchall()
                    columns = result.keys()
                    
                    return {
                        "success": True,
                        "data": [dict(zip(columns, row)) for row in rows],
                        "row_count": len(rows)
                    }
                else:
                    return {
                        "success": True,
                        "message": "Query executed successfully",
                        "row_count": result.rowcount
                    }
                    
        except SQLAlchemyError as e:
            return {
                "success": False,
                "error": str(e)
            }
```

---

## 🎛️ Workflow Orchestration

### 1. **Workflow Definition**
```python
from langgraph.graph import END, StateGraph, START
from langgraph.checkpoint.memory import MemorySaver

def create_workflow() -> StateGraph:
    """Create and configure the workflow graph"""
    # Create workflow with state
    workflow = StateGraph(State)
    
    # Add all nodes
    workflow.add_node("list_tables_node", list_tables_node)
    workflow.add_node("interpreter_agent_node", interpreter_agent_node)
    workflow.add_node("get_schema_node", get_schema_node)
    workflow.add_node("selector_agent_node", selector_agent_node)
    workflow.add_node("scribe_agent_node", scribe_agent_node)
    workflow.add_node("verify_agent_node", verify_agent_node)
    workflow.add_node("executor_agent_node", executor_agent_node)
    workflow.add_node("summary_agent_node", summary_agent_node)
    
    # Define entry point
    workflow.add_edge(START, "list_tables_node")
    
    # Compile with checkpointing for state persistence
    memory = MemorySaver()
    graph = workflow.compile(checkpointer=memory)
    
    return graph

def execute_workflow(graph: StateGraph, question: str, config: dict = None) -> dict:
    """Execute workflow with proper configuration"""
    if config is None:
        config = {
            "recursion_limit": 50,
            "thread_id": "default"
        }
    
    try:
        # Execute workflow
        result = None
        for event in graph.stream(
            {"question": question},
            config=config
        ):
            result = event
            logger.debug(f"Workflow event: {event}")
        
        return result
        
    except Exception as e:
        logger.error(f"Workflow execution failed: {e}")
        return {"error": str(e)}
```

### 2. **Workflow Monitoring**
```python
import time
from typing import Dict, Any

class WorkflowMonitor:
    def __init__(self):
        self.metrics = {}
        self.start_time = None
    
    def start_execution(self, question: str):
        """Start monitoring workflow execution"""
        self.start_time = time.time()
        self.metrics = {
            "question": question,
            "start_time": self.start_time,
            "node_timings": {},
            "errors": []
        }
    
    def log_node_start(self, node_name: str):
        """Log when a node starts execution"""
        self.metrics["node_timings"][node_name] = {
            "start_time": time.time()
        }
    
    def log_node_end(self, node_name: str, success: bool = True, error: str = None):
        """Log when a node completes execution"""
        if node_name in self.metrics["node_timings"]:
            self.metrics["node_timings"][node_name]["end_time"] = time.time()
            self.metrics["node_timings"][node_name]["duration"] = (
                self.metrics["node_timings"][node_name]["end_time"] - 
                self.metrics["node_timings"][node_name]["start_time"]
            )
            self.metrics["node_timings"][node_name]["success"] = success
            
            if error:
                self.metrics["errors"].append({
                    "node": node_name,
                    "error": error,
                    "timestamp": time.time()
                })
    
    def get_execution_summary(self) -> Dict[str, Any]:
        """Get execution summary with metrics"""
        if self.start_time:
            total_duration = time.time() - self.start_time
            self.metrics["total_duration"] = total_duration
        
        return self.metrics
```

---

## ⚡ Performance Optimization

### 1. **Connection Pooling**
```python
from sqlalchemy.pool import QueuePool

def create_optimized_engine(connection_string: str):
    """Create optimized database engine"""
    return create_engine(
        connection_string,
        poolclass=QueuePool,
        pool_size=20,           # Base pool size
        max_overflow=30,        # Additional connections
        pool_pre_ping=True,     # Test connections
        pool_recycle=3600,      # Recycle every hour
        pool_timeout=30,        # Timeout for getting connection
        echo=False
    )
```

### 2. **Caching Strategy**
```python
from functools import lru_cache
import hashlib
import json

class QueryCache:
    def __init__(self, max_size: int = 1000):
        self.cache = {}
        self.max_size = max_size
    
    def _generate_key(self, question: str, schema_hash: str) -> str:
        """Generate cache key from question and schema"""
        content = f"{question}:{schema_hash}"
        return hashlib.md5(content.encode()).hexdigest()
    
    def get(self, question: str, schema_hash: str) -> str:
        """Get cached result"""
        key = self._generate_key(question, schema_hash)
        return self.cache.get(key)
    
    def set(self, question: str, schema_hash: str, result: str):
        """Cache result"""
        if len(self.cache) >= self.max_size:
            # Remove oldest entry
            oldest_key = next(iter(self.cache))
            del self.cache[oldest_key]
        
        key = self._generate_key(question, schema_hash)
        self.cache[key] = result
    
    @lru_cache(maxsize=100)
    def get_schema_hash(self, schema: str) -> str:
        """Get hash of schema for caching"""
        return hashlib.md5(schema.encode()).hexdigest()
```

### 3. **Async Processing**
```python
import asyncio
from typing import List, Dict, Any

class AsyncWorkflowExecutor:
    def __init__(self, graph: StateGraph):
        self.graph = graph
    
    async def execute_async(self, questions: List[str]) -> List[Dict[str, Any]]:
        """Execute multiple questions concurrently"""
        tasks = []
        for question in questions:
            task = asyncio.create_task(self._execute_single(question))
            tasks.append(task)
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        return results
    
    async def _execute_single(self, question: str) -> Dict[str, Any]:
        """Execute single question asynchronously"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None, 
            self._sync_execute, 
            question
        )
    
    def _sync_execute(self, question: str) -> Dict[str, Any]:
        """Synchronous execution wrapper"""
        result = None
        for event in self.graph.stream({"question": question}):
            result = event
        return result
```

---

## 🧪 Testing Strategies

### 1. **Unit Testing**
```python
import pytest
from unittest.mock import Mock, patch
from app.staff.agent_node import interpreter_agent_node
from app.utilities.func import State

class TestAgentNodes:
    def test_interpreter_agent_node(self):
        """Test interpreter agent node"""
        # Mock state
        state = {
            "question": "How many employees are there?",
            "list_tables": "employees, departments, products"
        }
        
        # Mock LLM response
        with patch('app.staff.agent_node.interpreter_agent') as mock_agent:
            mock_response = Mock()
            mock_response.text.return_value = '{"table_target": ["employees"]}'
            mock_agent.invoke.return_value = mock_response
            
            # Execute node
            result = interpreter_agent_node(state)
            
            # Assertions
            assert result.goto == "get_schema_node"
            assert "table_target" in result.update
            assert result.update["table_target"] == ["employees"]
    
    def test_executor_agent_node_success(self):
        """Test executor agent with successful execution"""
        state = {
            "generation": "SELECT COUNT(*) FROM employees"
        }
        
        with patch('app.toolkit.tool.db_query_tool') as mock_tool:
            mock_tool.return_value = "100"
            
            result = executor_agent_node(state)
            
            assert result.goto == "summary_agent_node"
            assert result.update["data"] == "100"
    
    def test_executor_agent_node_error(self):
        """Test executor agent with execution error"""
        state = {
            "generation": "SELECT * FROM nonexistent_table"
        }
        
        with patch('app.toolkit.tool.db_query_tool') as mock_tool:
            mock_tool.return_value = "Error: Table not found"
            
            result = executor_agent_node(state)
            
            assert result.goto == "scribe_agent_node"
            assert "Error" in result.update["error"]
```

### 2. **Integration Testing**
```python
class TestWorkflowIntegration:
    def test_complete_workflow(self):
        """Test complete workflow execution"""
        # Setup test database
        test_db = create_test_database()
        
        # Test question
        question = "How many employees are in the sales department?"
        
        # Execute workflow
        result = execute_workflow(graph, question)
        
        # Verify result
        assert "summary_agent_node" in result
        assert "answer" in result["summary_agent_node"]
        assert "employees" in result["summary_agent_node"]["answer"].lower()
    
    def test_error_recovery(self):
        """Test error recovery mechanisms"""
        # Test with invalid question
        question = "Invalid question that should cause errors"
        
        result = execute_workflow(graph, question)
        
        # Should still complete with error handling
        assert result is not None
        # Verify error was handled gracefully
```

### 3. **Performance Testing**
```python
import time
import statistics

class TestPerformance:
    def test_query_performance(self):
        """Test query execution performance"""
        questions = [
            "How many employees are there?",
            "What is the average salary?",
            "List all departments",
            "Show top 10 customers"
        ]
        
        execution_times = []
        
        for question in questions:
            start_time = time.time()
            result = execute_workflow(graph, question)
            end_time = time.time()
            
            execution_times.append(end_time - start_time)
            assert result is not None
        
        # Performance assertions
        avg_time = statistics.mean(execution_times)
        max_time = max(execution_times)
        
        assert avg_time < 10.0  # Average should be under 10 seconds
        assert max_time < 30.0  # Max should be under 30 seconds
    
    def test_concurrent_execution(self):
        """Test concurrent query execution"""
        questions = ["How many employees?"] * 10
        
        start_time = time.time()
        results = execute_concurrent_workflow(graph, questions)
        end_time = time.time()
        
        assert len(results) == 10
        assert all(result is not None for result in results)
        assert (end_time - start_time) < 60.0  # Should complete within 60 seconds
```

This technical implementation guide provides comprehensive patterns and best practices for implementing the agentic text-to-SQL system, covering all aspects from basic agent patterns to advanced performance optimization and testing strategies.
