# 🏗️ Agentic Text-to-SQL Architecture Diagrams

## 📊 System Architecture Overview

```mermaid
graph TB
    subgraph "User Interface Layer"
        UI[User Interface]
        API[REST API]
    end
    
    subgraph "Workflow Orchestration Layer"
        LG[LangGraph Workflow Engine]
        STATE[Shared State Management]
    end
    
    subgraph "Agent Layer"
        IA[Interpreter Agent]
        SA[Selector Agent]
        SCA[Scribe Agent]
        VA[Verify Agent]
        EA[Executor Agent]
        SUA[Summary Agent]
    end
    
    subgraph "Tool Layer"
        LT[List Tables Tool]
        GS[Get Schema Tool]
        QT[Query Tool]
    end
    
    subgraph "Database Layer"
        DB[(Database)]
        CONN[Connection Pool]
    end
    
    subgraph "LLM Layer"
        GEMINI[Gemini LLM]
        MOCK[Mock LLM]
    end
    
    UI --> API
    API --> LG
    LG --> STATE
    LG --> IA
    LG --> SA
    LG --> SCA
    LG --> VA
    LG --> EA
    LG --> SUA
    
    IA --> GEMINI
    SA --> GEMINI
    SCA --> GEMINI
    VA --> GEMINI
    SUA --> GEMINI
    
    GEMINI -.-> MOCK
    
    EA --> QT
    LT --> DB
    GS --> DB
    QT --> DB
    
    DB --> CONN
```

## 🔄 Agent Workflow Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant W as Workflow Engine
    participant LT as List Tables Tool
    participant IA as Interpreter Agent
    participant GS as Get Schema Tool
    participant SA as Selector Agent
    participant SCA as Scribe Agent
    participant VA as Verify Agent
    participant EA as Executor Agent
    participant SUA as Summary Agent
    participant DB as Database
    participant LLM as Gemini LLM
    
    U->>W: Natural Language Question
    W->>LT: Get Available Tables
    LT->>DB: SELECT name FROM sqlite_master
    DB-->>LT: Table List
    LT-->>W: Table Names
    
    W->>IA: Question + Tables
    IA->>LLM: Identify Relevant Tables
    LLM-->>IA: Table Selection
    IA-->>W: Selected Tables
    
    W->>GS: Get Table Schemas
    GS->>DB: DESCRIBE TABLE queries
    DB-->>GS: Schema Information
    GS-->>W: Table Schemas
    
    W->>SA: Question + Tables + Schemas
    SA->>LLM: Select Relevant Columns
    LLM-->>SA: Column Selection
    SA-->>W: Selected Columns
    
    W->>SCA: Question + Tables + Columns
    SCA->>LLM: Generate SQL Query
    LLM-->>SCA: SQL Query
    SCA-->>W: Generated SQL
    
    W->>VA: SQL Query
    VA->>LLM: Validate SQL
    LLM-->>VA: Validation Result
    
    alt SQL Valid
        VA-->>W: Valid
        W->>EA: Execute SQL
        EA->>DB: Run Query
        DB-->>EA: Query Results
        EA-->>W: Results
        W->>SUA: Question + Results
        SUA->>LLM: Summarize Results
        LLM-->>SUA: Natural Language Answer
        SUA-->>W: Final Answer
        W-->>U: Answer
    else SQL Invalid
        VA-->>W: Invalid
        W->>SCA: Retry with Error
        SCA->>LLM: Generate Corrected SQL
        LLM-->>SCA: Corrected SQL
        SCA-->>W: New SQL
        Note over W: Loop back to validation
    end
```

## 🧠 Agent State Flow

```mermaid
stateDiagram-v2
    [*] --> InitialState
    
    InitialState --> TableDiscovery : User Question
    TableDiscovery --> TableSelection : Table List
    TableSelection --> SchemaExtraction : Selected Tables
    SchemaExtraction --> ColumnSelection : Table Schemas
    ColumnSelection --> SQLGeneration : Selected Columns
    SQLGeneration --> SQLValidation : Generated SQL
    
    SQLValidation --> SQLExecution : Valid SQL
    SQLValidation --> SQLGeneration : Invalid SQL
    
    SQLExecution --> ResultSummarization : Query Results
    SQLExecution --> SQLGeneration : Execution Error
    
    ResultSummarization --> [*] : Final Answer
    
    note right of TableDiscovery
        State: {question, list_tables}
    end note
    
    note right of TableSelection
        State: {question, list_tables, table_target}
    end note
    
    note right of SchemaExtraction
        State: {question, list_tables, table_target, schema}
    end note
    
    note right of ColumnSelection
        State: {question, list_tables, table_target, schema, column_target}
    end note
    
    note right of SQLGeneration
        State: {question, list_tables, table_target, schema, column_target, generation}
    end note
    
    note right of SQLValidation
        State: {question, list_tables, table_target, schema, column_target, generation, verify_valid}
    end note
    
    note right of SQLExecution
        State: {question, list_tables, table_target, schema, column_target, generation, verify_valid, data/error}
    end note
    
    note right of ResultSummarization
        State: {question, list_tables, table_target, schema, column_target, generation, verify_valid, data, answer}
    end note
```

## 🔧 Component Interaction Diagram

```mermaid
graph LR
    subgraph "Agent Nodes"
        IA[Interpreter Agent]
        SA[Selector Agent]
        SCA[Scribe Agent]
        VA[Verify Agent]
        EA[Executor Agent]
        SUA[Summary Agent]
    end
    
    subgraph "Tool Nodes"
        LT[List Tables]
        GS[Get Schema]
    end
    
    subgraph "External Systems"
        LLM[Gemini LLM]
        DB[(Database)]
    end
    
    subgraph "State Management"
        STATE[Shared State]
    end
    
    IA -.->|Read/Write| STATE
    SA -.->|Read/Write| STATE
    SCA -.->|Read/Write| STATE
    VA -.->|Read/Write| STATE
    EA -.->|Read/Write| STATE
    SUA -.->|Read/Write| STATE
    
    IA -->|Query| LLM
    SA -->|Query| LLM
    SCA -->|Query| LLM
    VA -->|Query| LLM
    SUA -->|Query| LLM
    
    LT -->|Query| DB
    GS -->|Query| DB
    EA -->|Execute| DB
    
    LT -.->|Update| STATE
    GS -.->|Update| STATE
```

## 🛠️ Error Handling Flow

```mermaid
flowchart TD
    START([Start Query Processing]) --> EXEC[Execute Agent]
    
    EXEC --> SUCCESS{Success?}
    
    SUCCESS -->|Yes| NEXT[Next Agent]
    SUCCESS -->|No| ERROR_TYPE{Error Type?}
    
    ERROR_TYPE -->|LLM Error| MOCK[Use Mock LLM]
    ERROR_TYPE -->|DB Error| RETRY[Retry with Backoff]
    ERROR_TYPE -->|SQL Error| CORRECT[Correct SQL]
    ERROR_TYPE -->|Validation Error| REGENERATE[Regenerate Query]
    
    MOCK --> EXEC
    RETRY --> EXEC
    CORRECT --> EXEC
    REGENERATE --> EXEC
    
    NEXT --> END_CHECK{More Agents?}
    END_CHECK -->|Yes| EXEC
    END_CHECK -->|No| COMPLETE([Complete])
    
    style ERROR_TYPE fill:#ffcccc
    style MOCK fill:#ffffcc
    style RETRY fill:#ccffcc
    style CORRECT fill:#ccccff
    style REGENERATE fill:#ffccff
```

## 📊 Data Flow Architecture

```mermaid
graph TD
    subgraph "Input Layer"
        NL[Natural Language Query]
    end
    
    subgraph "Processing Layer"
        PARSE[Parse & Validate Input]
        CONTEXT[Build Context]
    end
    
    subgraph "Agent Processing"
        AGENTS[Multi-Agent Processing]
        STATE[State Management]
    end
    
    subgraph "Output Layer"
        SQL[Generated SQL]
        RESULT[Query Results]
        ANSWER[Natural Language Answer]
    end
    
    subgraph "Storage Layer"
        CACHE[Query Cache]
        LOGS[Execution Logs]
        METRICS[Performance Metrics]
    end
    
    NL --> PARSE
    PARSE --> CONTEXT
    CONTEXT --> AGENTS
    AGENTS --> STATE
    STATE --> AGENTS
    
    AGENTS --> SQL
    SQL --> RESULT
    RESULT --> ANSWER
    
    SQL --> CACHE
    AGENTS --> LOGS
    RESULT --> METRICS
    
    CACHE -.->|Cache Hit| AGENTS
    LOGS -.->|Debug Info| AGENTS
    METRICS -.->|Performance| AGENTS
```

## 🔄 Retry and Recovery Mechanisms

```mermaid
graph TD
    subgraph "Primary Flow"
        A[Agent Execution] --> B{Success?}
        B -->|Yes| C[Next Agent]
        B -->|No| D[Error Analysis]
    end
    
    subgraph "Error Recovery"
        D --> E{Error Type}
        E -->|LLM API Error| F[Switch to Mock LLM]
        E -->|SQL Syntax Error| G[Regenerate SQL]
        E -->|DB Connection Error| H[Retry Connection]
        E -->|Query Execution Error| I[Correct Query]
        E -->|Validation Error| J[Fix Validation Issues]
    end
    
    subgraph "Recovery Actions"
        F --> K[Continue with Mock]
        G --> L[Use Error Feedback]
        H --> M[Exponential Backoff]
        I --> N[Query Correction]
        J --> O[Validation Fix]
    end
    
    subgraph "Retry Logic"
        K --> A
        L --> A
        M --> A
        N --> A
        O --> A
    end
    
    C --> P{More Agents?}
    P -->|Yes| A
    P -->|No| Q[Complete]
    
    style D fill:#ffcccc
    style E fill:#ffffcc
    style F fill:#ccffcc
    style G fill:#ccccff
    style H fill:#ffccff
    style I fill:#ccffff
    style J fill:#ffccff
```

## 🎯 Agent Specialization Matrix

```mermaid
graph TB
    subgraph "Input Processing Agents"
        IA[Interpreter Agent<br/>Table Selection]
        SA[Selector Agent<br/>Column Selection]
    end
    
    subgraph "Generation Agents"
        SCA[Scribe Agent<br/>SQL Generation]
        VA[Verify Agent<br/>SQL Validation]
    end
    
    subgraph "Execution Agents"
        EA[Executor Agent<br/>Query Execution]
        SUA[Summary Agent<br/>Result Summarization]
    end
    
    subgraph "Tool Agents"
        LT[List Tables Tool<br/>Database Introspection]
        GS[Get Schema Tool<br/>Schema Extraction]
    end
    
    subgraph "Capabilities"
        LLM[LLM Integration]
        DB[Database Access]
        STATE[State Management]
        ERROR[Error Handling]
    end
    
    IA --> LLM
    SA --> LLM
    SCA --> LLM
    VA --> LLM
    SUA --> LLM
    
    LT --> DB
    GS --> DB
    EA --> DB
    
    IA --> STATE
    SA --> STATE
    SCA --> STATE
    VA --> STATE
    EA --> STATE
    SUA --> STATE
    
    IA --> ERROR
    SA --> ERROR
    SCA --> ERROR
    VA --> ERROR
    EA --> ERROR
    SUA --> ERROR
```

This comprehensive set of diagrams illustrates the complete agentic architecture, showing how different components interact, how data flows through the system, and how errors are handled and recovered from.
