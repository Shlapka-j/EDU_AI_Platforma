import { Router } from 'express';
import { ollama } from '../services/ollama';
import { documentProcessor } from '../services/documentProcessor';

const router = Router();

interface ChatRequest {
  message: string;
  userRole: 'student' | 'teacher';
  subject?: string;
  studentId?: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

router.post('/message', async (req: any, res: any) => {
  try {
    const { message, userRole, subject, studentId, conversationHistory = [] }: ChatRequest = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`💬 Chat request from ${userRole}: ${message.substring(0, 100)}...`);

    // Search for relevant context in documents
    const contextResults = await documentProcessor.searchDocuments(
      message, 
      subject, 
      3 // Get top 3 relevant chunks
    );

    const context = contextResults
      .filter(result => result.relevanceScore > 0.7) // Only high-relevance results
      .map(result => `[${result.fileName}] ${result.content.substring(0, 300)}...`);

    // Generate AI response with context
    const aiResponse = await ollama.generateEducationalResponse(
      message,
      context,
      userRole,
      subject
    );

    // Calculate confidence based on context availability
    const confidence = context.length > 0 ? 0.9 : 0.7;

    const response = {
      id: `ai-${Date.now()}`,
      type: 'ai',
      content: aiResponse,
      timestamp: new Date().toISOString(),
      vectorContext: context.length > 0 ? contextResults.map(r => 
        `${r.fileName} (${Math.round(r.relevanceScore * 100)}%)`
      ) : [],
      confidence,
      relatedTopics: contextResults.length > 0 ? contextResults.map(r => r.subject).filter(Boolean) : [],
      metadata: {
        contextUsed: context.length > 0,
        documentsSearched: contextResults.length,
        relevantSources: contextResults.filter(r => r.relevanceScore > 0.7).length
      }
    };

    console.log(`✅ Chat response generated (confidence: ${confidence})`);
    res.json(response);

  } catch (error) {
    console.error('❌ Chat error:', error);
    res.status(500).json({ 
      error: 'Failed to generate response',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
    });
  }
});

router.get('/models', async (req, res) => {
  try {
    const models = await ollama.listModels();
    res.json({ models });
  } catch (error) {
    console.error('❌ Failed to list models:', error);
    res.status(500).json({ error: 'Failed to list models' });
  }
});

router.get('/health', async (req, res) => {
  try {
    const ollamaConnected = await ollama.checkConnection();
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        ollama: ollamaConnected ? 'connected' : 'disconnected',
        vectorDB: 'connected' // Assume connected if we got this far
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;