import { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [processedFiles, setProcessedFiles] = useState({
    excelFilename: null,
    jsonFilename: null,
    graphFilename: null,
  });

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setFile(null);
      setError('Please select a valid PDF file.');
    }
  };

  // Handle file upload using Axios
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status !== 200) {
        throw new Error('File upload failed.');
      }

      const data = response.data;
      console.log("Upload successful:", data);

      // Extract filenames from the response
      const excelFilename = new URL(data.excel_download_url, window.location.origin).searchParams.get('filename');
      const jsonFilename = new URL(data.json_download_url, window.location.origin).searchParams.get('filename');
      const graphFilename = new URL(data.graph_html_url, window.location.origin).searchParams.get('filename');

      // Store processed filenames
      setProcessedFiles({
        excelFilename,
        jsonFilename,
        graphFilename,
      });

      setError('');
    } catch (err) {
      setError(`Failed to upload file: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle Excel download using Axios
  const handleDownloadExcel = async () => {
    if (!processedFiles.excelFilename) {
      setError('No Excel file available for download.');
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/download-excel?filename=${processedFiles.excelFilename}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = processedFiles.excelFilename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(`Failed to download Excel file: ${err.message}`);
    }
  };

  // Handle JSON download using Axios
  const handleDownloadJson = async () => {
    if (!processedFiles.jsonFilename) {
      setError('No JSON file available for download.');
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/download-json?filename=${processedFiles.jsonFilename}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = processedFiles.jsonFilename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(`Failed to download JSON file: ${err.message}`);
    }
  };

  // Handle graph visualization using Axios
  const handleVisualize = async () => {
    if (!processedFiles.graphFilename) {
      setError('No graph available for visualization.');
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/download-graph?filename=${processedFiles.graphFilename}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank'); // Open the graph in a new tab
    } catch (err) {
      setError(`Failed to visualize data: ${err.message}`);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h1 className="text-center mb-4">PDF Processor</h1>

              {/* File Upload Section */}
              <div>
                <label className="fw-bold d-block mb-2">Upload PDF File</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="form-control form-control-lg mb-2"
                />
                <small className="text-muted">Only PDF files are accepted.</small>
              </div>

              {/* Error Display */}
              {error && (
                <div className="alert alert-danger mt-3" role="alert">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="d-grid gap-3 mt-4">
                {/* Upload Button */}
                <button
                  className="btn btn-primary btn-lg shadow-sm"
                  onClick={handleUpload}
                  disabled={!file || loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Uploading...
                    </>
                  ) : (
                    'Upload PDF'
                  )}
                </button>

                {/* Download Excel Button */}
                <button
                  className="btn btn-success btn-lg shadow-sm"
                  onClick={handleDownloadExcel}
                  disabled={!processedFiles.excelFilename || loading}
                >
                  <i className="bi bi-file-earmark-excel me-2"></i>
                  Download Excel
                </button>

                {/* Download JSON Button */}
                <button
                  className="btn btn-warning btn-lg shadow-sm text-white"
                  onClick={handleDownloadJson}
                  disabled={!processedFiles.jsonFilename || loading}
                >
                  <i className="bi bi-filetype-json me-2"></i>
                  Download JSON
                </button>

                {/* Visualize Graph Button */}
                <button
                  className="btn btn-info btn-lg shadow-sm text-white"
                  onClick={handleVisualize}
                  disabled={!processedFiles.graphFilename || loading}
                >
                  <i className="bi bi-graph-up me-2"></i>
                  Visualize Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;