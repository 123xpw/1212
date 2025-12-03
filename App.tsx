import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { JourneysView } from './views/Journeys';
import { ExpensesView } from './views/Expenses';
import { WishlistView } from './views/Wishlist';
import { ExploreView } from './views/Explore';
import { ViewName } from './types';

function App() {
  const [currentView, setCurrentView] = useState<ViewName>('journeys');

  const renderView = () => {
    switch (currentView) {
      case 'journeys': return <JourneysView />;
      case 'expenses': return <ExpensesView />;
      case 'wishlist': return <WishlistView />;
      case 'explore': return <ExploreView />;
      default: return <JourneysView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-blue-100">
      <Navbar currentView={currentView} onNavigate={setCurrentView} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {renderView()}
      </main>

      {/* Backend Expansion Guide Component (Hidden in UI, present in code) */}
      <div className="hidden">
        {/* 
          BACKEND EXPANSION GUIDE:
          
          To migrate this frontend-only app to a full stack application (Django/Node):
          
          1. API Layer:
             - Create RESTful endpoints or GraphQL resolvers for Journeys, Expenses, and Wishlist.
             - Example endpoints: GET /api/journeys, POST /api/journeys, DELETE /api/journeys/:id
          
          2. Database:
             - Replace 'types.ts' interfaces with Database Models (e.g., Mongoose Schema or Django Models).
             - Store images in S3 or Cloudinary instead of using picsum placeholder URLs.
          
          3. Authentication:
             - Implement JWT auth. 
             - Add a Login/Signup view in App.tsx.
             - Secure endpoints so users only see their own data.
          
          4. Frontend Changes:
             - Replace 'services/storageService.ts' with 'services/apiService.ts' using fetch or axios.
             - Use React Query or SWR for better server-state management.
        */}
      </div>
    </div>
  );
}

export default App;
