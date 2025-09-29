# 🤖 Agentic Text-to-SQL Architecture Documentation

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Agentic Architecture Principles](#agentic-architecture-principles)
3. [Core Components](#core-components)
4. [Agent Workflow](#agent-workflow)
5. [State Management](#state-management)
6. [Agent Types and Responsibilities](#agent-types-and-responsibilities)
7. [Tool Integration](#tool-integration)
8. [Error Handling and Recovery](#error-handling-and-recovery)
9. [LLM Integration](#llm-integration)
10. [Database Abstraction Layer](#database-abstraction-layer)
11. [Workflow Orchestration](#workflow-orchestration)
12. [Performance and Scalability](#performance-and-scalability)

---

## 🎯 System Overview

The Text-to-SQL Agent System is a sophisticated multi-agent architecture that converts natural language queries into executable SQL statements through a coordinated workflow of specialized AI agents. Built on LangGraph and LangChain frameworks, it implements a robust agentic approach to handle complex database interactions.

### Key Features
- **Multi-Agent Architecture**: Specialized agents for different aspects of SQL generation
- **State-Driven Workflow**: Centralized state management across all agents
- **Error Recovery**: Automatic retry mechanisms with error feedback
- **Database Agnostic**: Support for multiple database types
- **Few-Shot Learning**: Example-driven SQL generation
- **Validation Pipeline**: Multi-stage query verification

---

## 🏗️ Agentic Architecture Principles

### 1. **Specialization Principle**
Each agent has a single, well-defined responsibility:
- **Table Discovery**: Identify relevant database tables
- **Schema Analysis**: Extract table structures and relationships
- **Column Selection**: Choose appropriate columns for queries
- **SQL Generation**: Create syntactically correct SQL
- **Query Validation**: Verify SQL correctness
- **Execution**: Run queries against the database
- **Result Summarization**: Convert results to natural language

### 2. **State-Centric Design**
All agents share a common state object that evolves through the workflow:
```python
class State(TypedDict):
    question: str                           # Original user question
    list_tables: str                        # Available tables
    table_target: List[str]                 # Selected tables
    schema: List[str]                       # Table schemas
    column_target: Dict[str, List[str]]     # Selected columns
    generation: str | None                  # Generated SQL
    verify_valid: str                       # Validation result
    data: str                               # Query results
    error: str | None                       # Error messages
    answer: str                             # Final answer
```

### 3. **Command Pattern**
Agents communicate through Command objects that specify:
- **State Updates**: What data to modify
- **Next Node**: Which agent to execute next
- **Conditional Routing**: Dynamic workflow control

### 4. **Tool-Agent Separation**
Clear distinction between:
- **Tool Nodes**: Direct database/system interactions
- **Agent Nodes**: LLM-powered decision making

---

## 🔧 Core Components

### 1. **Workflow Engine** (`app/workflow/flow.py`)
```python
from langgraph.graph import END, StateGraph, START

# Create workflow graph
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

# Compile executable graph
graph = workflow.compile()
```

### 2. **State Management** (`app/utilities/func.py`)
Centralized state definition using TypedDict for type safety and validation.

### 3. **Database Tools** (`app/toolkit/tool.py`)
Database abstraction layer providing:
- Connection management
- Query execution
- Schema introspection
- Table listing

### 4. **Agent Implementations** (`app/staff/agent_node.py`)
Specialized AI agents for each workflow step.

---

## 🔄 Agent Workflow

### Workflow Diagram
```
START → list_tables_node → interpreter_agent_node → get_schema_node 
    ↓
selector_agent_node → scribe_agent_node → verify_agent_node 
    ↓
executor_agent_node → summary_agent_node → END
```

### Detailed Flow

#### 1. **Table Discovery Phase**
```python
def list_tables_node(state: State) -> Command[Literal["interpreter_agent_node"]]:
    # Get all available tables from database
    list_tables = list_tables_tool.invoke("")
    
    # Initialize state with table information
    state_data = {
        "question": state["question"],
        "list_tables": list_tables,
        "table_target": None,
        "schema": None,
        # ... other fields
    }
    
    return Command(
        update=state_data,
        goto="interpreter_agent_node"
    )
```

#### 2. **Table Selection Phase**
```python
def interpreter_agent_node(state: State) -> Command[Literal["get_schema_node"]]:
    # Combine question with available tables
    query = question + "\nList of tables: " + list_tables
    
    # Use LLM to identify relevant tables
    response = interpreter_agent.invoke({"input": query})
    json_data = json.loads(response.text())
    
    return Command(
        update=json_data,  # {"table_target": ["table1", "table2"]}
        goto="get_schema_node"
    )
```

#### 3. **Schema Extraction Phase**
```python
def get_schema_node(state: State) -> Command[Literal["selector_agent_node"]]:
    tables = state["table_target"]
    schema_data = []
    
    # Get schema for each target table
    for table in tables:
        schema = get_schema_tool.invoke(table)
        cleaned_schema = remove_after_char(schema, '/')
        schema_data.append(cleaned_schema)
    
    return Command(
        update={"schema": schema_data},
        goto="selector_agent_node"
    )
```

#### 4. **Column Selection Phase**
```python
def selector_agent_node(state: State) -> Command[Literal["scribe_agent_node"]]:
    # Prepare context for column selection
    table_target_str = "\nTable that you have to find the columns: \n[" + ", ".join(table_target) + "]"
    schema = "\n".join(schema_data)
    
    # Use LLM to select relevant columns
    response = selector_agent.invoke({
        "todo": question,
        "input": table_target_str,
        "schema": schema
    })
    
    return Command(
        update=response,  # {"column_target": {"table1": ["col1", "col2"]}}
        goto="scribe_agent_node"
    )
```

#### 5. **SQL Generation Phase**
```python
def scribe_agent_node(state: State) -> Command[Literal["verify_agent_node"]]:
    # Use few-shot examples and context to generate SQL
    response = scribe_agent.invoke({
        "examples": examples,
        "input": question,
        "table_target": table_target,
        "column_target": column_target,
        "query": query,  # Previous attempt (if any)
        "errorlog": error  # Previous error (if any)
    })
    
    # Clean up generated SQL
    text = response.text()
    text = text.replace("sqlite", "").replace("`", "").replace(";", "").replace("\n", "")
    
    return Command(
        update={"generation": text},
        goto="verify_agent_node"
    )
```

#### 6. **Query Validation Phase**
```python
def verify_agent_node(state: State) -> Command[Literal["executor_agent_node", "scribe_agent_node"]]:
    # Use LLM to validate SQL syntax and logic
    response = verify_agent.invoke({"input": gen})
    valid = response.text()
    
    # Route based on validation result
    goto = "executor_agent_node" if valid == "False" else "scribe_agent_node"
    
    return Command(
        update={"verify_valid": valid},
        goto=goto
    )
```

#### 7. **Query Execution Phase**
```python
def executor_agent_node(state: State) -> Command[Literal["summary_agent_node", "scribe_agent_node"]]:
    # Execute the SQL query
    response = db_query_tool(gen)
    
    # Handle execution results
    if "Error" in response:
        data = {"error": response}
        goto = "scribe_agent_node"  # Retry with error feedback
    else:
        data = {"data": response}
        goto = "summary_agent_node"
    
    return Command(
        update=data,
        goto=goto
    )
```

#### 8. **Result Summarization Phase**
```python
def summary_agent_node(state: State) -> Command[Literal["__end__"]]:
    # Convert query results to natural language
    response = summary_agent.invoke({
        "question": question,
        "data": data
    })
    
    return Command(
        update={"answer": response.text()},
        goto="__end__"
    )
```

---

## 🎭 Agent Types and Responsibilities

### 1. **Interpreter Agent**
**Purpose**: Analyze natural language and identify relevant database tables
**Input**: User question + available tables
**Output**: List of relevant table names
**Prompt Strategy**: 
- Context-aware table selection
- Handles ambiguous queries
- Returns structured JSON output

### 2. **Selector Agent**
**Purpose**: Choose appropriate columns from selected tables
**Input**: Question + target tables + table schemas
**Output**: Dictionary mapping tables to relevant columns
**Prompt Strategy**:
- Foreign key relationship awareness
- Column relevance analysis
- Structured output with Pydantic validation

### 3. **Scribe Agent**
**Purpose**: Generate syntactically correct SQL queries
**Input**: Question + tables + columns + examples + error feedback
**Output**: Clean SQL query string
**Prompt Strategy**:
- Few-shot learning with examples
- Error correction capabilities
- Iterative improvement with feedback

### 4. **Verify Agent**
**Purpose**: Validate SQL syntax and logic
**Input**: Generated SQL query
**Output**: Validation result (True/False)
**Prompt Strategy**:
- Common SQL mistake detection
- Syntax validation
- Logic verification

### 5. **Executor Agent**
**Purpose**: Execute SQL queries and handle results
**Input**: Validated SQL query
**Output**: Query results or error messages
**Implementation**: Direct database tool integration

### 6. **Summary Agent**
**Purpose**: Convert query results to natural language
**Input**: Original question + query results
**Output**: Human-readable answer
**Prompt Strategy**:
- Context-aware summarization
- Natural language generation
- Result interpretation

---

## 🛠️ Tool Integration

### Database Tools (`app/toolkit/tool.py`)

#### 1. **Connection Management**
```python
def get_database_connection():
    """Get database connection with support for multiple database types"""
    engine = create_engine(
        connection_string,
        pool_pre_ping=True,      # Test connections before use
        pool_recycle=300,        # Recycle connections every 5 minutes
        echo=False               # Disable SQL logging
    )
    
    # Test the connection
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    
    return SQLDatabase(engine)  # LangChain wrapper
```

#### 2. **Query Execution Tool**
```python
def db_query_tool(query: str) -> str:
    """Execute a SQL query against the database and get back the result"""
    result = db.run_no_throw(query)  # LangChain's safe execution
    if not result:
        return "Error: Query failed. Please rewrite your query and try again."
    return result
```

#### 3. **Schema Introspection Tools**
```python
# Extract tools from LangChain toolkit
list_tables_tool = next(tool for tool in tools if tool.name == "sql_db_list_tables")
get_schema_tool = next(tool for tool in tools if tool.name == "sql_db_schema")
```

---

## 🔄 Error Handling and Recovery

### 1. **Multi-Level Error Handling**

#### Database Connection Errors
```python
try:
    engine = create_engine(connection_string, ...)
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
except SQLAlchemyError as e:
    logger.error(f"Database connection failed: {e}")
    raise Exception(f"Failed to connect to database: {e}")
```

#### Query Execution Errors
```python
def executor_agent_node(state: State):
    response = db_query_tool(gen)
    
    if "Error" in response:
        data = {"error": response}
        goto = "scribe_agent_node"  # Retry with error feedback
    else:
        data = {"data": response}
        goto = "summary_agent_node"
```

#### LLM API Errors
```python
def get_llm():
    if not google_api_key or google_api_key == "your_google_api_key_here":
        # Return mock LLM for demo purposes
        return MockLLM()
    
    try:
        return ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=google_api_key)
    except Exception as e:
        raise Exception(f"Failed to initialize Gemini: {e}")
```

### 2. **Retry Mechanisms**
- **SQL Generation Retry**: If verification fails, retry with error feedback
- **Query Execution Retry**: If execution fails, retry with corrected query
- **Connection Retry**: Automatic reconnection on connection loss

### 3. **Graceful Degradation**
- **Mock LLM**: Fallback when API keys are unavailable
- **Error Messages**: User-friendly error reporting
- **Partial Results**: Continue workflow with available data

---

## 🧠 LLM Integration

### 1. **LLM Configuration**
```python
def get_llm():
    """Get Gemini LLM with fallback to mock"""
    if not google_api_key or google_api_key == "your_google_api_key_here":
        return MockLLM()  # Demo fallback
    
    return ChatGoogleGenerativeAI(
        model="gemini-2.0-flash", 
        google_api_key=google_api_key
    )
```

### 2. **Prompt Engineering**

#### Structured Prompts
Each agent uses carefully crafted prompts with:
- **Clear Instructions**: Specific task descriptions
- **Output Format**: Structured JSON or text requirements
- **Context**: Relevant information from previous steps
- **Examples**: Few-shot learning examples

#### Example: Scribe Agent Prompt
```python
scribe = """You are a SQL expert with a strong attention to detail.

Given an input question, output a syntactically correct SQLite query to run.

When generating the query:
- Output the SQL query that answers the input question
- You can order the results by a relevant column
- Never query for all columns, only relevant ones
- If you get an error, rewrite the query and try again
- DO NOT make any DML statements (INSERT, UPDATE, DELETE, DROP etc.)

Examples:
{examples}

Question: {input}
Tables: {table_target}
Columns: {column_target}
Earlier Generated Query: {query}
Error Log: {errorlog}
"""
```

### 3. **Few-Shot Learning**
```json
[
  {
    "question": "List all employees and their departments",
    "sql": "SELECT e.name, d.department_name FROM employees e JOIN departments d ON e.department_id = d.id",
    "explanation": "Join employees and departments tables to get employee names with their department names"
  },
  {
    "question": "What is the average salary by department?",
    "sql": "SELECT d.department_name, AVG(e.salary) as avg_salary FROM employees e JOIN departments d ON e.department_id = d.id GROUP BY d.department_name",
    "explanation": "Group employees by department and calculate average salary for each department"
  }
]
```

---

## 🗄️ Database Abstraction Layer

### 1. **Multi-Database Support**
```python
# Connection string examples
sqlite_conn = "sqlite:///path/to/database.db"
mysql_conn = "mysql+pymysql://user:pass@host:port/database"
postgres_conn = "postgresql://user:pass@host:port/database"
```

### 2. **LangChain SQLDatabase Integration**
```python
# Initialize database connection
db = get_database_connection()

# Create toolkit with database and LLM
toolkit = SQLDatabaseToolkit(db=db, llm=llm)
tools = toolkit.get_tools()

# Extract specific tools
list_tables_tool = next(tool for tool in tools if tool.name == "sql_db_list_tables")
get_schema_tool = next(tool for tool in tools if tool.name == "sql_db_schema")
```

### 3. **Connection Pooling**
```python
engine = create_engine(
    connection_string,
    pool_pre_ping=True,      # Test connections before use
    pool_recycle=300,        # Recycle connections every 5 minutes
    echo=False               # Disable SQL logging
)
```

---

## 🎛️ Workflow Orchestration

### 1. **LangGraph Integration**
```python
from langgraph.graph import END, StateGraph, START

# Create workflow
workflow = StateGraph(State)

# Add nodes
workflow.add_node("list_tables_node", list_tables_node)
workflow.add_node("interpreter_agent_node", interpreter_agent_node)
# ... more nodes

# Define edges
workflow.add_edge(START, "list_tables_node")

# Compile graph
graph = workflow.compile()
```

### 2. **Command-Based Communication**
```python
def agent_node(state: State) -> Command[Literal["next_node"]]:
    # Process state
    result = process_state(state)
    
    # Return command with updates and next node
    return Command(
        update={"field": result},
        goto="next_node"
    )
```

### 3. **Conditional Routing**
```python
def executor_agent_node(state: State) -> Command[Literal["summary_agent_node", "scribe_agent_node"]]:
    response = db_query_tool(gen)
    
    # Conditional routing based on result
    if "Error" in response:
        goto = "scribe_agent_node"  # Retry
    else:
        goto = "summary_agent_node"  # Continue
    
    return Command(update=data, goto=goto)
```

---

## ⚡ Performance and Scalability

### 1. **Connection Management**
- **Connection Pooling**: Reuse database connections
- **Pre-ping**: Test connections before use
- **Auto-recycle**: Refresh connections periodically

### 2. **State Management**
- **TypedDict**: Type-safe state definition
- **Immutable Updates**: Safe state modifications
- **Memory Efficient**: Minimal state footprint

### 3. **Error Recovery**
- **Graceful Degradation**: Continue with partial data
- **Retry Logic**: Automatic retry with feedback
- **Timeout Handling**: Prevent infinite loops

### 4. **LLM Optimization**
- **Prompt Efficiency**: Concise, focused prompts
- **Few-Shot Learning**: Reduce token usage
- **Structured Output**: Consistent parsing

---

## 🔍 Key Architectural Benefits

### 1. **Modularity**
- Each agent has a single responsibility
- Easy to modify or replace individual components
- Clear separation of concerns

### 2. **Extensibility**
- Add new agents without affecting existing ones
- Support new database types through abstraction layer
- Integrate additional LLM providers

### 3. **Reliability**
- Multi-level error handling
- Automatic retry mechanisms
- Graceful degradation

### 4. **Maintainability**
- Clear code organization
- Comprehensive documentation
- Type-safe implementations

### 5. **Scalability**
- Stateless agent design
- Efficient state management
- Connection pooling

---

## 🚀 Future Enhancements

### 1. **Advanced Agents**
- **Query Optimizer Agent**: Optimize generated SQL
- **Security Agent**: Validate query safety
- **Cache Agent**: Implement result caching

### 2. **Enhanced Error Handling**
- **Semantic Error Analysis**: Understand error context
- **Automatic Query Correction**: Fix common mistakes
- **User Feedback Integration**: Learn from corrections

### 3. **Performance Improvements**
- **Parallel Processing**: Execute independent operations
- **Result Streaming**: Stream large result sets
- **Query Caching**: Cache frequent queries

### 4. **Advanced Features**
- **Multi-Database Queries**: Cross-database operations
- **Query Explanation**: Explain query logic
- **Visual Query Builder**: GUI for complex queries

---

This agentic architecture provides a robust, scalable, and maintainable foundation for natural language to SQL conversion, with clear separation of concerns and comprehensive error handling mechanisms.
