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