import React, { useState, useCallback } from 'react';
import { MaterialType } from '../../types';

interface MaterialUploaderProps {
  subjectId: string;
  onMaterialUploaded: (material: any) => void;
  onClose: () => void;
}

const MaterialUploader: React.FC<MaterialUploaderProps> = ({
  subjectId,
  onMaterialUploaded,
  onClose
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const allowedTypes = ['pdf', 'docx', 'txt', 'mp3', 'mp4', 'jpg', 'png'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const validateFile = (file: File): boolean => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedTypes.includes(extension)) {
      alert(`Nepodporovaný formát souboru: ${extension}`);
      return false;
    }
    if (file.size > maxFileSize) {
      alert(`Soubor je příliš velký: ${Math.round(file.size / 1024 / 1024)}MB (max 10MB)`);
      return false;
    }
    return true;
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(validateFile);
    setFiles(prev => [...prev, ...validFiles]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = selectedFiles.filter(validateFile);
      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    setIsAnalyzing(true);
    
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('subjectId', subjectId);

      try {
        const response = await fetch(`/api/subjects/${subjectId}/materials`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          onMaterialUploaded(result.data);
          
          // AI analýza obsahu
          if (file.type.includes('text') || file.name.endsWith('.pdf') || file.name.endsWith('.docx')) {
            await analyzeContent(result.data.id);
          }
        }
      } catch (error) {
        console.error('Chyba při nahrávání:', error);
      }
    }

    setIsAnalyzing(false);
  };

  const analyzeContent = async (materialId: string) => {
    try {
      const response = await fetch(`/api/ai/analyze-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ materialId, subjectId })
      });

      if (response.ok) {
        const analysis = await response.json();
        setAnalysisResult(analysis.data);
      }
    } catch (error) {
      console.error('Chyba při analýze obsahu:', error);
    }
  };

  const getFileIcon = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return '📄';
      case 'docx': return '📝';
      case 'txt': return '📋';
      case 'mp3': return '🎵';
      case 'mp4': return '🎬';
      case 'jpg':
      case 'png': return '🖼️';
      default: return '📎';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Nahrát učební materiály</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Drag & Drop zona */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-2">
            <div className="text-4xl">📁</div>
            <div className="text-lg font-medium text-gray-900">
              Přetáhněte soubory sem nebo klikněte pro výběr
            </div>
            <div className="text-sm text-gray-500">
              Podporované formáty: PDF, DOCX, TXT, MP3, MP4, JPG, PNG (max 10MB)
            </div>
            <input
              type="file"
              multiple
              accept=".pdf,.docx,.txt,.mp3,.mp4,.jpg,.png"
              onChange={handleFileSelect}
              className="hidden"
              id="material-upload"
              name="materialFiles"
            />
            <label
              htmlFor="material-upload"
              className="inline-block px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 cursor-pointer transition-colors"
            >
              Vybrat soubory
            </label>
          </div>
        </div>

        {/* Seznam nahrávaných souborů */}
        {files.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Vybrané soubory ({files.length})
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getFileIcon(file.name)}</span>
                    <div>
                      <div className="font-medium text-sm">{file.name}</div>
                      <div className="text-xs text-gray-500">
                        {Math.round(file.size / 1024)} KB
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Odstranit
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI analýza výsledek */}
        {analysisResult && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">🤖 AI Analýza obsahu</h4>
            <div className="text-sm text-blue-800">
              <p><strong>Detekovaná témata:</strong> {analysisResult.topics?.join(', ')}</p>
              <p><strong>Doporučená obtížnost:</strong> {analysisResult.difficulty}</p>
              <p><strong>Odhadovaný čas studia:</strong> {analysisResult.estimatedTime} minut</p>
            </div>
          </div>
        )}

        {/* Akční tlačítka */}
        <div className="flex space-x-3 pt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
          >
            Zrušit
          </button>
          <button
            onClick={uploadFiles}
            disabled={files.length === 0 || isAnalyzing}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {isAnalyzing ? 'Analyzuji a nahrávám...' : `Nahrát ${files.length} souborů`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaterialUploader;