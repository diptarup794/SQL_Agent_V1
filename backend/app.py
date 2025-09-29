from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import sqlite3
import tempfile
import uuid
from werkzeug.utils import secure_filename
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.exc import SQLAlchemyError
import json
from datetime import datetime, timedelta
import logging
from dotenv import load_dotenv
import time

# Import our existing SQL agent components
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'app'))
from staff.agent_node import get_llm
from utilities.func import State
from llmops.langfuse import langfuse_ops, langfuse_handler

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables to store active connections
active_connections = {}
current_connection = None

# Rate limiting for status endpoint
last_status_check = {}
STATUS_CHECK_INTERVAL = 5  # seconds

# Supported database types
SUPPORTED_DB_TYPES = {
    'sqlite': {
        'name': 'SQLite',
        'description': 'Local file database',
        'fields': ['file_path']
    },
    'mysql': {
        'name': 'MySQL',
        'description': 'MySQL database server',
        'fields': ['host', 'port', 'username', 'password', 'database']
    },
    'postgresql': {
        'name': 'PostgreSQL',
        'description': 'PostgreSQL database server',
        'fields': ['host', 'port', 'username', 'password', 'database']
    },
    'mssql': {
        'name': 'SQL Server',
        'description': 'Microsoft SQL Server',
        'fields': ['host', 'port', 'username', 'password', 'database']
    }
}

def create_connection_string(db_type, connection_data):
    """Create SQLAlchemy connection string from connection data"""
    if db_type == 'sqlite':
        return f"sqlite:///{connection_data['file_path']}"
    elif db_type == 'mysql':
        return f"mysql+pymysql://{connection_data['username']}:{connection_data['password']}@{connection_data['host']}:{connection_data['port']}/{connection_data['database']}"
    elif db_type == 'postgresql':
        return f"postgresql://{connection_data['username']}:{connection_data['password']}@{connection_data['host']}:{connection_data['port']}/{connection_data['database']}"
    elif db_type == 'mssql':
        return f"mssql+pyodbc://{connection_data['username']}:{connection_data['password']}@{connection_data['host']}:{connection_data['port']}/{connection_data['database']}?driver=ODBC+Driver+17+for+SQL+Server"
    else:
        raise ValueError(f"Unsupported database type: {db_type}")

def test_connection(connection_string):
    """Test database connection"""
    try:
        engine = create_engine(connection_string, pool_pre_ping=True)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True, "Connection successful"
    except Exception as e:
        return False, str(e)

def get_database_schema(connection_string):
    """Get database schema information"""
    try:
        engine = create_engine(connection_string)
        inspector = inspect(engine)
        
        schema_info = {
            'tables': [],
            'connection_string': connection_string.split('://')[0] + '://***'
        }
        
        for table_name in inspector.get_table_names():
            columns = []
            for column in inspector.get_columns(table_name):
                columns.append({
                    'name': column['name'],
                    'type': str(column['type']),
                    'nullable': column['nullable'],
                    'primary_key': column.get('primary_key', False)
                })
            
            schema_info['tables'].append({
                'name': table_name,
                'columns': columns
            })
        
        return schema_info
    except Exception as e:
        logger.error(f"Error getting schema: {e}")
        return None

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'active_connections': len(active_connections)
    })

@app.route('/api/db-types', methods=['GET'])
def get_db_types():
    """Get supported database types"""
    return jsonify(SUPPORTED_DB_TYPES)

@app.route('/api/connect', methods=['POST'])
def connect_database():
    """Connect to a database"""
    global current_connection
    
    try:
        data = request.get_json()
        db_type = data.get('db_type')
        connection_data = data.get('connection_data', {})
        
        if not db_type or db_type not in SUPPORTED_DB_TYPES:
            return jsonify({'error': 'Invalid database type'}), 400
        
        # Create connection string
        connection_string = create_connection_string(db_type, connection_data)
        
        # Test connection
        is_connected, message = test_connection(connection_string)
        
        if not is_connected:
            return jsonify({'error': f'Connection failed: {message}'}), 400
        
        # Get schema
        schema = get_database_schema(connection_string)
        if not schema:
            return jsonify({'error': 'Failed to retrieve database schema'}), 500
        
        # Store connection
        connection_id = str(uuid.uuid4())
        active_connections[connection_id] = {
            'connection_string': connection_string,
            'db_type': db_type,
            'schema': schema,
            'connected_at': datetime.now().isoformat()
        }
        current_connection = connection_id
        
        return jsonify({
            'success': True,
            'message': 'Connection successful',
            'connection_id': connection_id,
            'schema': schema
        })
        
    except Exception as e:
        logger.error(f"Connection error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/upload-db', methods=['POST'])
def upload_database():
    """Upload SQLite database file"""
    global current_connection
    
    try:
        logger.info(f"Upload request received from {request.remote_addr}")
        
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not file.filename.endswith('.db'):
            return jsonify({'error': 'Only .db files are supported'}), 400
        
        logger.info(f"Uploading file: {file.filename}")
        
        # Disconnect any existing connection first
        if current_connection and current_connection in active_connections:
            old_conn = active_connections[current_connection]
            if 'file_path' in old_conn and os.path.exists(old_conn['file_path']):
                try:
                    os.remove(old_conn['file_path'])
                except:
                    pass
            del active_connections[current_connection]
            current_connection = None
        
        # Save file temporarily
        filename = secure_filename(file.filename)
        temp_dir = tempfile.mkdtemp()
        file_path = os.path.join(temp_dir, filename)
        file.save(file_path)
        
        logger.info(f"File saved to: {file_path}")
        
        # Test connection
        connection_string = f"sqlite:///{file_path}"
        logger.info(f"Testing connection: {connection_string}")
        is_connected, message = test_connection(connection_string)
        
        if not is_connected:
            os.remove(file_path)
            logger.error(f"Connection test failed: {message}")
            return jsonify({'error': f'Invalid database file: {message}'}), 400
        
        logger.info("Connection test successful")
        
        # Get schema
        logger.info("Retrieving database schema...")
        schema = get_database_schema(connection_string)
        if not schema:
            os.remove(file_path)
            logger.error("Failed to retrieve database schema")
            return jsonify({'error': 'Failed to read database schema'}), 500
        
        logger.info(f"Schema retrieved: {len(schema.get('tables', []))} tables")
        
        # Store connection
        connection_id = str(uuid.uuid4())
        active_connections[connection_id] = {
            'connection_string': connection_string,
            'db_type': 'sqlite',
            'schema': schema,
            'connected_at': datetime.now().isoformat(),
            'file_path': file_path,
            'filename': filename
        }
        current_connection = connection_id
        
        logger.info(f"New connection established: {connection_id}")
        
        return jsonify({
            'success': True,
            'message': f'Database "{filename}" uploaded and connected successfully',
            'connection_id': connection_id,
            'schema': schema,
            'filename': filename
        })
        
    except Exception as e:
        logger.error(f"Upload error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/query', methods=['POST'])
def execute_query():
    """Execute SQL query using the SQL agent with Langfuse monitoring"""
    global current_connection
    
    # Start Langfuse trace
    trace = None
    if langfuse_ops.enabled:
        trace = langfuse_ops.start_trace(
            name="sql_query_execution",
            user_id=request.remote_addr,
            session_id=current_connection,
            metadata={
                "endpoint": "/api/query",
                "method": "POST"
            }
        )
    
    try:
        if not current_connection or current_connection not in active_connections:
            error_msg = 'No active database connection'
            if trace:
                langfuse_ops.log_query_event(trace, "error", "", error=error_msg)
                langfuse_ops.update_trace(trace, status="failed", error=error_msg)
            return jsonify({'error': error_msg}), 400
        
        data = request.get_json()
        question = data.get('question')
        
        if not question:
            error_msg = 'No question provided'
            if trace:
                langfuse_ops.log_query_event(trace, "error", "", error=error_msg)
                langfuse_ops.update_trace(trace, status="failed", error=error_msg)
            return jsonify({'error': error_msg}), 400
        
        # Log query start
        if trace:
            langfuse_ops.log_query_event(trace, "query_start", question)
        
        # Get connection info
        conn_info = active_connections[current_connection]
        connection_string = conn_info['connection_string']
        
        # Set environment variable for the SQL agent
        os.environ['CONNECTION_STRING'] = connection_string
        
        # Import and run the SQL agent workflow
        sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'app'))
        from workflow.flow import graph
        
        # Execute the workflow with recursion limit and Langfuse callback
        result = None
        config = {"recursion_limit": 50}
        if langfuse_handler:
            config["callbacks"] = [langfuse_handler]
        
        try:
            for event in graph.stream(
                {"question": question}, 
                config=config
            ):
                result = event
                
                # Log intermediate results
                if trace and event:
                    for node_name, node_result in event.items():
                        if isinstance(node_result, dict):
                            langfuse_ops.log_query_event(
                                trace, 
                                f"node_{node_name}", 
                                str(node_result),
                                metadata={"node": node_name}
                            )
                        
        except Exception as e:
            logger.error(f"Workflow execution error: {e}")
            
            if trace:
                langfuse_ops.log_query_event(trace, "workflow_error", question, error=str(e))
                langfuse_ops.update_trace(trace, status="failed", error=str(e))
            
            if "recursion limit" in str(e).lower():
                return jsonify({
                    'success': False,
                    'error': 'Query too complex. Please try a simpler question or break it down into smaller parts.'
                }), 400
            elif "quota" in str(e).lower() or "429" in str(e):
                return jsonify({
                    'success': False,
                    'error': 'API quota exceeded. Please wait a few minutes before trying again, or upgrade your Google API plan. The free tier allows 15 requests per minute.'
                }), 429
            else:
                return jsonify({
                    'success': False,
                    'error': f'Query execution failed: {str(e)}'
                }), 500
        
        # Extract the final answer
        if result and 'summary_agent_node' in result:
            answer = result['summary_agent_node'].get('answer', 'No answer generated')
        else:
            answer = "Unable to process the query. Please try rephrasing your question."
        
        # Log successful completion
        if trace:
            langfuse_ops.log_query_event(trace, "query_complete", question, result=answer)
            langfuse_ops.update_trace(trace, status="completed", output=answer)
        
        return jsonify({
            'success': True,
            'answer': answer,
            'question': question,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Query execution error: {e}")
        
        if trace:
            langfuse_ops.log_query_event(trace, "execution_error", "", error=str(e))
            langfuse_ops.update_trace(trace, status="failed", error=str(e))
        
        return jsonify({'error': str(e)}), 500

@app.route('/api/schema', methods=['GET'])
def get_schema():
    """Get current database schema"""
    global current_connection
    
    if not current_connection or current_connection not in active_connections:
        return jsonify({'error': 'No active database connection'}), 400
    
    conn_info = active_connections[current_connection]
    return jsonify(conn_info['schema'])

@app.route('/api/disconnect', methods=['POST'])
def disconnect_database():
    """Disconnect from current database"""
    global current_connection
    
    if current_connection and current_connection in active_connections:
        conn_info = active_connections[current_connection]
        
        # Clean up uploaded file if it exists
        if 'file_path' in conn_info and os.path.exists(conn_info['file_path']):
            try:
                os.remove(conn_info['file_path'])
            except:
                pass
        
        del active_connections[current_connection]
        current_connection = None
        
        return jsonify({'success': True, 'message': 'Disconnected successfully'})
    
    return jsonify({'error': 'No active connection to disconnect'}), 400

@app.route('/api/status', methods=['GET'])
def get_status():
    """Get current connection status with rate limiting"""
    global current_connection
    
    # Rate limiting
    client_ip = request.remote_addr
    current_time = time.time()
    
    if client_ip in last_status_check:
        time_since_last = current_time - last_status_check[client_ip]
        if time_since_last < STATUS_CHECK_INTERVAL:
            return jsonify({
                'connected': current_connection is not None,
                'rate_limited': True,
                'retry_after': STATUS_CHECK_INTERVAL - time_since_last
            }), 429
    
    last_status_check[client_ip] = current_time
    
    if current_connection and current_connection in active_connections:
        conn_info = active_connections[current_connection]
        return jsonify({
            'connected': True,
            'db_type': conn_info['db_type'],
            'connected_at': conn_info['connected_at'],
            'schema': conn_info['schema'],
            'filename': conn_info.get('filename', 'Unknown'),
            'connection_id': current_connection
        })
    
    return jsonify({'connected': False})

@app.route('/api/connection-info', methods=['GET'])
def get_connection_info():
    """Get detailed connection information for debugging"""
    global current_connection
    
    logger.info(f"Connection info request - Current connection: {current_connection}")
    logger.info(f"Active connections: {list(active_connections.keys())}")
    
    if current_connection and current_connection in active_connections:
        conn_info = active_connections[current_connection]
        return jsonify({
            'connected': True,
            'connection_id': current_connection,
            'db_type': conn_info['db_type'],
            'connected_at': conn_info['connected_at'],
            'filename': conn_info.get('filename', 'Unknown'),
            'file_path': conn_info.get('file_path', 'Unknown'),
            'connection_string': conn_info['connection_string'].split('://')[0] + '://***',
            'schema': {
                'table_count': len(conn_info['schema'].get('tables', [])),
                'tables': [table['name'] for table in conn_info['schema'].get('tables', [])],
                'total_columns': sum(len(table.get('columns', [])) for table in conn_info['schema'].get('tables', []))
            }
        })
    
    return jsonify({
        'connected': False,
        'message': 'No active connection',
        'active_connections': list(active_connections.keys())
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
