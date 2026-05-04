/**
 * Board UI Logic for board.html
 */

document.addEventListener('DOMContentLoaded', () => {
    const views = {
        list: document.getElementById('board-list-view'),
        write: document.getElementById('write-view'),
        detail: document.getElementById('detail-view')
    };

    const postList = document.getElementById('post-list');
    const postForm = document.getElementById('post-form');
    const commentForm = document.getElementById('comment-form');
    let currentPostId = null;

    function showView(viewKey) {
        Object.values(views).forEach(v => v.classList.add('hidden'));
        views[viewKey].classList.remove('hidden');
        if (viewKey === 'list') loadPosts();
    }

    // Event Listeners
    document.getElementById('write-btn').addEventListener('click', () => showView('write'));
    document.getElementById('cancel-btn').addEventListener('click', () => showView('list'));
    document.getElementById('back-to-list').addEventListener('click', () => showView('list'));

    // Create Post
    postForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('title').value;
        const author = document.getElementById('author').value;
        const password = document.getElementById('password').value;
        const content = document.getElementById('content').value;

        try {
            await Board.createPost(title, author, content, password);
            alert('게시글이 등록되었습니다.');
            postForm.reset();
            showView('list');
        } catch (error) {
            alert('저장 실패: ' + error.message);
        }
    });

    // Load Posts
    async function loadPosts() {
        postList.innerHTML = '<div class="loading">불러오는 중...</div>';
        try {
            const posts = await Board.getPosts();
            if (posts.length === 0) {
                postList.innerHTML = '<div class="empty">게시글이 없습니다.</div>';
                return;
            }

            postList.innerHTML = posts.map(post => `
                <div class="post-item" onclick="viewPost('${post.id}')">
                    <div class="post-info">
                        <h4>
                            <span class="score-badge">
                                <i class="fas fa-star"></i> ${post.score || 0}
                            </span>
                            ${post.title}
                        </h4>
                        <div class="post-meta">
                            <span>${post.author}</span> | 
                            <span>${post.createdAt ? post.createdAt.toDate().toLocaleDateString() : '방금 전'}</span>
                        </div>
                    </div>
                    <i class="fas fa-chevron-right"></i>
                </div>
            `).join('');
        } catch (error) {
            postList.innerHTML = '<div class="error">데이터를 불러오지 못했습니다.</div>';
        }
    }

    // View Detail
    window.viewPost = async (id) => {
        currentPostId = id;
        showView('detail');
        const detailDiv = document.getElementById('post-detail');
        detailDiv.innerHTML = '불러오는 중...';

        try {
            const post = await Board.getPost(id);
            const votes = JSON.parse(localStorage.getItem('votes_data') || '{}');
            const myVote = votes[id] || 'none';

            detailDiv.innerHTML = `
                <div class="post-view-header">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <h2>${post.title}</h2>
                        <div class="score-badge" style="font-size: 1.2rem; padding: 5px 15px;">
                             점수: ${post.score || 0}
                        </div>
                    </div>
                    <div class="post-meta">
                        <span>작성자: ${post.author}</span> | 
                        <span>작성일: ${post.createdAt ? post.createdAt.toDate().toLocaleString() : ''}</span>
                    </div>
                </div>
                <div class="post-content" style="padding: 30px 0; min-height: 200px; white-space: pre-wrap; font-size: 1.1rem;">${post.content}</div>
                
                <div class="post-footer" style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #eee; padding-top: 20px;">
                    <div class="vote-btns">
                        <button class="vote-btn up ${myVote === 'up' ? 'active' : ''}" onclick="vote('post', '${id}', 'up')">
                            <i class="fas fa-thumbs-up"></i> 추천 ${post.likes || 0}
                        </button>
                        <button class="vote-btn down ${myVote === 'down' ? 'active' : ''}" onclick="vote('post', '${id}', 'down')">
                            <i class="fas fa-thumbs-down"></i> 비추천 ${post.dislikes || 0}
                        </button>
                    </div>
                    <div class="delete-area" style="display: flex; gap: 10px;">
                        <input type="password" id="delete-pw-${id}" placeholder="비밀번호" class="password-input">
                        <button class="secondary-btn" style="color: red; padding: 5px 15px;" onclick="deleteContent('post', '${id}')">삭제</button>
                    </div>
                </div>
            `;
            loadComments(id);
        } catch (error) {
            detailDiv.innerHTML = '글을 불러올 수 없습니다.';
        }
    };

    // Voting logic with localStorage tracking
    window.vote = async (target, id, type, commentId = null) => {
        const contentId = commentId || id;
        const storageKey = 'votes_data';
        let votes = JSON.parse(localStorage.getItem(storageKey) || '{}');
        const currentVote = votes[contentId] || 'none';

        let lDelta = 0, dDelta = 0, sDelta = 0;

        if (type === 'up') {
            if (currentVote === 'none') {
                lDelta = 1; sDelta = 1;
                votes[contentId] = 'up';
            } else if (currentVote === 'up') {
                lDelta = -1; sDelta = -1;
                votes[contentId] = 'none';
            } else if (currentVote === 'down') {
                lDelta = 1; dDelta = -1; sDelta = 2;
                votes[contentId] = 'up';
            }
        } else if (type === 'down') {
            if (currentVote === 'none') {
                dDelta = 1; sDelta = -1;
                votes[contentId] = 'down';
            } else if (currentVote === 'down') {
                dDelta = -1; sDelta = 1;
                votes[contentId] = 'none';
            } else if (currentVote === 'up') {
                dDelta = 1; lDelta = -1; sDelta = -2;
                votes[contentId] = 'down';
            }
        }

        try {
            if (target === 'post') {
                await Board.votePost(id, lDelta, dDelta, sDelta);
                localStorage.setItem(storageKey, JSON.stringify(votes));
                viewPost(id);
            } else {
                await Board.voteComment(id, commentId, lDelta, dDelta, sDelta);
                localStorage.setItem(storageKey, JSON.stringify(votes));
                loadComments(id);
            }
        } catch (error) {
            alert('투표 실패: ' + error.message);
        }
    };

    // Deleting
    window.deleteContent = async (target, id, commentId = null) => {
        const pwInput = document.getElementById(`delete-pw-${commentId || id}`);
        const password = pwInput.value;

        if (!password) {
            alert('비밀번호를 입력하세요.');
            return;
        }

        try {
            if (target === 'post') {
                await Board.deletePost(id, password);
                alert('게시글이 삭제되었습니다.');
                showView('list');
            } else {
                await Board.deleteComment(id, commentId, password);
                alert('댓글이 삭제되었습니다.');
                loadComments(id);
            }
        } catch (error) {
            alert(error.message);
        }
    };

    // Comments
    commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const author = document.getElementById('comment-author').value;
        const password = document.getElementById('comment-password').value;
        const content = document.getElementById('comment-content').value;

        try {
            await Board.addComment(currentPostId, author, content, password);
            commentForm.reset();
            loadComments(currentPostId);
        } catch (error) {
            alert('댓글 등록 실패');
        }
    });

    async function loadComments(postId) {
        const commentList = document.getElementById('comment-list');
        try {
            const comments = await Board.getComments(postId);
            const votes = JSON.parse(localStorage.getItem('votes_data') || '{}');

            if (comments.length === 0) {
                commentList.innerHTML = '<p style="color: #999; font-size: 0.9rem; padding: 20px 0;">댓글이 없습니다.</p>';
                return;
            }

            commentList.innerHTML = comments.map(c => {
                const myVote = votes[c.id] || 'none';
                return `
                <div class="comment-item" style="border-left: 4px solid var(--accent-color);">
                    <div style="display: flex; justify-content: space-between;">
                        <div class="comment-meta">
                            <strong>${c.author}</strong> 
                            <span class="score-badge" style="font-size: 0.75rem; margin-left: 10px;">점수: ${c.score || 0}</span>
                            <span style="font-weight: 400; color: #999; font-size: 0.8rem; margin-left: 10px;">${c.createdAt ? c.createdAt.toDate().toLocaleString() : ''}</span>
                        </div>
                        <div class="delete-area">
                            <input type="password" id="delete-pw-${c.id}" placeholder="PW" class="password-input" style="width: 60px !important;">
                            <button onclick="deleteContent('comment', '${postId}', '${c.id}')" style="background: none; border: none; color: #ff4d4d; font-size: 0.8rem; cursor: pointer;">삭제</button>
                        </div>
                    </div>
                    <div class="comment-text" style="margin: 10px 0;">${c.content}</div>
                    <div class="vote-btns">
                        <button class="vote-btn ${myVote === 'up' ? 'active' : ''}" onclick="vote('comment', '${postId}', 'up', '${c.id}')" style="font-size: 0.75rem;">
                            <i class="fas fa-thumbs-up"></i> ${c.likes || 0}
                        </button>
                        <button class="vote-btn ${myVote === 'down' ? 'active' : ''}" onclick="vote('comment', '${postId}', 'down', '${c.id}')" style="font-size: 0.75rem;">
                            <i class="fas fa-thumbs-down"></i> ${c.dislikes || 0}
                        </button>
                    </div>
                </div>
            `;}).join('');
        } catch (error) {
            commentList.innerHTML = '댓글을 불러오지 못했습니다.';
        }
    }

    // Initialize
    loadPosts();
});
