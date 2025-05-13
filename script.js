// DOM Elements
const newMemoryBtn = document.getElementById('new-memory-btn');
const memoryForm = document.querySelector('.memory-form');
const memoryFormElement = document.getElementById('memory-form');
const cancelMemoryBtn = document.getElementById('cancel-memory');
const memoriesList = document.getElementById('memories-list');
const noMemories = document.querySelector('.no-memories');
const lightThemeBtn = document.getElementById('light-theme');
const darkThemeBtn = document.getElementById('dark-theme');

// Memory data
let memories = JSON.parse(localStorage.getItem('memories')) || [];

// Theme management
const currentTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', currentTheme);
if (currentTheme === 'dark') {
    darkThemeBtn.classList.add('active');
    lightThemeBtn.classList.remove('active');
}

// Initialize the app
function init() {
    renderMemories();
    setupEventListeners();
}

// Set up event listeners
function setupEventListeners() {
    newMemoryBtn.addEventListener('click', showMemoryForm);
    cancelMemoryBtn.addEventListener('click', hideMemoryForm);
    memoryFormElement.addEventListener('submit', handleFormSubmit);
    lightThemeBtn.addEventListener('click', () => setTheme('light'));
    darkThemeBtn.addEventListener('click', () => setTheme('dark'));
}

// Show memory form with animation
function showMemoryForm() {
    memoryForm.classList.remove('hidden');
    newMemoryBtn.classList.add('hidden');
    memoryForm.style.animation = 'slideDown 0.5s ease-out';
}

// Hide memory form with animation
function hideMemoryForm() {
    memoryForm.style.animation = 'fadeIn 0.5s reverse';
    setTimeout(() => {
        memoryForm.classList.add('hidden');
        newMemoryBtn.classList.remove('hidden');
        memoryFormElement.reset();
    }, 500);
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('memory-title').value;
    const date = document.getElementById('memory-date').value;
    const content = document.getElementById('memory-content').value;
    
    const newMemory = {
        id: Date.now(),
        title,
        date,
        content
    };
    
    memories.unshift(newMemory);
    saveMemories();
    renderMemories();
    hideMemoryForm();
    
    // Add celebration effect
    celebrate();
}

// Save memories to localStorage
function saveMemories() {
    localStorage.setItem('memories', JSON.stringify(memories));
}

// Render memories list
function renderMemories() {
    if (memories.length === 0) {
        noMemories.classList.remove('hidden');
        memoriesList.innerHTML = '';
        return;
    }
    
    noMemories.classList.add('hidden');
    memoriesList.innerHTML = '';
    
    memories.forEach(memory => {
        const memoryCard = document.createElement('div');
        memoryCard.className = 'memory-card';
        memoryCard.innerHTML = `
            <h3>${memory.title}</h3>
            <span class="memory-date">${formatDate(memory.date)}</span>
            <p class="memory-content">${memory.content}</p>
            <button class="delete-memory" data-id="${memory.id}">Delete Memory</button>
        `;
        memoriesList.appendChild(memoryCard);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-memory').forEach(btn => {
        btn.addEventListener('click', deleteMemory);
    });
}

// Delete a memory
function deleteMemory(e) {
    const id = parseInt(e.target.getAttribute('data-id'));
    memories = memories.filter(memory => memory.id !== id);
    saveMemories();
    renderMemories();
    
    // Add animation to deleted card
    e.target.closest('.memory-card').style.animation = 'fadeInUp 0.5s reverse';
    setTimeout(() => {
        if (memories.length === 0) {
            noMemories.classList.remove('hidden');
        }
    }, 500);
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Set theme
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    if (theme === 'light') {
        lightThemeBtn.classList.add('active');
        darkThemeBtn.classList.remove('active');
    } else {
        darkThemeBtn.classList.add('active');
        lightThemeBtn.classList.remove('active');
    }
}

// Celebration effect
function celebrate() {
    const colors = ['#ff9ff3', '#feca57', '#ff6b6b', '#48dbfb', '#1dd1a1'];
    
    for (let i = 0; i < 20; i++) {
        createConfetti(colors);
    }
}

function createConfetti(colors) {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.width = '10px';
    confetti.style.height = '10px';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.borderRadius = '50%';
    confetti.style.left = `${Math.random() * 100}vw`;
    confetti.style.top = '-10px';
    confetti.style.opacity = '0.8';
    confetti.style.zIndex = '1000';
    confetti.style.animation = `fall ${Math.random() * 3 + 2}s linear forwards`;
    
    document.body.appendChild(confetti);
    
    setTimeout(() => {
        confetti.remove();
    }, 5000);
}

// Add animation for confetti
const style = document.createElement('style');
style.textContent = `
    @keyframes fall {
        to {
            transform: translateY(100vh) rotate(${Math.random() * 720}deg);
        }
    }
`;
document.head.appendChild(style);

// Initialize the app
init();