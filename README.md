Echo:AI Mood-Based Playlist Generator
Project Overview
Music enhances our daily lives, but finding the perfect playlist for a specific mood or activity can be time-consuming. **ECHO**  leverages AI to instantly generate personalized playlists based on natural language mood descriptions, providing a seamless music discovery experience.
## Objective
Create an intuitive web application using **Gemini AI** to interpret mood-based prompts and the **Spotify API** to curate playlists. The app is designed to make music discovery effortless and personalized.
## Features Implemented
- Search bar to find playlists by mood or keyword  
- Dynamic display of playlist results fetched via Spotify API (through Gemini API)  
- Hourly update of Spotify API data  
- Placeholder buttons for future Spotify linking  
## Technology Stack
- **Frontend:** React  
- **Backend:** Node.js  
- **APIs:** Gemini AI, Spotify API  
## Setup Instructions
1. Clone the repository:  
   ```bash
   git clone https://github.com/Adwika-95/Echo-.git
**Configure APIs**:
Spotify API:
Create a Spotify Developer account and generate a Client ID and Client Secret.
Add these credentials in your backend environment variables.
**Note**: Spotify API access tokens expire every 1 hour, so the backend fetches a new token periodically to keep playlist data updated.
Gemini AI API:
Obtain an API key from Gemini AI and add it to your backend environment variables.
