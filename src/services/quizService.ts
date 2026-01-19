import { db } from '../firebase';
import { collection, query, where, limit, getDocs, orderBy, startAt } from 'firebase/firestore';

/**
 * 난이도에 맞는 퀴즈를 랜덤하게 10개 가져오는 함수
 */
export const fetchQuizzesByDifficulty = async (difficulty: string) => {
    const quizRef = collection(db, "quizzes");
    const randomStart = Math.random(); // 0~1 사이의 무작위 시작점 생성

    try {
        // 1. 선택한 난이도 필터링 + randomWeight가 생성된 난수보다 큰 데이터 10개 추출
        let q = query(
            quizRef,
            where("difficulty", "==", difficulty),
            orderBy("randomWeight"),
            startAt(randomStart),
            limit(10)
        );

        let querySnapshot = await getDocs(q);
        let results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // 2. 만약 데이터가 부족하면(리스트 끝부분일 때) 다시 처음부터 부족한 만큼 가져오기
        if (results.length < 10) {
            const remainingLimit = 10 - results.length;
            const qFallback = query(
                quizRef,
                where("difficulty", "==", difficulty),
                orderBy("randomWeight"),
                limit(remainingLimit)
            );
            const fallbackSnapshot = await getDocs(qFallback);
            const fallbackResults = fallbackSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            results = [...results, ...fallbackResults];
        }

        return results;
    } catch (error) {
        console.error("퀴즈를 불러오는 중 오류 발생:", error);
        throw error;
    }
};