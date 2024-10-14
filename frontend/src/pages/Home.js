import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { CircularProgress, Button, Grid } from '@mui/material';

const Home = () => {
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFolders = async () => {
            try {
                const response = await axios.get('/api/folders');
                setFolders(response.data);
            } catch (error) {
                console.error('Error fetching folders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFolders();
    }, []);

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <div>
            <h1>Available Folders</h1>
            <Grid container spacing={2}>
                {folders.map((folder) => (
                    <Grid item key={folder}>
                        <Link to={`/explorer/${folder}`}>
                            <Button variant="contained">{folder}</Button>
                        </Link>
                    </Grid>
                ))}
            </Grid>
        </div>
    );
};

export default Home;