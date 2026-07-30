import React, { useState, useCallback, useRef, useEffect } from 'react';

export interface DropFile {
  id: string;
  name: string;
  size: number;
  type: string;
  source: 'file' | 'url' | 'clipboard';
  url?: string;
  data?: string;
  blob?: Blob;
  preview?: string;
}

export interface DropPanelAction {
  id: string;
  label: string;
  icon?: string;
  description: string;
  accept?: string;
  handler: (files: DropFile[]) => Promise<void>;
}

interface DropPanelProps {
  actions: DropPanelAction[];
  maxFiles?: number;
  maxSizeMB?: number;
  className?: string;
  onError?: (error: string) => void;
}

export function DropPanel({
  actions,
  maxFiles = 10,
  maxSizeMB = 50,
  className = '',
  onError,
}: DropPanelProps) {
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<DropFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const generateId = () => `drop-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const addFiles = useCallback((newFiles: DropFile[]) => {
    setFiles(prev => {
      const combined = [...prev, ...newFiles];
      return combined.slice(0, maxFiles);
    });
  }, [maxFiles]);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = useCallback(async (fileList: FileList | File[]) => {
    const maxBytes = maxSizeMB * 1024 * 1024;
    const newFiles: DropFile[] = [];

    for (const file of Array.from(fileList)) {
      if (file.size > maxBytes) {
        onError?.(`${file.name} exceeds ${maxSizeMB}MB limit`);
        continue;
      }
      const dataUrl = await readFileAsDataURL(file);
      newFiles.push({
        id: generateId(),
        name: file.name,
        size: file.size,
        type: file.type,
        source: 'file',
        data: dataUrl,
        blob: file,
        preview: file.type.startsWith('image/') ? dataUrl : undefined,
      });
    }

    addFiles(newFiles);
  }, [addFiles, maxSizeMB, onError]);

  const handleUrl = useCallback(async (url: string) => {
    if (!url.trim()) return;
    const trimmed = url.trim();
    const name = trimmed.split('/').pop() || trimmed.split('?')[0] || 'url-resource';
    const newFile: DropFile = {
      id: generateId(),
      name,
      size: 0,
      type: 'url',
      source: 'url',
      url: trimmed,
    };
    addFiles([newFile]);
    setUrlInput('');
    setShowUrlInput(false);
  }, [addFiles]);

  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const fileItems: File[] = [];
    for (const item of Array.from(items)) {
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) fileItems.push(file);
      }
    }
    if (fileItems.length > 0) {
      await handleFiles(fileItems);
    }
  }, [handleFiles]);

  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;
    el.addEventListener('paste', handlePaste);
    return () => el.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    const droppedFiles = e.dataTransfer?.files;
    if (droppedFiles && droppedFiles.length > 0) {
      await handleFiles(droppedFiles);
    }

    const text = e.dataTransfer?.getData('text');
    if (text && /^https?:\/\//.test(text.trim())) {
      await handleUrl(text.trim());
    }
  }, [handleFiles, handleUrl]);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFiles(e.target.files);
    }
    e.target.value = '';
  }, [handleFiles]);

  const executeAction = useCallback(async (action: DropPanelAction) => {
    if (files.length === 0) return;
    setProcessing(true);
    try {
      await action.handler(files);
    } catch (err: any) {
      onError?.(err.message || 'Action failed');
    } finally {
      setProcessing(false);
    }
  }, [files, onError]);

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '';
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div
      ref={dropRef}
      className={`drop-panel ${className} ${dragOver ? 'drop-panel--drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      tabIndex={0}
    >
      {/* Drop zone */}
      <div className="drop-panel-zone" onClick={() => fileInputRef.current?.click()}>
        <div className="drop-panel-icon">
          <i className="bi bi-cloud-arrow-up" style={{ fontSize: '2rem' }} />
        </div>
        <p className="drop-panel-text">
          <strong>Drop files or URLs here</strong>
          <br />
          <span className="text-muted">or click to browse &middot; paste from clipboard</span>
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="d-none"
          onChange={handleFileInput}
        />
      </div>

      {/* URL input toggle */}
      <div className="drop-panel-url-section">
        {showUrlInput ? (
          <div className="input-group input-group-sm">
            <span className="input-group-text">
              <i className="bi bi-link-45deg" />
            </span>
            <input
              type="url"
              className="form-control"
              placeholder="Paste a URL (YouTube, audio file, etc.)"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleUrl(urlInput)}
              autoFocus
            />
            <button
              className="btn btn-outline-secondary"
              onClick={() => handleUrl(urlInput)}
              disabled={!urlInput.trim()}
            >
              <i className="bi bi-plus-lg me-1" />
              Add
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={() => { setShowUrlInput(false); setUrlInput(''); }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            className="btn btn-sm btn-outline-secondary w-100"
            onClick={() => setShowUrlInput(true)}
          >
            <i className="bi bi-link-45deg me-1" />
            Add from URL
          </button>
        )}
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="drop-panel-files">
          <div className="drop-panel-files-header">
            <span className="fw-semibold small">
              <i className="bi bi-files me-1" />
              {files.length} file{files.length !== 1 ? 's' : ''}
            </span>
            <button className="btn btn-sm btn-link text-muted p-0" onClick={clearFiles}>
              <i className="bi bi-x-circle me-1" />
              Clear all
            </button>
          </div>
          <div className="drop-panel-files-list">
            {files.map(file => (
              <div key={file.id} className="drop-panel-file-item">
                {file.preview ? (
                  <img src={file.preview} alt="" className="drop-panel-file-preview" />
                ) : (
                  <div className="drop-panel-file-icon">
                    <i className={`bi ${file.source === 'url' ? 'bi-link-45deg' : 'bi-file-earmark'}`} />
                  </div>
                )}
                <div className="drop-panel-file-info">
                  <span className="drop-panel-file-name text-truncate">{file.name}</span>
                  {file.size > 0 && (
                    <span className="drop-panel-file-size text-muted">{formatSize(file.size)}</span>
                  )}
                </div>
                <button
                  className="btn btn-sm btn-link text-muted p-0 drop-panel-file-remove"
                  onClick={() => removeFile(file.id)}
                  title="Remove"
                >
                  <i className="bi bi-x" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      {files.length > 0 && (
        <div className="drop-panel-actions">
          {actions.map(action => (
            <button
              key={action.id}
              className="btn btn-sm btn-outline-primary drop-panel-action-btn"
              onClick={() => executeAction(action)}
              disabled={processing}
              title={action.description}
            >
              {processing ? (
                <span className="spinner-border spinner-border-sm me-1" role="status" />
              ) : (
                <i className={`bi ${action.icon || 'bi-lightning-charge'} me-1`} />
              )}
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Processing indicator */}
      {processing && (
        <div className="drop-panel-processing">
          <div className="progress" style={{ height: '4px' }}>
            <div className="progress-bar progress-bar-striped progress-bar-animated" style={{ width: '100%' }} />
          </div>
          <small className="text-muted mt-2 d-block">
            <i className="bi bi-arrow-repeat me-1" />
            Processing...
          </small>
        </div>
      )}
    </div>
  );
}

export default DropPanel;
