import './App.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CircularProgress, Button, Grid, Container, TextField } from '@mui/material';
import FileExplorer from './components/FileExplorer';

function App() {
    const [folders, setFolders] = useState([]); // To store list of folders
    const [loading, setLoading] = useState(true); // To handle loading state
    const [selectedFolder, setSelectedFolder] = useState(''); // To handle selected folder, empty means root
    const [folderContents, setFolderContents] = useState({ folders: [], files: [] }); // To store folder contents
    const [folderHistory, setFolderHistory] = useState([]); // To track folder navigation history
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch the list of root folders from the backend
    useEffect(() => {
        const fetchFolders = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/folders');
                setFolders(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching folders:', error);
                setLoading(false);
            }
        };

        fetchFolders();
    }, []);

    // Fetch contents of a folder when a folder is selected
    const handleFolderClick = async (folder) => {
        setLoading(true);
        setSearchResults([]);

        // Add current folder to history before navigating deeper
        if (selectedFolder) {
            setFolderHistory((prevHistory) => [...prevHistory, selectedFolder]);
        }

        setSelectedFolder(folder); // Reset the selected folder to the newly clicked one

        try {
            const encodedFolder = encodeURIComponent(folder);
            const response = await axios.get(`http://localhost:3001/api/folder-contents?folder=${encodedFolder}`); // Fetch contents of the selected folder
            setFolderContents(response.data); // Update contents of the folder
            setLoading(false);
        } catch (error) {
            console.error('Error fetching folder contents:', error);
            setLoading(false); // Ensure loading is stopped in case of error
        }
    };

    // Handle Back Button to go up one level
    const handleGoBack = () => {
        if (selectedFolder.includes('/')) {
            // If the current folder is not at the root, go up one level
            const newFolder = selectedFolder.substring(0, selectedFolder.lastIndexOf('/')); // Remove the last folder from the path
            setSelectedFolder(newFolder); // Update selected folder
            handleFolderClick(newFolder); // Fetch contents of the new folder
        } else {
            // If at root, reset to root folder view
            setSelectedFolder('');
            setFolderContents({ folders: [], files: [] }); // Clear folder contents
            fetchRootFolders(); // Re-fetch root folder list
        }
    };

    // Fetch root folder contents when resetting to root
    const fetchRootFolders = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:3001/api/folders');
            setFolders(response.data); // Set root folders again
            setFolderContents({ folders: [], files: [] }); // Clear file explorer contents
            setLoading(false);
        } catch (error) {
            console.error('Error fetching root folders:', error);
            setLoading(false);
        }
    };

    // Handle Search
    const handleSearch = async () => {
        if (!searchQuery) return;

        console.log('Searching for:', searchQuery); // Log search query
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:3001/api/search?q=${encodeURIComponent(searchQuery)}`);
            console.log('Search results:', response.data); // Log search results
            setSearchResults(response.data);
            setSelectedFolder(''); // Clear the current folder
            setLoading(false);
        } catch (error) {
            console.error('Error searching files:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <CircularProgress />
                <h2>Loading...</h2>
            </div>
        );
    }

    return (
        <Container className="App">
            <nav>
                <h1></h1>
            </nav>

            {/* Search Bar */}
            <div className="search-container">
                <div className="search-bar">
                    <TextField
                        label="Search"
                        variant="outlined"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        fullWidth
                    />
                </div>
                <Button
                    variant="contained"
                    className="search-button"
                    onClick={handleSearch}
                >
                    Search
                </Button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
                <div>
                    <h2>Search Results</h2>
                    <ul>
                        {searchResults.map((result, index) => (
                            <li key={index}>
                                <a
                                    href={`http://localhost:3001/uploads/${encodeURIComponent(result)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {result}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Folder List */}
            <div className="folder-list">
                <h2></h2>
                <Grid container spacing={1} justifyContent="center" alignItems="center" className="folder-grid">
                    {folders.length > 0 ? (
                        folders.map((folder) => (
                            <Grid item key={folder}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleFolderClick(folder)} // Clicking resets the folder path
                                    style={{ padding: '10px 20px', marginBottom: '10px' }}
                                >
                                    {folder}
                                </Button>
                            </Grid>
                        ))
                    ) : (
                        <h3>No folders available</h3>
                    )}
                </Grid>
            </div>

            {/* Conditionally Render File Explorer */}
            {selectedFolder && (
                <div className="file-explorer-section">
                    <h2>Contents of: {selectedFolder}</h2>

                    {/* Back Button */}
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleGoBack}
                        disabled={folderHistory.length === 0} // Disable the back button if there's no folder history
                        style={{ padding: '10px 20px', marginBottom: '10px' }}
                    >
                        Go Back
                    </Button>

                    {/* Pass folder contents to FileExplorer component */}
                    <FileExplorer
                        folderContents={folderContents}
                        onSubFolderClick={handleFolderClick}
                        currentFolder={selectedFolder} // Pass current folder path
                    />
                </div>
            )}
        </Container>
    );
}

export default App;