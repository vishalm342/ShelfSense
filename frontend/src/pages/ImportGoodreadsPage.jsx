import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import { uploadGoodreadsCSV, downloadTemplate } from '../services/importService';

export default function ImportGoodreadsPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Handle file selection from input or drag-drop
   */
  const handleFileSelect = (selectedFile) => {
    // Validate file type
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    // Validate file size (10MB max)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setImportResult(null);
  };

  /**
   * Handle drag and drop events
   */
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  /**
   * Handle file input change
   */
  const handleFileInputChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  /**
   * Upload and import the CSV file
   */
  const handleImport = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    const result = await uploadGoodreadsCSV(file, (progress) => {
      setUploadProgress(progress);
    });

    setIsUploading(false);

    if (result.success) {
      setImportResult(result.data);
      setFile(null);
    } else {
      setError(result.error.message);
    }
  };

  /**
   * Reset form to import another file
   */
  const handleImportAnother = () => {
    setFile(null);
    setImportResult(null);
    setError(null);
    setUploadProgress(0);
  };

  /**
   * Format file size for display
   */
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="min-h-screen bg-[var(--color-background-light)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--color-accent-sage)]/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-[var(--color-primary)]/10 rounded-lg transition"
            >
              <ArrowLeft className="text-[var(--color-primary)] w-6 h-6" />
            </button>
            <BookOpen className="text-[var(--color-primary)] w-8 h-8" />
            <h1 className="font-display text-2xl font-bold text-[var(--color-text-forest)]">
              ShelfSense
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="font-display text-4xl font-bold text-[var(--color-text-forest)] mb-2">
            Import from Goodreads
          </h2>
          <p className="text-[var(--color-text-charcoal)]">
            Bulk import your entire Goodreads library in seconds
          </p>
        </div>

        {/* Instructions Card */}
        <div className="bg-white rounded-lg border border-[var(--color-accent-sage)]/30 p-6 shadow-sm mb-6">
          <h3 className="font-display text-xl font-bold text-[var(--color-text-forest)] mb-4">
            📚 How to Export from Goodreads
          </h3>
          <ol className="space-y-3 mb-6">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </span>
              <span className="text-[var(--color-text-charcoal)]">
                Visit{' '}
                <a
                  href="https://www.goodreads.com/review/import"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-primary)] hover:underline font-medium"
                >
                  Goodreads Import/Export page
                </a>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </span>
              <span className="text-[var(--color-text-charcoal)]">
                Click the "Export Library" button
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </span>
              <span className="text-[var(--color-text-charcoal)]">
                Wait for the email notification from Goodreads
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center text-sm font-bold">
                4
              </span>
              <span className="text-[var(--color-text-charcoal)]">
                Download the CSV file and upload it below
              </span>
            </li>
          </ol>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-primary)] border border-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition"
          >
            <Download size={18} />
            Download Sample Template
          </button>
        </div>

        {/* Upload Area */}
        {!importResult && (
          <div className="bg-white rounded-lg border border-[var(--color-accent-sage)]/30 p-8 shadow-sm mb-6">
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition ${
                isDragging
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                  : file
                  ? 'border-green-500 bg-green-50'
                  : 'border-[var(--color-accent-sage)]/50 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5'
              } cursor-pointer`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input').click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".csv"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {!file ? (
                <>
                  <Upload className="w-12 h-12 text-[var(--color-primary)] mx-auto mb-4" />
                  <h3 className="font-display text-xl font-bold text-[var(--color-text-forest)] mb-2">
                    Upload Your Goodreads CSV
                  </h3>
                  <p className="text-[var(--color-text-charcoal)] mb-4">
                    Drag and drop your file here, or click to browse
                  </p>
                  <p className="text-sm text-[var(--color-text-charcoal)]/70">
                    Accepts CSV files up to 10MB
                  </p>
                </>
              ) : (
                <>
                  <FileText className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-display text-xl font-bold text-[var(--color-text-forest)] mb-2">
                    {file.name}
                  </h3>
                  <p className="text-[var(--color-text-charcoal)] mb-4">
                    {formatFileSize(file.size)}
                  </p>
                  <p className="text-sm text-green-600 font-medium">
                    ✓ Ready to import
                  </p>
                </>
              )}
            </div>

            {file && !isUploading && (
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleImport}
                  className="flex-1 bg-[var(--color-primary)] text-white px-6 py-3 rounded-lg font-medium hover:bg-[var(--color-primary)]/90 transition shadow-md hover:shadow-lg"
                >
                  Import Books
                </button>
                <button
                  onClick={() => setFile(null)}
                  className="px-6 py-3 border border-[var(--color-accent-sage)] text-[var(--color-text-charcoal)] rounded-lg font-medium hover:bg-[var(--color-accent-sage)]/10 transition"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {/* Progress Section */}
        {isUploading && (
          <div className="bg-white rounded-lg border border-[var(--color-accent-sage)]/30 p-8 shadow-sm mb-6">
            <h3 className="font-display text-xl font-bold text-[var(--color-text-forest)] mb-4 text-center">
              Importing your library...
            </h3>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-2">
              <div
                className="bg-[var(--color-primary)] h-full transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-center text-[var(--color-text-charcoal)] text-sm">
              {uploadProgress}% complete
            </p>
          </div>
        )}

        {/* Success Result */}
        {importResult && (
          <div className="bg-white rounded-lg border border-[var(--color-accent-sage)]/30 p-8 shadow-sm mb-6">
            <div className="text-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="font-display text-3xl font-bold text-[var(--color-text-forest)] mb-2">
                Import Successful! 🎉
              </h3>
              <p className="text-[var(--color-text-charcoal)]">
                {importResult.message}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-700 mb-1">
                  {importResult.stats.imported}
                </p>
                <p className="text-sm text-green-600 font-medium">Imported</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-700 mb-1">
                  {importResult.stats.skipped}
                </p>
                <p className="text-sm text-blue-600 font-medium">Skipped (Already in Library)</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-gray-700 mb-1">
                  {importResult.stats.total}
                </p>
                <p className="text-sm text-gray-600 font-medium">Total Books</p>
              </div>
            </div>

            {importResult.stats.errors > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-800 font-medium mb-1">
                      {importResult.stats.errors} book(s) could not be imported
                    </p>
                    <p className="text-sm text-yellow-700">
                      Some books had errors during import. The rest were imported successfully.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => navigate('/library')}
                className="flex-1 bg-[var(--color-primary)] text-white px-6 py-3 rounded-lg font-medium hover:bg-[var(--color-primary)]/90 transition shadow-md hover:shadow-lg"
              >
                View My Library
              </button>
              <button
                onClick={handleImportAnother}
                className="flex-1 px-6 py-3 border border-[var(--color-accent-sage)] text-[var(--color-text-charcoal)] rounded-lg font-medium hover:bg-[var(--color-accent-sage)]/10 transition"
              >
                Import Another File
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium mb-1">Import Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-display text-lg font-bold text-blue-900 mb-3">
            💡 Need Help?
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Make sure you're uploading a CSV file exported from Goodreads</li>
            <li>• The file should contain columns like Title, Author, ISBN, etc.</li>
            <li>• Books already in your library will be skipped automatically</li>
            <li>• Your reading status (read, currently reading, to-read) will be preserved</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
