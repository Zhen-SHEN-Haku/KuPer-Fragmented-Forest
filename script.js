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
function search() {
    const searchBox = document.getElementById('searchBox');
    const results = document.getElementById('results');
    // 在这里实现搜索逻辑
    results.innerHTML = `搜索结果: ${searchBox.value}`;
}

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