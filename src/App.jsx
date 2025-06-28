import React, { useState } from "react";
import AdminDashboard from "./AdminDashboard";
import "./App.css";

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = () => setLoggedIn(true);
  const handleLogout = () => setLoggedIn(false);

  return (
    
      
          <AdminDashboard />
        
      )
};

export default App;