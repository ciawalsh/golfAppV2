import { deleteDoc, doc, setDoc } from 'firebase/firestore';
import { COLLECTIONS } from '@/constants/collections';
import { db } from '@/lib/firebase';
import { Round } from '@/types/golf';

export async function persistRound(round: Round): Promise<void> {
  const roundRef = doc(db, COLLECTIONS.USERS, round.userId, 'rounds', round.id);
  await setDoc(roundRef, round, { merge: true });
}

export async function deleteRound(
  userId: string,
  roundId: string,
): Promise<void> {
  const roundRef = doc(db, COLLECTIONS.USERS, userId, 'rounds', roundId);
  await deleteDoc(roundRef);
}
