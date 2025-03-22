# GraphQL Profile Dashboard

A modern, dark-themed dashboard for visualizing your school progress using GraphQL. This application fetches and displays user information, XP progress, project grades, audit activities, and skills assessment.

## Live Demo

View the live dashboard at: [https://stella-achar-oiro.github.io/graphql/](https://stella-achar-oiro.github.io/graphql/)

## Project Structure

```
/graphql-profile/
  ├── index.html           # Main entry point
  ├── assets/              # Static assets folder
      ├── css/             # Stylesheets
      │   ├── main.css     # Main styles with dark theme
      ├── js/              # JavaScript files
          ├── app.js       # Main application entry point
          ├── services/    # Service modules
          │   ├── auth.js  # Authentication service
          │   └── api.js   # GraphQL API service
          ├── components/  # UI components
          │   ├── profile.js   # Profile component
          │   ├── xp.js        # XP component
          │   ├── grades.js    # Grades component
          │   ├── audits.js    # Audits component
          │   └── skills.js    # Skills component
          └── utils/       # Utility functions
              └── charts.js    # SVG chart generators
  └── server.js            # Local development server
```

## Features

- **Modern Dark Theme UI** with light mode option
- **Responsive Design** for all screen sizes
- **Interactive Data Visualization** with SVG charts
- **File Size Style XP Display** for innovative metrics presentation
- **Privacy-focused** design with masked sensitive information
- **Filtering and Sorting** for projects
- **Skills Assessment** based on XP and project performance
- **Secure Authentication** with JWT token management

## Implementation Steps

1. **Create Project Structure**
   - Set up folders according to the structure above
   - Create all the necessary files

2. **Copy Files**
   - Copy all the provided code into their respective files
   - Make sure to keep the file structure consistent

3. **Install Dependencies for Local Server**
   - The project includes a simple Express server for local development
   - Run `npm init -y` and then `npm install express http-proxy-middleware`

4. **Start Local Server**
   - Run `node server.js` to start the local development server
   - The application will be available at `http://localhost:3000`

5. **Deploy to Hosting**
   - For GitHub Pages: Push to a GitHub repository and enable GitHub Pages
   - For Netlify: Link your repository and deploy from there
   - For other hosting: Follow their respective deployment instructions

## Authentication

The application uses JWT for authentication with the GraphQL API. The login process:

1. User enters credentials (username/email and password)
2. Credentials are encoded in Base64 and sent to the authentication endpoint
3. The JWT token is stored in localStorage
4. The token is included in the Authorization header for all GraphQL requests

## GraphQL Queries

The application uses several GraphQL queries:

- **User Info**: Basic profile information
- **XP Data**: Experience points transactions
- **Projects Data**: Project progress and grades
- **Audits Data**: Audits given and received

## Data Visualization

The dashboard includes several SVG-based charts:

1. **XP per Project**: Bar chart showing XP distribution across projects
2. **Project Pass/Fail Ratio**: Pie chart showing success rate
3. **XP Timeline**: Line chart showing XP growth over time
4. **Audit Performance**: Bar chart comparing audits given and received

## Customization Options

1. **Theme Customization**
   - Edit the CSS variables in `main.css` to change colors
   - Light and dark themes use separate variable sets

2. **Chart Styling**
   - Charts are fully customizable in `charts.js`
   - Colors automatically adapt to the selected theme

3. **Adding New Features**
   - The modular structure makes it easy to add new components
   - Just create a new component file and import it in `app.js`

## Browser Compatibility

The application is compatible with all modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Known Issues and Limitations

- SVG charts might not render correctly on very small screens
- The application requires JavaScript to be enabled
- Browser localStorage is used for token storage