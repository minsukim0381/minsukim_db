/**
 * Board Logic - CRUD Operations for Firestore
 */

const Board = {
    // collection names
    POSTS: 'posts',
    COMMENTS: 'comments',

    // Create a new post
    async createPost(title, author, content) {
        return await db.collection(this.POSTS).add({
            title,
            author,
            content,
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

    // Update a post
    async updatePost(id, title, content) {
        return await db.collection(this.POSTS).doc(id).update({
            title,
            content,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    },

    // Delete a post
    async deletePost(id) {
        return await db.collection(this.POSTS).doc(id).delete();
    },

    // --- Comments ---

    // Add a comment
    async addComment(postId, author, content) {
        return await db.collection(this.POSTS).doc(postId).collection(this.COMMENTS).add({
            author,
            content,
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

    // Delete a comment
    async deleteComment(postId, commentId) {
        return await db.collection(this.POSTS).doc(postId)
            .collection(this.COMMENTS).doc(commentId).delete();
    }
};
