import React, { useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderPlus } from '@fortawesome/free-solid-svg-icons';

//Folder Creation
function CFolder() {
    const [folderName, setFolderName] = useState('');
    const [message, setMessage] = useState('');

    const handleFolderCreation = async () => {
        if (!folderName) {
            setMessage('Please enter a folder name.');
            return;
        }

        try {
            const res = await axios.post('/create-folder', { folderName });
            setMessage(res.data.message);
            setFolderName(''); // Clear the input after successful folder creation
        } catch (error) {
            setMessage(error.response ? error.response.data.message : 'Error creating folder.');
        }
    };

    return (
        <div>
            <input
                type="text"
                placeholder="Enter folder name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
            />
            <button onClick={handleFolderCreation}>
                <FontAwesomeIcon icon={faFolderPlus} /> Create Folder
            </button>
            <p>{message}</p> {/* Show success or error message */}
        </div>
    );
}

export default CFolder;