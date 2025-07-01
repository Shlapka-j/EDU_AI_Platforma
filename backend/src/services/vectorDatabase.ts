// import { ChromaApi } from 'chromadb';
import { ollama } from './ollama';

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    fileName: string;
    fileType: string;
    subject?: string;
    grade?: number;
    chunkIndex: number;
    uploadedAt: Date;
  };
}

export interface VectorSearchResult {
  document: string;
  metadata: any;
  distance: number;
  relevanceScore: number;
}

class VectorDatabaseService {
  private chroma: any;
  private collection: any = null;

  constructor() {
    try {
      // For now, we'll use mock mode until ChromaDB issues are resolved
      console.log('⚠️ ChromaDB temporarily disabled, using mock vector database');
      this.chroma = null;
    } catch (error) {
      console.log('Using mock vector database for now');
      this.chroma = null;
    }
  }

  async initialize(): Promise<void> {
    if (!this.chroma) {
      console.log('⚠️ Vector database not available, using mock mode');
      return;
    }
    
    try {
      // Create or get collection
      this.collection = await this.chroma.getOrCreateCollection({
        name: "edu_ai_documents",
        metadata: { description: "Educational documents and materials" }
      });
      
      console.log('✅ Vector database initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize vector database:', error);
      console.log('⚠️ Falling back to mock mode');
      this.chroma = null;
    }
  }

  async addDocuments(chunks: DocumentChunk[]): Promise<void> {
    if (!this.chroma || !this.collection) {
      console.log('⚠️ Vector database not available, skipping document indexing');
      return;
    }

    try {
      const ids = chunks.map(chunk => chunk.id);
      const documents = chunks.map(chunk => chunk.content);
      const metadatas = chunks.map(chunk => ({
        fileName: chunk.metadata.fileName,
        fileType: chunk.metadata.fileType,
        subject: chunk.metadata.subject || '',
        grade: chunk.metadata.grade || 0,
        chunkIndex: chunk.metadata.chunkIndex,
        uploadedAt: chunk.metadata.uploadedAt.toISOString()
      }));

      // Generate embeddings using Ollama
      const embeddings = await Promise.all(
        documents.map(doc => ollama.generateEmbedding(doc))
      );

      await this.collection.add({
        ids,
        documents,
        metadatas,
        embeddings
      });

      console.log(`✅ Added ${chunks.length} document chunks to vector database`);
    } catch (error) {
      console.error('❌ Failed to add documents to vector database:', error);
      throw error;
    }
  }

  async searchSimilar(query: string, limit: number = 5, subject?: string): Promise<VectorSearchResult[]> {
    if (!this.chroma || !this.collection) {
      console.log('⚠️ Vector database not available, returning empty results');
      return [];
    }

    try {
      const where = subject ? { subject } : undefined;
      
      // Generate query embedding using Ollama
      const queryEmbedding = await ollama.generateEmbedding(query);
      
      const results = await this.collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: limit,
        where
      });

      if (!results.documents[0] || !results.metadatas[0] || !results.distances[0]) {
        return [];
      }

      return results.documents[0]
        .map((doc: any, index: number) => ({
          document: doc || '',
          metadata: results.metadatas[0]![index] || {},
          distance: results.distances[0]![index] || 0,
          relevanceScore: Math.max(0, 1 - (results.distances[0]![index] || 0)) // Convert distance to relevance score
        }))
        .filter((result: any) => result.document); // Filter out empty documents
    } catch (error) {
      console.error('❌ Failed to search vector database:', error);
      throw error;
    }
  }

  async deleteDocument(fileName: string): Promise<void> {
    if (!this.collection) {
      throw new Error('Vector database not initialized');
    }

    try {
      // Get all chunks for this file
      const results = await this.collection.get({
        where: { fileName }
      });

      if (results.ids && results.ids.length > 0) {
        await this.collection.delete({
          ids: results.ids
        });
        console.log(`✅ Deleted ${results.ids.length} chunks for file: ${fileName}`);
      }
    } catch (error) {
      console.error('❌ Failed to delete document from vector database:', error);
      throw error;
    }
  }

  async getCollectionStats(): Promise<{ count: number; subjects: string[] }> {
    if (!this.chroma || !this.collection) {
      return { count: 0, subjects: [] };
    }

    try {
      const count = await this.collection.count();
      const results = await this.collection.get({});
      
      const subjects: string[] = results.metadatas 
        ? Array.from(new Set(results.metadatas.map((m: any) => m.subject).filter(Boolean))) as string[]
        : [];

      return { count, subjects };
    } catch (error) {
      console.error('❌ Failed to get collection stats:', error);
      throw error;
    }
  }
}

export const vectorDB = new VectorDatabaseService();