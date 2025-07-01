# EDU AI Platform Backend

Backend server s **Ollama LLM** a **Vector Database** integráciou pre inteligentný vzdělávací systém.

## 🚀 Funkcie

- **🤖 Ollama LLM Integration** - Lokálne AI modely (llama2, mxbai-embed-large)
- **🗄️ Vector Database** - ChromaDB pre semantické vyhľadávanie dokumentov
- **📄 Document Processing** - PDF, DOCX, TXT embedding a indexovanie
- **💬 AI Chat** - Kontextovo-aware konverzácie s prístupom k materiálom
- **🔍 Semantic Search** - Vyhľadávanie relevantného obsahu v dokumentoch

## 📋 Požiadavky

### 1. Docker
```bash
# macOS
brew install docker

# Linux
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### 2. Ollama
```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh
```

## ⚡ Rýchla inštalácia

```bash
# 1. Spustite setup script
./setup.sh

# 2. Spustite backend server
npm run dev
```

## 🔧 Manuálna inštalácia

### 1. Spustite ChromaDB
```bash
docker run -d --name chromadb -p 8000:8000 chromadb/chroma
```

### 2. Spustite Ollama
```bash
ollama serve
```

### 3. Stiahnite AI modely
```bash
# LLM model pre chat (cca 4GB)
ollama pull llama2

# Embedding model pre vector search (cca 300MB)  
ollama pull mxbai-embed-large
```

### 4. Spustite backend
```bash
npm install
npm run dev
```

## 🌐 API Endpoints

| Endpoint | Metóda | Popis |
|----------|--------|-------|
| `/api/health` | GET | Status služieb |
| `/api/chat/message` | POST | AI chat konverzácia |
| `/api/documents/upload` | POST | Nahranie a spracovanie dokumentu |
| `/api/documents/search` | GET | Vyhľadávanie v dokumentoch |
| `/api/documents/stats` | GET | Štatistiky databázy |

## 💬 AI Chat API

```bash
curl -X POST http://localhost:3001/api/chat/message \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "Vysvetli mi gravitáciu",
    "userRole": "student",
    "subject": "Fyzika"
  }'
```

## 📄 Document Upload API

```bash
curl -X POST http://localhost:3001/api/documents/upload \\
  -F "file=@uczebnica_fyziky.pdf" \\
  -F "subject=Fyzika" \\
  -F "grade=8"
```

## 🔍 Search API

```bash
curl "http://localhost:3001/api/documents/search?query=gravitace&subject=Fyzika&limit=3"
```

## 🏗️ Architektúra

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Ollama LLM    │
│   React App     │───▶│   Express.js    │───▶│   Local Models  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   ChromaDB      │
                       │   Vector Store  │
                       └─────────────────┘
```

## 🔧 Konfigurácia

Upravte `.env` súbor:

```env
# Server
PORT=3001
NODE_ENV=development

# Ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama2
OLLAMA_EMBEDDING_MODEL=mxbai-embed-large

# ChromaDB
CHROMA_URL=http://localhost:8000

# Frontend
FRONTEND_URL=http://localhost:3000
```

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:3001/api/health
```

### Document Stats  
```bash
curl http://localhost:3001/api/documents/stats
```

### Available Models
```bash
curl http://localhost:3001/api/chat/models
```

## 🐛 Troubleshooting

### Ollama nereaguje
```bash
# Skontrolujte status
ollama list

# Reštartujte service
ollama serve
```

### ChromaDB nedostupná
```bash
# Skontrolujte container
docker ps | grep chroma

# Reštartujte container
docker restart chromadb
```

### Pomalé AI odpovede
```bash
# Použite menší model
ollama pull llama2:7b-chat

# Alebo phi3
ollama pull phi3:mini
```

## 🚀 Produkcia

Pre produkčné nasadenie:

```bash
# Build backend
npm run build

# Spustite produkčný server
npm start
```

## 📈 Performance Tips

1. **GPU Acceleration** - Ollama automaticky využije GPU ak je dostupné
2. **Memory Management** - Nastavte `OLLAMA_NUM_PARALLEL=2` pre viac requestov
3. **Model Cache** - Modely sa cachujú po prvom použití
4. **Vector Index** - ChromaDB automaticky indexuje pre rýchle vyhľadávanie

## 🔐 Bezpečnosť

- Všetko beží lokálne - žiadne dáta sa neodosielajú na externé servery
- Dokumenty sa spracovávajú a ukladajú len lokálne
- AI modely bežia kompletne offline

## 📚 Dokumentácia modelov

- **llama2** - Meta's LLM pre general chat
- **mxbai-embed-large** - Embedding model pre semantic search
- **phi3:mini** - Menší, rýchlejší model od Microsoft

---

**🎓 EDU AI Platform** - Lokálne AI pre vzdelávanie