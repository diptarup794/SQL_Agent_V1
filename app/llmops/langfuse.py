from langfuse import Langfuse
try:
    from langfuse.callback import CallbackHandler
except ImportError:
    # Fallback for older versions
    CallbackHandler = None
try:
    from langfuse.decorators import observe, langfuse_context
except ImportError:
    # Fallback for older versions
    observe = None
    langfuse_context = None
import os
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)

# Get Langfuse credentials
secret_key = os.getenv("LANGFUSE_SECRET_KEY")
public_key = os.getenv("LANGFUSE_PUBLIC_KEY")
host = os.getenv("LANGFUSE_HOST", "https://cloud.langfuse.com")

# Initialize Langfuse client
langfuse = None
langfuse_handler = None

if secret_key and public_key and secret_key != "your_langfuse_secret_key_here":
    try:
        langfuse = Langfuse(
            public_key=public_key,
            secret_key=secret_key,
            host=host
        )
        if CallbackHandler:
            langfuse_handler = CallbackHandler(
                public_key=public_key,
                secret_key=secret_key,
                host=host
            )
        else:
            langfuse_handler = None
        logger.info("✅ Langfuse initialized successfully")
    except Exception as e:
        logger.error(f"❌ Failed to initialize Langfuse: {e}")
        langfuse = None
        langfuse_handler = None
else:
    logger.warning("⚠️ Langfuse credentials not configured. LLMOps monitoring disabled.")

class LangfuseOps:
    """Langfuse LLMOps wrapper for SQL Agent monitoring"""
    
    def __init__(self):
        self.langfuse = langfuse
        self.enabled = langfuse is not None
    
    def start_trace(self, name: str, user_id: str = None, session_id: str = None, **kwargs):
        """Start a new trace for SQL query processing"""
        if not self.enabled:
            return None
        
        try:
            # Try different API methods based on Langfuse version
            if hasattr(self.langfuse, 'trace'):
                return self.langfuse.trace(
                    name=name,
                    user_id=user_id,
                    session_id=session_id,
                    **kwargs
                )
            elif hasattr(self.langfuse, 'create_trace'):
                return self.langfuse.create_trace(
                    name=name,
                    user_id=user_id,
                    session_id=session_id,
                    **kwargs
                )
            else:
                logger.warning("Langfuse trace API not available")
                return None
        except Exception as e:
            logger.error(f"Failed to start trace: {e}")
            return None
    
    def log_query_event(self, trace, event_type: str, query: str, **kwargs):
        """Log SQL query processing events"""
        if not self.enabled or not trace:
            return
        
        try:
            trace.event(
                name=event_type,
                input=query,
                **kwargs
            )
        except Exception as e:
            logger.error(f"Failed to log query event: {e}")
    
    def log_llm_call(self, trace, model: str, prompt: str, response: str, **kwargs):
        """Log LLM calls with detailed information"""
        if not self.enabled or not trace:
            return
        
        try:
            trace.generation(
                name="llm_call",
                model=model,
                input=prompt,
                output=response,
                **kwargs
            )
        except Exception as e:
            logger.error(f"Failed to log LLM call: {e}")
    
    def log_sql_execution(self, trace, sql_query: str, result: str, error: str = None):
        """Log SQL execution results"""
        if not self.enabled or not trace:
            return
        
        try:
            trace.span(
                name="sql_execution",
                input=sql_query,
                output=result,
                metadata={
                    "error": error is not None,
                    "error_message": error
                }
            )
        except Exception as e:
            logger.error(f"Failed to log SQL execution: {e}")
    
    def update_trace(self, trace, status: str = "completed", **kwargs):
        """Update trace with final status"""
        if not self.enabled or not trace:
            return
        
        try:
            trace.update(
                status=status,
                **kwargs
            )
        except Exception as e:
            logger.error(f"Failed to update trace: {e}")

# Global instance
langfuse_ops = LangfuseOps()

# Decorator for automatic tracing
def trace_sql_agent(func):
    """Decorator to automatically trace SQL agent functions"""
    def wrapper(*args, **kwargs):
        if not langfuse_ops.enabled:
            return func(*args, **kwargs)
        
        trace = langfuse_ops.start_trace(
            name=f"sql_agent_{func.__name__}",
            metadata={"function": func.__name__}
        )
        
        try:
            result = func(*args, **kwargs)
            langfuse_ops.update_trace(trace, status="completed")
            return result
        except Exception as e:
            langfuse_ops.update_trace(trace, status="failed", error=str(e))
            raise
    
    return wrapper

# Export the handler for LangChain compatibility
__all__ = ['langfuse_handler', 'langfuse_ops', 'trace_sql_agent']