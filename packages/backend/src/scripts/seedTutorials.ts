import mongoose from "mongoose";
import dotenv from "dotenv";
import { TutorialModel, ITutorial } from "../models/Tutorial";
import { ConceptModel } from "../models/Concept";
import { webAPIsTutorial } from "./tutorials/webAPIsTutorial";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/code-challenges";

// Define type for our tutorial data
interface TutorialData extends Omit<ITutorial, '_id' | 'createdAt' | 'updatedAt'> {
  relatedConcepts: mongoose.Types.ObjectId[];
}

const dataRenderingPatternsTutorial: TutorialData = {
  title: "Data Rendering Patterns in React",
  slug: "data-rendering-patterns-react",
  description: "Learn essential patterns for rendering data efficiently in React applications, from basic listings to advanced virtualization techniques.",
  category: "patterns",
  language: "all", // Changed from typescript to all to make it appear in all language filters
  order: 1,
  prerequisites: [],
  mainImage: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613",
  timeToComplete: 45,
  author: "Cristian Echeverria",
  relatedConcepts: [],
  steps: [
    {
      title: "Introduction to Data Rendering Patterns",
      content: `
        <p class="text-gray-800 dark:text-gray-200">When building web applications, efficiently displaying data to users is one of the most common tasks you'll face. React offers several approaches to render data, each with its own advantages and tradeoffs.</p>
        
        <p class="text-gray-800 dark:text-gray-200">In this tutorial, we'll explore:</p>
        <ul class="text-gray-800 dark:text-gray-200">
          <li>Basic list rendering techniques</li>
          <li>Conditional rendering patterns</li>
          <li>Data-driven component rendering</li>
          <li>Virtualization for large datasets</li>
          <li>Data fetching strategies</li>
        </ul>
        
        <p class="text-gray-800 dark:text-gray-200">By the end of this tutorial, you'll have a solid understanding of how to efficiently render data in your React applications, improving both performance and user experience.</p>
      `,
      codeExamples: [],
    },
    {
      title: "Basic List Rendering",
      content: `
        <p class="text-gray-800 dark:text-gray-200">The most common data rendering pattern in React is mapping over an array to create a list of elements. This technique is simple yet powerful.</p>
        
        <p class="text-gray-800 dark:text-gray-200">When rendering lists in React, remember these key principles:</p>
        <ul class="text-gray-800 dark:text-gray-200">
          <li><strong>Use the key prop</strong>: Always provide a unique key for each item to help React identify which items have changed, been added, or removed.</li>
          <li><strong>Keep transformations simple</strong>: Transform your data into the desired format before rendering when possible.</li>
          <li><strong>Extract list item components</strong>: For complex items, create a dedicated component for better code organization.</li>
        </ul>
        
        <p class="text-gray-800 dark:text-gray-200">Let's see these principles in action with some examples.</p>
      `,
      codeExamples: [
        {
          title: "Basic Array Mapping",
          description: "A simple example of mapping an array to JSX elements with proper keys.",
          code: `import React from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

const UserList = () => {
  const users: User[] = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com' },
  ];

  return (
    <div className="user-list">
      <h2>User List</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <strong>{user.name}</strong> - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;`,
          language: "typescript",
        },
        {
          title: "Extracted List Item Component",
          description: "Improved version with a separate component for list items.",
          code: `import React from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface UserListItemProps {
  user: User;
}

// Extracted component for each list item
const UserListItem = ({ user }: UserListItemProps) => (
  <li className="user-item">
    <div className="user-name">{user.name}</div>
    <div className="user-email">{user.email}</div>
  </li>
);

const UserList = () => {
  const users: User[] = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com' },
  ];

  return (
    <div className="user-list">
      <h2>User List</h2>
      <ul>
        {users.map((user) => (
          <UserListItem key={user.id} user={user} />
        ))}
      </ul>
    </div>
  );
};

export default UserList;`,
          language: "typescript",
        },
      ],
    },
    {
      title: "Conditional Rendering Patterns",
      content: `
        <p>Conditional rendering is a powerful technique that allows you to show different UI elements based on certain conditions. This is essential for creating dynamic interfaces that respond to user actions and data states.</p>
        
        <p>In React, there are several approaches to conditional rendering:</p>
        <ul>
          <li><strong>If statements</strong>: Using JavaScript if statements in component logic</li>
          <li><strong>Ternary operators</strong>: Inline conditions with the ? : syntax</li>
          <li><strong>Logical AND (&&)</strong>: Short-circuit evaluation for simple cases</li>
          <li><strong>Switch statements</strong>: For multiple conditions</li>
          <li><strong>Conditional component rendering</strong>: Rendering different components based on state</li>
        </ul>
        
        <p>Let's explore these patterns with some practical examples.</p>
      `,
      codeExamples: [
        {
          title: "Using Ternary Operators",
          description: "Conditional rendering with the ternary operator for two alternatives.",
          code: `import React, { useState } from 'react';

const UserProfile = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({ name: 'John Doe', email: 'john@example.com' });

  return (
    <div className="user-profile">
      <h2>User Profile</h2>
      
      {/* Conditional rendering using ternary operator */}
      {isLoggedIn ? (
        <div className="profile-info">
          <p>Welcome back, {user.name}!</p>
          <p>Email: {user.email}</p>
          <button onClick={() => setIsLoggedIn(false)}>Log Out</button>
        </div>
      ) : (
        <div className="login-prompt">
          <p>Please log in to view your profile</p>
          <button onClick={() => setIsLoggedIn(true)}>Log In</button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;`,
          language: "typescript",
        },
        {
          title: "Using Logical AND (&&)",
          description: "Short-circuit evaluation for simple conditional rendering.",
          code: `import React, { useState } from 'react';

interface Notification {
  id: number;
  message: string;
}

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, message: 'Your profile was updated successfully' },
    { id: 2, message: 'You have a new message' }
  ]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <div className="notification-center">
      <h2>Notifications</h2>
      
      {/* Render count badge only if there are notifications */}
      {notifications.length > 0 && (
        <span className="badge">{notifications.length}</span>
      )}
      
      <ul className="notification-list">
        {notifications.map(notification => (
          <li key={notification.id}>{notification.message}</li>
        ))}
      </ul>
      
      {/* Only show clear button if there are notifications */}
      {notifications.length > 0 && (
        <button onClick={clearNotifications}>Clear All</button>
      )}
      
      {/* Show a message when there are no notifications */}
      {notifications.length === 0 && (
        <p>You have no new notifications</p>
      )}
    </div>
  );
};

export default NotificationCenter;`,
          language: "typescript",
        },
      ],
    },
    {
      title: "Data-Driven Component Rendering",
      content: `
        <p>Data-driven component rendering is a powerful pattern where your UI structure is determined by the shape and content of your data. This approach makes your components more dynamic and adaptable.</p>
        
        <p>The key benefits of this approach include:</p>
        <ul>
          <li><strong>Flexible UI</strong>: The interface adapts based on the data it receives</li>
          <li><strong>Reusable components</strong>: Components can handle different data structures</li>
          <li><strong>Maintainable code</strong>: Changes to the UI can be driven by data changes</li>
          <li><strong>Declarative rendering</strong>: The UI is a direct reflection of the data state</li>
        </ul>
        
        <p>Let's explore some techniques for data-driven rendering.</p>
      `,
      codeExamples: [
        {
          title: "Component Map Pattern",
          description: "Map data types to specific components for rendering.",
          code: `import React from 'react';

// Different data types that require different rendering
type ContentItem = 
  | { type: 'text'; content: string }
  | { type: 'image'; url: string; alt: string }
  | { type: 'video'; url: string; title: string }
  | { type: 'quote'; text: string; author: string };

// Component for text content
const TextItem = ({ content }: { content: string }) => (
  <div className="text-item">
    <p>{content}</p>
  </div>
);

// Component for image content
const ImageItem = ({ url, alt }: { url: string; alt: string }) => (
  <div className="image-item">
    <img src={url} alt={alt} />
  </div>
);

// Component for video content
const VideoItem = ({ url, title }: { url: string; title: string }) => (
  <div className="video-item">
    <h3>{title}</h3>
    <video src={url} controls />
  </div>
);

// Component for quote content
const QuoteItem = ({ text, author }: { text: string; author: string }) => (
  <div className="quote-item">
    <blockquote>"{text}"</blockquote>
    <cite>— {author}</cite>
  </div>
);

// Map content types to components
const contentComponentMap = {
  text: TextItem,
  image: ImageItem,
  video: VideoItem,
  quote: QuoteItem,
};

// Main content renderer component
const DynamicContent = () => {
  // Sample content items of different types
  const contentItems: ContentItem[] = [
    { type: 'text', content: 'This is a sample text paragraph.' },
    { type: 'image', url: 'https://example.com/image.jpg', alt: 'Sample image' },
    { type: 'quote', text: 'The best way to predict the future is to create it.', author: 'Peter Drucker' },
    { type: 'video', url: 'https://example.com/video.mp4', title: 'Introduction to Data Rendering' },
  ];

  return (
    <div className="dynamic-content">
      <h2>Dynamic Content</h2>
      <div className="content-container">
        {contentItems.map((item, index) => {
          // Dynamically select the appropriate component based on content type
          const ContentComponent = contentComponentMap[item.type];
          
          // Render the component with the appropriate props
          return <ContentComponent key={index} {...item} />;
        })}
      </div>
    </div>
  );
};

export default DynamicContent;`,
          language: "typescript",
        },
      ],
    },
    {
      title: "Virtualization for Large Datasets",
      content: `
        <p>When dealing with large datasets, rendering all items at once can significantly impact performance. This is where virtualization comes in — a technique that only renders items currently visible in the viewport.</p>
        
        <p>Benefits of virtualization include:</p>
        <ul>
          <li><strong>Improved performance</strong>: Only visible items consume resources</li>
          <li><strong>Reduced memory usage</strong>: Fewer DOM nodes are created</li>
          <li><strong>Smoother scrolling</strong>: Less work per scroll event means better frame rates</li>
          <li><strong>Faster initial rendering</strong>: Only the initial viewport items need to be rendered</li>
        </ul>
        
        <p>While you can implement virtualization yourself, libraries like <code>react-window</code> and <code>react-virtualized</code> provide optimized solutions. Let's look at a basic example using react-window.</p>
      `,
      codeExamples: [
        {
          title: "Virtualized List with react-window",
          description: "Using react-window to efficiently render a large list of items.",
          code: `import React from 'react';
import { FixedSizeList as List } from 'react-window';

// For a real implementation, you would need to install react-window:
// npm install react-window
// npm install --save-dev @types/react-window

interface User {
  id: number;
  name: string;
  email: string;
}

const VirtualizedUserList = () => {
  // Generate a large dataset (in a real app, this would come from an API)
  const users: User[] = Array.from({ length: 10000 }, (_, index) => ({
    id: index,
    name: \`User \${index}\`,
    email: \`user\${index}@example.com\`,
  }));

  // Row renderer function - will only be called for visible items
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const user = users[index];
    
    return (
      <div className="user-row" style={style}>
        <div className="user-card">
          <h3>{user.name}</h3>
          <p>{user.email}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="virtualized-list-container">
      <h2>Virtualized User List (10,000 users)</h2>
      <div className="list-container">
        <List
          height={400} // Fixed height container
          itemCount={users.length} // Total number of items
          itemSize={80} // Height of each item in pixels
          width="100%" // Width of the list
        >
          {Row}
        </List>
      </div>
    </div>
  );
};

export default VirtualizedUserList;`,
          language: "typescript",
        },
      ],
    },
    {
      title: "Data Fetching and Loading States",
      content: `
        <p>Properly handling data fetching and loading states is crucial for a good user experience. Users should always understand what's happening, whether data is loading, an error occurred, or the operation completed successfully.</p>
        
        <p>Common states to handle include:</p>
        <ul>
          <li><strong>Loading</strong>: Initial data fetch or refreshing</li>
          <li><strong>Empty</strong>: No data available</li>
          <li><strong>Error</strong>: Something went wrong during fetching</li>
          <li><strong>Partial</strong>: Some data loaded, but not all</li>
          <li><strong>Success</strong>: Data loaded successfully</li>
        </ul>
        
        <p>Let's implement a component that handles these different states elegantly.</p>
      `,
      codeExamples: [
        {
          title: "Complete Data Fetching Pattern",
          description: "A component that handles all data states: loading, error, empty, and success.",
          code: `import React, { useState, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

type DataState = {
  status: 'idle' | 'loading' | 'success' | 'error';
  data: Product[] | null;
  error: string | null;
};

const ProductList = () => {
  const [state, setState] = useState<DataState>({
    status: 'idle',
    data: null,
    error: null,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      // Set loading state
      setState({ status: 'loading', data: null, error: null });
      
      try {
        // In a real app, this would be an API call
        // const response = await fetch('https://api.example.com/products');
        // const data = await response.json();
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulate API response
        const data: Product[] = [
          { id: 1, name: 'Laptop', price: 1299, description: 'Powerful laptop for development' },
          { id: 2, name: 'Smartphone', price: 699, description: 'Latest smartphone model' },
          { id: 3, name: 'Headphones', price: 199, description: 'Noise-cancelling headphones' },
        ];
        
        // Set success state with data
        setState({ status: 'success', data, error: null });
      } catch (error) {
        // Set error state
        setState({ 
          status: 'error', 
          data: null, 
          error: error instanceof Error ? error.message : 'An unknown error occurred' 
        });
      }
    };

    fetchProducts();
  }, []);

  // Different UI based on the current state
  const renderContent = () => {
    switch (state.status) {
      case 'idle':
        return <p>Ready to load products.</p>;
        
      case 'loading':
        return (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading products...</p>
          </div>
        );
        
      case 'error':
        return (
          <div className="error-state">
            <h3>Error Loading Products</h3>
            <p>{state.error}</p>
            <button onClick={() => fetchProducts()}>Try Again</button>
          </div>
        );
        
      case 'success':
        // Empty state check
        if (!state.data || state.data.length === 0) {
          return (
            <div className="empty-state">
              <h3>No Products Found</h3>
              <p>There are no products available at this time.</p>
            </div>
          );
        }
        
        // Success state with data
        return (
          <div className="product-grid">
            {state.data.map(product => (
              <div key={product.id} className="product-card">
                <h3>{product.name}</h3>
                <p className="price">\${product.price}</p>
                <p>{product.description}</p>
                <button>Add to Cart</button>
              </div>
            ))}
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="product-list-container">
      <h2>Products</h2>
      {renderContent()}
    </div>
  );
};

export default ProductList;`,
          language: "typescript",
        },
      ],
    }
  ],
};

async function seedTutorials() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Find related concepts
    const reactConcept = await ConceptModel.findOne({ slug: "react" });
    const stateConcept = await ConceptModel.findOne({ slug: "react-state" });
    const webApisConcept = await ConceptModel.findOne({ slug: "web-apis" });
    const javascriptConcept = await ConceptModel.findOne({ slug: "javascript" });

    // Set related concepts for the Data Rendering Patterns tutorial
    if (reactConcept || stateConcept) {
      const relatedConcepts: mongoose.Types.ObjectId[] = [];
      if (reactConcept) relatedConcepts.push(reactConcept._id);
      if (stateConcept) relatedConcepts.push(stateConcept._id);
      dataRenderingPatternsTutorial.relatedConcepts = relatedConcepts;
    }
    
    // Set related concepts for the Web APIs tutorial
    if (webApisConcept || javascriptConcept) {
      const relatedConcepts: mongoose.Types.ObjectId[] = [];
      if (webApisConcept) relatedConcepts.push(webApisConcept._id);
      if (javascriptConcept) relatedConcepts.push(javascriptConcept._id);
      webAPIsTutorial.relatedConcepts = relatedConcepts;
    }

    // Array of tutorials to seed
    const tutorials = [dataRenderingPatternsTutorial, webAPIsTutorial];
    
    // Seed each tutorial
    for (const tutorial of tutorials) {
      // Check if the tutorial already exists
      const existingTutorial = await TutorialModel.findOne({ 
        slug: tutorial.slug 
      });

      if (existingTutorial) {
        console.log(`Tutorial '${tutorial.title}' already exists. Updating...`);
        await TutorialModel.findByIdAndUpdate(
          existingTutorial._id,
          tutorial
        );
      } else {
        console.log(`Creating new tutorial: ${tutorial.title}`);
        await TutorialModel.create(tutorial);
      }
    }

    console.log("Tutorials seeded successfully!");
  } catch (error) {
    console.error("Error seeding tutorials:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the seed function
seedTutorials();