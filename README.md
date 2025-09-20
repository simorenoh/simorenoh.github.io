# Simon Moreno - Personal Portfolio

A minimalistic, sleek portfolio website built for GitHub Pages. This site serves as both a professional showcase and a personal learning journal where I track my progress across different technologies and document ideas and insights.

## 🚀 Live Demo

Visit the live site at: [https://simorenoh.github.io](https://simorenoh.github.io)

## ✨ Features

- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, minimalistic design built with Tailwind CSS
- **Learning Tracker**: Dynamic section to track learning progress across technologies
- **Project Showcase**: Highlight your projects with descriptions, tech stacks, and links
- **Personal Notes**: Private note-taking system for ideas and insights
- **Admin Mode**: Password-protected content management directly from the website
- **Smooth Animations**: Scroll-based animations and smooth transitions
- **SEO Optimized**: Proper meta tags and structured data
- **Fast Loading**: Optimized for performance and GitHub Pages

## 🛠️ Tech Stack

- **HTML5**: Semantic markup
- **Tailwind CSS**: Utility-first CSS framework
- **Vanilla JavaScript**: No frameworks, pure JS for maximum performance
- **Font Awesome**: Icons
- **Google Fonts**: Inter font family
- **localStorage**: Client-side data persistence

## 📁 Project Structure

```
simorenoh.github.io/
├── index.html          # Main HTML file
├── script.js           # JavaScript functionality
├── README.md           # This file
└── favicon.ico         # Website icon (add your own)
```

## 🚀 Quick Start

### 1. Fork and Clone

1. Fork this repository to your GitHub account
2. Clone your fork locally:
   ```bash
   git clone https://github.com/yourusername/yourusername.github.io.git
   cd yourusername.github.io
   ```

### 2. Customize Content

Edit the following sections in `index.html`:

#### Personal Information
- Replace "Simon Moreno" with your name
- Update the hero description
- Change social media links
- Update contact information

#### About Section
- Customize the about text to reflect your background
- Update the interests (soccer, tennis) with your own
- Modify the current focus areas and progress bars

#### Default Data
The JavaScript file contains default data that you can customize:

**Learning Items** (in `script.js`):
```javascript
const defaultItems = [
    { name: 'JavaScript', category: 'frontend', progress: 85 },
    { name: 'React', category: 'frontend', progress: 80 },
    // Add your own technologies and progress
];
```

**Projects** (in `script.js`):
```javascript
const defaultProjects = [
    {
        title: 'Your Project Name',
        description: 'Project description...',
        technologies: ['Tech1', 'Tech2'],
        demoUrl: 'https://your-demo-url.com',
        githubUrl: 'https://github.com/yourusername/project'
    }
];
```

**Notes** (in `script.js`):
```javascript
const defaultNotes = [
    {
        title: 'Your Note Title',
        content: 'Your thoughts...',
        category: 'learning', // tech, idea, learning, personal
        date: new Date().toISOString()
    }
];
```

### 3. Deploy to GitHub Pages

1. Push your changes to GitHub:
   ```bash
   git add .
   git commit -m "Customize portfolio content"
   git push origin main
   ```

2. Enable GitHub Pages:
   - Go to your repository settings
   - Scroll to "Pages" section
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)"
   - Save

3. Your site will be available at `https://yourusername.github.io`

## 🎨 Customization Guide

### Colors
The site uses a professional blue/gray color scheme. To change colors, update the Tailwind config in `index.html`:

```javascript
tailwind.config = {
    theme: {
        extend: {
            colors: {
                'primary': '#0f172a',    // Dark blue-gray
                'secondary': '#64748b',  // Medium gray
                'accent': '#3b82f6',     // Blue accent
            }
        }
    }
}
```

### Fonts
Currently uses Inter font. To change, update the Google Fonts link and the font family in the Tailwind config.

### Admin Mode
The admin mode allows you to add/remove content directly from the website:

1. Click the gear icon (⚙️) in the bottom right
2. Enter the password (default: `admin123`)
3. Use the admin panels to add new learning items, projects, and notes

**Important**: Change the default password in `script.js`:
```javascript
if (password === 'your-new-password') {
```

### Adding New Sections
To add new sections:

1. Add the HTML structure in `index.html`
2. Add navigation link
3. Implement JavaScript functionality in `script.js`
4. Style with Tailwind classes

## 📱 Responsive Design

The site is fully responsive with breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

## 🔧 Local Development

For local development, simply open `index.html` in your browser. Since it's a static site with no build process, you can see changes immediately.

For a better development experience with live reload:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (if you have it)
npx serve .

# Using PHP
php -S localhost:8000
```

## 🌟 Features Explained

### Learning Progress Tracker
- Track your progress across different technologies
- Categorize by frontend, backend, DevOps, etc.
- Visual progress bars
- Add/remove items in admin mode

### Project Showcase
- Display projects with descriptions
- Link to live demos and source code
- Tag with technologies used
- Responsive card layout

### Personal Notes System
- Category-based notes (tech, ideas, learning, personal)
- Chronological ordering
- Private to you (stored in browser)
- Search and filter capabilities

### Admin Mode
- Password-protected content management
- Add/edit/delete content directly from the site
- Data persisted in localStorage
- Toggle on/off with floating button

## 🔒 Privacy & Data

- All data is stored locally in your browser's localStorage
- No external services or databases required
- Admin functionality is client-side only
- Contact form is demo only (add your own service)

## 🚀 Performance

- Lightweight: No heavy frameworks
- Fast loading: Optimized assets
- SEO friendly: Proper meta tags
- Accessible: ARIA labels and semantic HTML

## 📝 Content Tips

### Writing About Projects
- Start with the problem you solved
- Mention technologies and why you chose them
- Include quantifiable results if possible
- Provide both demo and code links

### Learning Progress
- Be honest about your skill levels
- Update regularly to track growth
- Include both current learning and future goals

### Personal Notes
- Document insights and "aha" moments
- Track ideas for future projects
- Note down useful resources and links

## 🤝 Contributing

This is a personal portfolio template, but suggestions for improvements are welcome! Feel free to:

1. Open issues for bugs or feature requests
2. Submit pull requests for improvements
3. Share your customizations and modifications

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙋‍♂️ Support

If you have questions or need help customizing your portfolio:

1. Check the issues section for common problems
2. Create a new issue with details about your question
3. Include screenshots if it's a visual issue

---

**Happy coding!** 🚀

Built with ❤️ by Simon Moreno
