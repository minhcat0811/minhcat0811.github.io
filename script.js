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
        
        if (window.innerWidth <= 768) {
            win.style.top = '45%';
            win.style.left = '50%';
            win.style.transform = 'translate(-50%, -50%)';
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
            bringToFront(win);
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
    allTabs.forEach(t => t.style.background = '#1a0d2e');
    allTabs.forEach(t => t.style.color = '#9664FF');
    
    const relatedTab = document.getElementById(`tab-${element.id}`);
    if(relatedTab) {
        relatedTab.style.background = '#9664FF';
        relatedTab.style.color = '#000';
    }
}

const windows = document.querySelectorAll('.window');
windows.forEach(win => {
    const titleBar = win.querySelector('.title-bar');
    
    win.addEventListener('mousedown', () => bringToFront(win));
    win.addEventListener('touchstart', () => bringToFront(win), {passive: true});

    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    titleBar.addEventListener('mousedown', startDrag);
    titleBar.addEventListener('touchstart', (e) => {
        e.preventDefault(); 
        startDrag(e.touches[0]);
    }, {passive: false});

    function startDrag(e) {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        
        const rect = win.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;
        
        win.style.transform = 'none'; 
        win.style.left = `${initialLeft}px`;
        win.style.top = `${initialTop}px`;
    }

    function onMove(clientX, clientY) {
        if (!isDragging) return;
        const dx = clientX - startX;
        const dy = clientY - startY;
        win.style.left = `${initialLeft + dx}px`;
        win.style.top = `${initialTop + dy}px`;
    }

    document.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
    document.addEventListener('touchmove', (e) => {
        if(isDragging) e.preventDefault();
        const touch = e.touches[0];
        onMove(touch.clientX, touch.clientY);
    }, {passive: false});

    const stopDrag = () => { isDragging = false; };
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchend', stopDrag);
    element.addEventListener('pointerdown', myFunction);
});