import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

interface CreateCommunityCommentRequest {
  postId: string;
  text: string;
}

interface CreateCommunityCommentResponse {
  commentId: string;
}

export async function createCommunityComment(
  postId: string,
  text: string,
): Promise<string> {
  const callable = httpsCallable<
    CreateCommunityCommentRequest,
    CreateCommunityCommentResponse
  >(functions, 'createCommunityComment');
  const result = await callable({ postId, text });
  return result.data.commentId;
}
