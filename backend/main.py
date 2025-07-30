from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

app = FastAPI()

class TodoCreate(BaseModel):
    text: str
    done: bool = False

class TodoItem(TodoCreate):
    id: int

todos: List[TodoItem] = []
next_id = 1

@app.get("/todos", response_model=List[TodoItem])
def list_todos():
    return todos

@app.post("/todos", response_model=TodoItem, status_code=201)
def create_todo(item: TodoCreate):
    global next_id
    todo = TodoItem(id=next_id, **item.dict())
    next_id += 1
    todos.append(todo)
    return todo

@app.delete("/todos/{todo_id}", status_code=204)
def delete_todo(todo_id: int):
    for i, t in enumerate(todos):
        if t.id == todo_id:
            todos.pop(i)
            return
    raise HTTPException(404, "Not found")