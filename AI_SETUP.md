# 🤖 AI Integration Setup Guide

Kompletný návod na spustenie EDU AI Platform s **Ollama** a **Vector Database**.

## 🎯 Výsledok

Po dokončení budete mať:
- ✅ **Skutočný AI tutor** namiesto mock odpovedí
- ✅ **Vector databázu** pre semantic search v dokumentoch  
- ✅ **Lokálne LLM modely** (žiadne API keys)
- ✅ **Document embedding** - nahrané súbory sa použijú pre AI odpovede

## 📋 Krok za krokom

### 1. Nainštalujte Docker
```bash
# macOS
brew install docker

# Linux
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Windows - stiahnite Docker Desktop
```

### 2. Nainštalujte Ollama
```bash
# macOS
brew install ollama

# Linux  
curl -fsSL https://ollama.ai/install.sh | sh

# Windows - stiahnite z https://ollama.ai
```

### 3. Spustite AI služby

#### Terminal 1 - ChromaDB
```bash
docker run -d --name chromadb -p 8000:8000 chromadb/chroma
```

#### Terminal 2 - Ollama
```bash
ollama serve
```

#### Terminal 3 - Download AI models
```bash
# LLM model pre chat (4GB - počkajte 5-10 min)
ollama pull llama2

# Embedding model pre vector search (300MB)
ollama pull mxbai-embed-large
```

### 4. Spustite Backend
```bash
# Choďte do backend adresára
cd backend

# Nainštalujte dependencies (ak ešte nie)
npm install

# Spustite server
npm run dev
```

### 5. Spustite Frontend
```bash
# V pôvodnom adresári (src/)
npm start
```

## ✅ Verifikácia

### 1. Skontrolujte služby
```bash
# ChromaDB
curl http://localhost:8000/api/v1/heartbeat

# Ollama  
curl http://localhost:11434/api/tags

# Backend
curl http://localhost:3001/api/health
```

### 2. Test AI Chat
1. Otvorte http://localhost:3000/EDU_AI_Platforma
2. Prihláste sa ako učiteľ: `ucitel@demo.cz` / `heslo123`
3. Choďte do záložky **"Chat"**
4. Napíšte správu - mali by ste dostať AI odpoveď!

### 3. Test Document Upload
1. Choďte do záložky **"Dokumenty"** 
2. Nahrajte PDF/DOCX súbor
3. Súbor sa spracuje a pridá do vector databázy
4. V chate sa teraz pýtajte na obsah dokumentu!

## 🔧 Troubleshooting

### "AI služba není dostupná"
```bash
# Skontrolujte Ollama
ollama list

# Reštartujte
ollama serve
```

### "Failed to connect to ChromaDB"
```bash
# Skontrolujte Docker container
docker ps | grep chroma

# Reštartujte
docker restart chromadb
```

### Pomalé AI odpovede
```bash
# Použite menší model
ollama pull phi3:mini

# Nastavte v backend/.env:
OLLAMA_MODEL=phi3:mini
```

### Backend sa nespustí
```bash
# Skontrolujte porty
lsof -i :3001
lsof -i :8000  
lsof -i :11434

# Zastavte konflikty
kill -9 <PID>
```

## 🚀 Optimalizácia

### Pre rýchlejšie odpovede:
```bash
# Menší model (1.7GB namiesto 4GB)
ollama pull phi3:mini

# Upravte backend/.env
OLLAMA_MODEL=phi3:mini
```

### Pre lepšie odpovede:
```bash
# Väčší model (7GB)
ollama pull llama2:13b

# Upravte backend/.env  
OLLAMA_MODEL=llama2:13b
```

### GPU Acceleration:
```bash
# Ollama automaticky použije NVIDIA GPU
nvidia-smi

# Pre Apple Silicon Mac automaticky použije Metal
```

## 🎓 Používanie

### 1. Nahrávanie dokumentov
- Podporované: PDF, DOCX, TXT
- Max veľkosť: 50MB
- Automaticky sa vytvárajú embeddings
- Indexujú sa do vector databázy

### 2. AI Chat
- Kontext z nahraných dokumentov
- Učiteľský vs študentský mód  
- Vector search pre relevantný obsah
- Confidence scoring

### 3. Semantic Search
- Vyhľadávanie podľa významu, nie len klúčových slov
- Multijazyčná podpora
- Filtrovanie podľa predmetu

## 📊 Monitoring

```bash
# Backend health
curl http://localhost:3001/api/health

# Document stats
curl http://localhost:3001/api/documents/stats

# Available models
curl http://localhost:3001/api/chat/models
```

## 🔐 Bezpečnosť

✅ **Kompletne offline** - žiadne dáta neunikajú  
✅ **Lokálne modely** - žiadne API keys  
✅ **Súkromie** - dokumenty sa spracovávajú len lokálne  
✅ **Open source** - úplná kontrola nad kódom

---

## 🆘 Potrebujete pomoc?

1. **Skontrolujte logy** - `docker logs chromadb`, `ollama logs`
2. **Reštartujte služby** - Docker, Ollama, Backend  
3. **Skontrolujte system resources** - RAM, GPU, disk space
4. **Vyskúšajte menší model** - `phi3:mini` namiesto `llama2`

**🎉 Hotovo! Teraz máte skutočný AI systém s vector databázou!** 🚀
kakat
