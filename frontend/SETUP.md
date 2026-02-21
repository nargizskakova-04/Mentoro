# Mentoro - Setup Instructions

## Quick Start Guide

### Prerequisites
- Node.js (version 16 or higher)
- npm (comes with Node.js)

### Installation Steps

1. **Navigate to the project directory:**
   ```bash
   cd mentoroAI
   ```

2. **Install all dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Additional Commands

- **Build for production:**
  ```bash
  npm run build
  ```

- **Start production server:**
  ```bash
  npm run start
  ```

- **Run linter:**
  ```bash
  npm run lint
  ```

### Important Notes

1. **LM Studio Requirement:** The AI chat functionality requires LM Studio running locally on port 1234. Download and install LM Studio from [https://lmstudio.ai/](https://lmstudio.ai/) and load a compatible model.

2. **Environment Variables:** The project uses a mock database by default. No additional configuration needed for development.

3. **First Time Setup:** After running `npm install`, all required packages will be downloaded from the `package.json` file.

### Common Issues

**Port 3000 already in use:**
- Stop other applications using port 3000, or modify the port in the dev script

**LM Studio not connected:**
- Ensure LM Studio is running on http://localhost:1234
- Load a compatible model in LM Studio

**Build errors:**
- Delete `node_modules` folder and `.next` folder
- Run `npm install` again
- Run `npm run build`

### Project Structure
```
mentoroAI/
├── public/
│   └── assets/          # Images and static files
├── src/
│   ├── app/            # Next.js app router pages
│   ├── components/     # React components
│   └── lib/           # Utility functions
├── package.json       # Dependencies
└── next.config.ts    # Next.js configuration
```

### Support
For issues or questions, please refer to the project documentation or contact the development team.
