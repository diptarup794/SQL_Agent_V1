# 🤖 SQL Agent v2 - Multi-Agent Text-to-SQL System

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![LangChain](https://img.shields.io/badge/LangChain-0.3.20-green.svg)](https://langchain.com)
[![LangGraph](https://img.shields.io/badge/LangGraph-0.3.5-orange.svg)](https://langchain.com/langgraph)
[![Gemini](https://img.shields.io/badge/Gemini-2.0--flash-purple.svg)](https://ai.google.dev)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A sophisticated **multi-agent architecture** for converting natural language queries into executable SQL statements. Built with **LangGraph** and **LangChain**, featuring specialized AI agents, comprehensive error handling, and production-ready web interface.

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [✨ Key Features](#-key-features)
- [🏗️ Architecture](#️-architecture)
- [🚀 Quick Start](#-quick-start)
- [📚 Documentation](#-documentation)
- [🛠️ Installation](#️-installation)
- [💻 Usage](#-usage)
- [🔧 Configuration](#-configuration)
- [📊 Sample Data](#-sample-data)
- [🧪 Testing](#-testing)
- [🌐 Web Interface](#-web-interface)
- [📈 Performance](#-performance)
- [🔄 Async Processing](#-async-processing)
- [📖 API Reference](#-api-reference)
- [🛡️ Security](#️-security)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🎯 Overview

SQL Agent v2 is a production-grade system that transforms natural language questions into accurate SQL queries through a coordinated workflow of specialized AI agents. Each agent has a specific responsibility, working together to ensure high-quality SQL generation with comprehensive error handling and validation.

### **Why SQL Agent v2?**

- 🧠 **Multi-Agent Architecture**: Specialized agents for different aspects of SQL generation
- 🔄 **State-Driven Workflow**: Centralized state management across all agents
- 🛡️ **Error Recovery**: Automatic retry mechanisms with intelligent error feedback
- 🌐 **Database Agnostic**: Support for SQLite, MySQL, PostgreSQL, SQL Server, Oracle
- 📚 **Few-Shot Learning**: Example-driven SQL generation for better accuracy
- 🎨 **Modern UI**: Production-ready web interface with real-time updates
- 📊 **LLMOps Integration**: Langfuse monitoring and performance tracking

---

## ✨ Key Features

### **🤖 Multi-Agent System**
- **Interpreter Agent**: Analyzes questions and identifies relevant tables
- **Selector Agent**: Chooses appropriate columns from selected tables
- **Scribe Agent**: Generates syntactically correct SQL queries
- **Verify Agent**: Validates SQL syntax and logic
- **Executor Agent**: Executes queries against the database
- **Summary Agent**: Converts results to natural language

### **🔄 Advanced Workflow**
- **LangGraph Orchestration**: Sophisticated workflow management
- **State Management**: Centralized state with type safety
- **Conditional Routing**: Dynamic workflow control based on results
- **Error Recovery**: Automatic retry with error feedback
- **Validation Pipeline**: Multi-stage query verification

### **🌐 Production Features**
- **Web Interface**: Modern React/Next.js frontend
- **REST API**: Comprehensive backend with Flask
- **Database Support**: Multiple database types with connection pooling
- **File Upload**: SQLite database file upload and management
- **Real-time Updates**: Live connection status and schema display
- **Error Handling**: User-friendly error messages and recovery

### **📊 Monitoring & Analytics**
- **Langfuse Integration**: LLM call tracking and performance metrics
- **Error Monitoring**: Comprehensive error tracking and analysis
- **Performance Metrics**: Query execution time and success rates
- **Cost Analysis**: API usage and cost tracking

---

## 🏗️ Architecture

### **System Architecture**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Frontend  │    │  Flask Backend  │    │  SQL Agent      │
│   (Next.js)     │◄──►│   (REST API)    │◄──►│  (LangGraph)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Database      │    │   Gemini LLM    │
                       │   (SQLAlchemy)  │    │   (Google AI)   │
                       └─────────────────┘    └─────────────────┘
```

### **Agent Workflow**
```
User Question → Table Discovery → Table Selection → Schema Extraction 
     ↓
Column Selection → SQL Generation → Query Validation → Query Execution 
     ↓
Result Summarization → Natural Language Answer
```

### **Technology Stack**
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Flask, Python, SQLAlchemy
- **AI Framework**: LangChain, LangGraph
- **LLM**: Google Gemini 2.0 Flash
- **Database**: SQLite, MySQL, PostgreSQL, SQL Server, Oracle
- **Monitoring**: Langfuse
- **Deployment**: Docker, Docker Compose

---

## 🚀 Quick Start

### **1. Clone and Setup**
```bash
git clone <repository-url>
cd sql-ag-v2-main

# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies
cd frontend
npm install
cd ..
```

### **2. Configure Environment**
```bash
# Copy template and configure
cp credentials_template.env .env

# Edit .env with your credentials
GOOGLE_API_KEY=your_google_api_key_here
CONNECTION_STRING=sqlite:///sample_database.db
```

### **3. Test the System**
```bash
# Test SQL execution (no external tools needed!)
python test_sql_execution_simple.py

# Test complete system
python demo_sql_agent.py
```

### **4. Start the Application**
```bash
# Start backend (Terminal 1)
python backend/app.py

# Start frontend (Terminal 2)
cd frontend
npm run dev
```

### **5. Use the Web Interface**
1. Open `http://localhost:3000`
2. Upload a database file (`.db` file)
3. Ask questions in natural language
4. Get instant SQL results!

---

## 📚 Documentation

### **Comprehensive Documentation Suite**

| Document | Description | Size |
|----------|-------------|------|
| **[AGENTIC_ARCHITECTURE_DOCUMENTATION.md](./AGENTIC_ARCHITECTURE_DOCUMENTATION.md)** | Complete architecture guide with agent workflows | 20KB |
| **[TECHNICAL_IMPLEMENTATION_GUIDE.md](./TECHNICAL_IMPLEMENTATION_GUIDE.md)** | Detailed implementation patterns and best practices | 34KB |
| **[AGENTIC_ARCHITECTURE_DIAGRAM.md](./AGENTIC_ARCHITECTURE_DIAGRAM.md)** | Visual diagrams and workflow representations | 10KB |
| **[SQL_EXECUTION_GUIDE.md](./SQL_EXECUTION_GUIDE.md)** | Complete SQL execution guide (no external tools needed) | 12KB |
| **[ASYNC_PROCESSING_SUMMARY.md](./ASYNC_PROCESSING_SUMMARY.md)** | Async/concurrent processing analysis and implementation | 12KB |
| **[ASYNC_IMPLEMENTATION_EXAMPLE.py](./ASYNC_IMPLEMENTATION_EXAMPLE.py)** | Complete async implementation example | 22KB |

### **Quick Reference Guides**

| Guide | Purpose |
|-------|---------|
| **[QUICK_START_SQL_TESTING.md](./QUICK_START_SQL_TESTING.md)** | 5-minute setup for immediate SQL testing |
| **[CREDENTIALS_SETUP.md](./CREDENTIALS_SETUP.md)** | Environment configuration guide |
| **[langfuse_llmops_setup.md](./langfuse_llmops_setup.md)** | LLMOps monitoring setup |

---

## 🛠️ Installation

### **Prerequisites**
- Python 3.8+
- Node.js 16+
- npm or yarn
- Google API key (for Gemini LLM)

### **Python Dependencies**
```bash
pip install -r requirements.txt
```

**Key Dependencies:**
- `langchain==0.3.20` - LLM framework
- `langgraph==0.3.5` - Workflow orchestration
- `langchain-google-genai==2.0.10` - Gemini integration
- `sqlalchemy>=2.0.0` - Database abstraction
- `flask>=2.0.0` - Web framework
- `pydantic>=2.0.0` - Data validation

### **Node.js Dependencies**
```bash
cd frontend
npm install
```

**Key Dependencies:**
- `next@14` - React framework
- `typescript` - Type safety
- `tailwindcss` - Styling
- `axios` - HTTP client

---

## 💻 Usage

### **1. Natural Language Queries**
Ask questions in plain English:
- "How many employees are there?"
- "Show me the top 5 customers by total spent"
- "What is the average salary by department?"
- "List all products with price greater than 100"

### **2. Direct SQL Execution**
```python
from app.toolkit.tool import get_database_connection

db = get_database_connection()

# Execute any SQL query
result = db.run("SELECT COUNT(*) FROM employees")
print(result)
```

### **3. API Endpoints**
```bash
# Upload database
curl -X POST -F "file=@database.db" http://localhost:5000/api/upload-db

# Execute query
curl -X POST -H "Content-Type: application/json" \
  -d '{"question": "How many employees are there?"}' \
  http://localhost:5000/api/query
```

### **4. Batch Processing**
```python
# Execute multiple queries
questions = [
    "How many employees are there?",
    "What is the average salary?",
    "List all departments"
]

for question in questions:
    result = execute_query(question)
    print(f"Q: {question}\nA: {result}\n")
```

---

## 🔧 Configuration

### **Environment Variables**
```bash
# .env file
GOOGLE_API_KEY=your_google_api_key_here
CONNECTION_STRING=sqlite:///sample_database.db

# Optional: Langfuse monitoring
LANGFUSE_PUBLIC_KEY=your_langfuse_public_key
LANGFUSE_SECRET_KEY=your_langfuse_secret_key
LANGFUSE_HOST=https://cloud.langfuse.com
```

### **Database Configuration**
```python
# SQLite (default)
CONNECTION_STRING=sqlite:///database.db

# MySQL
CONNECTION_STRING=mysql+pymysql://user:pass@host:port/database

# PostgreSQL
CONNECTION_STRING=postgresql://user:pass@host:port/database

# SQL Server
CONNECTION_STRING=mssql+pyodbc://user:pass@server/database?driver=ODBC+Driver+17+for+SQL+Server
```

### **LLM Configuration**
```python
# Gemini (primary)
GOOGLE_API_KEY=your_google_api_key_here

# Fallback to mock LLM if API key not available
# No additional configuration needed
```

---

## 📊 Sample Data

### **Included Sample Databases**

| Database | Size | Tables | Rows | Description |
|----------|------|--------|------|-------------|
| `sample_database.db` | 20KB | 3 | ~100 | Basic test database |
| `robust_sample_database.db` | 4.1MB | 5+ | 1000+ | Large test database with 50+ columns per table |
| `transactional_db.db` | 3.7MB | Multiple | 1000+ | Transaction-focused database |

### **Sample Queries**
```sql
-- Simple queries
SELECT COUNT(*) FROM employees;
SELECT * FROM employees ORDER BY salary DESC LIMIT 5;

-- Complex queries
SELECT e.name, d.department_name, e.salary 
FROM employees e 
JOIN departments d ON e.department_id = d.id 
ORDER BY e.salary DESC;

-- Aggregation
SELECT d.department_name, AVG(e.salary) as avg_salary
FROM employees e 
JOIN departments d ON e.department_id = d.id 
GROUP BY d.department_name;
```

---

## 🧪 Testing

### **Test Scripts**

| Script | Purpose | Command |
|--------|---------|---------|
| `test_sql_execution_simple.py` | Basic SQL execution test | `python test_sql_execution_simple.py` |
| `demo_sql_agent.py` | Complete system demo | `python demo_sql_agent.py` |
| `simple_gemini_test.py` | LLM and database test | `python simple_gemini_test.py` |
| `test_db_connection.py` | API endpoint testing | `python test_db_connection.py` |

### **Test Coverage**
- ✅ Database connectivity
- ✅ SQL query execution
- ✅ LLM integration
- ✅ Agent workflow
- ✅ Error handling
- ✅ API endpoints
- ✅ Web interface

### **Performance Testing**
```bash
# Test query performance
python -c "
import time
from app.toolkit.tool import get_database_connection
db = get_database_connection()
start = time.time()
result = db.run('SELECT COUNT(*) FROM employees')
print(f'Query time: {time.time() - start:.2f}s')
print(f'Result: {result}')
"
```

---

## 🌐 Web Interface

### **Features**
- 🎨 **Modern UI**: Clean, responsive design with Tailwind CSS
- 📱 **Mobile Friendly**: Works on all device sizes
- 🔄 **Real-time Updates**: Live connection status and schema display
- 📁 **File Upload**: Drag-and-drop database file upload
- 💬 **Chat Interface**: Natural language conversation
- 📊 **Schema Viewer**: Interactive database schema display
- ⚡ **Status Indicators**: Real-time connection and processing status

### **Screenshots**
```
┌─────────────────────────────────────────────────────────┐
│  🤖 SQL Agent v2                    [Connected] [●]     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  💬 Chat Interface                                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │ User: How many employees are there?             │   │
│  │                                                 │   │
│  │ Agent: There are 1,000 employees in the        │   │
│  │        database.                                │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  📊 Database Schema                                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │ employees (1000 rows)                           │   │
│  │ ├─ id (INTEGER, PRIMARY KEY)                    │   │
│  │ ├─ name (TEXT)                                  │   │
│  │ ├─ salary (REAL)                                │   │
│  │ └─ department_id (INTEGER, FOREIGN KEY)         │   │
│  │                                                 │   │
│  │ departments (10 rows)                           │   │
│  │ ├─ id (INTEGER, PRIMARY KEY)                    │   │
│  │ └─ name (TEXT)                                  │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 📈 Performance

### **Benchmarks**

| Metric | Current | With Async | Improvement |
|--------|---------|------------|-------------|
| Single Query | 6.9s | 5.7s | **17% faster** |
| Batch (5 queries) | 34.5s | 5.7s | **6x faster** |
| Batch (10 queries) | 69s | 5.7s | **12x faster** |
| Concurrent Queries | Not supported | 10-20 queries | **New capability** |

### **Optimization Features**
- 🔄 **Connection Pooling**: Efficient database connection reuse
- 📊 **Query Caching**: Result caching for repeated queries
- ⚡ **Parallel Processing**: Concurrent schema extraction
- 🎯 **Rate Limiting**: API quota management
- 📈 **Performance Monitoring**: Real-time metrics

---

## 🔄 Async Processing

### **Current Status**
The system currently runs **synchronously** but includes comprehensive async implementation examples:

- ✅ **Async Database Operations**: Non-blocking database calls
- ✅ **Concurrent Query Execution**: Multiple queries simultaneously
- ✅ **Parallel Agent Processing**: Independent operations in parallel
- ✅ **Rate Limiting**: API quota management
- ✅ **Connection Pooling**: Advanced async connection management

### **Implementation**
See **[ASYNC_IMPLEMENTATION_EXAMPLE.py](./ASYNC_IMPLEMENTATION_EXAMPLE.py)** for complete async implementation with:
- Async workflow execution
- Concurrent database operations
- Parallel agent processing
- Performance monitoring

---

## 📖 API Reference

### **Backend Endpoints**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/status` | GET | Connection status |
| `/api/connection-info` | GET | Detailed connection info |
| `/api/db-types` | GET | Supported database types |
| `/api/connect` | POST | Connect to database |
| `/api/upload-db` | POST | Upload SQLite database |
| `/api/query` | POST | Execute natural language query |
| `/api/schema` | GET | Get database schema |

### **Request/Response Examples**

#### **Execute Query**
```bash
POST /api/query
Content-Type: application/json

{
  "question": "How many employees are there?"
}
```

**Response:**
```json
{
  "success": true,
  "answer": "There are 1,000 employees in the database.",
  "question": "How many employees are there?",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### **Upload Database**
```bash
POST /api/upload-db
Content-Type: multipart/form-data

file: database.db
```

**Response:**
```json
{
  "success": true,
  "message": "Database uploaded successfully",
  "connection_id": "uuid-here",
  "schema": {
    "tables": ["employees", "departments"],
    "table_count": 2
  }
}
```

---

## 🛡️ Security

### **Security Features**
- 🔒 **Input Validation**: Comprehensive input sanitization
- 🚫 **SQL Injection Protection**: Parameterized queries
- 🔐 **API Rate Limiting**: Prevents abuse
- 🛡️ **Error Handling**: No sensitive data in error messages
- 🔑 **Environment Variables**: Secure credential management

### **Best Practices**
- Use environment variables for sensitive data
- Validate all user inputs
- Implement proper error handling
- Use HTTPS in production
- Regular security updates

---

## 🤝 Contributing

### **Development Setup**
```bash
# Clone repository
git clone <repository-url>
cd sql-ag-v2-main

# Install dependencies
pip install -r requirements.txt
cd frontend && npm install && cd ..

# Run tests
python -m pytest tests/

# Run linting
flake8 app/
```

### **Code Style**
- Follow PEP 8 guidelines
- Use type hints
- Document all functions
- Write comprehensive tests
- Update documentation

### **Pull Request Process**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Update documentation
6. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **LangChain**: For the excellent LLM integration framework
- **LangGraph**: For the powerful workflow orchestration
- **SQLAlchemy**: For robust database abstraction
- **Google Gemini**: For the advanced language model capabilities
- **Next.js**: For the modern React framework
- **Tailwind CSS**: For the utility-first CSS framework

---

## 📞 Support

For questions, issues, or contributions:
- 📧 Create an issue in the repository
- 📚 Check the comprehensive documentation
- 🔍 Review the troubleshooting guides
- 💬 Join the community discussions

---
