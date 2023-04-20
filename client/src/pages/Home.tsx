import React from 'react';
import Navbar from '../components/Navbar/Navbar';
import Thumbs from '../components/Thumbs/Thumbs';

function Home() {
    const exists = localStorage.getItem('user')
    if (!exists) {
        return (
            <div>
                <Navbar children={undefined} />
                <h1>Please Login</h1>
            </div>
        )
    }
    else {
        return (
            <>
                <Navbar children={undefined} />
                <Thumbs />
                <h1>Home</h1>
            </>
        );
    }
}

export default Home;
