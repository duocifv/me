from fastapi import FastAPI, Body
from pydantic import BaseModel

app = FastAPI()

# Kiểu dữ liệu đầu vào
class Item(BaseModel):
    id: int
    name: str
    description: str = None

# GET /
@app.get("/")
def root():
    return {"Hello": "World!22"}

# POST /items
@app.post("/items")
def create_item(item: Item):
    return {"message": "Item created", "item": item}

# PUT /items/{item_id}
@app.put("/items/{item_id}")
def update_item(item_id: int, item: Item):
    return {
        "message": f"Item {item_id} updated",
        "item": item
    }
