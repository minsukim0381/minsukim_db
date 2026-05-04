/**
 * Board Logic - CRUD Operations for Firestore
 */

const Board = {
    // collection names
    POSTS: 'posts',
    COMMENTS: 'comments',
    REPLIES: 'replies',

    // Create a new post with password
    async createPost(title, author, content, password) {
        return await db.collection(this.POSTS).add({
            title,
            author,
            content,
            password, // Store password (plain text for simplicity, or should be hashed?)
            score: 0,
            likes: 0,
            dislikes: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    },

    // Get all posts with sorting
    async getPosts(sortBy = 'latest') {
        let query = db.collection(this.POSTS);
        
        if (sortBy === 'latest') {
            query = query.orderBy('createdAt', 'desc');
        } else if (sortBy === 'oldest') {
            query = query.orderBy('createdAt', 'asc');
        } else if (sortBy === 'popular') {
            query = query.orderBy('likes', 'desc');
        }
        
        const snapshot = await query.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    // Get a single post
    async getPost(id) {
        const doc = await db.collection(this.POSTS).doc(id).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    },

    // Flexible vote on a post
    async votePost(id, likesDelta, dislikesDelta, scoreDelta) {
        return await db.collection(this.POSTS).doc(id).update({
            likes: firebase.firestore.FieldValue.increment(likesDelta),
            dislikes: firebase.firestore.FieldValue.increment(dislikesDelta),
            score: firebase.firestore.FieldValue.increment(scoreDelta)
        });
    },

    // Delete a post with password check
    async deletePost(id, password) {
        const doc = await db.collection(this.POSTS).doc(id).get();
        if (doc.exists && doc.data().password === password) {
            return await db.collection(this.POSTS).doc(id).delete();
        } else {
            throw new Error('비밀번호가 일치하지 않습니다.');
        }
    },

    // --- Comments ---

    // Add a comment
    async addComment(postId, author, content, password) {
        return await db.collection(this.POSTS).doc(postId).collection(this.COMMENTS).add({
            author,
            content,
            password,
            score: 0,
            likes: 0,
            dislikes: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    },

    // Get comments for a post
    async getComments(postId) {
        const snapshot = await db.collection(this.POSTS).doc(postId)
            .collection(this.COMMENTS)
            .orderBy('createdAt', 'asc')
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    // Flexible vote on a comment
    async voteComment(postId, commentId, likesDelta, dislikesDelta, scoreDelta) {
        return await db.collection(this.POSTS).doc(postId).collection(this.COMMENTS).doc(commentId).update({
            likes: firebase.firestore.FieldValue.increment(likesDelta),
            dislikes: firebase.firestore.FieldValue.increment(dislikesDelta),
            score: firebase.firestore.FieldValue.increment(scoreDelta)
        });
    },

    // Delete a comment with password check
    async deleteComment(postId, commentId, password) {
        const doc = await db.collection(this.POSTS).doc(postId).collection(this.COMMENTS).doc(commentId).get();
        if (doc.exists && doc.data().password === password) {
            return await db.collection(this.POSTS).doc(postId).collection(this.COMMENTS).doc(commentId).delete();
        } else {
            throw new Error('비밀번호가 일치하지 않습니다.');
        }
    }
};
