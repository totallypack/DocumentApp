import React, { useState } from 'react';
import axios from 'axios';

function FileUpload() {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]); // Save the selected file in state
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage('Please select a file before uploading.');
            return;
        }

        const formData = new FormData();
        formData.append('document', file); // Append file to FormData object

        try {
            const res = await axios.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setMessage('File uploaded successfully!');
            console.log('File uploaded:', res.data);
            setFile(null); // Clear the file input after successful upload
        } catch (error) {
            setMessage('Error uploading file.');
            console.error('Error uploading file:', error);
        }
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload</button>
            <p>{message}</p> {/* Display success or error message */}
        </div>
    );
}

export default FileUpload;
