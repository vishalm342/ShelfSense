import api from './api.js';

/**
 * Upload Goodreads CSV file for import
 * @param {File} file - The CSV file to upload
 * @param {Function} onProgress - Optional callback for upload progress (0-100)
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 */
export const uploadGoodreadsCSV = async (file, onProgress = null) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/import/goodreads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: {
        message: error.response?.data?.error?.message || 'Failed to upload CSV file. Please try again.',
        details: error.response?.data?.error?.details,
      },
    };
  }
};

/**
 * Download sample Goodreads CSV template
 */
export const downloadTemplate = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const templateUrl = `${API_URL}/import/template`;

  // Create a temporary link and trigger download
  const link = document.createElement('a');
  link.href = templateUrl;
  link.download = 'goodreads_template.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default {
  uploadGoodreadsCSV,
  downloadTemplate,
};
