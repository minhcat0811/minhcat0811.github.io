window.addEventListener('load', () => {
    const startupScreen = document.getElementById('startup-screen');
    setTimeout(() => {
        startupScreen.style.opacity = '0';
        startupScreen.style.transition = 'opacity 0.8s';
        setTimeout(() => {
            startupScreen.style.display = 'none';
        }, 800);
    }, 2000);
});

function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    
    const clockEl = document.getElementById('clock');
    if(clockEl) clockEl.innerText = `${hours}:${minutes} ${ampm}`;
}
setInterval(updateClock, 1000);
updateClock();

function openWindow(id, titleName) {
    const win = document.getElementById(id);
    if (win) {
        win.style.display = 'flex';
        bringToFront(win);
        
        const isMobile = window.innerWidth <= 768;
        const isPortrait = window.innerHeight > window.innerWidth;
        
        if (isMobile) {
            win.style.top = '50%';
            win.style.left = '50%';
            win.style.transform = 'translate(-50%, -50%)';
            win.style.margin = '0';
            
            if (isPortrait) {
                win.style.width = '95vw';
                win.style.height = '85vh';
            } else {
                win.style.width = '90vw';
                win.style.height = '80vh';
            }
        }

        addTaskbarItem(id, titleName || 'Window');
    }
}

function closeWindow(id) {
    const win = document.getElementById(id);
    if(win) {
        win.style.display = 'none';
        removeTaskbarItem(id);
    }
}

function addTaskbarItem(id, name) {
    const taskbarContainer = document.getElementById('taskbar-apps');
    let existingItem = document.getElementById(`tab-${id}`);
    
    if (!existingItem) {
        const item = document.createElement('div');
        item.className = 'taskbar-item active';
        item.id = `tab-${id}`;
        item.innerText = name;
        
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const win = document.getElementById(id);
            if (win.style.display === 'none') {
                openWindow(id, name);
            } else {
                bringToFront(win);
            }
        });
        
        taskbarContainer.appendChild(item);
    }
}

function removeTaskbarItem(id) {
    const item = document.getElementById(`tab-${id}`);
    if (item) {
        item.remove();
    }
}

let zIndexCounter = 100;
function bringToFront(element) {
    zIndexCounter++;
    element.style.zIndex = zIndexCounter;
    
    const allTabs = document.querySelectorAll('.taskbar-item');
    allTabs.forEach(t => {
        t.classList.remove('active');
    });
    
    const relatedTab = document.getElementById(`tab-${element.id}`);
    if(relatedTab) {
        relatedTab.classList.add('active');
    }
}

const windows = document.querySelectorAll('.window');

windows.forEach(win => {
    const titleBar = win.querySelector('.title-bar');
    const closeBtn = win.querySelector('.btn-close');

    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeWindow(win.id);
        });
        
        closeBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeWindow(win.id);
        });
    }

    titleBar.style.touchAction = 'none';
    
    win.addEventListener('pointerdown', (e) => {
        if (!e.target.closest('.btn-close')) {
            bringToFront(win);
        }
    });

    let isDragging = false;
    let startX, startY;
    let initialLeft, initialTop;

    titleBar.addEventListener('pointerdown', (e) => {
        if (e.target.classList.contains('btn-close') || e.target.closest('.btn-close')) {
            return;
        }
        
        e.preventDefault();
        isDragging = true;
        
        const rect = win.getBoundingClientRect();
        
        startX = e.clientX;
        startY = e.clientY;
        
        const computedStyle = window.getComputedStyle(win);
        const currentTransform = computedStyle.transform;
        
        if (currentTransform && currentTransform !== 'none') {
            win.style.transform = 'none';
            win.style.left = `${rect.left}px`;
            win.style.top = `${rect.top}px`;
        }
        
        initialLeft = parseFloat(win.style.left) || rect.left;
        initialTop = parseFloat(win.style.top) || rect.top;
        
        win.style.margin = '0';
        
        titleBar.setPointerCapture(e.pointerId);
        titleBar.style.cursor = 'grabbing';
    });

    titleBar.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        e.preventDefault();

        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        const newLeft = initialLeft + deltaX;
        const newTop = initialTop + deltaY;

        const maxX = window.innerWidth - win.offsetWidth;
        const maxY = window.innerHeight - win.offsetHeight - 40;

        win.style.left = `${Math.max(0, Math.min(newLeft, maxX))}px`;
        win.style.top = `${Math.max(0, Math.min(newTop, maxY))}px`;
    });

    const stopDrag = (e) => {
        if (!isDragging) return;
        isDragging = false;
        if (e.pointerId !== undefined) {
            titleBar.releasePointerCapture(e.pointerId);
        }
        titleBar.style.cursor = 'move';
    };

    titleBar.addEventListener('pointerup', stopDrag);
    titleBar.addEventListener('pointercancel', stopDrag);
    titleBar.addEventListener('touchend', stopDrag);
});

window.addEventListener('resize', () => {
    const openWindows = document.querySelectorAll('.window[style*="display: flex"]');
    openWindows.forEach(win => {
        const isMobile = window.innerWidth <= 768;
        const isPortrait = window.innerHeight > window.innerWidth;
        
        if (isMobile) {
            win.style.top = '50%';
            win.style.left = '50%';
            win.style.transform = 'translate(-50%, -50%)';
            
            if (isPortrait) {
                win.style.width = '95vw';
                win.style.height = '85vh';
            } else {
                win.style.width = '90vw';
                win.style.height = '80vh';
            }
        } else {
            const rect = win.getBoundingClientRect();
            if (rect.left < 0 || rect.top < 0 || rect.right > window.innerWidth || rect.bottom > window.innerHeight) {
                win.style.top = '50%';
                win.style.left = '50%';
                win.style.transform = 'translate(-50%, -50%)';
            }
        }
    });
});
