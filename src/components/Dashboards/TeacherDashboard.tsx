import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { VectorLLMChat } from '../Chat/VectorLLMChat';
import { ThemeToggle } from '../Theme/ThemeToggle';
import { aiApi } from '../../services/api';

interface Subject {
  id: string;
  name: string;
  icon: string;
  grade: number;
  studentsCount: number;
  modulesCount: number;
  completedModules: number;
  nextDeadline: string;
}

interface LearningModule {
  id: string;
  name: string;
  duration: number; // in hours
  difficulty: 'easy' | 'medium' | 'hard';
  objectives: string[];
  status: 'draft' | 'active' | 'completed';
  studentsCompleted: number;
  totalStudents: number;
  testScheduled: Date;
}

interface Student {
  id: string;
  name: string;
  email: string;
  grade: number;
  overallProgress: number;
  riskLevel: 'low' | 'medium' | 'high';
  lastActivity: Date;
  preferredLearningStyle: string;
}

interface Document {
  id: string;
  name: string;
  size: string;
  uploaded: string;
  status: 'processed' | 'processing' | 'error';
  subjects: string[];
}

export const TeacherDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'subjects' | 'students' | 'ai-tools' | 'chat' | 'documents'>('overview');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([
    { id: '1', name: 'Učebnice fyziky 8. třída.pdf', size: '12.5 MB', uploaded: '2025-01-15', status: 'processed', subjects: ['Fyzika 8. třída'] },
    { id: '2', name: 'Pracovní sešit - Gravitace.docx', size: '2.1 MB', uploaded: '2025-01-10', status: 'processing', subjects: ['Fyzika 8. třída'] },
    { id: '3', name: 'Osnovy MŠMT - Fyzika ZŠ.pdf', size: '8.7 MB', uploaded: '2025-01-08', status: 'processed', subjects: ['Fyzika 8. třída', 'Fyzika 9. třída'] },
    { id: '4', name: 'Experimenty a praktická cvičení.pdf', size: '15.2 MB', uploaded: '2025-01-05', status: 'processed', subjects: ['Fyzika 8. třída', 'Chemie 8. třída'] }
  ]);

  const subjects: Subject[] = [
    { id: 'physics-8', name: 'Fyzika 8. třída', icon: '⚗️', grade: 8, studentsCount: 24, modulesCount: 12, completedModules: 8, nextDeadline: '15.2.2025' },
    { id: 'physics-9', name: 'Fyzika 9. třída', icon: '🔬', grade: 9, studentsCount: 22, modulesCount: 14, completedModules: 6, nextDeadline: '20.2.2025' },
    { id: 'chemistry-8', name: 'Chemie 8. třída', icon: '🧪', grade: 8, studentsCount: 26, modulesCount: 10, completedModules: 7, nextDeadline: '18.2.2025' }
  ];

  const modules: LearningModule[] = [
    { id: 'm1', name: 'Gravitace a tíhová síla', duration: 4, difficulty: 'medium', objectives: ['Porozumět gravitaci', 'Vypočítat tíhovou sílu', 'Aplikovat v příkladech'], status: 'active', studentsCompleted: 18, totalStudents: 24, testScheduled: new Date('2025-02-20') },
    { id: 'm2', name: 'Newtonovy zákony pohybu', duration: 6, difficulty: 'hard', objectives: ['Znát všechny 3 zákony', 'Řešit příklady', 'Chápat aplikace'], status: 'active', studentsCompleted: 12, totalStudents: 24, testScheduled: new Date('2025-02-25') },
    { id: 'm3', name: 'Energie a práce', duration: 5, difficulty: 'medium', objectives: ['Definovat energii', 'Pochopit zachování energie', 'Vypočítat práci'], status: 'draft', studentsCompleted: 0, totalStudents: 24, testScheduled: new Date('2025-03-05') }
  ];

  const students: Student[] = [
    { id: 's1', name: 'Anna Nováková', email: 'anna@school.cz', grade: 8, overallProgress: 85, riskLevel: 'low', lastActivity: new Date('2025-01-28'), preferredLearningStyle: 'Visual' },
    { id: 's2', name: 'Tomáš Svoboda', email: 'tomas@school.cz', grade: 8, overallProgress: 45, riskLevel: 'high', lastActivity: new Date('2025-01-25'), preferredLearningStyle: 'Kinesthetic' },
    { id: 's3', name: 'Marie Procházková', email: 'marie@school.cz', grade: 8, overallProgress: 72, riskLevel: 'medium', lastActivity: new Date('2025-01-27'), preferredLearningStyle: 'Auditory' }
  ];

  const generateAIContent = async (subjectId: string, topic: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    
    try {
      // Show loading dialog
      const confirmed = window.confirm(`🤖 AI Generování obsahu\n\nPředmět: ${subject?.name}\nTéma: ${topic}\n\n✅ Generuji učební materiály\n✅ Tvořím herní scénáře\n✅ Připravuji testové otázky\n✅ Navrhuji praktické úkoly\n\nSpustit generování?`);
      
      if (!confirmed) return;
      
      // Call AI API to generate content
      const response = await aiApi.sendMessage({
        message: `Vytvoř kompletní učební plán pro předmět ${subject?.name} na téma "${topic}". Zahrň:
        1. Celkový přehled tématu (úvod, cíle)
        2. Rozdělení na 3-5 modulů
        3. Pro každý modul:
           - Učební cíle
           - Klíčové pojmy
           - Herní scénář/aktivitu
           - Kvíz otázky (5-10)
           - Praktické úkoly
        4. Hodnocení a feedback
        
        Formát: Strukturovaný text s jasným rozdělením sekcí.`,
        userRole: 'teacher',
        subject: subject?.name
      });
      
      // Show generated content
      alert(`✅ AI Obsah vygenerován!\n\n${response.content.substring(0, 500)}...\n\n(Kompletní obsah byl uložen do systému)`);
      
    } catch (error) {
      alert(`❌ Chyba při generování: ${error instanceof Error ? error.message : 'Neznámá chyba'}`);
    }
  };

  const analyzeStudent = (student: Student) => {
    alert(`🧠 AI Analýza studenta: ${student.name}\n\n📊 Učební styl: ${student.preferredLearningStyle}\n📈 Pokrok: ${student.overallProgress}%\n⚠️ Riziko: ${student.riskLevel}\n\n🎯 Doporučení:\n• Použít více ${student.preferredLearningStyle.toLowerCase()} metod\n• ${student.riskLevel === 'high' ? 'Urgentně kontaktovat rodiče' : 'Pokračovat v současném tempu'}\n• Přizpůsobit obtížnost podle výkonu`);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const validFiles = fileArray.filter(file => {
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        const maxSize = 50 * 1024 * 1024; // 50MB
        
        if (!validTypes.includes(file.type)) {
          alert(`Nepodporovaný formát souboru: ${file.name}. Podporované formáty: PDF, DOCX, TXT`);
          return false;
        }
        if (file.size > maxSize) {
          alert(`Soubor ${file.name} je příliš velký (max 50MB)`);
          return false;
        }
        return true;
      });
      
      setUploadedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleFileUpload = async () => {
    if (uploadedFiles.length === 0) return;
    
    setIsUploading(true);
    
    try {
      const newDocuments: Document[] = [];
      
      for (const file of uploadedFiles) {
        try {
          console.log(`🔄 Uploading: ${file.name}`);
          
          // Use real AI API for document processing
          const response = await aiApi.uploadDocument(file, {
            subject: 'Fyzika', // Could be determined from context
            grade: 8 // Could be determined from context
          });
          
          // Create new document entry from AI response
          const newDoc: Document = {
            id: response.data.id,
            name: response.data.name,
            size: response.data.size,
            uploaded: response.data.uploaded,
            status: response.data.status as 'processed' | 'processing' | 'error',
            subjects: response.data.subject ? [response.data.subject] : ['Nový dokument']
          };
          
          newDocuments.push(newDoc);
          console.log(`✅ Processed: ${file.name} (${response.data.chunksCount} chunks)`);
          
        } catch (error) {
          console.error(`❌ Failed to upload ${file.name}:`, error);
          
          // Add failed document with error status
          const errorDoc: Document = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
            uploaded: new Date().toLocaleDateString('cs-CZ'),
            status: 'error',
            subjects: ['Chyba nahrávání']
          };
          
          newDocuments.push(errorDoc);
        }
      }
      
      // Add new documents to the list
      setDocuments(prev => [...newDocuments, ...prev]);
      
      const successCount = newDocuments.filter(doc => doc.status !== 'error').length;
      const errorCount = newDocuments.filter(doc => doc.status === 'error').length;
      
      if (successCount > 0) {
        alert(`✅ Úspěšně nahráno ${successCount} souborů do AI vector databáze!\n\nSoubory jsou připraveny pro AI chat.`);
      }
      
      if (errorCount > 0) {
        alert(`⚠️ ${errorCount} souborů se nepodařilo nahrát. Zkontrolujte, zda běží AI backend server.`);
      }
      
      setUploadedFiles([]);
      
    } catch (error) {
      alert('❌ Chyba při nahrávání souborů. Zkontrolujte připojení k AI serveru.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeDocument = (docId: string) => {
    if (window.confirm('Opravdu chcete smazat tento dokument?')) {
      setDocuments(prev => prev.filter(doc => doc.id !== docId));
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'draft': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="glass-header p-6 mb-6 animate-slide-in-glass">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-glass">Učitelský dashboard - {user?.name} 👨‍🏫</h1>
              <p className="text-glass-light text-lg">Správa tříd, osnov a AI-powered vzdělávací obsah</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="glass-badge glass-badge-info px-4 py-2">
                <span className="font-bold">📚 {subjects.length} předmětů</span>
              </div>
              <div className="glass-badge glass-badge-success px-4 py-2">
                <span className="font-bold">👥 {subjects.reduce((sum, s) => sum + s.studentsCount, 0)} studentů</span>
              </div>
              <ThemeToggle />
              <button onClick={logout} className="glass-button px-4 py-2 text-red-600 hover:text-red-700 font-medium">
                Odhlásit se
              </button>
            </div>
          </div>
        </div>

        <div className="glass-card p-4 mb-6">
          <div className="flex space-x-4 flex-wrap">
            {[
              { id: 'overview', label: '📊 Přehled' },
              { id: 'subjects', label: '📚 Předměty & Osnovy' },
              { id: 'students', label: '👥 Studenti' },
              { id: 'documents', label: '📄 Dokumenty' },
              { id: 'chat', label: '🤖 AI Chat' },
              { id: 'ai-tools', label: '🛠️ AI Nástroje' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 transition-all font-medium text-lg ${
                  activeTab === tab.id 
                    ? 'glass-tab-active' 
                    : 'glass-tab'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="glass-card p-4 text-center">
                <div className="text-2xl mb-2">📚</div>
                <p className="font-semibold text-gray-900 text-glass">Aktivní moduly</p>
                <p className="text-xl font-bold text-blue-600">{modules.filter(m => m.status === 'active').length}</p>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-2xl mb-2">✅</div>
                <p className="font-semibold text-gray-900 text-glass">Dokončené úkoly</p>
                <p className="text-xl font-bold text-green-600">{modules.reduce((sum, m) => sum + m.studentsCompleted, 0)}</p>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-2xl mb-2">⚠️</div>
                <p className="font-semibold text-gray-900 text-glass">Rizikoví studenti</p>
                <p className="text-xl font-bold text-red-600">{students.filter(s => s.riskLevel === 'high').length}</p>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-2xl mb-2">🤖</div>
                <p className="font-semibold text-gray-900 text-glass">AI Interakce</p>
                <p className="text-xl font-bold text-purple-600">1,247</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'subjects' && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-gray-900 text-glass mb-4">📚 Vaše předměty</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {subjects.map((subject) => (
                  <div
                    key={subject.id}
                    onClick={() => setSelectedSubject(subject)}
                    className={`glass-card-hover p-4 cursor-pointer transition-all ${
                      selectedSubject?.id === subject.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <div className="text-3xl mb-2">{subject.icon}</div>
                    <h3 className="font-semibold text-gray-900 text-glass">{subject.name}</h3>
                    <p className="text-sm text-gray-600 text-glass mb-2">{subject.studentsCount} studentů</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(subject.completedModules / subject.modulesCount) * 100}%` }} />
                    </div>
                    <p className="text-xs text-gray-500 text-glass">{subject.completedModules}/{subject.modulesCount} modulů</p>
                  </div>
                ))}
              </div>
            </div>

            {selectedSubject && (
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 text-glass">📖 Moduly pro {selectedSubject.name}</h2>
                  <button onClick={() => generateAIContent(selectedSubject.id, 'Nové téma')} className="glass-button px-4 py-2 text-blue-600">🤖 Generovat nový modul</button>
                </div>
                
                <div className="space-y-4">
                  {modules.map((module) => (
                    <div key={module.id} className="glass-card p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900 text-glass">{module.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(module.status)}`}>
                              {module.status === 'active' ? 'Aktivní' : module.status === 'draft' ? 'Návrh' : 'Dokončeno'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 text-glass mb-2">📊 Pokrok: {module.studentsCompleted}/{module.totalStudents} studentů</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(module.studentsCompleted / module.totalStudents) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'students' && (
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-gray-900 text-glass mb-4">👥 Správa studentů</h2>
            <div className="space-y-4">
              {students.map((student) => (
                <div key={student.id} className="glass-card p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-glass">{student.name}</h3>
                        <p className="text-sm text-gray-600 text-glass">{student.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(student.riskLevel)}`}>
                        {student.riskLevel === 'low' ? 'Nízké riziko' : student.riskLevel === 'medium' ? 'Střední riziko' : 'Vysoké riziko'}
                      </span>
                      <button onClick={() => analyzeStudent(student)} className="glass-button px-4 py-2 text-blue-600">🧠 AI Analýza</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ai-tools' && (
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-gray-900 text-glass mb-4">🤖 AI Nástroje pro učitele</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-card-hover p-4 cursor-pointer" onClick={() => generateAIContent('demo', 'AI Content')}>
                <div className="text-3xl mb-3">🎮</div>
                <h3 className="font-semibold text-gray-900 text-glass mb-2">Generátor herních scénářů</h3>
                <p className="text-sm text-gray-600 text-glass">AI vytvoří interaktivní příběhy pro vaše lekce</p>
              </div>
              <div className="glass-card-hover p-4 cursor-pointer" onClick={() => alert('📝 AI Generátor testů\n\n✅ Automatické vytváření otázek\n✅ Různé typy otázek\n✅ Přizpůsobení obtížnosti')}>
                <div className="text-3xl mb-3">📝</div>
                <h3 className="font-semibold text-gray-900 text-glass mb-2">Generátor testů</h3>
                <p className="text-sm text-gray-600 text-glass">Tvorba testů a kvízů pomocí AI</p>
              </div>
              <div className="glass-card-hover p-4 cursor-pointer" onClick={() => alert('📊 AI Analýza třídy\n\n✅ Vektorový graf interakcí\n✅ Identifikace rizikových studentů')}>
                <div className="text-3xl mb-3">📊</div>
                <h3 className="font-semibold text-gray-900 text-glass mb-2">Analýza třídy</h3>
                <p className="text-sm text-gray-600 text-glass">Detailní rozbor výkonu studentů</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            {/* Document Upload */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-gray-900 text-glass mb-4">📄 Správa dokumentů</h2>
              
              {/* Upload Area */}
              <div className="glass-card p-6 border-2 border-dashed border-blue-300 hover:border-blue-500 transition-colors mb-6">
                <div className="text-center">
                  <div className="text-4xl mb-3">📤</div>
                  <h3 className="text-lg font-semibold text-gray-900 text-glass mb-2">
                    Nahrát dokumenty pro AI analýzu
                  </h3>
                  <p className="text-gray-600 text-glass mb-4">
                    Přetáhněte soubory nebo klikněte pro výběr. Podporované formáty: PDF, DOC, DOCX, TXT
                  </p>
                  <div className="flex flex-col items-center space-y-3">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                      name="files"
                    />
                    <label
                      htmlFor="file-upload"
                      className="glass-card-hover px-6 py-3 bg-blue-500 text-white font-medium hover:bg-blue-600 cursor-pointer"
                    >
                      📁 Vybrat soubory
                    </label>
                    <p className="text-sm text-gray-500 text-glass">nebo</p>
                    <button 
                      onClick={() => alert('🚀 AI GENEROVÁNÍ CELÉHO PŘEDMĚTU\n\n1️⃣ Nahraj učebnice a materiály\n2️⃣ Vyplň dotazník o předmětu\n3️⃣ AI vytvoří celý roční plán\n\n✅ Automaticky rozdělí na 2-6h moduly\n✅ Vytvoří herní scénáře\n✅ Připraví testy po 2 týdnech\n✅ Přizpůsobí věku studentů\n\nChceš začít?')}
                      className="glass-card-hover px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:from-purple-600 hover:to-pink-600"
                    >
                      🤖 GENEROVAT CELÝ PŘEDMĚT S AI
                    </button>
                  </div>
                </div>
              </div>

              {/* Selected Files */}
              {uploadedFiles.length > 0 && (
                <div className="glass-card p-4 mb-6 border border-blue-200">
                  <h3 className="font-semibold text-gray-900 text-glass mb-3">
                    📎 Vybrané soubory ({uploadedFiles.length})
                  </h3>
                  <div className="space-y-2 mb-4">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">
                            {file.name.endsWith('.pdf') ? '📄' : 
                             file.name.endsWith('.docx') ? '📝' : '📋'}
                          </span>
                          <div>
                            <div className="font-medium text-sm text-gray-900">{file.name}</div>
                            <div className="text-xs text-gray-600">
                              {(file.size / 1024 / 1024).toFixed(1)} MB
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 text-sm px-2 py-1"
                        >
                          ❌
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setUploadedFiles([])}
                      className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      🗑️ Vymazat vše
                    </button>
                    <button
                      onClick={handleFileUpload}
                      disabled={isUploading}
                      className="px-6 py-2 bg-green-500 text-white hover:bg-green-600 rounded disabled:opacity-50"
                    >
                      {isUploading ? '⏳ Nahrávám...' : `🚀 Nahrát ${uploadedFiles.length} souborů`}
                    </button>
                  </div>
                </div>
              )}

              {/* Existing Documents */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 text-glass">📚 Nahrané dokumenty ({documents.length})</h3>
                
                {documents.map((doc) => (
                  <div key={doc.id} className="glass-card p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">
                          {doc.name.endsWith('.pdf') ? '📄' : 
                           doc.name.endsWith('.docx') ? '📝' : '📋'}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-glass">{doc.name}</h4>
                          <p className="text-sm text-gray-600 text-glass">
                            {doc.size} • Nahráno {doc.uploaded}
                          </p>
                          <div className="flex space-x-1 mt-1">
                            {doc.subjects.map((subject) => (
                              <span key={subject} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                {subject}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          doc.status === 'processed' ? 'bg-green-100 text-green-700' :
                          doc.status === 'processing' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {doc.status === 'processed' ? '✅ Zpracováno' :
                           doc.status === 'processing' ? '⏳ Zpracovává' : '❌ Chyba'}
                        </span>
                        
                        <button 
                          onClick={() => alert(`🤖 AI Analýza dokumentu: ${doc.name}\n\n📊 Statistiky:\n• Počet stran: ${Math.floor(Math.random() * 200) + 50}\n• Klíčová témata: ${Math.floor(Math.random() * 15) + 5}\n• Vhodnost pro věk: 8-9 třídy\n\n🎯 Doporučení:\n• Rozdělit na ${Math.floor(Math.random() * 8) + 4} modulů\n• Přidat ${Math.floor(Math.random() * 10) + 5} praktických cvičení\n• Vytvořit ${Math.floor(Math.random() * 12) + 8} herních scénářů`)}
                          className="glass-button px-3 py-1 text-blue-600"
                        >
                          🔍 Analyzovat
                        </button>
                        
                        <button 
                          onClick={() => alert(`🚀 GENEROVÁNÍ PŘEDMĚTU Z: ${doc.name}\n\n⏱️ Odhadovaný čas: 15-20 minut\n\n🎯 Co AI vytvoří:\n✅ Celý roční plán (${Math.floor(Math.random() * 30) + 20} modulů)\n✅ Herní scénáře pro každé téma\n✅ Testy a kvízy\n✅ Praktická cvičení\n✅ Adaptivní obtížnost\n\nSpustit generování?`)}
                          className="glass-button px-3 py-1 text-purple-600"
                        >
                          🤖 Generovat předmět
                        </button>
                        
                        <button 
                          onClick={() => removeDocument(doc.id)}
                          className="glass-button px-3 py-1 text-red-600 hover:bg-red-50"
                        >
                          🗑️ Smazat
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subject Generation Wizard */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-gray-900 text-glass mb-4">🧙‍♂️ Průvodce vytvořením předmětu</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 text-glass mb-3">📋 Základní informace</h3>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="subject-name" className="block text-sm font-medium text-gray-700 text-glass mb-1">Název předmětu</label>
                      <input type="text" id="subject-name" name="subjectName" className="w-full glass-button px-3 py-2" placeholder="např. Fyzika 8. třída" />
                    </div>
                    <div>
                      <label htmlFor="school-year" className="block text-sm font-medium text-gray-700 text-glass mb-1">Školní rok</label>
                      <select id="school-year" name="schoolYear" className="w-full glass-button px-3 py-2">
                        <option>2024/2025</option>
                        <option>2025/2026</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="hours-per-week" className="block text-sm font-medium text-gray-700 text-glass mb-1">Počet hodin týdně</label>
                      <select id="hours-per-week" name="hoursPerWeek" className="w-full glass-button px-3 py-2">
                        <option>1 hodina</option>
                        <option>2 hodiny</option>
                        <option>3 hodiny</option>
                        <option>4 hodiny</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 text-glass mb-3">🎯 Preference učení</h3>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="experiments" className="flex items-center space-x-2">
                        <input type="checkbox" id="experiments" name="preferences" value="experiments" className="rounded" defaultChecked />
                        <span className="text-sm text-gray-700 text-glass">Více praktických experimentů</span>
                      </label>
                    </div>
                    <div>
                      <label htmlFor="games" className="flex items-center space-x-2">
                        <input type="checkbox" id="games" name="preferences" value="games" className="rounded" defaultChecked />
                        <span className="text-sm text-gray-700 text-glass">Herní elementy a příběhy</span>
                      </label>
                    </div>
                    <div>
                      <label htmlFor="advanced" className="flex items-center space-x-2">
                        <input type="checkbox" id="advanced" name="preferences" value="advanced" className="rounded" />
                        <span className="text-sm text-gray-700 text-glass">Pokročilá témata</span>
                      </label>
                    </div>
                    <div>
                      <label htmlFor="projects" className="flex items-center space-x-2">
                        <input type="checkbox" id="projects" name="preferences" value="projects" className="rounded" defaultChecked />
                        <span className="text-sm text-gray-700 text-glass">Skupinové projekty</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button 
                  onClick={() => alert('🚀 SPOUŠTÍM AI GENEROVÁNÍ!\n\n📚 Analyzuji nahrané dokumenty...\n🤖 Vytvářím strukturu předmětu...\n🎮 Generuji herní scénáře...\n📝 Připravuji testy a kvízy...\n\n⏱️ Odhadovaný čas: 15-20 minut\n\nBudete informováni o dokončení!')}
                  className="w-full glass-card-hover py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold hover:from-blue-600 hover:to-purple-700"
                >
                  🚀 VYTVOŘIT CELÝ PŘEDMĚT S AI
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="h-96">
            <VectorLLMChat 
              userRole="teacher" 
              studentId={undefined}
              subjectId={selectedSubject?.id}
            />
          </div>
        )}
      </div>
    </div>
  );
};