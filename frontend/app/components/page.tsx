// frontend/app/page.tsx
import ChurnInputForm from './churninputform';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-100">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center">Sales Management System</h1>
        
        {/* Add the new form component to the page */}
        <div className="flex justify-center">
          <ChurnInputForm />
        </div>
        
      </div>
    </main>
  );
}