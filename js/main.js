/**
 * Main UI Logic and Routing
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const sections = {
        home: document.getElementById('home-section'),
        board: document.getElementById('board-section'),
        write: document.getElementById('write-section'),
        view: document.getElementById('view-section')
    };

    const navItems = document.querySelectorAll('.nav-item');
    const boardNav = document.getElementById('board-nav');
    const homeLink = document.getElementById('home-link');
    const writeBtn = document.getElementById('write-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const postForm = document.getElementById('post-form');
    const postList = document.getElementById('post-list');
    const backToListBtn = document.getElementById('back-to-list');
    const commentForm = document.getElementById('comment-form');

    let currentPostId = null;

    // --- Navigation ---
    function showSection(sectionKey) {
        Object.values(sections).forEach(s => s.classList.add('hidden'));
        sections[sectionKey].classList.remove('hidden');
        
        // Update nav active state
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.id === `${sectionKey}-nav`) item.classList.add('active');
        });

        if (sectionKey === 'board') loadPosts();
    }

    homeLink.addEventListener('click', () => showSection('home'));
    boardNav.addEventListener('click', (e) => {
        e.preventDefault();
        showSection('board');
    });

    // --- Board Interactions ---
    writeBtn.addEventListener('click', () => {
        document.getElementById('form-title').innerText = '게시글 작성';
        postForm.reset();
        document.getElementById('post-id').value = '';
        showSection('write');
    });

    cancelBtn.addEventListener('click', () => showSection('board'));
    backToListBtn.addEventListener('click', () => showSection('board'));

    // Handle form submission (Create/Update)
    postForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('post-id').value;
        const title = document.getElementById('title').value;
        const author = document.getElementById('author').value;
        const content = document.getElementById('content').value;

        try {
            if (id) {
                await Board.updatePost(id, title, content);
                alert('수정되었습니다.');
            } else {
                await Board.createPost(title, author, content);
                alert('등록되었습니다.');
            }
            showSection('board');
        } catch (error) {
            console.error(error);
            alert('오류가 발생했습니다. Firebase 설정을 확인하세요.');
        }
    });

    // Load Posts
    async function loadPosts() {
        postList.innerHTML = '<div class="loading">게시글을 불러오는 중...</div>';
        try {
            const posts = await Board.getPosts();
            if (posts.length === 0) {
                postList.innerHTML = '<div class="empty">게시글이 없습니다.</div>';
                return;
            }

            postList.innerHTML = posts.map(post => `
                <div class="post-item" onclick="viewPost('${post.id}')">
                    <div class="post-info">
                        <h4>${post.title}</h4>
                        <div class="post-meta">
                            <span>${post.author}</span> | 
                            <span>${post.createdAt ? post.createdAt.toDate().toLocaleDateString() : '방금 전'}</span>
                        </div>
                    </div>
                    <i class="fas fa-chevron-right"></i>
                </div>
            `).join('');
        } catch (error) {
            postList.innerHTML = '<div class="error">Firebase 설정을 완료한 후 이용해주세요.</div>';
        }
    }

    // View Post
    window.viewPost = async (id) => {
        currentPostId = id;
        showSection('view');
        const postDetail = document.getElementById('post-detail');
        postDetail.innerHTML = '불러오는 중...';

        try {
            const post = await Board.getPost(id);
            postDetail.innerHTML = `
                <div class="post-view-header">
                    <h2>${post.title}</h2>
                    <div class="post-meta">
                        <span>작성자: ${post.author}</span> | 
                        <span>작동일: ${post.createdAt ? post.createdAt.toDate().toLocaleString() : ''}</span>
                    </div>
                </div>
                <div class="post-content" style="padding: 20px 0; min-height: 200px; white-space: pre-wrap;">${post.content}</div>
                <div class="post-actions" style="display: flex; gap: 10px; margin-bottom: 20px;">
                    <button class="secondary-btn" onclick="editPost('${post.id}')">수정</button>
                    <button class="secondary-btn" style="color: red;" onclick="deletePost('${post.id}')">삭제</button>
                </div>
            `;
            loadComments(id);
        } catch (error) {
            postDetail.innerHTML = '글을 불러오지 못했습니다.';
        }
    };

    // Edit Post
    window.editPost = async (id) => {
        const post = await Board.getPost(id);
        document.getElementById('form-title').innerText = '게시글 수정';
        document.getElementById('post-id').value = post.id;
        document.getElementById('title').value = post.title;
        document.getElementById('author').value = post.author;
        document.getElementById('content').value = post.content;
        showSection('write');
    };

    // Delete Post
    window.deletePost = async (id) => {
        if (confirm('정말 삭제하시겠습니까?')) {
            await Board.deletePost(id);
            alert('삭제되었습니다.');
            showSection('board');
        }
    };

    // --- Comments ---
    commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const author = document.getElementById('comment-author').value;
        const content = document.getElementById('comment-content').value;

        await Board.addComment(currentPostId, author, content);
        commentForm.reset();
        loadComments(currentPostId);
    });

    async function loadComments(postId) {
        const commentList = document.getElementById('comment-list');
        const comments = await Board.getComments(postId);
        
        if (comments.length === 0) {
            commentList.innerHTML = '<p style="color: #999; font-size: 0.9rem;">댓글이 없습니다.</p>';
            return;
        }

        commentList.innerHTML = comments.map(c => `
            <div class="comment-item">
                <div class="comment-meta">
                    ${c.author} <span style="font-weight: 400; color: #999; font-size: 0.8rem;">(${c.createdAt ? c.createdAt.toDate().toLocaleString() : '방금 전'})</span>
                </div>
                <div class="comment-text">${c.content}</div>
                <button onclick="deleteComment('${postId}', '${c.id}')" style="background: none; border: none; color: #ff4d4d; font-size: 0.75rem; cursor: pointer; padding: 0; margin-top: 5px;">삭제</button>
            </div>
        `).join('');
    }

    window.deleteComment = async (postId, commentId) => {
        if (confirm('댓글을 삭제하시겠습니까?')) {
            await Board.deleteComment(postId, commentId);
            loadComments(postId);
        }
    };

    // --- Club Tabs ---
    const clubTabs = document.querySelectorAll('.club-tab');
    const clubName = document.getElementById('club-name');
    const clubDesc = document.getElementById('club-desc');
    const clubImg = document.getElementById('club-img');

    const clubData = {
        'MAS': { desc: '모바일 로봇 및 자율주행 연구 동아리입니다.', img: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=150' },
        'MCA': { desc: '로봇 제어 알고리즘 및 소프트웨어 개발 동아리입니다.', img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=150' },
        'MoAS': { desc: '드론 및 무인 항공 시스템 연구 동아리입니다.', img: 'https://images.unsplash.com/photo-1473968512647-3e44a224fe8f?auto=format&fit=crop&q=80&w=150' },
        'SMART': { desc: '스마트 팩토리 및 자동화 시스템 구축 동아리입니다.', img: 'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?auto=format&fit=crop&q=80&w=150' },
        'UR': { desc: '유니버설 로봇 및 협동 로봇 응용 동아리입니다.', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=150' },
        'IR': { desc: '지능형 로봇 및 AI 비전 연구 동아리입니다.', img: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&q=80&w=150' }
    };

    clubTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            clubTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const club = tab.getAttribute('data-club');
            clubName.innerText = club === 'IR' ? '지능형로봇' : club;
            clubDesc.innerText = clubData[club].desc;
            clubImg.src = clubData[club].img;
        });
    });
});
