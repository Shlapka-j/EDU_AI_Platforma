import { Router } from 'express';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { documentProcessor } from '../services/documentProcessor';
import { vectorDB } from '../services/vectorDatabase';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Keep original filename with timestamp prefix
    const timestamp = Date.now();
    cb(null, `${timestamp}_${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.docx', '.txt'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${fileExt}. Allowed: ${allowedTypes.join(', ')}`));
    }
  }
});

router.post('/upload', upload.single('file'), async (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { subject, grade } = req.body;
    const filePath = req.file.path;
    const originalName = req.file.originalname;

    console.log(`📁 Processing uploaded file: ${originalName}`);

    // Process the document
    const result = await documentProcessor.processFile(filePath, originalName, {
      subject: subject || undefined,
      grade: grade ? parseInt(grade) : undefined
    });

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    console.log(`✅ File processed successfully: ${originalName}`);

    res.json({
      success: true,
      data: {
        id: `doc_${Date.now()}`,
        name: result.fileName,
        size: `${req.file.size} bytes`,
        type: result.fileType,
        uploaded: new Date().toISOString(),
        status: 'processed',
        chunksCount: result.chunksCount,
        subject: result.subject,
        estimatedGrade: result.estimatedGrade,
        preview: result.content
      }
    });

  } catch (error) {
    console.error('❌ Document upload error:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ 
      error: 'Failed to process document',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
    });
  }
});

router.delete('/:fileName', async (req: any, res: any) => {
  try {
    const { fileName } = req.params;
    
    if (!fileName) {
      return res.status(400).json({ error: 'File name is required' });
    }

    await documentProcessor.deleteDocument(fileName);

    res.json({ 
      success: true, 
      message: `Document ${fileName} deleted successfully` 
    });

  } catch (error) {
    console.error('❌ Document deletion error:', error);
    res.status(500).json({ 
      error: 'Failed to delete document',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
    });
  }
});

router.get('/search', async (req: any, res: any) => {
  try {
    const { query, subject, limit = 5 } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const results = await documentProcessor.searchDocuments(
      query,
      subject as string,
      parseInt(limit as string)
    );

    res.json({
      success: true,
      query,
      results: results.map(result => ({
        fileName: result.fileName,
        content: result.content.substring(0, 200) + '...',
        subject: result.subject,
        grade: result.grade,
        relevanceScore: Math.round(result.relevanceScore * 100),
        chunkIndex: result.chunkIndex
      }))
    });

  } catch (error) {
    console.error('❌ Document search error:', error);
    res.status(500).json({ 
      error: 'Search failed',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
    });
  }
});

router.get('/stats', async (req: any, res: any) => {
  try {
    const stats = await vectorDB.getCollectionStats();
    
    res.json({
      success: true,
      stats: {
        totalDocuments: stats.count,
        subjects: stats.subjects,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Stats error:', error);
    res.status(500).json({ 
      error: 'Failed to get stats',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
    });
  }
});

export default router;