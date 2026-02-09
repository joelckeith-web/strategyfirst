'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { API_ENDPOINTS } from '@/lib/constants';

interface LocationData {
  id: string;
  label: string;
  city: string;
  state: string;
}

interface ClientData {
  id: string;
  business_name: string;
  website_url: string;
  industry: string | null;
  status: string;
  updated_at: string;
  locations?: LocationData[];
}

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<ClientData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients(searchTerm?: string) {
    setIsLoading(true);
    try {
      const url = searchTerm
        ? `${API_ENDPOINTS.clients}?search=${encodeURIComponent(searchTerm)}`
        : API_ENDPOINTS.clients;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      }
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    } finally {
      setIsLoading(false);
    }
  }

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClients(search || undefined);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#002366]">Clients</h1>
          <p className="text-gray-600 mt-1">Manage business profiles and audit history</p>
        </div>
        <Button onClick={() => router.push('/clients/new')}>
          Add Client
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search clients by name or website..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002366]/20 focus:border-[#002366]"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <svg className="w-8 h-8 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="ml-3 text-gray-600">Loading clients...</span>
        </div>
      ) : clients.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No clients yet</h3>
              <p className="text-gray-500 mb-4">
                Clients are created automatically when you run research, or you can add one manually.
              </p>
              <div className="flex justify-center gap-3">
                <Button onClick={() => router.push('/research')}>
                  Run Research
                </Button>
                <Button variant="outline" onClick={() => router.push('/clients/new')}>
                  Add Client Manually
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 border-b bg-gray-50">
                    <th className="px-6 py-3 font-medium">Business Name</th>
                    <th className="px-6 py-3 font-medium">Website</th>
                    <th className="px-6 py-3 font-medium">Locations</th>
                    <th className="px-6 py-3 font-medium">Industry</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {clients.map((client) => (
                    <tr
                      key={client.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => router.push(`/clients/${client.id}`)}
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/clients/${client.id}`}
                          className="font-medium text-[#002366] hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {client.business_name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs">
                        {client.website_url}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {client.locations?.length || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {client.industry || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          client.status === 'active' ? 'bg-green-100 text-green-800' :
                          client.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(client.updated_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
