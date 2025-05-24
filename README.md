# Timeline Card Creator

Transform your personal photos into an exciting Timeline board game! This web application allows users to upload their photos, automatically extract dates from EXIF data, and generate printable cards for a personalized Timeline game experience.

## 🎯 What It Does

The Timeline Card Creator converts your personal photos into a physical board game where players try to place cards in chronological order. It's perfect for families, couples, and friend groups who want to test their knowledge of shared memories and life events.

## 🎲 Game Attribution

This application is inspired by and uses the game mechanics from **Timeline** (2012), designed by **Frédéric Henry** and published by Asmodee. 

**Original Game Credits:**
- **Designer:** Frédéric Henry
- **Artists:** Xavier Collette, [Jérémie Fleury](https://www.jeremiefleury.art/), Nicolas Fructus, Gaël Lannurien, Sébastien Lopez
- **Publisher:** Asmodee
- **Year Released:** 2012
- **BoardGameGeek:** [Timeline](https://boardgamegeek.com/boardgame/128664/timeline)

This digital tool creates personalized versions of the Timeline game using your own photos, but all game mechanics and rules belong to the original creators. Please support the original game and its creators!

## 🛠️ Tech Stack

### Frontend Framework
- **Next.js 15** (App Router) - React framework with server-side rendering
- **React 18** - UI library with hooks and modern patterns
- **TypeScript** - Type safety and better developer experience

### Styling & UI
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality, accessible React components
- **Lucide React** - Beautiful, customizable icons

### Core Libraries
- **jsPDF** - Client-side PDF generation
- **ExifReader** - Extract metadata from image files
- **react-dropzone** - Drag-and-drop file upload interface

### Browser APIs
- **Canvas API** - Image processing and manipulation
- **File API** - Handle uploaded files
- **LocalStorage** - Cache user data between sessions

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Timeline Card Creator                   │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Next.js + React)                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Upload UI     │  │   Card Editor   │  │ PDF Export  │ │
│  │                 │  │                 │  │             │ │
│  │ • Drag & Drop   │  │ • Event Names   │  │ • Layout    │ │
│  │ • File Validation│  │ • Year Editing  │  │ • Printing  │ │
│  │ • EXIF Reading  │  │ • Sorting       │  │ • Download  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Core Processing Layer                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │  Image Utils    │  │  EXIF Utils     │  │ PDF Engine  │ │
│  │                 │  │                 │  │             │ │
│  │ • Crop to 3:4   │  │ • Date Extract  │  │ • Canvas    │ │
│  │ • B&W Convert   │  │ • Fallbacks     │  │ • Rendering │ │
│  │ • Canvas Ops    │  │ • Validation    │  │ • Layout    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                 │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │  State Mgmt     │  │  Local Cache    │                  │
│  │                 │  │                 │                  │
│  │ • Card Array    │  │ • Event Names   │                  │
│  │ • Sorting       │  │ • Persistence   │                  │
│  │ • Updates       │  │ • Cache Cleanup │                  │
│  └─────────────────┘  └─────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
timeline-card-creator/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main application page
│   └── globals.css         # Global styles
├── components/
│   ├── upload-section.tsx  # File upload interface
│   ├── cards-grid.tsx      # Card management and display
│   ├── card-item.tsx       # Individual card editor
│   └── instructions-card.tsx # Game rules and printing guide
├── lib/
│   ├── exif-utils.ts       # EXIF data extraction
│   ├── image-utils.ts      # Image processing utilities
│   ├── event-cache.ts      # LocalStorage management
│   ├── pdf-generator.ts    # Main PDF creation logic
│   ├── pdf-card-factory.ts # Card creation and layout
│   ├── pdf-card-renderer.ts # Canvas rendering engine
│   └── card-designer.ts    # Visual design system
├── types/
│   └── timeline-card.ts    # TypeScript interfaces
└── README.md
```

## 🔄 Data Flow

### 1. Image Upload Process
```
User uploads images → react-dropzone → File validation → EXIF extraction → TimelineCard creation
```

### 2. EXIF Date Extraction
```
File → ExifReader → Date parsing → Fallback to file.lastModified → Year extraction
```

### 3. Card State Management
```
Cards array → Sorting by date → React state updates → UI re-rendering
```

### 4. PDF Generation Pipeline
```
Cards → Image processing → Canvas rendering → PDF layout → File download
```

## 🎨 Key Features

### Smart Date Extraction
- Reads EXIF data from photos (DateTimeOriginal, DateTime, etc.)
- Falls back to file modification date if no EXIF data
- Handles various date formats and edge cases

### Image Processing
- Crops images to 3:4 aspect ratio for consistent card layout
- Converts to black and white for better printing
- Optimizes for PDF embedding

### PDF Generation
- Creates print-ready landscape PDFs
- 5 cards per page with fold lines and cutting guides
- Handles multiple pages automatically
- Optimized for letter-size paper

### Caching System
- Stores event names in localStorage
- Generates unique cache keys based on date + filename
- Automatic cleanup of old entries

### Responsive Design
- Works on desktop and mobile devices
- Touch-friendly interface
- Accessible components

## 🎮 Game Mechanics

The generated cards create a Timeline-style board game where:
- Players try to place cards in chronological order
- Cards have photos on one side, dates on the other
- First player to correctly place all cards wins
- Perfect for testing knowledge of family history and shared memories

*All game mechanics are based on the original Timeline board game by Frédéric Henry.*

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
git clone [GITHUB_LINK_PLACEHOLDER]
cd timeline-card-creator
npm install
npm run dev
```

### Usage
1. Upload 5-24 photos from different time periods
2. Add memorable event names (2-3 words work best)
3. Adjust years if needed
4. Export as PDF
5. Print, fold, cut, and play!

## 🔧 Development

### Key Components

**UploadSection**: Handles file uploads with drag-and-drop support
**CardsGrid**: Manages the collection of cards with editing capabilities  
**CardItem**: Individual card editor with event name and year inputs
**PDF Generator**: Complex pipeline that converts cards to printable format

### State Management
Uses React's built-in state management with:
- \`useState\` for card collection
- Sorting logic for chronological order
- Batch updates for performance

### Performance Optimizations
- Image processing on separate thread
- Efficient canvas operations
- Minimal re-renders with proper key props
- Lazy loading of heavy operations

## 🎯 Design Decisions

### Why Canvas API?
- Precise control over image processing
- Better quality than CSS transforms
- Required for PDF embedding

### Why Client-Side PDF Generation?
- No server required
- Instant generation
- Privacy-friendly (no uploads)
- Works offline

### Why LocalStorage Caching?
- Preserves user work between sessions
- No account system needed
- Automatic cleanup prevents bloat

## 🐛 Known Limitations

- Maximum 24 cards (PDF layout constraint)
- Requires modern browser with Canvas support
- Large images may cause memory issues
- EXIF data not available in all image formats

## 🔮 Future Enhancements

- [ ] Custom card designs and themes
- [ ] Batch event name editing
- [ ] Export to different paper sizes
- [ ] Social sharing features
- [ ] Multiple game variants

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

GitHub Repository: [GITHUB_LINK_PLACEHOLDER]

## 📄 License

MIT License - feel free to use this code for your own projects!

## 🙏 Acknowledgments

- **Timeline Board Game** by Frédéric Henry and Asmodee for the original game concept
- **Jérémie Fleury** and the artistic team for the visual inspiration
- **v0 by Vercel** for the development platform
- **Open Source Community** for the amazing libraries that made this possible

---

*This is a fan-made digital tool inspired by the Timeline board game. Please support the original creators by purchasing the official Timeline games from Asmodee.*
