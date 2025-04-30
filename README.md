# GraphQL Profile Dashboard

A modern, dark-themed dashboard for visualizing your school progress using GraphQL. This application fetches and displays user information, XP progress, project grades, audit activities, and module-specific statistics.

## Live Demo

View the live dashboard at: [https://stella-achar-oiro.github.io/graphql/](https://stella-achar-oiro.github.io/graphql/)

## Features

- **Dynamic Module Selection** with module persistence across sessions
- **Modern Dark/Light Theme** with automatic theme persistence
- **Responsive Design** with mobile-optimized layout and charts
- **Interactive SVG Visualizations** including:
  - XP Progress Timeline
  - Audit Activity Distribution
  - Project Success Rate Charts
- **Real-time Data Updates** with module-specific statistics
- **Smart XP Display** using file size format (B, KB, MB)
- **Advanced Filtering & Sorting** for transactions and projects
- **Secure JWT Authentication** with token validation
- **Mobile-First Sidebar** with collapsible navigation

## Project Structure

```
/graphql/
  ├── index.html           # Main entry point
  ├── css/                 # Stylesheets
  │   ├── styles.css       # Main styles with theme support
  │   └── sidebar.css      # Sidebar-specific styles
  ├── js/                  # JavaScript modules
  │   ├── app.js          # Application entry point
  │   ├── router.js       # Client-side routing
  │   ├── components/     # UI Components
  │   │   ├── LoginComponent.js
  │   │   ├── ModuleSelectionComponent.js
  │   │   ├── ProfileComponent.js
  │   │   ├── ProgressComponent.js
  │   │   ├── StatisticsComponent.js
  │   │   ├── TransactionsComponent.js
  │   │   ├── UserInfoComponent.js
  │   │   └── XPComponent.js
  │   └── utils/          # Utility modules
  │       ├── AuthManager.js
  │       ├── FormatUtils.js
  │       ├── GraphQLClient.js
  │       └── queries.js
  └── LICENSE             # MIT License
```

## Technical Features

### Module Management
- Dynamic module switching with state persistence
- Parent/child module relationship handling
- Automatic data reloading on module change

### Theme System
- CSS variable-based theming
- Persistent theme preferences
- Dark/light mode with smooth transitions
- Chart colors that adapt to theme

### Data Visualization
- SVG-based charts with theme support
- Interactive tooltips and hover states
- Responsive chart scaling
- Real-time data updates

### Authentication
- JWT-based authentication
- Token validation and refresh
- Secure credential handling
- Persistent session management

### Performance
- Request deduplication for GraphQL queries
- Efficient DOM updates
- Lazy-loaded components
- Optimized mobile performance

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

1. Clone the repository
2. Open index.html in a modern browser
3. No build step required - uses native ES modules

## GraphQL API Integration

The dashboard connects to a GraphQL API endpoint with the following queries:
- User information
- XP transactions
- Project progress
- Audit data
- Module-specific results

## Mobile Responsiveness

The dashboard is fully responsive with:
- Collapsible sidebar navigation
- Mobile-optimized charts
- Touch-friendly controls
- Adaptive layouts for all screen sizes

## License

MIT License - See [LICENSE](LICENSE) file for details