import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Grid, CircularProgress, Breadcrumbs, Link, Typography } from '@mui/material';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import LazyLoad from 'react-lazyload';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Menu, Item, useContextMenu } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';
import './Documents.css';

const FolderSelection = ({ onFolderSelect }) => {
    const folders = ['Folder1', 'Folder2', 'Folder3']; // Example folder names

    return (
        <Grid container spacing={2}>
            {folders.map((folder) => (
                <Grid item key={folder}>
                    <Button variant="contained" onClick={() => onFolderSelect(folder)}>
                        {folder}
                    </Button>
                </Grid>
            ))}
        </Grid>
    );
};

const FileItem = ({ file }) => {
    const { show } = useContextMenu({ id: file });

    return (
        <div onContextMenu={(e) => show(e, { props: { file } })}>
            {file}
        </div>
    );
};

const FolderItem = ({ folder, onFolderSelect }) => {
    const { show } = useContextMenu({ id: folder });

    return (
        <div onContextMenu={(e) => show(e, { props: { folder } })} onClick={() => onFolderSelect(folder)}>
            📁 {folder}
        </div>
    );
};

const FileContextMenu = ({ id }) => (
    <Menu id={id}>
        <Item onClick={({ props }) => alert('Download ' + props.file)}>Download</Item>
        <Item onClick={({ props }) => alert('Delete ' + props.file)}>Delete</Item>
    </Menu>
);

const FolderContextMenu = ({ id, onFolderDelete }) => (
    <Menu id={id}>
        <Item onClick={({ props }) => alert('Open ' + props.folder)}>Open</Item>
        <Item onClick={({ props }) => onFolderDelete(props.folder)}>Delete Folder</Item>
    </Menu>
);

const FileExplorer = ({ folderContents, onFolderSelect, onFolderDelete, loading }) => {
    if (loading) {
        return <CircularProgress />;
    }

    return (
        <div className="file-explorer">
            <TransitionGroup>
                {folderContents.folders.map((folder) => (
                    <CSSTransition key={folder} timeout={300} classNames="fade">
                        <div>
                            <FolderItem folder={folder} onFolderSelect={onFolderSelect} />
                            <FolderContextMenu id={folder} onFolderDelete={onFolderDelete} />
                        </div>
                    </CSSTransition>
                ))}

                {folderContents.files.map((file) => (
                    <CSSTransition key={file} timeout={300} classNames="fade">
                        <div>
                            <FileItem file={file} />
                            <FileContextMenu id={file} />
                        </div>
                    </CSSTransition>
                ))}
            </TransitionGroup>
        </div>
    );
};

const App = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [folderContents, setFolderContents] = useState({ folders: [], files: [] });
    const [currentPath, setCurrentPath] = useState('Root');

    const theme = createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
        },
    });

    const fetchFolderContents = async (folderName) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/folder-contents?folder=${folderName}`);
            setFolderContents(response.data);
            setCurrentPath(folderName);
        } catch (error) {
            console.error('Error fetching folder contents:', error);
        } finally {
            setLoading(false);
        }
    };

    const onFolderSelect = (folder) => {
        fetchFolderContents(folder);
    };

    const onFolderDelete = async (folderName) => {
        try {
            await axios.delete(`/api/delete-folder/${folderName}`);
            alert(`Folder ${folderName} deleted`);
            fetchFolderContents(currentPath); // Reload folder contents after deletion
        } catch (err) {
            console.error('Error deleting folder:', err);
        }
    };

    useEffect(() => {
        fetchFolderContents('Root'); // Initial load of the root folder
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Button onClick={() => setDarkMode(!darkMode)}>Toggle Dark Mode</Button>

            <FileExplorerBreadcrumbs currentPath={currentPath} />
            <FileExplorer
                folderContents={folderContents}
                onFolderSelect={onFolderSelect}
                onFolderDelete={onFolderDelete}
                loading={loading}
            />
        </ThemeProvider>
    );
};

const FileExplorerBreadcrumbs = ({ currentPath }) => {
    const pathArray = currentPath.split('/');

    return (
        <Breadcrumbs aria-label="breadcrumb">
            {pathArray.map((folder, index) => (
                <Link key={index} color="inherit">
                    {folder}
                </Link>
            ))}
            <Typography color="textPrimary">{pathArray[pathArray.length - 1]}</Typography>
        </Breadcrumbs>
    );
};

export default App;
