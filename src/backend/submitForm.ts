import React from 'react';
import { db } from './firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

export const handleSubmit = async (event: React.FormEvent<HTMLFormElement>, name: string, phoneNumber: string, email: string) => {
    event.preventDefault();
    try {
        const docRef = await addDoc(collection(db, "contacts"), {
        name: name,
        email: email,
        phoneNumber: phoneNumber,
        timestamp: new Date()
        });
        console.log("Document written with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
        alert("An error occurred. Please try again.");
    }
};

