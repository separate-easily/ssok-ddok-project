import { db } from '../firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

/**
 * 유저의 누적 포인트를 업데이트하는 함수
 * @param userId 유저의 고유 UID
 * @param addedPoints 이번 게임에서 얻은 점수
 */
export const updateUserPoints = async (userId: string, addedPoints: number) => {
    try {
        const userRef = doc(db, "users", userId);

        // increment를 사용하면 기존 점수에 값을 안전하게 더해줍니다.
        await updateDoc(userRef, {
            points: increment(addedPoints)
        });

        console.log(`${addedPoints} 포인트가 성공적으로 누적되었습니다.`);
    } catch (error) {
        console.error("포인트 업데이트 중 오류 발생:", error);
        throw error;
    }
};