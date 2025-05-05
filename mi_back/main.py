from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers.users import user_router
from routers.items import items_router
from routers.carts import carts_router
import uvicorn, stripe, os
from dotenv import load_dotenv

app = FastAPI(title="mi_app", version="v.0.0.1")

# Cargar claves desde .env
load_dotenv()
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')


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

@app.get("/get-secret-key", tags=["main"], status_code=200, response_description="Everything okay")
async def getSecretKey():
    apikey = os.getenv('STRIPE_SECRET_KEY')
    if apikey: return JSONResponse({"message":"secret Key loaded successfully"})
    else:  return JSONResponse({"message":"Error: secret Key not loaded"})

@app.get("/get-public-key", tags=["main"], status_code=200, response_description="Everything okay")
async def getPublicKey():
    publicKey = os.getenv('STRIPE_PUBLIC_KEY')
    if publicKey: return JSONResponse({"message":"public Key loaded successfully",
                                    "key": publicKey})
    else:  return JSONResponse({"message":"Error: secret Key not loaded",
                                "key": "null"})


if __name__ == "__main__":
    uvicorn.run("main:app", port=8000, reload=True)