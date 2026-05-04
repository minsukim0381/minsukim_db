/**
 * Main UI Logic for index.html (Homepage)
 */

document.addEventListener('DOMContentLoaded', () => {
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
