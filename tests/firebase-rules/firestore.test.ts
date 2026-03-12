import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { describe, beforeAll, afterAll, afterEach, it } from 'vitest';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'sweetspot-rules-test',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
    },
  });
});

afterEach(async () => {
  await testEnv.clearFirestore();
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('User profile rules', () => {
  it('allows a user to read their own profile', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const db = alice.firestore();
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'users', 'alice'), { displayName: 'Alice' });
    });
    await assertSucceeds(getDoc(doc(db, 'users', 'alice')));
  });

  it('denies a user from reading another user profile', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const db = alice.firestore();
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'users', 'bob'), { displayName: 'Bob' });
    });
    await assertFails(getDoc(doc(db, 'users', 'bob')));
  });

  it('allows a user to create their own profile', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const db = alice.firestore();
    await assertSucceeds(
      setDoc(doc(db, 'users', 'alice'), {
        displayName: 'Alice',
        email: 'alice@example.com',
      }),
    );
  });

  it('denies a user from creating another user profile', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const db = alice.firestore();
    await assertFails(
      setDoc(doc(db, 'users', 'bob'), {
        displayName: 'Bob',
      }),
    );
  });

  it('denies a user from writing subscription field', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const db = alice.firestore();
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'users', 'alice'), {
        displayName: 'Alice',
        subscription: { tier: 'free' },
      });
    });
    await assertFails(
      updateDoc(doc(db, 'users', 'alice'), {
        subscription: { tier: 'premium_monthly' },
      }),
    );
  });

  it('allows a user to update their own non-subscription fields', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const db = alice.firestore();
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'users', 'alice'), {
        displayName: 'Alice',
        handicap: 18,
      });
    });
    await assertSucceeds(
      updateDoc(doc(db, 'users', 'alice'), {
        displayName: 'Alice Updated',
        handicap: 15,
      }),
    );
  });
});

describe('Community post rules', () => {
  it('allows any auth user to read posts', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const db = alice.firestore();
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'communityPosts', 'post1'), {
        userId: 'bob',
        text: 'Hello',
        likes: 0,
        likedBy: [],
        commentCount: 0,
      });
    });
    await assertSucceeds(getDoc(doc(db, 'communityPosts', 'post1')));
  });

  it('allows a user to create a post with their own userId', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const db = alice.firestore();
    await assertSucceeds(
      setDoc(doc(db, 'communityPosts', 'post1'), {
        userId: 'alice',
        text: 'Hello world',
        likes: 0,
        likedBy: [],
        commentCount: 0,
      }),
    );
  });

  it('denies creating a post with another user userId', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const db = alice.firestore();
    await assertFails(
      setDoc(doc(db, 'communityPosts', 'post1'), {
        userId: 'bob',
        text: 'Impersonation',
        likes: 0,
        likedBy: [],
        commentCount: 0,
      }),
    );
  });

  it('allows a user to like a post (increment by 1, add self to likedBy)', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const db = alice.firestore();
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'communityPosts', 'post1'), {
        userId: 'bob',
        text: 'Hello',
        likes: 0,
        likedBy: [],
        commentCount: 0,
      });
    });
    await assertSucceeds(
      updateDoc(doc(db, 'communityPosts', 'post1'), {
        likes: 1,
        likedBy: ['alice'],
      }),
    );
  });

  it('allows a user to unlike a post (decrement by 1, remove self from likedBy)', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const db = alice.firestore();
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'communityPosts', 'post1'), {
        userId: 'bob',
        text: 'Hello',
        likes: 1,
        likedBy: ['alice'],
        commentCount: 0,
      });
    });
    await assertSucceeds(
      updateDoc(doc(db, 'communityPosts', 'post1'), {
        likes: 0,
        likedBy: [],
      }),
    );
  });

  it('denies setting likes to arbitrary value', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const db = alice.firestore();
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'communityPosts', 'post1'), {
        userId: 'bob',
        text: 'Hello',
        likes: 5,
        likedBy: ['bob', 'charlie', 'dave', 'eve', 'frank'],
        commentCount: 0,
      });
    });
    await assertFails(
      updateDoc(doc(db, 'communityPosts', 'post1'), {
        likes: 999,
        likedBy: ['bob', 'charlie', 'dave', 'eve', 'frank', 'alice'],
      }),
    );
  });

  it('denies a user from removing another user from likedBy', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const db = alice.firestore();
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'communityPosts', 'post1'), {
        userId: 'bob',
        text: 'Hello',
        likes: 2,
        likedBy: ['alice', 'charlie'],
        commentCount: 0,
      });
    });
    // Alice tries to remove charlie — should fail
    await assertFails(
      updateDoc(doc(db, 'communityPosts', 'post1'), {
        likes: 1,
        likedBy: ['alice'],
      }),
    );
  });

  it('denies liking a post the user already liked', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const db = alice.firestore();
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'communityPosts', 'post1'), {
        userId: 'bob',
        text: 'Hello',
        likes: 1,
        likedBy: ['alice'],
        commentCount: 0,
      });
    });
    // Alice already in likedBy — can't like again
    await assertFails(
      updateDoc(doc(db, 'communityPosts', 'post1'), {
        likes: 2,
        likedBy: ['alice', 'alice'],
      }),
    );
  });

  it('allows incrementing commentCount by 1', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const db = alice.firestore();
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'communityPosts', 'post1'), {
        userId: 'bob',
        text: 'Hello',
        likes: 0,
        likedBy: [],
        commentCount: 3,
      });
    });
    await assertSucceeds(
      updateDoc(doc(db, 'communityPosts', 'post1'), {
        commentCount: 4,
      }),
    );
  });

  it('denies decrementing commentCount', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const db = alice.firestore();
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'communityPosts', 'post1'), {
        userId: 'bob',
        text: 'Hello',
        likes: 0,
        likedBy: [],
        commentCount: 3,
      });
    });
    await assertFails(
      updateDoc(doc(db, 'communityPosts', 'post1'), {
        commentCount: 2,
      }),
    );
  });

  it('allows post owner to update content but not counters', async () => {
    const bob = testEnv.authenticatedContext('bob');
    const db = bob.firestore();
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'communityPosts', 'post1'), {
        userId: 'bob',
        text: 'Hello',
        likes: 5,
        likedBy: ['alice', 'charlie', 'dave', 'eve', 'frank'],
        commentCount: 2,
      });
    });
    await assertSucceeds(
      updateDoc(doc(db, 'communityPosts', 'post1'), {
        text: 'Updated text',
      }),
    );
  });

  it('denies post owner from manipulating likes directly', async () => {
    const bob = testEnv.authenticatedContext('bob');
    const db = bob.firestore();
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'communityPosts', 'post1'), {
        userId: 'bob',
        text: 'Hello',
        likes: 5,
        likedBy: ['alice', 'charlie', 'dave', 'eve', 'frank'],
        commentCount: 2,
      });
    });
    await assertFails(
      updateDoc(doc(db, 'communityPosts', 'post1'), {
        text: 'Updated',
        likes: 100,
      }),
    );
  });

  it('allows post owner to delete their post', async () => {
    const bob = testEnv.authenticatedContext('bob');
    const db = bob.firestore();
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'communityPosts', 'post1'), {
        userId: 'bob',
        text: 'Hello',
        likes: 0,
        likedBy: [],
        commentCount: 0,
      });
    });
    const { deleteDoc } = await import('firebase/firestore');
    await assertSucceeds(deleteDoc(doc(db, 'communityPosts', 'post1')));
  });

  it('denies non-owner from deleting a post', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const db = alice.firestore();
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'communityPosts', 'post1'), {
        userId: 'bob',
        text: 'Hello',
        likes: 0,
        likedBy: [],
        commentCount: 0,
      });
    });
    const { deleteDoc } = await import('firebase/firestore');
    await assertFails(deleteDoc(doc(db, 'communityPosts', 'post1')));
  });
});

describe('User rounds rules', () => {
  it('allows a user to write their own rounds', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const db = alice.firestore();
    await assertSucceeds(
      setDoc(doc(db, 'users', 'alice', 'rounds', 'round1'), {
        courseId: 'c1',
        inProgress: true,
      }),
    );
  });

  it('allows a user to read their own rounds', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const db = alice.firestore();
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'users', 'alice', 'rounds', 'round1'), {
        courseId: 'c1',
      });
    });
    await assertSucceeds(getDoc(doc(db, 'users', 'alice', 'rounds', 'round1')));
  });

  it('denies a user from reading another user rounds', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const db = alice.firestore();
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'users', 'bob', 'rounds', 'round1'), {
        courseId: 'c1',
      });
    });
    await assertFails(getDoc(doc(db, 'users', 'bob', 'rounds', 'round1')));
  });

  it('denies a user from writing another user rounds', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const db = alice.firestore();
    await assertFails(
      setDoc(doc(db, 'users', 'bob', 'rounds', 'round1'), {
        courseId: 'c1',
        inProgress: true,
      }),
    );
  });
});

describe('Content collections — read-only for auth users', () => {
  it('allows auth user to read golf clubs', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const db = alice.firestore();
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'golfClubs', 'c1'), { name: 'Test Club' });
    });
    await assertSucceeds(getDoc(doc(db, 'golfClubs', 'c1')));
  });

  it('denies auth user from writing golf clubs', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const db = alice.firestore();
    await assertFails(
      setDoc(doc(db, 'golfClubs', 'c1'), { name: 'Hacked Club' }),
    );
  });

  it('allows auth user to read articles', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const db = alice.firestore();
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'articles', 'a1'), { title: 'Test' });
    });
    await assertSucceeds(getDoc(doc(db, 'articles', 'a1')));
  });

  it('allows auth user to read coach data', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const db = alice.firestore();
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'golfCenterCoaches', 'coach1'), {
        name: 'Pro',
      });
    });
    await assertSucceeds(getDoc(doc(db, 'golfCenterCoaches', 'coach1')));
  });
});

describe('Unauthenticated access', () => {
  it('denies unauthenticated read on users', async () => {
    const unauth = testEnv.unauthenticatedContext();
    const db = unauth.firestore();
    await assertFails(getDoc(doc(db, 'users', 'alice')));
  });

  it('denies unauthenticated read on community posts', async () => {
    const unauth = testEnv.unauthenticatedContext();
    const db = unauth.firestore();
    await assertFails(getDoc(doc(db, 'communityPosts', 'post1')));
  });

  it('denies unauthenticated read on articles', async () => {
    const unauth = testEnv.unauthenticatedContext();
    const db = unauth.firestore();
    await assertFails(getDoc(doc(db, 'articles', 'a1')));
  });

  it('denies unauthenticated read on golf clubs', async () => {
    const unauth = testEnv.unauthenticatedContext();
    const db = unauth.firestore();
    await assertFails(getDoc(doc(db, 'golfClubs', 'c1')));
  });

  it('denies unauthenticated write on any collection', async () => {
    const unauth = testEnv.unauthenticatedContext();
    const db = unauth.firestore();
    await assertFails(
      setDoc(doc(db, 'users', 'hacker'), { displayName: 'Hacker' }),
    );
    await assertFails(
      setDoc(doc(db, 'communityPosts', 'spam'), {
        userId: 'hacker',
        text: 'spam',
      }),
    );
  });
});
