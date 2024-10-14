const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const uploadsDir = path.join(__dirname, 'uploads');

app.use(cors());

const ensureUploadsDirExists = async () => {
    try {
        await fs.access(uploadsDir);
    } catch (err) {
        await fs.mkdir(uploadsDir);
    }
};

// API to list directories inside /uploads
app.get('/api/folders', async (req, res) => {
    console.log('Request received for /api/folders');
    try {
        await ensureUploadsDirExists();
        const files = await fs.readdir(uploadsDir);
        const folders = [];
        for (const file of files) {
            const filePath = path.join(uploadsDir, file);
            const stats = await fs.lstat(filePath);
            if (stats.isDirectory()) {
                folders.push(file);
            }
        }
        res.json(folders);
    } catch (err) {
        console.error('Error reading folders:', err);
        res.status(500).json({ message: 'Unable to scan folders' });
    }
});

// API to list contents of a specific folder inside /uploads
app.get('/api/folder-contents', async (req, res) => {
    const folderName = req.query.folder;
    const folderPath = path.join(uploadsDir, folderName);

    try {
        const files = await fs.readdir(folderPath);
        const contents = {folders: [],files: []};
        // Loop through each item in the folder and categorize as a folder or a file
        for (const file of files) {
            const filePath = path.join(folderPath, file);
            const stats = await fs.lstat(filePath);
            if (stats.isDirectory()) {
                contents.folders.push(file);
            } else {
                contents.files.push(file);
            }
        }
        res.json(contents);
    } catch (err) {
        if (err.code === 'ENOENT') {
            res.status(404).json({ message: `Folder '${folderName}' not found.` });
        } else {
            console.error('Error reading folder contents:', err);
            res.status(500).json({ message: `Unable to read contents of folder '${folderName}'` });
        }
    }
});

// API to search files across all subfolders inside /uploads
app.get('/api/search', async (req, res) => {
    const searchTerm = req.query.q; // Get the search term from query parameter
    if (!searchTerm) {
        return res.status(400).json({ message: "Search term is required" });
    }

    const searchResults = [];

    const searchFiles = async (dir) => {
        const files = await fs.readdir(dir);

        for (const file of files) {
            const filePath = path.join(dir, file);
            const stats = await fs.lstat(filePath);

            if (stats.isDirectory()) {
                await searchFiles(filePath); // Recursively search in subdirectories
            } else if (file.toLowerCase().includes(searchTerm.toLowerCase())) {
                const relativePath = path.relative(uploadsDir, filePath);
                searchResults.push(relativePath); // Add matching files to the results
            }
        }
    };

    try {
        await searchFiles(uploadsDir);
        res.json(searchResults);
    } catch (err) {
        console.error('Error searching files:', err);
        res.status(500).json({ message: 'Unable to search files' });
    }
});

app.use('/uploads', express.static(uploadsDir));

ensureUploadsDirExists().catch(console.error);

const port = 3001;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});