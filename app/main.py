from mermaid.vis import display_graph
from workflow.flow import graph
from llmops.langfuse import langfuse_handler

def main():
    print("Hello from sql-ag-v2!")
    question = "Show me the top 10 employees by salary with their names and departments"
    try:
        for event in graph.stream(
        {"question": question}#, config={"recursion_limit": 25, "callbacks": [langfuse_handler]}
        ):
            print(event)
            print("\n\n")    
    except Exception as e:
        print(e)

if __name__ == "__main__":
    main()
