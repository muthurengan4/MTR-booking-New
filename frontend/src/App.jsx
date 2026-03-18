import React from "react";
import Routes from "./Routes";
import { CartProvider } from "./contexts/CartContext";
import { UserAuthProvider } from "./contexts/UserAuthContext";

function App() {
  return (
    <UserAuthProvider>
      <CartProvider>
        <Routes />
      </CartProvider>
    </UserAuthProvider>
  );
}

export default App;
