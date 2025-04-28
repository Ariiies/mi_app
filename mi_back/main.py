from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers.users import user_router
from routers.items import items_router
from routers.carts import carts_router
import uvicorn

app = FastAPI(title="mi_app", version="v.0.0.1")

# Configura CORS para permitir interactuar con el frontend (REACT)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Crear tablas en la base de datos
Base.metadata.create_all(bind=engine)

# Incluir routers
app.include_router(user_router)
app.include_router(items_router)
app.include_router(carts_router)

# Endpoint raíz
@app.get("/", tags=["main"], status_code=200, response_description="Everything okay")
async def root():
    return {"message": "Hello World"}

if __name__ == "__main__":
    uvicorn.run("main:app", port=8000, reload=True)