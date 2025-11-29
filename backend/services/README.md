# Gemini AI Service Documentation

## Overview

The Gemini AI service provides intelligent book recommendations for ShelfSense users based on their reading patterns, preferences, and history.

## Features

- **Dual-Model Architecture**: Uses gemini-2.0-flash-exp (primary) with automatic fallback to gemini-1.5-flash (stable)
- **Personalized Recommendations**: Analyzes user's genres, authors, and reading history
- **Structured Output**: Returns clean JSON with title, author, genre, and personalized reasons
- **Error Resilience**: Graceful degradation if AI service is unavailable
- **Detailed Logging**: Track which model was used and any errors

## Installation

Package is already installed. If needed:
```bash
npm install @google/generative-ai
```

## Configuration

API key is configured in `.env`:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

## Usage

### Basic Recommendation Generation

```javascript
import { getBookRecommendations } from './services/geminiService.js';

const userProfile = {
  topGenres: ['Fantasy', 'Science Fiction'],
  favoriteAuthors: ['J.K. Rowling', 'Brandon Sanderson'],
  recentBooks: [
    {
      title: "Harry Potter and the Sorcerer's Stone",
      author: 'J.K. Rowling',
      genre: 'Fantasy'
    }
  ],
  totalBooks: 25,
  avgRating: 4.5
};

const recommendations = await getBookRecommendations(userProfile);

recommendations.forEach(book => {
  console.log(`${book.title} by ${book.author}`);
  console.log(`Reason: ${book.reason}\n`);
});
```

### Manual Initialization

The service auto-initializes, but you can manually initialize if needed:

```javascript
import { initializeGemini } from './services/geminiService.js';

initializeGemini();
```

### Testing the Service

```bash
# Run comprehensive test suite
node services/testGemini.js
```

### Get Book Description

```javascript
import { getBookDescription } from './services/geminiService.js';

const description = await getBookDescription('1984', 'George Orwell');
console.log(description);
```

## API Functions

### `initializeGemini()`
Initializes both primary and fallback AI models.

**Throws**: Error if GEMINI_API_KEY not found

---

### `getBookRecommendations(userProfile)`
Generates 10 personalized book recommendations.

**Parameters**:
- `userProfile` (Object):
  - `topGenres` (string[]): User's favorite genres
  - `favoriteAuthors` (string[]): User's favorite authors
  - `recentBooks` (Object[]): Recently read books with title, author, genre
  - `totalBooks` (number): Total books read
  - `avgRating` (number): Average rating (1-5)

**Returns**: Promise<Array<{title, author, genre, reason}>>

**Fallback Strategy**:
1. Try gemini-2.0-flash-exp (experimental)
2. If fails, try gemini-1.5-flash (stable)
3. If both fail, return empty array

---

### `testGeminiService()`
Tests if the service is operational.

**Returns**: Promise<boolean>

---

### `getBookDescription(bookTitle, bookAuthor)`
Generates a compelling 2-3 sentence description.

**Parameters**:
- `bookTitle` (string): Book title
- `bookAuthor` (string): Book author

**Returns**: Promise<string>

## Model Information

### Primary Model: gemini-2.0-flash-exp
- Latest experimental Gemini model
- Enhanced reasoning capabilities
- Better context understanding
- Improved creative recommendations

### Fallback Model: gemini-1.5-flash
- Stable, production-ready
- Proven reliability
- Consistent performance
- Lower latency

## Error Handling

The service handles these scenarios gracefully:

1. **Rate Limiting**: Automatically falls back to stable model
2. **API Errors**: Returns empty array with detailed logging
3. **Network Issues**: Logs error and allows graceful degradation
4. **Invalid Responses**: Attempts to parse and clean various formats

## Logging

The service provides detailed console output:

- ✅ Success messages with model used
- ⚠️  Warnings when falling back
- ❌ Errors with troubleshooting hints
- 📚 Recommendation counts

## Integration Example

```javascript
// In your route handler
import { getBookRecommendations } from '../services/geminiService.js';
import UserBook from '../models/UserBook.js';

export async function getRecommendationsRoute(req, res) {
  const userId = req.user.userId;

  // Build user profile from database
  const stats = await UserBook.getReadingStats(userId);
  const recentBooks = await UserBook.getUserBooks(userId);

  const userProfile = {
    topGenres: extractTopGenres(recentBooks),
    favoriteAuthors: extractFavoriteAuthors(recentBooks),
    recentBooks: recentBooks.slice(0, 10).map(b => ({
      title: b.title,
      author: b.authors[0],
      genre: b.categories[0]
    })),
    totalBooks: stats.totalBooks,
    avgRating: stats.averageUserRating || 4.0
  };

  const recommendations = await getBookRecommendations(userProfile);

  res.json({
    success: true,
    data: recommendations
  });
}
```

## Testing

The test suite verifies:
1. Service initialization
2. Recommendation generation for fantasy readers
3. Recommendation generation for mystery readers
4. Model fallback functionality
5. Error handling

Expected output:
```
✅ ALL TESTS PASSED
Gemini AI service is fully operational!
```

## Troubleshooting

### No recommendations generated
- Check GEMINI_API_KEY in .env
- Verify internet connection
- Check API quota limits
- Review console logs for specific errors

### Service initialization fails
- Ensure GEMINI_API_KEY is set
- Verify API key is valid
- Check if key has necessary permissions

### Rate limit errors
- Service automatically falls back to stable model
- Consider caching recommendations
- Implement request throttling

## Best Practices

1. **Cache Recommendations**: Store generated recommendations to reduce API calls
2. **Batch Requests**: Generate recommendations for multiple users in scheduled jobs
3. **Monitor Usage**: Track API usage to stay within limits
4. **Error Handling**: Always check for empty arrays and handle gracefully
5. **User Feedback**: Allow users to rate recommendations to improve future prompts

## File Structure

```
backend/services/
├── geminiService.js    # Main service implementation
├── testGemini.js       # Test suite
└── README.md           # This file
```

## Environment Variables

Required in `.env`:
```
GEMINI_API_KEY=your_api_key_here
```

## Dependencies

- `@google/generative-ai`: ^0.21.0 (or latest)

## License

Part of the ShelfSense project.
