// lib/downloadUtils.ts
// Utility functions for handling file downloads in the browser

import type { 
  CompleteProjectDownloadResponse, 
  SingleFileDownloadResponse,
  DownloadResponse 
} from '@/types/development-phase';

/**
 * Download file content as a file
 */
export const downloadFileFromContent = (
  content: string, 
  filename: string, 
  mimeType: string = 'text/plain'
) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Create and download a ZIP file from multiple files
 * Requires: npm install jszip
 */
export const createZipDownload = async (
  files: Record<string, string>, 
  filename: string
) => {
  try {
    // Dynamic import to avoid bundling JSZip if not used
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    
    // Add each file to the zip
    Object.entries(files).forEach(([filepath, content]) => {
      zip.file(filepath, content);
    });
    
    // Generate the zip file
    const content = await zip.generateAsync({ type: 'blob' });
    
    // Trigger download
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Failed to create ZIP download:', error);
    throw new Error('Failed to create ZIP file. Make sure jszip is installed.');
  }
};

/**
 * Process download response from backend and trigger appropriate download
 */
export const processDownloadResponse = async (
  response: DownloadResponse,
  fileType: string,
  projectId: string
): Promise<void> => {
  if (fileType === 'complete') {
    // Handle complete project download
    if ('files' in response && response.files) {
      const { filename } = getDownloadInfo(fileType, projectId);
      await createZipDownload(response.files, filename);
    } else {
      throw new Error('Invalid response format for complete project download. Expected files object.');
    }
  } else {
    // Handle single file download
    if ('content' in response && typeof response.content === 'string') {
      const { filename, mimeType } = getDownloadInfo(fileType, projectId);
      downloadFileFromContent(response.content, filename, mimeType);
    } else {
      throw new Error(`Invalid response format for ${fileType} download. Expected content string.`);
    }
  }
};

/**
 * Get appropriate filename and mime type for different file types
 */
export const getDownloadInfo = (
  fileType: string, 
  projectId: string
): { filename: string; mimeType: string } => {
  switch (fileType) {
    case 'documentation':
      return {
        filename: `project-${projectId}-documentation.md`,
        mimeType: 'text/markdown'
      };
    case 'setup':
      return {
        filename: `project-${projectId}-setup.md`,
        mimeType: 'text/markdown'
      };
    case 'ethical-report':
      return {
        filename: `project-${projectId}-ethical-report.md`,
        mimeType: 'text/markdown'
      };
    case 'deployment':
      return {
        filename: `project-${projectId}-deployment.md`,
        mimeType: 'text/markdown'
      };
    case 'complete':
      return {
        filename: `project-${projectId}-complete.zip`,
        mimeType: 'application/zip'
      };
    default:
      return {
        filename: `project-${projectId}-${fileType}.txt`,
        mimeType: 'text/plain'
      };
  }
};