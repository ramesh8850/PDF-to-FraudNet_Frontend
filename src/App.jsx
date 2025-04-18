import { useState } from 'react';
import { Container, Form, Button, Alert, Card, Row, Col } from 'react-bootstrap';
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

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('File upload failed.');
      }

      const data = await response.json();
      console.log('Upload successful:', data);

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

  // Handle Excel download
  const handleDownloadExcel = async () => {
    if (!processedFiles.excelFilename) {
      setError('No Excel file available for download.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/download-excel?filename=${processedFiles.excelFilename}`);
      if (!response.ok) {
        throw new Error('Failed to download Excel file.');
      }

      const blob = await response.blob();
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

  // Handle JSON download
  const handleDownloadJson = async () => {
    if (!processedFiles.jsonFilename) {
      setError('No JSON file available for download.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/download-json?filename=${processedFiles.jsonFilename}`);
      if (!response.ok) {
        throw new Error('Failed to download JSON file.');
      }

      const blob = await response.blob();
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

  // Handle graph visualization
  const handleVisualize = async () => {
    if (!processedFiles.graphFilename) {
      setError('No graph available for visualization.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/download-graph?filename=${processedFiles.graphFilename}`);
      if (!response.ok) {
        throw new Error('Failed to load graph.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank'); // Open the graph in a new tab
    } catch (err) {
      setError(`Failed to visualize data: ${err.message}`);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h1 className="text-center mb-4">PDF Processor</h1>

              {/* File Upload Section */}
              <Form>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">Upload PDF File</Form.Label>
                  <Form.Control
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="form-control-lg"
                  />
                  <Form.Text className="text-muted">Only PDF files are accepted.</Form.Text>
                </Form.Group>

                {/* Error Display */}
                {error && (
                  <Alert variant="danger" className="mb-4">
                    {error}
                  </Alert>
                )}

                {/* Action Buttons */}
                <div className="d-grid gap-3">
                  {/* Upload Button */}
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleUpload}
                    disabled={!file || loading}
                    className="shadow-sm"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Uploading...
                      </>
                    ) : (
                      'Upload PDF'
                    )}
                  </Button>

                  {/* Download Excel Button */}
                  <Button
                    variant="success"
                    size="lg"
                    onClick={handleDownloadExcel}
                    disabled={!processedFiles.excelFilename || loading}
                    className="shadow-sm"
                  >
                    <i className="bi bi-file-earmark-excel me-2"></i>
                    Download Excel
                  </Button>

                  {/* Download JSON Button */}
                  <Button
                    variant="warning"
                    size="lg"
                    onClick={handleDownloadJson}
                    disabled={!processedFiles.jsonFilename || loading}
                    className="shadow-sm text-white"
                  >
                    <i className="bi bi-filetype-json me-2"></i>
                    Download JSON
                  </Button>

                  {/* Visualize Graph Button */}
                  <Button
                    variant="info"
                    size="lg"
                    onClick={handleVisualize}
                    disabled={!processedFiles.graphFilename || loading}
                    className="shadow-sm text-white"
                  >
                    <i className="bi bi-graph-up me-2"></i>
                    Visualize Data
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default App;