import { useState, useRef } from 'react';
import { studentApi } from '../services/api';

export default function ResumeUploader({ 
  file, 
  onFileChange, 
  existingResume, 
  onDeleteExisting, 
  disabled = false,
  addToast 
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPreviewing, setIsPreviewing] = useState(false);
  const fileInputRef = useRef(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  const validateAndSetFile = (selectedFile) => {
    setErrorMessage('');
    if (!selectedFile) return;

    // Check extension and mime
    const isPdf = selectedFile.name.toLowerCase().endsWith('.pdf') || 
                  selectedFile.type === 'application/pdf';
    if (!isPdf) {
      const err = 'Only PDF files (.pdf) are accepted. Please choose a valid PDF resume.';
      setErrorMessage(err);
      if (addToast) addToast(err, 'error');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      const err = `File size (${formatFileSize(selectedFile.size)}) exceeds the maximum limit of 5 MB.`;
      setErrorMessage(err);
      if (addToast) addToast(err, 'error');
      return;
    }

    onFileChange(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onFileChange(null);
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handlePreviewExisting = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setIsPreviewing(true);
      const blob = await studentApi.getResumeResourceBlob('/students/resume/preview');
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (err) {
      if (addToast) addToast(err.message || 'Unable to open preview.', 'error');
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleDownloadExisting = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const blob = await studentApi.getResumeResourceBlob('/students/resume/download');
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = existingResume?.fileName || 'resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
    } catch (err) {
      if (addToast) addToast(err.message || 'Unable to download resume.', 'error');
    }
  };

  return (
    <div className="resume-uploader-container">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".pdf,application/pdf"
        style={{ display: 'none' }}
        id="resume-file-input"
        disabled={disabled}
      />

      {/* When a file is newly selected */}
      {file ? (
        <div className="resume-selected-card">
          <div className="resume-file-info">
            <div className="pdf-icon-badge">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="resume-file-name" title={file.name}>{file.name}</div>
              <div className="resume-file-size">{formatFileSize(file.size)} • Ready to upload</div>
            </div>
          </div>
          <div className="resume-actions">
            <button
              type="button"
              className="btn-outline"
              style={{ padding: '6px 12px', fontSize: '13px' }}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              disabled={disabled}
            >
              🔄 Change PDF
            </button>
            <button
              type="button"
              className="btn-danger"
              style={{ padding: '6px 12px', fontSize: '13px' }}
              onClick={handleRemove}
              disabled={disabled}
            >
              ✕ Remove
            </button>
          </div>
        </div>
      ) : existingResume && existingResume.fileName ? (
        /* When an existing resume is already persisted on server */
        <div className="resume-existing-card">
          <div className="resume-file-info">
            <div className="pdf-icon-badge active">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="resume-file-name" title={existingResume.fileName}>
                  {existingResume.fileName}
                </span>
                <span className="saved-badge">Saved on Server</span>
              </div>
              <div className="resume-file-size">
                {existingResume.fileSize ? formatFileSize(existingResume.fileSize) : 'PDF Document'}
                {existingResume.uploadedAt && ` • Uploaded ${existingResume.uploadedAt.replace('T', ' ').substring(0, 16)}`}
              </div>
            </div>
          </div>

          <div className="resume-actions">
            <button
              type="button"
              className="btn-outline"
              style={{ padding: '6px 12px', fontSize: '12.5px' }}
              onClick={handlePreviewExisting}
              disabled={isPreviewing}
            >
              👁️ {isPreviewing ? 'Loading...' : 'Preview'}
            </button>
            <button
              type="button"
              className="btn-outline"
              style={{ padding: '6px 12px', fontSize: '12.5px' }}
              onClick={handleDownloadExisting}
            >
              📥 Download
            </button>
            <button
              type="button"
              className="btn-primary"
              style={{ padding: '6px 12px', fontSize: '12.5px' }}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              disabled={disabled}
            >
              🔄 Replace
            </button>
            {onDeleteExisting && (
              <button
                type="button"
                className="btn-danger"
                style={{ padding: '6px 10px', fontSize: '12.5px' }}
                onClick={onDeleteExisting}
                disabled={disabled}
                title="Delete resume from server"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Empty Dropzone area */
        <div
          className={`resume-dropzone ${isDragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current && fileInputRef.current.click()}
        >
          <div className="dropzone-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </div>
          <div className="dropzone-text">
            <span style={{ fontWeight: 700, color: 'var(--slate-800)' }}>
              Drag & drop your Resume PDF here
            </span>
            <span style={{ fontSize: '13px', color: 'var(--slate-500)', marginTop: '4px' }}>
              or click to browse from your device
            </span>
          </div>
          <div style={{ marginTop: '12px' }}>
            <button
              type="button"
              className="btn-outline"
              style={{ pointerEvents: 'none', padding: '6px 16px', fontSize: '13px' }}
            >
              📁 Choose PDF
            </button>
          </div>
          <div className="dropzone-hint">
            Supports PDF files only • Maximum size: 5 MB
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="resume-upload-error">
          ⚠️ {errorMessage}
        </div>
      )}
    </div>
  );
}
