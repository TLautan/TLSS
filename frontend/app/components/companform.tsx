// frontend/app/components/companyform.tsx
"use client";

import { useState } from 'react';
import axios from 'axios';

interface CompanyFormProps {
  onCompanyAdded: () => void;
}

export default function CompanyForm({ onCompanyAdded }: CompanyFormProps) {
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!companyName || !industry) {
      setError('Both fields are required.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      await axios.post('http://127.0.0.1:8000/api/companies/', {
        company_name: companyName,
        industry: industry,
      });
      // Clear the form and notify the parent
      setCompanyName('');
      setIndustry('');
      onCompanyAdded(); 
    } catch (err) {
      console.error("Failed to add company:", err);
      setError('Failed to save company.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md space-y-4">
      <h3 className="text-xl font-bold">Add New Company</h3>
      <div>
        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
        <input
          id="companyName"
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="mt-1 block w-full p-2 border rounded-md"
        />
      </div>
      <div>
        <label htmlFor="industry" className="block text-sm font-medium text-gray-700">Industry</label>
        <input
          id="industry"
          type="text"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="mt-1 block w-full p-2 border rounded-md"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
      >
        {isLoading ? 'Saving...' : 'Save Company'}
      </button>
    </form>
  );
}