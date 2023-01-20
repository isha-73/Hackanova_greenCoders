import React, { useState, useEffect, useContext, createContext } from "react";

import firebase from "@/lib/firebase";
import { createUser } from "@/lib/db";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const auth = useAuthProvider();
    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    return useContext(AuthContext);
}

function useAuthProvider() {
    const [ user, setUser ] = useState(null);

    const handleUser = (rawUser) => {
        if (rawUser) {
            const user = formatUser(rawUser);

            createUser(user.uid, user)
            setUser(user);
            return user;
        } else {
            setUser(false);
            return false;
        }
    }

    const signInWithGoogle = () => {
        return firebase
            .auth()
            .signInWithPopup(new firebase.auth.GoogleAuthProvider())
            .then((response) => handleUser(response.user));
    }

    const signout = () => {
        return firebase
            .auth()
            .signOut()
            .then(() => handleUser(false));
    }

    useEffect(() => {
        const unsubscribe = firebase.auth().onAuthStateChanged(handleUser);
        return () => unsubscribe();
    }, []);

    return {
        user,
        signInWithGoogle,
        signout
    };
}

const formatUser = (user) => {
    return {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        provider: user.providerData[ 0 ].providerId,
        photoUrl: user.photoURL
    };
};