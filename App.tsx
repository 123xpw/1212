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

      {/* 
        BACKEND EXPANSION GUIDE (HIDDEN):
        
        To migrate Curio Travel to a full stack application:
        
        1. API Layer:
           - Create RESTful endpoints or GraphQL resolvers.
        
        2. Database:
           - Replace 'types.ts' with DB Models.
           - Use Cloudinary/S3 for images.
        
        3. Authentication:
           - Implement JWT auth.
        
        4. Frontend:
           - Replace storageService with apiService.
      */}
    </div>
  );
}

export default App;