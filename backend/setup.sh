#!/bin/bash

echo "🚀 Setting up EDU AI Platform Backend..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is required but not installed. Please install Docker first."
    exit 1
fi

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "📥 Ollama not found. Installing Ollama..."
    
    # Detect OS and install Ollama
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        echo "🍎 Detected macOS - Please install Ollama manually from https://ollama.ai"
        echo "   Or use: brew install ollama"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl -fsSL https://ollama.ai/install.sh | sh
    else
        echo "❌ Unsupported OS. Please install Ollama manually from https://ollama.ai"
        exit 1
    fi
fi

# Start ChromaDB container
echo "🗄️ Starting ChromaDB container..."
docker run -d --name chromadb -p 8000:8000 chromadb/chroma

# Wait for ChromaDB to start
echo "⏳ Waiting for ChromaDB to start..."
sleep 10

# Start Ollama service
echo "🤖 Starting Ollama service..."
ollama serve &
OLLAMA_PID=$!

# Wait for Ollama to start
echo "⏳ Waiting for Ollama to start..."
sleep 5

# Pull required models
echo "📥 Pulling required Ollama models..."
echo "   This may take several minutes..."

ollama pull llama2
ollama pull mxbai-embed-large

echo "✅ Setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Run: npm run dev"
echo "2. The backend will be available at http://localhost:3001"
echo "3. Check health at http://localhost:3001/api/health"
echo ""
echo "🔧 Services running:"
echo "   - ChromaDB: http://localhost:8000"
echo "   - Ollama: http://localhost:11434"
echo "   - Backend API: http://localhost:3001"