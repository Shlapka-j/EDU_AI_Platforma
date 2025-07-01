import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Import services
import { vectorDB } from './services/vectorDatabase';
import { ollama } from './services/ollama';

// Import routes
import chatRoutes from './routes/chat';
import documentRoutes from './routes/documents';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3002',
    process.env.FRONTEND_URL || 'http://localhost:3000'
  ],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/documents', documentRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const ollamaConnected = await ollama.checkConnection();
    const stats = await vectorDB.getCollectionStats();
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        ollama: ollamaConnected ? 'connected' : 'disconnected',
        vectorDatabase: 'connected',
        documentsCount: stats.count
      },
      version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'EDU AI Platform Backend',
    version: '1.0.0',
    description: 'Backend server with Ollama LLM and Vector Database integration',
    endpoints: {
      health: '/api/health',
      chat: '/api/chat',
      documents: '/api/documents'
    }
  });
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Server error:', error);
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({
//     error: 'Endpoint not found',
//     path: req.originalUrl,
//     timestamp: new Date().toISOString()
//   });
// });

// Initialize services and start server
async function startServer() {
  try {
    console.log('🚀 Starting EDU AI Platform Backend...');
    
    // Check Ollama connection
    console.log('🔗 Checking Ollama connection...');
    const ollamaConnected = await ollama.checkConnection();
    if (!ollamaConnected) {
      console.warn('⚠️ Ollama is not connected. Please make sure Ollama is running.');
      console.warn('   Install: https://ollama.ai');
      console.warn('   Run: ollama serve');
    }

    // Initialize vector database
    console.log('🗄️ Initializing vector database...');
    await vectorDB.initialize();

    // Start server
    app.listen(PORT, () => {
      console.log('✅ Server started successfully!');
      console.log(`📡 Server running on: http://localhost:${PORT}`);
      console.log(`🌐 API endpoints:`);
      console.log(`   Health: http://localhost:${PORT}/api/health`);
      console.log(`   Chat: http://localhost:${PORT}/api/chat`);
      console.log(`   Documents: http://localhost:${PORT}/api/documents`);
      console.log('');
      console.log('📋 Prerequisites:');
      console.log('   1. Ollama installed and running (ollama serve)');
      console.log('   2. ChromaDB running (docker run -p 8000:8000 chromadb/chroma)');
      console.log('   3. Recommended models: ollama pull llama2 && ollama pull mxbai-embed-large');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();

export default app;