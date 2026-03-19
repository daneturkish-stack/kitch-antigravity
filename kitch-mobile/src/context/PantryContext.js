import React, { createContext, useContext, useState, useEffect } from 'react';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';

const PantryContext = createContext();

export const PantryProvider = ({ children, firestore, userId = 'test_user_123' }) => {
    const [pantryItems, setPantryItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const db = firestore || getFirestore();
        const pantryRef = collection(db, 'users', userId, 'pantry');

        const unsubscribe = onSnapshot(pantryRef, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPantryItems(items);
            setLoading(false);
        }, (error) => {
            console.error("Pantry listener error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId, firestore]);

    return (
        <PantryContext.Provider value={{ pantryItems, loading, userId, db: firestore || getFirestore() }}>
            {children}
        </PantryContext.Provider>
    );
};

export const usePantry = () => {
    const context = useContext(PantryContext);
    if (!context) {
        throw new Error('usePantry must be used within a PantryProvider');
    }
    return context;
};
