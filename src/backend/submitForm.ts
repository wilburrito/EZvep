import React from 'react';
import { db } from './firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import axios from 'axios';

// const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
// const TELEGRAM_GROUP_ID = process.env.TELEGRAM_GROUP_ID;
const FIREBASE_ENDPOINT = process.env.REACT_APP_FIREBASE_ENDPOINT || "";


export const handleSubmit = async (event: React.FormEvent<HTMLFormElement>, name: string, phoneNumber: string, email: string) => {
    event.preventDefault();
    try {
        await addDoc(collection(db, "contacts"), {
        name: name,
        email: email,
        phoneNumber: phoneNumber,
        timestamp: new Date()
        });
        await axios.post(
            FIREBASE_ENDPOINT,
            {
              name,
              phoneNumber,
              email,
            }
          );
    } catch (e) {
        console.error("Error adding document: ", e);
        alert("An error occurred. Please try again.");
    }
};

