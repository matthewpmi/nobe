import React, { useState, useEffect } from 'react';
import Router from './Router';
import ResponsiveAppBar from './components/Navbar/ResponsiveAppBar';
import OpenIconSpeedDial from './components/ActionButton/ActionButton';
import UserContext, { UserContextType } from './hooks/Context';
import ChatContext, { ChatContextType } from './hooks/ChatContext';
import Navbar from './components/Navbar/Navbar';
import axios from 'axios';


function App() {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoaded, setIsLoaded] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const user = JSON.parse(storedUser);
                    const { id } = user;
                    const response = await axios.get(`/user/id?id=${id}`);
                    console.log(response.data);
                    console.log('poop');
                    setUserAndSave(response.data);
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            }
            setIsLoading(false);
        };

        fetchData();
    }, []);

    const setUserAndSave = (userData: any) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        setIsLoaded(true);
        setIsLoading(false);
    };

    const userContextValue: UserContextType = {
        user,
        setUser: setUserAndSave,
    };

    const chatContextValue: ChatContextType = {
        messages,
        setMessages,
    };

    return (
        <div className="App">
            <UserContext.Provider value={userContextValue}>
                <ChatContext.Provider value={chatContextValue}>
                    <ResponsiveAppBar />
                    {isLoading ? <div>Loading...</div> : <Router />}
                    <OpenIconSpeedDial />
                </ChatContext.Provider>
            </UserContext.Provider>
            <OpenIconSpeedDial />
        </div>
    );
}

export default App;