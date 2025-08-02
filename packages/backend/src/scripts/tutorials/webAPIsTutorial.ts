import mongoose from "mongoose";
import { ITutorial } from "../../models/Tutorial";

// Define type for our tutorial data
interface TutorialData extends Omit<ITutorial, '_id' | 'createdAt' | 'updatedAt'> {
  relatedConcepts: mongoose.Types.ObjectId[];
}

export const webAPIsTutorial: TutorialData = {
  title: "Modern Web APIs: Building Interactive Web Applications",
  slug: "modern-web-apis",
  description: "Learn how to use browser Web APIs to build powerful, interactive web applications with features like data fetching, storage, history manipulation, and offline functionality.",
  category: "fundamentals",
  language: "all",
  order: 2,
  prerequisites: [],
  mainImage: "https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2",
  timeToComplete: 60,
  author: "Cristian Echeverria",
  relatedConcepts: [],
  steps: [
    {
      title: "Introduction to Web APIs",
      content: `
        <p class="text-gray-800 dark:text-gray-200">Modern browsers provide powerful APIs that allow web applications to interact with various system features. These Web APIs enable developers to create rich, interactive web experiences.</p>
        
        <p class="text-gray-800 dark:text-gray-200">In this tutorial, we'll explore essential Web APIs that every front-end developer should know:</p>
        <ul class="text-gray-800 dark:text-gray-200">
          <li><strong>Fetch API</strong>: Making HTTP requests to retrieve data from servers</li>
          <li><strong>Web Storage API</strong>: Storing data in the browser with localStorage and sessionStorage</li>
          <li><strong>History API</strong>: Manipulating the browser history and implementing client-side routing</li>
          <li><strong>Service Workers</strong>: Enabling offline functionality and background processing</li>
        </ul>
        
        <p class="text-gray-800 dark:text-gray-200">Understanding these APIs is crucial for building modern web applications that provide a seamless user experience across different network conditions.</p>

        <p class="text-gray-800 dark:text-gray-200">By the end of this tutorial, you'll be able to confidently implement these APIs in your own projects to enhance their functionality and user experience.</p>
      `,
      codeExamples: [],
    },
    {
      title: "Fetch API: Making HTTP Requests",
      content: `
        <p class="text-gray-800 dark:text-gray-200">The Fetch API provides a modern interface for making HTTP requests. It's a more powerful and flexible replacement for the older XMLHttpRequest.</p>
        
        <p class="text-gray-800 dark:text-gray-200">Key features of the Fetch API include:</p>
        <ul class="text-gray-800 dark:text-gray-200">
          <li><strong>Promise-based</strong>: Works naturally with async/await for cleaner code</li>
          <li><strong>Request/Response objects</strong>: Provides a standardized way to handle HTTP interactions</li>
          <li><strong>Headers object</strong>: Makes it easy to manipulate request and response headers</li>
          <li><strong>Request options</strong>: Offers fine-grained control over requests (method, headers, body, mode, etc.)</li>
        </ul>
        
        <p class="text-gray-800 dark:text-gray-200">Let's look at how to use the Fetch API for common operations:</p>
      `,
      codeExamples: [
        {
          title: "Basic GET Request",
          description: "Making a simple GET request to fetch data from an API.",
          code: `// Basic GET request
fetch('https://api.example.com/data')
  .then(response => {
    // Check if the request was successful
    if (!response.ok) {
      throw new Error('Network response was not ok: ' + response.status);
    }
    return response.json(); // Parse the JSON response
  })
  .then(data => {
    console.log('Data received:', data);
    // Use the data to update your UI
  })
  .catch(error => {
    console.error('Fetch error:', error);
    // Handle errors appropriately
  });

// Using async/await for cleaner code
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data');
    
    if (!response.ok) {
      throw new Error('Network response was not ok: ' + response.status);
    }
    
    const data = await response.json();
    console.log('Data received:', data);
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    // Handle errors appropriately
  }
}`,
          language: "javascript",
        },
        {
          title: "POST Request with JSON Data",
          description: "Sending data to an API using a POST request with JSON payload.",
          code: `// POST request with JSON data
async function postData(url, data) {
  try {
    const response = await fetch(url, {
      method: 'POST',               // HTTP method
      headers: {                    // Request headers
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      },
      body: JSON.stringify(data)    // Convert data to JSON string
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok: ' + response.status);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error posting data:', error);
    throw error;  // Re-throw to let the caller handle it
  }
}

// Example usage
const userData = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  role: 'developer'
};

postData('https://api.example.com/users', userData)
  .then(result => console.log('User created:', result))
  .catch(error => console.error('Failed to create user:', error));`,
          language: "javascript",
        }
      ],
    },
    {
      title: "Web Storage API: localStorage and sessionStorage",
      content: `
        <p class="text-gray-800 dark:text-gray-200">The Web Storage API provides mechanisms for storing data in the browser. It offers two main storage options:</p>
        
        <ul class="text-gray-800 dark:text-gray-200">
          <li><strong>localStorage</strong>: Persistent storage that remains until explicitly deleted</li>
          <li><strong>sessionStorage</strong>: Temporary storage that lasts only for the duration of the page session</li>
        </ul>
        
        <p class="text-gray-800 dark:text-gray-200">Both storage types provide a simple key-value store for string data, with a much larger capacity than cookies (typically 5-10MB). They also don't send data to the server with every HTTP request, unlike cookies.</p>
        
        <p class="text-gray-800 dark:text-gray-200">When to use each type:</p>
        <ul class="text-gray-800 dark:text-gray-200">
          <li><strong>localStorage</strong>: Use for long-term data that should persist between sessions (user preferences, theme settings, etc.)</li>
          <li><strong>sessionStorage</strong>: Use for temporary data needed only during the current page session (form data, navigation state, etc.)</li>
        </ul>
        
        <p class="text-gray-800 dark:text-gray-200">Let's explore how to use both storage mechanisms:</p>
      `,
      codeExamples: [
        {
          title: "Using localStorage",
          description: "Storing and retrieving data using localStorage for persistent storage.",
          code: `// Storing data in localStorage
localStorage.setItem('username', 'JohnDoe');
localStorage.setItem('theme', 'dark');
localStorage.setItem('lastLogin', new Date().toISOString());

// To store objects or arrays, you need to convert them to JSON strings
const userPreferences = {
  theme: 'dark',
  fontSize: 16,
  notifications: true
};

// Store object as JSON string
localStorage.setItem('preferences', JSON.stringify(userPreferences));

// Retrieving data from localStorage
const username = localStorage.getItem('username');  // 'JohnDoe'
const theme = localStorage.getItem('theme');        // 'dark'

// Parse JSON data when retrieving objects
const storedPreferences = localStorage.getItem('preferences');
const preferences = JSON.parse(storedPreferences);
console.log(preferences.fontSize);  // 16

// Removing specific items
localStorage.removeItem('lastLogin');

// Clearing all data in localStorage
localStorage.clear();

// Checking if an item exists
if (localStorage.getItem('username')) {
  console.log('User is remembered');
} else {
  console.log('No saved username');
}

// Getting the number of items in storage
const itemCount = localStorage.length;
console.log('Items in storage:', itemCount);`,
          language: "javascript",
        },
        {
          title: "Using sessionStorage",
          description: "Storing and retrieving temporary data with sessionStorage.",
          code: `// sessionStorage works the same way as localStorage
// but data is cleared when the page session ends

// Storing data in sessionStorage
sessionStorage.setItem('currentPage', '3');
sessionStorage.setItem('searchQuery', 'javascript tutorials');

// Storing form data temporarily
const formData = {
  name: document.getElementById('name').value,
  email: document.getElementById('email').value,
  message: document.getElementById('message').value
};

// Save form data in case user accidentally navigates away
sessionStorage.setItem('contactForm', JSON.stringify(formData));

// Later, we can restore the form data
function restoreFormData() {
  const savedData = sessionStorage.getItem('contactForm');
  
  if (savedData) {
    const formData = JSON.parse(savedData);
    document.getElementById('name').value = formData.name;
    document.getElementById('email').value = formData.email;
    document.getElementById('message').value = formData.message;
  }
}

// Removing data
sessionStorage.removeItem('searchQuery');

// Clear all sessionStorage data
sessionStorage.clear();`,
          language: "javascript",
        }
      ],
    },
    {
      title: "History API: Manipulating Browser History",
      content: `
        <p class="text-gray-800 dark:text-gray-200">The History API allows you to manipulate the browser's session history. It's a key component in building single-page applications (SPAs) with client-side routing.</p>
        
        <p class="text-gray-800 dark:text-gray-200">With the History API, you can:</p>
        <ul class="text-gray-800 dark:text-gray-200">
          <li><strong>Navigate</strong> programmatically through the browser history</li>
          <li><strong>Add new entries</strong> to the browser history without triggering a page reload</li>
          <li><strong>Replace the current entry</strong> in the history stack</li>
          <li><strong>Associate state data</strong> with history entries</li>
        </ul>
        
        <p class="text-gray-800 dark:text-gray-200">This API is what enables modern JavaScript frameworks like React Router, Vue Router, and others to manage navigation in SPAs while maintaining browser history functionality.</p>
        
        <p class="text-gray-800 dark:text-gray-200">Let's look at how to use the History API:</p>
      `,
      codeExamples: [
        {
          title: "Basic History Navigation",
          description: "Using the History API to navigate through browser history.",
          code: `// Navigate backwards (like clicking the browser's back button)
window.history.back();

// Navigate forwards (like clicking the forward button)
window.history.forward();

// Go to a specific point in history relative to the current page
// Negative values move backward, positive values move forward
window.history.go(-2);  // Go back 2 pages
window.history.go(1);   // Go forward 1 page

// Getting the history length
console.log('History entries:', window.history.length);

// Note: For security reasons, you can't access the actual URLs in the history
// object or view the complete history list`,
          language: "javascript",
        },
        {
          title: "Adding and Modifying History Entries",
          description: "Manipulating browser history without page reloads.",
          code: `// Adding a new entry to the browser history
// This changes the URL in the address bar without reloading the page
const addHistoryEntry = (path, title, stateData) => {
  // path: The new URL path (e.g., '/products')
  // title: Page title (not supported in most browsers)
  // stateData: Any data you want to associate with this history entry
  
  const url = window.location.origin + path;
  const state = stateData || {};
  
  // Add a new entry to the history stack
  window.history.pushState(state, title, url);
};

// Example: Navigate to a new "page" in your SPA
addHistoryEntry('/products', 'Products Page', { section: 'products' });

// Replacing the current history entry instead of adding a new one
// Useful for updating the URL without adding to history stack
const replaceHistoryEntry = (path, title, stateData) => {
  const url = window.location.origin + path;
  const state = stateData || {};
  
  // Replace current history entry
  window.history.replaceState(state, title, url);
};

// Example: Update URL with query parameters without adding history entry
replaceHistoryEntry(
  '/products?category=electronics&sort=price', 
  'Electronics Products', 
  { category: 'electronics', sort: 'price' }
);

// Listening for navigation events (back/forward buttons)
window.addEventListener('popstate', (event) => {
  // event.state contains the state data (if any) that was
  // passed to pushState or replaceState
  console.log('Navigation occurred:', event);
  console.log('State data:', event.state);
  
  // Update your application based on the new URL or state
  const currentPath = window.location.pathname;
  // updateUI(currentPath, event.state); // Example function to update UI
});`,
          language: "javascript",
        }
      ],
    },
    {
      title: "Service Workers: Offline Functionality",
      content: `
        <p class="text-gray-800 dark:text-gray-200">Service Workers are powerful scripts that run in the background, separate from a web page. They enable features that don't need a web page or user interaction, such as:</p>
        
        <ul class="text-gray-800 dark:text-gray-200">
          <li><strong>Offline functionality</strong>: Serving cached content when the network is unavailable</li>
          <li><strong>Background synchronization</strong>: Syncing data in the background when connectivity is restored</li>
          <li><strong>Push notifications</strong>: Receiving and displaying notifications from a server</li>
          <li><strong>Resource caching</strong>: Optimizing performance by controlling how resources are cached</li>
        </ul>
        
        <p class="text-gray-800 dark:text-gray-200">Service Workers act as a programmable network proxy, allowing you to control how network requests from your page are handled. This makes them perfect for implementing offline-first applications.</p>
        
        <p class="text-gray-800 dark:text-gray-200">Let's explore how to implement a basic Service Worker for offline functionality:</p>
      `,
      codeExamples: [
        {
          title: "Registering a Service Worker",
          description: "How to register a Service Worker in your web application.",
          code: `// Check if Service Workers are supported
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Register the service worker
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered successfully:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

// You can also check if the page is controlled by a service worker
if (navigator.serviceWorker.controller) {
  console.log('This page is controlled by a service worker');
}

// Communicating with a service worker
navigator.serviceWorker.addEventListener('message', event => {
  console.log('Message received from service worker:', event.data);
});

// Send a message to the service worker
const sendMessageToSW = message => {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(message);
  }
};`,
          language: "javascript",
        },
        {
          title: "Basic Service Worker Implementation",
          description: "A simple Service Worker script for caching and serving resources offline.",
          code: `// service-worker.js

// Version helps with cache management
const CACHE_NAME = 'my-site-cache-v1';

// Resources to cache immediately when the SW is installed
const INITIAL_CACHED_RESOURCES = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/scripts/main.js',
  '/images/logo.png',
  '/offline.html'  // Fallback page for when network is unavailable
];

// Install event - triggers when the SW is first installed
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  
  // Wait until the cache is set up before completing installation
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching initial resources');
        return cache.addAll(INITIAL_CACHED_RESOURCES);
      })
  );
});

// Activate event - triggers after the SW is installed
// This is a good place to clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  
  // Get all the cache keys (cache names)
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete any cache that isn't the current one
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - triggers whenever your page tries to load something
self.addEventListener('fetch', event => {
  console.log('Fetch intercepted for:', event.request.url);
  
  event.respondWith(
    // Try the network first, then fall back to the cache
    fetch(event.request)
      .then(response => {
        // Don't cache responses that aren't successful
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Clone the response - the response body can only be consumed once
        const responseToCache = response.clone();
        
        // Add the response to the cache for future use
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });
          
        return response;
      })
      .catch(() => {
        // When the network fails, try to get the resource from the cache
        return caches.match(event.request);
      })
  );
});`,
          language: "javascript",
        }
      ],
    },
    {
      title: "Putting It All Together: Building an Offline-Capable App",
      content: `
        <p class="text-gray-800 dark:text-gray-200">Now that we've covered the main Web APIs, let's see how they can work together to create a robust, offline-capable web application. In a real-world application, you might:</p>
        
        <ul class="text-gray-800 dark:text-gray-200">
          <li>Use <strong>localStorage</strong> to save user preferences and data locally</li>
          <li>Implement the <strong>Fetch API</strong> to sync data with a server when online</li>
          <li>Use the <strong>History API</strong> for client-side routing without page reloads</li>
          <li>Employ a <strong>Service Worker</strong> for offline functionality</li>
        </ul>
        
        <p class="text-gray-800 dark:text-gray-200">By combining these technologies, you can create web applications that work seamlessly whether the user is online or offline, providing a native-like experience in the browser.</p>

        <p class="text-gray-800 dark:text-gray-200">Key benefits of this approach include:</p>
        <ul class="text-gray-800 dark:text-gray-200">
          <li>Better user experience with faster page transitions</li>
          <li>Reduced server load as resources are cached locally</li>
          <li>Improved reliability in unstable network conditions</li>
          <li>The ability to work completely offline when necessary</li>
        </ul>

        <p class="text-gray-800 dark:text-gray-200">As you continue to build web applications, consider how these Web APIs can help you create more robust, performant, and user-friendly experiences.</p>
      `,
      codeExamples: [],
    }
  ],
};