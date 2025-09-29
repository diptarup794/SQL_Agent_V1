# 🤖 Agentic Text-to-SQL System

## 📖 Overview

This repository contains a sophisticated **multi-agent architecture** for converting natural language queries into executable SQL statements. Built on **LangGraph** and **LangChain** frameworks, the system implements a robust agentic approach with specialized AI agents working in coordination to handle complex database interactions.

## 🏗️ Architecture Highlights

### **Multi-Agent Design**
- **6 Specialized Agents**: Each with a specific responsibility in the SQL generation pipeline
- **State-Driven Workflow**: Centralized state management across all agents
- **Error Recovery**: Automatic retry mechanisms with intelligent error feedback
- **Tool Integration**: Seamless database interaction through LangChain tools

### **Key Features**
- ✅ **Database Agnostic**: Support for SQLite, MySQL, PostgreSQL, SQL Server, Oracle
- ✅ **Few-Shot Learning**: Example-driven SQL generation for better accuracy
- ✅ **Validation Pipeline**: Multi-stage query verification and correction
- ✅ **Graceful Degradation**: Mock LLM fallback when API keys are unavailable
- ✅ **Connection Pooling**: Efficient database connection management
- ✅ **Error Handling**: Comprehensive error recovery and user-friendly messages

## 📚 Documentation Structure

### 1. **[Agentic Architecture Documentation](./AGENTIC_ARCHITECTURE_DOCUMENTATION.md)**
Comprehensive guide covering:
- System overview and architecture principles
- Core components and their interactions
- Detailed agent workflow and responsibilities
- State management and command patterns
- Error handling and recovery mechanisms
- LLM integration and prompt engineering
- Database abstraction layer
- Performance and scalability considerations

### 2. **[Architecture Diagrams](./AGENTIC_ARCHITECTURE_DIAGRAM.md)**
Visual representations including:
- System architecture overview
- Agent workflow sequence diagrams
- State flow diagrams
- Component interaction diagrams
- Error handling flows
- Data flow architecture
- Retry and recovery mechanisms

### 3. **[Technical Implementation Guide](./TECHNICAL_IMPLEMENTATION_GUIDE.md)**
Detailed implementation patterns:
- Core implementation details
- Agent implementation patterns
- State management implementation
- Tool integration patterns
- Error handling implementation
- LLM integration patterns
- Database integration
- Workflow orchestration
- Performance optimization
- Testing strategies

## 🔄 Agent Workflow

```mermaid
graph LR
    A[User Question] --> B[Table Discovery]
    B --> C[Table Selection]
    C --> D[Schema Extraction]
    D --> E[Column Selection]
    E --> F[SQL Generation]
    F --> G[Query Validation]
    G --> H[Query Execution]
    H --> I[Result Summarization]
    I --> J[Natural Language Answer]
```

### **Agent Responsibilities**

| Agent | Purpose | Input | Output |
|-------|---------|-------|--------|
| **Interpreter** | Identify relevant tables | Question + Available tables | Selected table names |
| **Selector** | Choose appropriate columns | Question + Tables + Schemas | Table→columns mapping |
| **Scribe** | Generate SQL queries | Question + Tables + Columns + Examples | SQL query string |
| **Verify** | Validate SQL syntax | Generated SQL query | Validation result |
| **Executor** | Execute queries | Validated SQL | Query results |
| **Summary** | Convert results to natural language | Question + Results | Human-readable answer |

## 🛠️ Core Components

### **1. Agent Layer** (`app/staff/`)
- **`agent_node.py`**: AI agent implementations with LLM integration
- **`tool_node.py`**: Tool-based nodes for database operations
- **`few_shot/examples.json`**: Few-shot learning examples

### **2. Tool Layer** (`app/toolkit/`)
- **`tool.py`**: Database connection and query execution tools
- Multi-database support with connection pooling
- Safe query execution with validation

### **3. Workflow Layer** (`app/workflow/`)
- **`flow.py`**: LangGraph workflow definition and orchestration
- State management and agent coordination
- Conditional routing and error handling

### **4. Utilities** (`app/utilities/`)
- **`func.py`**: State definition and type safety
- Shared utilities and helper functions

## 🚀 Quick Start

### **Prerequisites**
```bash
# Python 3.8+
pip install -r requirements.txt
```

### **Environment Setup**
```bash
# Copy template and configure
cp credentials_template.env .env

# Edit .env with your credentials
GOOGLE_API_KEY=your_google_api_key_here
CONNECTION_STRING=sqlite:///path/to/your/database.db
```

### **Basic Usage**
```python
from app.workflow.flow import graph

# Execute a natural language query
question = "How many employees are in the sales department?"
result = graph.stream({"question": question})

# Extract the final answer
for event in result:
    if 'summary_agent_node' in event:
        answer = event['summary_agent_node']['answer']
        print(f"Answer: {answer}")
```

## 🔧 Configuration

### **Database Connection**
```python
# SQLite
CONNECTION_STRING=sqlite:///database.db

# MySQL
CONNECTION_STRING=mysql+pymysql://user:pass@host:port/database

# PostgreSQL
CONNECTION_STRING=postgresql://user:pass@host:port/database
```

### **LLM Configuration**
```python
# Gemini (Primary)
GOOGLE_API_KEY=your_google_api_key_here

# Fallback to Mock LLM if API key not available
# No additional configuration needed
```

## 📊 State Management

The system uses a centralized state object that evolves through the workflow:

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

## ⚠️ Error Handling

### **Multi-Level Error Recovery**
1. **LLM API Errors**: Automatic fallback to mock LLM
2. **Database Errors**: Connection retry with exponential backoff
3. **SQL Errors**: Automatic query correction with error feedback
4. **Validation Errors**: Retry with improved prompts

### **Graceful Degradation**
- Mock LLM for demo purposes when API keys unavailable
- User-friendly error messages
- Partial results when possible

## 🧪 Testing

### **Unit Tests**
```bash
# Test individual agents
python -m pytest tests/test_agents.py

# Test database tools
python -m pytest tests/test_tools.py
```

### **Integration Tests**
```bash
# Test complete workflow
python -m pytest tests/test_workflow.py

# Test error scenarios
python -m pytest tests/test_error_handling.py
```

### **Performance Tests**
```bash
# Test query performance
python -m pytest tests/test_performance.py
```

## 📈 Performance Optimization

### **Connection Pooling**
- Automatic connection reuse
- Pre-ping connection testing
- Configurable pool sizes

### **Caching**
- Query result caching
- Schema information caching
- LLM response caching

### **Async Processing**
- Concurrent query execution
- Non-blocking database operations
- Parallel agent processing

## 🔍 Monitoring and Observability

### **Langfuse Integration**
- LLM call tracking
- Performance metrics
- Error monitoring
- Cost analysis

### **Logging**
- Structured logging
- Performance metrics
- Error tracking
- Debug information

## 🚀 Advanced Features

### **Few-Shot Learning**
```json
[
  {
    "question": "List all employees and their departments",
    "sql": "SELECT e.name, d.department_name FROM employees e JOIN departments d ON e.department_id = d.id",
    "explanation": "Join employees and departments tables"
  }
]
```

### **Custom Prompts**
- Configurable agent prompts
- Domain-specific templates
- Multi-language support

### **Query Optimization**
- Automatic query optimization
- Index usage analysis
- Performance monitoring

## 🤝 Contributing

### **Development Setup**
```bash
# Clone repository
git clone <repository-url>
cd sql-ag-v2-main

# Install dependencies
pip install -r requirements.txt

# Run tests
python -m pytest

# Run linting
flake8 app/
```

### **Code Style**
- Follow PEP 8 guidelines
- Use type hints
- Document all functions
- Write comprehensive tests

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **LangChain**: For the excellent LLM integration framework
- **LangGraph**: For the powerful workflow orchestration
- **SQLAlchemy**: For robust database abstraction
- **Google Gemini**: For the advanced language model capabilities

## 📞 Support

For questions, issues, or contributions:
- Create an issue in the repository
- Check the documentation for common solutions
- Review the technical implementation guide

---

**Built with ❤️ using LangChain, LangGraph, and modern Python practices**
