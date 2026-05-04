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

    // Get all posts
    async getPosts() {
        const snapshot = await db.collection(this.POSTS)
            .orderBy('createdAt', 'desc')
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    // Get a single post
    async getPost(id) {
        const doc = await db.collection(this.POSTS).doc(id).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    },

    // Vote on a post
    async votePost(id, type) {
        const increment = firebase.firestore.FieldValue.increment(1);
        const decrement = firebase.firestore.FieldValue.increment(-1);
        const updateData = {};
        
        if (type === 'up') {
            updateData.likes = increment;
            updateData.score = increment;
        } else {
            updateData.dislikes = increment;
            updateData.score = decrement;
        }
        
        return await db.collection(this.POSTS).doc(id).update(updateData);
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

    // Vote on a comment
    async voteComment(postId, commentId, type) {
        const increment = firebase.firestore.FieldValue.increment(1);
        const decrement = firebase.firestore.FieldValue.increment(-1);
        const updateData = {};
        
        if (type === 'up') {
            updateData.likes = increment;
            updateData.score = increment;
        } else {
            updateData.dislikes = increment;
            updateData.score = decrement;
        }
        
        return await db.collection(this.POSTS).doc(postId).collection(this.COMMENTS).doc(commentId).update(updateData);
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
