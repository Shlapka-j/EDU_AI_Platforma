import * as fs from 'fs';
import * as path from 'path';
const pdfParse = require('pdf-parse');
import * as mammoth from 'mammoth';
import { vectorDB, DocumentChunk } from './vectorDatabase';
import { ollama } from './ollama';

export interface ProcessedDocument {
  fileName: string;
  fileType: string;
  content: string;
  chunksCount: number;
  subject?: string;
  estimatedGrade?: number;
}

class DocumentProcessorService {
  private readonly CHUNK_SIZE = 1000; // Characters per chunk
  private readonly CHUNK_OVERLAP = 200; // Overlap between chunks

  async processFile(filePath: string, fileName: string, metadata?: {
    subject?: string;
    grade?: number;
  }): Promise<ProcessedDocument> {
    try {
      console.log(`📄 Processing file: ${fileName}`);
      
      const fileType = path.extname(fileName).toLowerCase();
      let content: string;

      // Extract text based on file type
      switch (fileType) {
        case '.pdf':
          content = await this.extractFromPDF(filePath);
          break;
        case '.docx':
          content = await this.extractFromDOCX(filePath);
          break;
        case '.txt':
          content = await this.extractFromTXT(filePath);
          break;
        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }

      // Clean and normalize content
      content = this.cleanText(content);

      if (!content.trim()) {
        throw new Error('No text content could be extracted from the file');
      }

      // Create chunks
      const chunks = this.createChunks(content, fileName, fileType, metadata);

      // Add to vector database
      await vectorDB.addDocuments(chunks);

      // Analyze content with AI (optional)
      let estimatedGrade: number | undefined;
      let detectedSubject: string | undefined;

      try {
        const analysis = await this.analyzeContent(content);
        estimatedGrade = analysis.grade;
        detectedSubject = analysis.subject;
      } catch (error) {
        console.warn('⚠️ Content analysis failed:', error);
      }

      console.log(`✅ Processed ${fileName}: ${chunks.length} chunks created`);

      return {
        fileName,
        fileType,
        content: content.substring(0, 500) + '...', // Preview
        chunksCount: chunks.length,
        subject: metadata?.subject || detectedSubject,
        estimatedGrade: metadata?.grade || estimatedGrade
      };

    } catch (error) {
      console.error(`❌ Failed to process file ${fileName}:`, error);
      throw error;
    }
  }

  private async extractFromPDF(filePath: string): Promise<string> {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  }

  private async extractFromDOCX(filePath: string): Promise<string> {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  private async extractFromTXT(filePath: string): Promise<string> {
    return fs.readFileSync(filePath, 'utf-8');
  }

  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Replace multiple whitespaces with single space
      .replace(/\n\s*\n/g, '\n') // Replace multiple newlines with single newline
      .trim();
  }

  private createChunks(
    content: string, 
    fileName: string, 
    fileType: string, 
    metadata?: { subject?: string; grade?: number }
  ): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    const words = content.split(' ');
    
    for (let i = 0; i < words.length; i += this.CHUNK_SIZE) {
      const chunkWords = words.slice(
        Math.max(0, i - this.CHUNK_OVERLAP), 
        i + this.CHUNK_SIZE
      );
      
      const chunkContent = chunkWords.join(' ');
      
      if (chunkContent.trim().length > 50) { // Skip very small chunks
        chunks.push({
          id: `${fileName}_chunk_${chunks.length}`,
          content: chunkContent,
          metadata: {
            fileName,
            fileType,
            subject: metadata?.subject,
            grade: metadata?.grade,
            chunkIndex: chunks.length,
            uploadedAt: new Date()
          }
        });
      }
    }

    return chunks;
  }

  private async analyzeContent(content: string): Promise<{
    subject?: string;
    grade?: number;
    topics: string[];
  }> {
    try {
      const prompt = `Analyzuj tento vzdělávací text a urči:
1. Předmět (Fyzika, Matematika, Chemie, Biologie, Historie, atd.)
2. Doporučená třída (1-9 pro ZŠ, 1-4 pro SŠ)
3. Hlavní témata (max 5)

Text: ${content.substring(0, 1000)}...

Odpověz ve formátu JSON:
{
  "subject": "název předmětu",
  "grade": číslo_třídy,
  "topics": ["téma1", "téma2", "téma3"]
}`;

      const response = await ollama.generateResponse([
        { role: 'user', content: prompt }
      ], { temperature: 0.3 });

      // Try to parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return analysis;
      }

      return { topics: [] };
    } catch (error) {
      console.error('❌ Content analysis failed:', error);
      return { topics: [] };
    }
  }

  async deleteDocument(fileName: string): Promise<void> {
    try {
      await vectorDB.deleteDocument(fileName);
      console.log(`✅ Deleted document: ${fileName}`);
    } catch (error) {
      console.error(`❌ Failed to delete document ${fileName}:`, error);
      throw error;
    }
  }

  async searchDocuments(query: string, subject?: string, limit: number = 5) {
    try {
      const results = await vectorDB.searchSimilar(query, limit, subject);
      
      return results.map(result => ({
        content: result.document,
        fileName: result.metadata.fileName,
        subject: result.metadata.subject,
        grade: result.metadata.grade,
        relevanceScore: result.relevanceScore,
        chunkIndex: result.metadata.chunkIndex
      }));
    } catch (error) {
      console.error('❌ Document search failed:', error);
      throw error;
    }
  }
}

export const documentProcessor = new DocumentProcessorService();