import React from 'react';

interface FileItem {
  name: string;
  downloadUrl?: string;
}

export const GeneratedFiles: React.FC = () => {
  // Dummy data for now – you can replace this with actual files from your app's state
  const files: FileItem[] = [
    { name: 'output.log', downloadUrl: '#' },
    { name: 'results.json', downloadUrl: '#' },
    { name: 'report.pdf', downloadUrl: '#' },
  ];

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Generated Files</h2>
      {files.length === 0 ? (
        <p>No files have been generated yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {files.map((file, index) => (
            <li
              key={index}
              style={{
                marginBottom: '0.5rem',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '8px',
              }}
            >
              <span>{file.name}</span>
              {file.downloadUrl && (
                <a
                  href={file.downloadUrl}
                  style={{ marginLeft: '1rem' }}
                  download
                >
                  Download
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
