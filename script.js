window.addEventListener('load', () => {
    const startupScreen = document.getElementById('startup-screen');
    // Hiệu ứng tắt màn hình startup
    setTimeout(() => {
        startupScreen.style.opacity = '0';
        startupScreen.style.transition = 'opacity 0.8s';
        setTimeout(() => {
            startupScreen.style.display = 'none';
        }, 800);
    }, 2000);
});

// --- CLOCK FUNCTION ---
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

// --- WINDOW MANAGEMENT ---

function openWindow(id, titleName) {
    const win = document.getElementById(id);
    if (win) {
        win.style.display = 'flex';
        bringToFront(win);
        
        // Logic reset vị trí cho Mobile để đảm bảo luôn căn giữa khi mở
        if (window.innerWidth <= 768) {
            win.style.top = '45%';
            win.style.left = '50%';
            win.style.transform = 'translate(-50%, -50%)';
            win.style.margin = '0'; // Reset margin nếu có
        } 
        // Logic cho PC: Nếu chưa từng kéo (vẫn còn transform), giữ nguyên. 
        // Nếu đã kéo rồi (có top/left cụ thể), giữ nguyên vị trí cũ.

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

// --- TASKBAR MANAGEMENT ---

function addTaskbarItem(id, name) {
    const taskbarContainer = document.getElementById('taskbar-apps');
    let existingItem = document.getElementById(`tab-${id}`);
    
    if (!existingItem) {
        const item = document.createElement('div');
        item.className = 'taskbar-item active';
        item.id = `tab-${id}`;
        item.innerText = name;
        
        // Sự kiện click vào taskbar
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
    
    // Cập nhật giao diện taskbar (active/inactive)
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

// --- DRAGGING LOGIC (POINTER EVENTS) ---
// Sử dụng Pointer Events để hỗ trợ cả Mouse và Touch cùng lúc

const windows = document.querySelectorAll('.window');

windows.forEach(win => {
    const titleBar = win.querySelector('.title-bar');
    
    // Khi chạm vào bất kỳ đâu trên window thì bring to front
    win.addEventListener('pointerdown', () => bringToFront(win));

    let isDragging = false;
    let offsetLeft, offsetTop;

    titleBar.addEventListener('pointerdown', (e) => {
        // Ngăn chặn hành vi mặc định (như bôi đen text)
        e.preventDefault(); 
        
        isDragging = true;
        
        // Tính toán vị trí hiện tại của window
        const rect = win.getBoundingClientRect();
        
        // Tính khoảng cách từ con trỏ chuột đến góc trái trên của window
        offsetLeft = e.clientX - rect.left;
        offsetTop = e.clientY - rect.top;

        // Xóa transform để chuyển sang dùng top/left tuyệt đối
        // Điều này ngăn việc cửa sổ bị "nhảy" khi bắt đầu kéo
        win.style.transform = 'none';
        win.style.left = `${rect.left}px`;
        win.style.top = `${rect.top}px`;
        
        // "Bắt" con trỏ vào titleBar để khi kéo nhanh ra ngoài vẫn nhận diện được
        titleBar.setPointerCapture(e.pointerId);
        titleBar.style.cursor = 'grabbing';
    });

    titleBar.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        e.preventDefault();

        // Tính toán vị trí mới
        const newX = e.clientX - offsetLeft;
        const newY = e.clientY - offsetTop;

        win.style.left = `${newX}px`;
        win.style.top = `${newY}px`;
    });

    titleBar.addEventListener('pointerup', (e) => {
        isDragging = false;
        titleBar.releasePointerCapture(e.pointerId);
        titleBar.style.cursor = 'move';
    });
    
    // Xử lý trường hợp con trỏ bị hủy (ví dụ Alt+Tab hoặc popup hệ thống)
    titleBar.addEventListener('pointercancel', (e) => {
        isDragging = false;
        titleBar.releasePointerCapture(e.pointerId);
        titleBar.style.cursor = 'move';
    });
});
