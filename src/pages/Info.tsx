import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, Loader2, UserCircle2, Baby, Edit2, X, Check, Trash2, Lock } from 'lucide-react';
import { auth, db } from '../firebase';
import { collection, getDocs, doc, setDoc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import Header from '../components/Header';

interface Profile {
    profileNo: string;
    profileName: string;
    avatar: string;
    points: number;
    isMain: boolean;
    agency?: string;
    parentUid?: string;
}

const InfoPage: React.FC = () => {
    return (
        <p>정보탭 / 미개발 상태</p>
    );
};

export default InfoPage;