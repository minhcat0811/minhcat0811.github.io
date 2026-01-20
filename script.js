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
        
        if (isMobile) {
            win.style.top = '50%';
            win.style.left = '50%';
            win.style.transform = 'translate(-50%, -50%)';
            win.style.margin = '0';
            win.style.width = '90vw';
            win.style.height = '80vh';
            win.style.maxWidth = '90vw';
            win.style.maxHeight = '80vh';
        } else {
            if (!win.style.left || win.style.left === '50%') {
                win.style.top = '50%';
                win.style.left = '50%';
                win.style.transform = 'translate(-50%, -50%)';
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
        
        item.onclick = () => {
            const win = document.getElementById(id);
            if (win.style.display === 'none') {
                openWindow(id, name);
            } else {
                bringToFront(win);
            }
        };
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
        t.style.background = '#1a0d2e';
        t.style.color = '#9664FF';
    });
    
    const relatedTab = document.getElementById(`tab-${element.id}`);
    if(relatedTab) {
        relatedTab.style.background = '#9664FF';
        relatedTab.style.color = '#000';
    }
}

const windows = document.querySelectorAll('.window');

windows.forEach(win => {
    const titleBar = win.querySelector('.title-bar');

    titleBar.style.touchAction = 'none'; 
    
    win.addEventListener('pointerdown', () => bringToFront(win));

    let isDragging = false;
    let offsetLeft, offsetTop;

    titleBar.addEventListener('pointerdown', (e) => {
        if (e.target.classList.contains('close-btn')) return;
        
        e.preventDefault();
        
        isDragging = true; 
        
        const rect = win.getBoundingClientRect();
        
        offsetLeft = e.clientX - rect.left;
        offsetTop = e.clientY - rect.top;

        const computedTransform = window.getComputedStyle(win).transform;
        if (computedTransform && computedTransform !== 'none') {
            win.style.transform = 'none';
            win.style.left = `${rect.left}px`;
            win.style.top = `${rect.top}px`;
            win.style.margin = '0';
        }
        
        titleBar.setPointerCapture(e.pointerId);
        titleBar.style.cursor = 'grabbing';
    });

    titleBar.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        e.preventDefault(); 

        const newX = e.clientX - offsetLeft;
        const newY = e.clientY - offsetTop;

        const maxX = window.innerWidth - win.offsetWidth;
        const maxY = window.innerHeight - win.offsetHeight;

        const boundedX = Math.max(0, Math.min(newX, maxX));
        const boundedY = Math.max(0, Math.min(newY, maxY));

        win.style.left = `${boundedX}px`;
        win.style.top = `${boundedY}px`;
    });

    const stopDrag = (e) => {
        if (!isDragging) return;
        isDragging = false;
        titleBar.releasePointerCapture(e.pointerId);
        titleBar.style.cursor = 'move';
    };

    titleBar.addEventListener('pointerup', stopDrag);
    titleBar.addEventListener('pointercancel', stopDrag);
});

let resizeObserver;
if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
        windows.forEach(win => {
            if (win.style.display !== 'none') {
                const isMobile = window.innerWidth <= 768;
                if (isMobile) {
                    win.style.top = '50%';
                    win.style.left = '50%';
                    win.style.transform = 'translate(-50%, -50%)';
                    win.style.width = '90vw';
                    win.style.height = '80vh';
                    win.style.maxWidth = '90vw';
                    win.style.maxHeight = '80vh';
                }
            }
        });
    });
    resizeObserver.observe(document.body);
}
