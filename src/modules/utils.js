function makeDraggable(el, storageKey) {
    let isDragging = false, startX, startY, initialX, initialY;

    const savedPos = localStorage.getItem(storageKey);
    if (savedPos) {
        const { x, y } = JSON.parse(savedPos);
        el.style.left = x;
        el.style.top = y;
        el.style.bottom = 'auto'; 
        el.style.right = 'auto';
        el.style.transition = 'none';
    }

    const dragHandle = el.querySelector('.menu-header') || el;
    dragHandle.style.cursor = 'move';

    dragHandle.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'BUTTON' || e.target.classList.contains('toggle-switch') || e.target.classList.contains('btn-minimize')) return;
        
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialX = el.offsetLeft;
        initialY = el.offsetTop;
        
        el.style.bottom = 'auto';
        el.style.right = 'auto';
        el.style.transition = 'none';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        el.style.left = `${initialX + dx}px`;
        el.style.top = `${initialY + dy}px`;
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            if (storageKey) {
                localStorage.setItem(storageKey, JSON.stringify({
                    x: el.style.left,
                    y: el.style.top
                }));
            }
        }
    });
}

module.exports = { makeDraggable };