{
  "version": 2,
  "name": "lottery-api",
  "builds": [
    {
      "src": "app.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/app.py"
    }
  ],
  "env": {
    "PYTHON_VERSION": "3.11"
  }
}