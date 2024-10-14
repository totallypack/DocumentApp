import React from 'react';
import { List, ListItem, ListItemIcon, ListItemText, Button } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import './FileExplorer.css'; // Ensure this CSS file is imported

const FileExplorer = ({ folderContents, onSubFolderClick, currentFolder }) => {
    const downloadFile = (fileName) => {
        const fileUrl = `http://localhost:3001/uploads/${encodeURIComponent(currentFolder)}/${encodeURIComponent(fileName)}`;
        // Create an anchor tag for downloading the file
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName; // Forces download
        document.body.appendChild(link); // Append link to body
        link.click();
        document.body.removeChild(link); // Remove link after download
    };

    return (
        <div className="file-explorer-container">
            <h3></h3>
            <List className="file-explorer-list">
                {folderContents.folders.length > 0 ? (
                    folderContents.folders.map((subFolder) => (
                        <ListItem
                            button
                            key={subFolder}
                            className="file-explorer-list-item"
                            onClick={() => onSubFolderClick(`${currentFolder}/${subFolder}`)} // Navigate into the subfolder
                        >
                            <ListItemIcon>
                                <FolderIcon />
                            </ListItemIcon>
                            <ListItemText primary={subFolder} />
                        </ListItem>
                    ))
                ) : (
                    <ListItem>
                        <ListItemText primary="No subfolders found" />
                    </ListItem>
                )}
            </List>

            <h3>Files:</h3>
            <List className="file-explorer-list">
                {folderContents.files.length > 0 ? (
                    folderContents.files.map((file) => (
                        <ListItem key={file} className="file-explorer-list-item">
                            <ListItemIcon>
                                <InsertDriveFileIcon />
                            </ListItemIcon>
                            <ListItemText primary={file} />

                            <div className="file-actions">

                                {/* Open in New Tab Button */}
                                <Button
                                    variant="contained"
                                    component="a"
                                    href={`http://localhost:3001/uploads/${encodeURIComponent(currentFolder)}/${encodeURIComponent(file)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Open
                                </Button>
                            </div>
                        </ListItem>
                    ))
                ) : (
                    <ListItem>
                        <ListItemText primary="No files found" />
                    </ListItem>
                )}
            </List>
        </div>
    );
};

export default FileExplorer;