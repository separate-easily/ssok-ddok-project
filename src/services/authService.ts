import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export const signUp = async (email: string, password: string, nickname: string, agency: string) => {
    try {
        // 1. Firebase Auth에 계정 생성
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Firestore의 'users' 컬렉션에 해당 UID로 문서 생성
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: email,
            nickname: nickname,
            agency: agency,
            points: 0, // 초기 점수는 0점
            createdAt: new Date().toISOString()
        });

        return user;
    } catch (error) {
        console.error("회원가입 에러:", error);
        throw error;
    }
};