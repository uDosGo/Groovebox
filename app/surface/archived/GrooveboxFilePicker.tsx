import React, { useState, useEffect, useCallback } from 'react';
import { useGrooveboxAPI, WorkspaceRoot, VaultFile } from './hooks/useGrooveboxAPI';

interface GrooveboxFilePickerProps {
  onSelectFile: (rootId: string, path: string, content: string) => void;
  onClose: () => void;
}

export function GrooveboxFilePicker({ onSelectFile, onClose }: GrooveboxFilePickerProps) {
  const { getWorkspaceRoots, getWorkspaceTree, readWorkspaceFile } = useGrooveboxAPI();
  const [roots, setRoots] = useState<WorkspaceRoot[]>([]);
  const [selectedRoot, setSelectedRoot] = useState<string | null>(null);
  const [tree, setTree] = useState<VaultFile[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [pathStack, setPathStack] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getWorkspaceRoots().then(setRoots);
  }, [getWorkspaceRoots]);

  const loadTree = useCallback(async (rootId: string, path: string) => {
    setLoading(true);
    try {
      const children = await getWorkspaceTree(rootId, path);
      setTree(children);
    } finally {
      setLoading(false);
    }
  }, [getWorkspaceTree]);

  const handleSelectRoot = useCallback((rootId: string) => {
    setSelectedRoot(rootId);
    setCurrentPath('');
    setPathStack([]);
    loadTree(rootId, '');
  }, [loadTree]);

  const handleEnterDir = useCallback((dirName: string) => {
    const newPath = currentPath ? `${currentPath}/${dirName}` : dirName;
    setPathStack(prev => [...prev, currentPath]);
    setCurrentPath(newPath);
    if (selectedRoot) loadTree(selectedRoot, newPath);
  }, [currentPath, selectedRoot, loadTree]);

  const handleGoBack = useCallback(() => {
    const prev = pathStack[pathStack.length - 1] || '';
    setPathStack(prev => prev.slice(0, -1));
    setCurrentPath(prev);
    if (selectedRoot) loadTree(selectedRoot, prev);
  }, [pathStack, selectedRoot, loadTree]);

  const handleSelectFile = useCallback(async (filePath: string) => {
    if (!selectedRoot) return;
    const fullPath = currentPath ? `${currentPath}/${filePath}` : filePath;
    const content = await readWorkspaceFile(selectedRoot, fullPath);
    if (content !== null) {
      onSelectFile(selectedRoot, fullPath, content);
      onClose();
    }
  }, [selectedRoot, currentPath, readWorkspaceFile, onSelectFile, onClose]);

  const rootLabel = selectedRoot
    ? roots.find(r => r.id === selectedRoot)?.label || selectedRoot
    : null;

  return (
    <aside className="groovebox-filepicker">
      <div className="groovebox-filepicker-header">
        <span className="groovebox-filepicker-title">
          <i className="bi bi-folder2-open" /> Files
        </span>
        <button
          className="groovebox-filepicker-close"
          onClick={onClose}
          aria-label="Close file picker"
        >
          <i className="bi bi-x-lg" />
        </button>
      </div>

      {/* Root selector */}
      {!selectedRoot ? (
        <div className="groovebox-filepicker-roots">
          {roots.map(root => (
            <button
              key={root.id}
              className="groovebox-filepicker-root-btn"
              onClick={() => handleSelectRoot(root.id)}
              title={root.path}
            >
              <i className="bi bi-hdd-stack" />
              <span>{root.label}</span>
              <span className="groovebox-filepicker-root-path">{root.path}</span>
            </button>
          ))}
        </div>
      ) : (
        <>
          {/* Breadcrumb */}
          <div className="groovebox-filepicker-breadcrumb">
            <button
              className="groovebox-filepicker-breadcrumb-btn"
              onClick={() => { setSelectedRoot(null); setTree([]); setCurrentPath(''); setPathStack([]); }}
              title="Back to roots"
            >
              <i className="bi bi-hdd-stack" />
            </button>
            <span className="groovebox-filepicker-breadcrumb-label">{rootLabel}</span>
            {currentPath && (
              <>
                <span className="groovebox-filepicker-breadcrumb-sep">/</span>
                <span className="groovebox-filepicker-breadcrumb-path">{currentPath}</span>
              </>
            )}
          </div>

          {/* File tree */}
          <div className="groovebox-filepicker-tree">
            {pathStack.length > 0 && (
              <button className="groovebox-filepicker-tree-item groovebox-filepicker-tree-back" onClick={handleGoBack}>
                <i className="bi bi-arrow-return-left" />
                <span>..</span>
              </button>
            )}
            {loading ? (
              <div className="groovebox-filepicker-loading">
                <i className="bi bi-arrow-repeat spin" /> Loading...
              </div>
            ) : tree.length === 0 ? (
              <div className="groovebox-filepicker-empty">Empty directory</div>
            ) : (
              tree.map(item => (
                <button
                  key={item.path}
                  className="groovebox-filepicker-tree-item"
                  onClick={() => item.type === 'directory' ? handleEnterDir(item.name) : handleSelectFile(item.path)}
                >
                  {item.type === 'directory' ? (
                    <i className="bi bi-folder" />
                  ) : (
                    <i className="bi bi-file-earmark" />
                  )}
                  <span>{item.name}</span>
                  {item.size !== undefined && (
                    <span className="groovebox-filepicker-tree-size">
                      {item.size > 1024 ? `${(item.size / 1024).toFixed(1)} KB` : `${item.size} B`}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </>
      )}
    </aside>
  );
}

export default GrooveboxFilePicker;
