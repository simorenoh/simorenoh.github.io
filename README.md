# Personal Portfolio

A clean, responsive portfolio website built for GitHub Pages.

## Tech Stack

- **HTML5** - Semantic markup
- **Tailwind CSS** - Utility-first CSS framework via CDN
- **Vanilla JavaScript** - No frameworks, client-side functionality
- **Font Awesome** - Icons
- **Google Fonts** - Inter typography

## Features

- Responsive design optimized for all devices
- Skills showcase with proficiency levels
- Project gallery with filtering
- Personal notes system using localStorage
- Admin panel for content management
- Smooth scrolling navigation and animations

## Architecture

- **Static site** - No build process required
- **Client-side data persistence** - Uses browser localStorage for dynamic content
- **Admin mode** - Password-protected content management interface
- **GitHub Pages ready** - Deploy directly from main branch

## Local Development

```bash
# Clone the repository
git clone https://github.com/simorenoh/simorenoh.github.io.git
cd simorenoh.github.io

# Serve locally (any HTTP server works)
python3 -m http.server 8000
# or
npx serve .
```

Visit `http://localhost:8000` to view the site.

## Deployment

Push to the `main` branch and enable GitHub Pages in repository settings. The site will be available at `https://simorenoh.github.io`.

## License

MIT License
