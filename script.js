// 深色模式切换功能
const darkModeToggle = document.getElementById('darkModeToggle');
const htmlElement = document.documentElement;

// 检查本地存储中的主题设置
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
}

darkModeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// 搜索功能
function search(keyword) {
    const searchDropdown = document.querySelector('.search-dropdown');
    searchDropdown.innerHTML = '';
    
    if (!keyword.trim()) {
        searchDropdown.style.display = 'none';
        return;
    }

    const results = [];
    const addedTexts = new Set();

    // 搜索当前页面内容
    const contentElements = document.querySelectorAll('.faq-item li label, .about-section p, .profile-text');
    contentElements.forEach(element => {
        const text = element.textContent.trim();
        if (text.toLowerCase().includes(keyword.toLowerCase()) && !addedTexts.has(text)) {
            let nearestHeading = element.closest('.faq-item')?.querySelector('h4')?.textContent || 
                               element.closest('.faq-section')?.querySelector('h3')?.textContent ||
                               element.closest('section')?.querySelector('h2')?.textContent ||
                               '页面内容';
            
            const highlightedText = text.replace(
                new RegExp(keyword, 'gi'),
                match => `<span class="highlight-text">${match}</span>`
            );

            results.push({
                text: highlightedText,
                element: element,
                section: nearestHeading,
                type: 'current'
            });
            addedTexts.add(text);
        }
    });

    // 搜索其他页面内容
    if (typeof siteSearchIndex !== 'undefined') {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        
        siteSearchIndex.pages.forEach(page => {
            if (page.url !== currentPath) {
                page.content.forEach(content => {
                    if (content.text.toLowerCase().includes(keyword.toLowerCase()) && !addedTexts.has(content.text)) {
                        const highlightedText = content.text.replace(
                            new RegExp(keyword, 'gi'),
                            match => `<span class="highlight-text">${match}</span>`
                        );

                        results.push({
                            text: highlightedText,
                            section: content.section,
                            type: 'external',
                            url: page.url,
                            title: page.title
                        });
                        addedTexts.add(content.text);
                    }
                });
            }
        });
    }

    // 搜索讨论区内容
    comments.forEach((comment, index) => {
        if (comment.text.toLowerCase().includes(keyword.toLowerCase())) {
            results.push({
                text: comment.text,
                section: '讨论区评论',
                type: 'current'
            });
        }
        comment.replies.forEach(reply => {
            if (reply.text.toLowerCase().includes(keyword.toLowerCase())) {
                results.push({
                    text: reply.text,
                    section: '讨论区回复',
                    type: 'current'
                });
            }
        });
    });

    if (results.length > 0) {
        searchDropdown.style.display = 'block';
        results.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            
            if (result.type === 'current') {
                resultItem.innerHTML = `
                    <div class="result-section">${result.section}</div>
                    <div class="result-text">${result.text}</div>
                `;
                resultItem.addEventListener('click', () => {
                    result.element.scrollIntoView({ behavior: 'smooth' });
                    searchDropdown.style.display = 'none';
                    searchBox.value = '';
                });
            } else {
                resultItem.innerHTML = `
                    <div class="result-section">${result.title} - ${result.section}</div>
                    <div class="result-text">${result.text}</div>
                `;
                resultItem.addEventListener('click', () => {
                    window.location.href = result.url;
                });
            }
            
            searchDropdown.appendChild(resultItem);
        });
    } else {
        searchDropdown.style.display = 'block';
        const noResult = document.createElement('div');
        noResult.className = 'search-result-item no-result';
        noResult.textContent = '无相关内容';
        searchDropdown.appendChild(noResult);
    }
}

// 实时搜索
searchBox.addEventListener('input', (e) => {
    search(e.target.value);
});

// 回车搜索
searchBox.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        search(e.target.value);
    }
});

// 点击外部关闭搜索结果
document.addEventListener('click', (e) => {
    if (!searchBox.contains(e.target) && !searchDropdown.contains(e.target)) {
        searchDropdown.style.display = 'none';
    }
});

// 邮件复制功能
const emailContainer = document.querySelector('.email-container');
const copyBtn = document.querySelector('.copy-btn');

// 阻止邮件容器的点击事件导致页面跳转
emailContainer.addEventListener('click', (e) => {
    e.preventDefault();
    const email = copyBtn.getAttribute('data-email');
    copyToClipboard(email);
});

// 复制按钮点击事件
copyBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const email = copyBtn.getAttribute('data-email');
    copyToClipboard(email);
});

// 复制功能
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        
        // 显示复制成功提示
        const successMsg = document.createElement('div');
        successMsg.textContent = '邮箱地址已复制';
        successMsg.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 10px 20px;
            background-color: ${getComputedStyle(document.documentElement).getPropertyValue('--header-bg')};
            color: ${getComputedStyle(document.documentElement).getPropertyValue('--text-color')};
            border-radius: 4px;
            box-shadow: 0 2px 8px ${getComputedStyle(document.documentElement).getPropertyValue('--shadow')};
            z-index: 10000;
        `;
        
        document.body.appendChild(successMsg);
        setTimeout(() => {
            successMsg.remove();
        }, 2000);
    } catch (err) {
        console.error('复制失败:', err);
    }
} 

let comments = [];

function getUserDeviceInfo() {
    return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language,
        timestamp: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        referrer: document.referrer,
        browserInfo: {
            cookiesEnabled: navigator.cookieEnabled,
            language: navigator.language,
            onLine: navigator.onLine,
            doNotTrack: navigator.doNotTrack,
            vendor: navigator.vendor
        }
    };
}

function addComment() {
    const commentText = document.getElementById('newComment').value.trim();
    if (commentText) {
        const deviceInfo = getUserDeviceInfo();
        const newComment = {
            text: commentText,
            timestamp: new Date().toLocaleString(),
            replies: [],
            deviceInfo: deviceInfo,
            id: Date.now() + Math.random().toString(36).substr(2, 9) 
        };
        
        // 将评论保存到 localStorage
        comments.push(newComment);
        localStorage.setItem(`comments_${window.location.pathname}`, JSON.stringify(comments));
        
        // 如果你想将数据发送到服务器，可以使用：
        // sendToServer(newComment);
        
        document.getElementById('newComment').value = '';
        renderComments();
    }
}

// 页面加载时加载评论
document.addEventListener('DOMContentLoaded', () => {
    // 从 localStorage 加载当前页面的评论
    const savedComments = localStorage.getItem(`comments_${window.location.pathname}`);
    if (savedComments) {
        comments = JSON.parse(savedComments);
        renderComments();
    }
    
    // 设置固定讨论区功能
    const pinToggle = document.querySelector('.pin-toggle');
    const content = document.querySelector('.content');
    const discussionContainer = document.querySelector('.discussion-container');
    
    // 如果是移动端，直接隐藏图钉按钮
    if (isMobileDevice()) {
        pinToggle.style.display = 'none';
    } else {
        pinToggle.addEventListener('click', function() {
            this.classList.toggle('pinned');
            content.classList.toggle('with-discussion');
            discussionContainer.classList.toggle('pinned');
            
            if (discussionContainer.classList.contains('pinned')) {
                // 固定讨论区
                document.body.style.paddingRight = '30%';
                content.style.maxWidth = '68%';
            } else {
                // 取消固定
                document.body.style.paddingRight = '0';
                content.style.maxWidth = '100%';
            }
        });

        // 监听窗口大小变化
        window.addEventListener('resize', () => {
            if (isMobileDevice()) {
                pinToggle.style.display = 'none';
                // 如果处于固定状态，取消固定
                if (discussionContainer.classList.contains('pinned')) {
                    pinToggle.click();
                }
            } else {
                pinToggle.style.display = 'flex';
            }
        });
    }
});

function isMobileDevice() {
    return (window.innerWidth <= 768) || /Mobi|Android/i.test(navigator.userAgent);
}

function renderComments() {
    const commentsList = document.getElementById('commentsList');
    commentsList.innerHTML = '';
    
    comments.forEach((comment, index) => {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        commentElement.innerHTML = `
            <p>${comment.text}</p>
            <span class="timestamp">${comment.timestamp}</span>
            <button class="reply-button" onclick="replyToComment(${index})">回复</button>
            <button class="admin-info-button" onclick="showDeviceInfo(${index})">查看设备信息</button>
            <div class="replies">
                ${comment.replies.map(reply => `
                    <div class="reply">
                        <p>${reply.text}</p>
                        <span class="timestamp">${reply.timestamp}</span>
                    </div>
                `).join('')}
            </div>
        `;
        commentsList.appendChild(commentElement);
    });
}


function showDeviceInfo(index) {
    const comment = comments[index];
    const deviceInfo = comment.deviceInfo;
    
    const infoDialog = document.createElement('div');
    infoDialog.className = 'device-info-dialog';
    infoDialog.innerHTML = `
        <div class="device-info-content">
            <h3>设备信息</h3>
            <p>浏览器: ${deviceInfo.userAgent}</p>
            <p>平台: ${deviceInfo.platform}</p>
            <p>分辨率: ${deviceInfo.screenResolution}</p>
            <p>语言: ${deviceInfo.language}</p>
            <p>时区: ${deviceInfo.timezone}</p>
            <p>来源页面: ${deviceInfo.referrer || '直接访问'}</p>
            <button onclick="this.parentElement.parentElement.remove()">关闭</button>
        </div>
    `;
    
    document.body.appendChild(infoDialog);
}

function replyToComment(index) {
    const replyText = prompt('输入你的回复:');
    if (replyText) {
        const reply = {
            text: replyText,
            timestamp: new Date().toLocaleString()
        };
        comments[index].replies.push(reply);
        renderComments();
    }
} 