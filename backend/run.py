import uvicorn

# if __name__ == "__main__":
#     uvicorn.run("app.main:app", host="0.0.0.0", port=8000)
# if __name__ == "__main__":
#     uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
if __name__ == "__main__":
    uvicorn.run("app.main:app", reload=True)
