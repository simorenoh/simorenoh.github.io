// Portfolio JavaScript - Simon Moreno

// State management
let isAdminMode = false;

// Initialize the portfolio
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeScrollEffects();
    initializeSkillsSection();
    initializeProjectsSection();
    initializeNotesSection();
    initializeContactForm();
    initializeAdminMode();
});

// Navigation functionality
function initializeNavigation() {
    // Mobile menu toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-link, a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed nav
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                }
            }
        });
    });

    // Update active nav link on scroll
    window.addEventListener('scroll', updateActiveNavLink);
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('text-accent');
        link.classList.add('text-gray-700');
        
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.remove('text-gray-700');
            link.classList.add('text-accent');
        }
    });
}

// Scroll effects
function initializeScrollEffects() {
    const backToTopButton = document.getElementById('back-to-top');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopButton.classList.remove('opacity-0', 'pointer-events-none');
            backToTopButton.classList.add('opacity-100');
        } else {
            backToTopButton.classList.add('opacity-0', 'pointer-events-none');
            backToTopButton.classList.remove('opacity-100');
        }
    });
    
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Skills section
function initializeSkillsSection() {
    loadSkills();
}

function loadSkills() {
    const skillsGrid = document.getElementById('skills-grid');
    const defaultSkills = [
        { name: 'Python', category: 'language', level: 'advanced' },
        { name: 'Golang', category: 'language', level: 'intermediate' },
        { name: 'Flutter', category: 'framework', level: 'intermediate' },
        { name: 'Java', category: 'language', level: 'intermediate' },
        { name: 'GCP', category: 'cloud', level: 'intermediate' },
        { name: 'Azure', category: 'cloud', level: 'intermediate' },
        { name: 'React', category: 'framework', level: 'beginner' }
    ];
    
    const savedSkills = JSON.parse(localStorage.getItem('skills')) || defaultSkills;
    
    skillsGrid.innerHTML = '';
    savedSkills.forEach((skill, index) => {
        const skillElement = createSkillElement(skill, index);
        skillsGrid.appendChild(skillElement);
    });
    
    // Save default skills if none exist
    if (!localStorage.getItem('skills')) {
        localStorage.setItem('skills', JSON.stringify(defaultSkills));
    }
}

function createSkillElement(skill, index) {
    const categoryColors = {
        language: 'bg-blue-100 text-blue-800',
        framework: 'bg-green-100 text-green-800',
        cloud: 'bg-purple-100 text-purple-800',
        tool: 'bg-orange-100 text-orange-800'
    };

    const levelColors = {
        beginner: 'bg-gray-100 text-gray-700',
        intermediate: 'bg-yellow-100 text-yellow-800',
        advanced: 'bg-blue-100 text-blue-800',
        expert: 'bg-green-100 text-green-800'
    };

    const levelDots = {
        beginner: '●○○○',
        intermediate: '●●○○',
        advanced: '●●●○',
        expert: '●●●●'
    };

    const div = document.createElement('div');
    div.className = 'bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200';
    div.innerHTML = `
        <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg font-semibold text-primary">${skill.name}</h3>
            ${isAdminMode ? `<button onclick="removeSkill(${index})" class="text-red-500 hover:text-red-700 text-sm"><i class="fas fa-trash"></i></button>` : ''}
        </div>
        <div class="mb-3">
            <span class="inline-block px-2 py-1 text-xs rounded-full ${categoryColors[skill.category] || categoryColors.tool}">
                ${skill.category.charAt(0).toUpperCase() + skill.category.slice(1)}
            </span>
        </div>
        <div class="flex items-center justify-between">
            <span class="inline-block px-2 py-1 text-xs rounded-full ${levelColors[skill.level] || levelColors.beginner}">
                ${skill.level.charAt(0).toUpperCase() + skill.level.slice(1)}
            </span>
            <span class="text-accent font-mono text-sm">${levelDots[skill.level] || levelDots.beginner}</span>
        </div>
    `;
    return div;
}

function addSkill() {
    const name = document.getElementById('skill-name').value;
    const category = document.getElementById('skill-category').value;
    const level = document.getElementById('skill-level').value;
    
    if (!name) {
        alert('Please enter a skill name');
        return;
    }
    
    const skills = JSON.parse(localStorage.getItem('skills')) || [];
    skills.push({
        name: name,
        category: category,
        level: level
    });
    
    localStorage.setItem('skills', JSON.stringify(skills));
    loadSkills();
    
    // Clear form
    document.getElementById('skill-name').value = '';
}

function removeSkill(index) {
    const skills = JSON.parse(localStorage.getItem('skills')) || [];
    skills.splice(index, 1);
    localStorage.setItem('skills', JSON.stringify(skills));
    loadSkills();
}

// Projects section
function initializeProjectsSection() {
    loadProjects();
}

function loadProjects() {
    const projectsGrid = document.getElementById('projects-grid');
    const defaultProjects = [
        {
            title: 'Personal Portfolio Website',
            description: 'A responsive portfolio website built with Tailwind CSS and vanilla JavaScript. Features include learning progress tracking and personal notes management.',
            technologies: ['HTML', 'CSS', 'JavaScript', 'Tailwind CSS'],
            demoUrl: '',
            githubUrl: 'https://github.com/simorenoh/simorenoh.github.io'
        }
    ];
    
    const savedProjects = JSON.parse(localStorage.getItem('projects')) || defaultProjects;
    
    projectsGrid.innerHTML = '';
    savedProjects.forEach((project, index) => {
        const projectElement = createProjectElement(project, index);
        projectsGrid.appendChild(projectElement);
    });
    
    // Save default projects if none exist
    if (!localStorage.getItem('projects')) {
        localStorage.setItem('projects', JSON.stringify(defaultProjects));
    }
}

function createProjectElement(project, index) {
    const div = document.createElement('div');
    div.className = 'bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200';
    div.innerHTML = `
        <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg font-semibold text-primary">${project.title}</h3>
            ${isAdminMode ? `<button onclick="removeProject(${index})" class="text-red-500 hover:text-red-700 text-sm"><i class="fas fa-trash"></i></button>` : ''}
        </div>
        <p class="text-gray-600 mb-4 leading-relaxed">${project.description}</p>
        <div class="mb-4">
            <div class="flex flex-wrap gap-2">
                ${project.technologies.map(tech => `<span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">${tech}</span>`).join('')}
            </div>
        </div>
        <div class="flex space-x-4">
            ${project.demoUrl ? `<a href="${project.demoUrl}" target="_blank" class="text-accent hover:text-blue-600 transition-colors"><i class="fas fa-external-link-alt mr-1"></i>Demo</a>` : ''}
            ${project.githubUrl ? `<a href="${project.githubUrl}" target="_blank" class="text-accent hover:text-blue-600 transition-colors"><i class="fab fa-github mr-1"></i>Code</a>` : ''}
        </div>
    `;
    return div;
}

function addProject() {
    const title = document.getElementById('project-title').value;
    const description = document.getElementById('project-description').value;
    const tech = document.getElementById('project-tech').value;
    const demoUrl = document.getElementById('project-demo').value;
    const githubUrl = document.getElementById('project-github').value;
    
    if (!title || !description) {
        alert('Please fill in title and description');
        return;
    }
    
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    projects.push({
        title: title,
        description: description,
        technologies: tech.split(',').map(t => t.trim()).filter(t => t),
        demoUrl: demoUrl,
        githubUrl: githubUrl
    });
    
    localStorage.setItem('projects', JSON.stringify(projects));
    loadProjects();
    
    // Clear form
    document.getElementById('project-title').value = '';
    document.getElementById('project-description').value = '';
    document.getElementById('project-tech').value = '';
    document.getElementById('project-demo').value = '';
    document.getElementById('project-github').value = '';
}

function removeProject(index) {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    projects.splice(index, 1);
    localStorage.setItem('projects', JSON.stringify(projects));
    loadProjects();
}

// Notes section
function initializeNotesSection() {
    loadNotes();
}

function loadNotes() {
    const notesGrid = document.getElementById('notes-grid');
    const defaultNotes = [
        {
            title: 'AI Systems & Agent Learning Goals',
            content: 'Deep dive into building AI systems and understanding agent architectures. Want to explore agent-to-agent (A2A) communication, multi-agent networks, and how agents can collaborate effectively. Key areas: reinforcement learning, neural networks for decision making, and distributed AI systems.',
            category: 'learning',
            date: new Date().toISOString()
        },
        {
            title: 'Project Idea: Soccer Stats Tracker',
            content: 'Build a web app to track Champions League and Premier League statistics. Could include player performance analytics and match predictions.',
            category: 'idea',
            date: new Date().toISOString()
        }
    ];
    
    const savedNotes = JSON.parse(localStorage.getItem('notes')) || defaultNotes;
    
    notesGrid.innerHTML = '';
    savedNotes.forEach((note, index) => {
        const noteElement = createNoteElement(note, index);
        notesGrid.appendChild(noteElement);
    });
    
    // Save default notes if none exist
    if (!localStorage.getItem('notes')) {
        localStorage.setItem('notes', JSON.stringify(defaultNotes));
    }
}

function createNoteElement(note, index) {
    const categoryColors = {
        tech: 'bg-blue-100 text-blue-800',
        idea: 'bg-yellow-100 text-yellow-800',
        learning: 'bg-green-100 text-green-800',
        personal: 'bg-purple-100 text-purple-800'
    };

    const date = new Date(note.date).toLocaleDateString();
    
    const div = document.createElement('div');
    div.className = 'bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200';
    div.innerHTML = `
        <div class="flex justify-between items-start mb-3">
            <h3 class="text-lg font-semibold text-primary">${note.title}</h3>
            ${isAdminMode ? `<button onclick="removeNote(${index})" class="text-red-500 hover:text-red-700 text-sm"><i class="fas fa-trash"></i></button>` : ''}
        </div>
        <div class="mb-3">
            <span class="inline-block px-2 py-1 text-xs rounded-full ${categoryColors[note.category] || categoryColors.tech}">
                ${note.category.charAt(0).toUpperCase() + note.category.slice(1)}
            </span>
        </div>
        <p class="text-gray-600 mb-3 leading-relaxed">${note.content}</p>
        <div class="text-xs text-gray-400">${date}</div>
    `;
    return div;
}

function addNote() {
    const title = document.getElementById('note-title').value;
    const content = document.getElementById('note-content').value;
    const category = document.getElementById('note-category').value;
    
    if (!title || !content) {
        alert('Please fill in title and content');
        return;
    }
    
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes.unshift({
        title: title,
        content: content,
        category: category,
        date: new Date().toISOString()
    });
    
    localStorage.setItem('notes', JSON.stringify(notes));
    loadNotes();
    
    // Clear form
    document.getElementById('note-title').value = '';
    document.getElementById('note-content').value = '';
}

function removeNote(index) {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes.splice(index, 1);
    localStorage.setItem('notes', JSON.stringify(notes));
    loadNotes();
}

// Contact form
function initializeContactForm() {
    const contactForm = document.getElementById('contact-form');
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        
        // Since this is a static site, we'll just show a message
        // In a real implementation, you'd send this to a service like Formspree, Netlify Forms, etc.
        alert(`Thanks for your message, ${name}! Since this is a demo, the message wasn't actually sent. In a real implementation, this would be connected to a form service.`);
        
        // Clear form
        contactForm.reset();
    });
}

// Admin mode functionality
function initializeAdminMode() {
    const adminToggle = document.getElementById('admin-toggle');
    
    adminToggle.addEventListener('click', function() {
        // Simple password protection (in a real app, you'd use proper authentication)
        const password = prompt('Enter admin password:');
        if (password === 'admin123') { // Change this to a secure password
            toggleAdminMode();
        } else if (password !== null) {
            alert('Incorrect password');
        }
    });
}

function toggleAdminMode() {
    isAdminMode = !isAdminMode;
    const adminPanels = document.querySelectorAll('[id$="-admin"]');
    const adminToggle = document.getElementById('admin-toggle');
    
    if (isAdminMode) {
        adminPanels.forEach(panel => panel.classList.remove('hidden'));
        adminToggle.innerHTML = '<i class="fas fa-times"></i>';
        adminToggle.classList.add('bg-red-500');
        adminToggle.classList.remove('bg-accent');
    } else {
        adminPanels.forEach(panel => panel.classList.add('hidden'));
        adminToggle.innerHTML = '<i class="fas fa-cog"></i>';
        adminToggle.classList.remove('bg-red-500');
        adminToggle.classList.add('bg-accent');
    }
    
    // Refresh all sections to show/hide delete buttons
    loadSkills();
    loadProjects();
    loadNotes();
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add some smooth reveal animations
function addScrollRevealAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
}

// Initialize scroll animations after page load
window.addEventListener('load', addScrollRevealAnimations);
