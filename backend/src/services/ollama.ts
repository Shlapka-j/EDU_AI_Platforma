import { Ollama } from 'ollama';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  max_tokens?: number;
  context_window?: number;
}

class OllamaService {
  private client: Ollama;
  private defaultModel: string;
  private embeddingModel: string;

  constructor() {
    this.client = new Ollama({
      host: process.env.OLLAMA_URL || 'http://localhost:11434'
    });
    this.defaultModel = process.env.OLLAMA_MODEL || 'llama2'; // Default model
    this.embeddingModel = process.env.OLLAMA_EMBEDDING_MODEL || 'mxbai-embed-large';
  }

  async checkConnection(): Promise<boolean> {
    try {
      await this.client.list();
      console.log('✅ Ollama connection successful');
      return true;
    } catch (error) {
      console.error('❌ Ollama connection failed:', error);
      return false;
    }
  }

  async ensureModel(modelName: string): Promise<void> {
    try {
      const models = await this.client.list();
      const modelExists = models.models.some(m => m.name.includes(modelName));
      
      if (!modelExists) {
        console.log(`📥 Pulling model: ${modelName}...`);
        await this.client.pull({ model: modelName });
        console.log(`✅ Model ${modelName} pulled successfully`);
      }
    } catch (error) {
      console.error(`❌ Failed to ensure model ${modelName}:`, error);
      throw error;
    }
  }

  async generateResponse(
    messages: ChatMessage[], 
    options: ChatOptions = {},
    model?: string
  ): Promise<string> {
    try {
      const modelToUse = model || this.defaultModel;
      await this.ensureModel(modelToUse);

      const response = await this.client.chat({
        model: modelToUse,
        messages: messages as any,
        options: {
          temperature: options.temperature || 0.7,
          num_predict: options.max_tokens || 2048,
          num_ctx: options.context_window || 4096
        }
      });

      return response.message.content;
    } catch (error) {
      console.error('❌ Failed to generate response:', error);
      throw error;
    }
  }

  async generateEducationalResponse(
    userMessage: string,
    context: string[],
    userRole: 'student' | 'teacher',
    subject?: string
  ): Promise<string> {
    const contextText = context.length > 0 
      ? `\n\nRelevantní kontext z materiálů:\n${context.join('\n\n')}` 
      : '';

    const systemPrompt = userRole === 'student' 
      ? `Jsi Professor Kwark, přátelský AI tutor pro české studenty. Pomáháš s učením ${subject || 'různých předmětů'}. 
         Odpovídej česky, jednoduše a srozumitelně. Používej příklady a analogie. Buď povzbuzující a trpělivý.`
      : `Jsi AI asistent pro české učitele. Pomáháš s analýzou studentů, přípravou materiálů a pedagogickými radami.
         Odpovídej profesionálně a prakticky. Navrhuj konkrétní postupy a metody.`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage + contextText }
    ];

    return await this.generateResponse(messages, { temperature: 0.7 });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      await this.ensureModel(this.embeddingModel);
      
      const response = await this.client.embeddings({
        model: this.embeddingModel,
        prompt: text
      });

      return response.embedding;
    } catch (error) {
      console.error('❌ Failed to generate embedding:', error);
      throw error;
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const models = await this.client.list();
      return models.models.map(m => m.name);
    } catch (error) {
      console.error('❌ Failed to list models:', error);
      return [];
    }
  }

  async getModelInfo(modelName: string): Promise<any> {
    try {
      return await this.client.show({ model: modelName });
    } catch (error) {
      console.error(`❌ Failed to get model info for ${modelName}:`, error);
      return null;
    }
  }
}

export const ollama = new OllamaService();