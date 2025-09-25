# Bill Processing System

A modern, dark-themed React application for processing bills with automated image recognition and policy management.

## Features

- **User Authentication**: Secure login with email and password
- **Bill Upload & Processing**: Upload bill images with automated data extraction
- **Policy Management**: View and search company policies
- **AI Chatbot**: Interactive assistant for policy questions
- **Bill Management**: Track uploaded bills with status and details
- **Dark Theme**: Modern dark UI with excellent user experience

## Components

### 1. Login System
- Email/password authentication
- Secure form validation
- Demo credentials provided

### 2. Dashboard
- Bill upload interface with drag-and-drop
- Real-time processing status
- Detailed results display with extracted data
- Support for JPG, PNG, and PDF formats

### 3. Navigation Bar
- Responsive design with mobile menu
- Quick access to all sections
- User profile and logout functionality

### 4. Policies
- Comprehensive policy library
- Search and filter functionality
- Category-based organization
- Download and view options

### 5. Chatbot
- AI-powered policy assistant
- Predefined quick questions
- Real-time conversation interface
- Context-aware responses

### 6. Bills List
- Complete bill history
- Status tracking (Accepted/Pending/Rejected)
- Detailed bill information sidebar
- Search and filter capabilities

## Technology Stack

- **React 18**: Modern React with hooks
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library
- **Responsive Design**: Mobile-first approach

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Access Application**
   - Open [http://localhost:3000](http://localhost:3000)
   - Use demo credentials: `admin@example.com` / `password123`

## Project Structure

```
src/
├── components/
│   ├── Login.js          # Authentication component
│   ├── Dashboard.js      # Main bill upload interface
│   ├── Navbar.js         # Navigation component
│   ├── Policies.js       # Policy management
│   ├── Chatbot.js        # AI assistant
│   └── BillsList.js      # Bill history and details
├── App.js                # Main application component
├── index.js              # Application entry point
└── index.css             # Global styles and Tailwind imports
```

## Dark Theme Design

The application features a carefully crafted dark theme with:
- **Background**: Deep navy (`#0f0f23`)
- **Surface**: Dark blue-gray (`#1a1a2e`)
- **Cards**: Slightly lighter blue (`#16213e`)
- **Accent**: Bright blue (`#4299e1`)
- **Text**: Light gray (`#e2e8f0`)
- **Status Colors**: Green (success), Red (error), Orange (warning)

## Features in Detail

### Bill Processing
- Drag-and-drop file upload
- Real-time processing simulation
- Extracted data validation
- Confidence scoring
- Status tracking

### Policy Management
- Categorized policy library
- Advanced search functionality
- Version tracking
- Download capabilities

### AI Chatbot
- Natural language processing
- Context-aware responses
- Quick question shortcuts
- Real-time typing indicators

### Bill Management
- Complete audit trail
- Status filtering
- Detailed information display
- Export functionality

## Customization

The application is built with modularity in mind:
- Easy to extend with new features
- Customizable color scheme
- Responsive design patterns
- Component-based architecture

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Development

The application uses modern React patterns:
- Functional components with hooks
- Context for state management
- Custom CSS classes with Tailwind
- Responsive design principles

## License

This project is for demonstration purposes.





