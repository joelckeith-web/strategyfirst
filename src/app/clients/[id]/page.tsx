'use client';

import { use, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { API_ENDPOINTS } from '@/lib/constants';

interface LocationData {
  id: string;
  client_id: string;
  label: string;
  city: string;
  state: string;
  service_area: string | null;
  gbp_url: string | null;
  address: string | null;
  phone: string | null;
  is_primary: boolean;
}

interface ClientData {
  id: string;
  business_name: string;
  website_url: string;
  gbp_url: string | null;
  primary_service_area: string;
  phone: string | null;
  industry: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  locations?: LocationData[];
}

interface SessionData {
  id: string;
  client_id: string;
  location_id: string | null;
  input: { businessName?: string; website?: string; city?: string; state?: string };
  status: string;
  created_at: string;
  completed_at: string | null;
}

export default function ClientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: clientId } = use(params);
  const router = useRouter();
  const [client, setClient] = useState<ClientData | null>(null);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inline edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<ClientData>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Add location state
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [newLocation, setNewLocation] = useState({ label: '', city: '', state: '', gbp_url: '', service_area: '' });
  const [isAddingLocation, setIsAddingLocation] = useState(false);

  const fetchClient = useCallback(async () => {
    try {
      const response = await fetch(API_ENDPOINTS.clientById(clientId));
      if (!response.ok) throw new Error('Client not found');
      const data = await response.json();
      setClient(data.client);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load client');
    }
  }, [clientId]);

  const fetchSessions = useCallback(async () => {
    try {
      const response = await fetch(API_ENDPOINTS.clientSessions(clientId));
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    }
  }, [clientId]);

  useEffect(() => {
    Promise.all([fetchClient(), fetchSessions()]).finally(() => setIsLoading(false));
  }, [fetchClient, fetchSessions]);

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(API_ENDPOINTS.clientById(clientId), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (response.ok) {
        const data = await response.json();
        setClient(data.client);
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocation.label || !newLocation.city || !newLocation.state) return;

    setIsAddingLocation(true);
    try {
      const response = await fetch(API_ENDPOINTS.clientLocations(clientId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newLocation,
          service_area: newLocation.service_area || `${newLocation.city}, ${newLocation.state}`,
          gbp_url: newLocation.gbp_url || undefined,
        }),
      });
      if (response.ok) {
        setNewLocation({ label: '', city: '', state: '', gbp_url: '', service_area: '' });
        setShowAddLocation(false);
        await fetchClient();
      }
    } catch (err) {
      console.error('Failed to add location:', err);
    } finally {
      setIsAddingLocation(false);
    }
  };

  const handleDeleteLocation = async (locationId: string) => {
    if (!confirm('Delete this location? Sessions linked to it will be unlinked.')) return;
    try {
      await fetch(API_ENDPOINTS.clientLocation(clientId, locationId), { method: 'DELETE' });
      await fetchClient();
    } catch (err) {
      console.error('Failed to delete location:', err);
    }
  };

  const getLocationLabel = (locationId: string | null) => {
    if (!locationId || !client?.locations) return '-';
    const loc = client.locations.find((l) => l.id === locationId);
    return loc ? loc.label : '-';
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <svg className="w-8 h-8 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="ml-3 text-gray-600">Loading client...</span>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardBody>
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error || 'Client not found'}</p>
              <Button onClick={() => router.push('/clients')}>Back to Clients</Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Back link */}
      <div>
        <Link href="/clients" className="text-sm text-gray-500 hover:text-[#002366]">
          &larr; Back to Clients
        </Link>
      </div>

      {/* Section 1: Client Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Client Information</h2>
            {!isEditing ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditForm({
                      business_name: client.business_name,
                      website_url: client.website_url,
                      phone: client.phone,
                      industry: client.industry,
                      notes: client.notes,
                    });
                    setIsEditing(true);
                  }}
                >
                  Edit
                </Button>
                <button
                  onClick={async () => {
                    if (!confirm(`Delete "${client.business_name}"? This will also delete all locations and unlink audit sessions.`)) return;
                    try {
                      const res = await fetch(API_ENDPOINTS.clientById(clientId), { method: 'DELETE' });
                      if (res.ok) router.push('/clients');
                    } catch (err) {
                      console.error('Failed to delete client:', err);
                    }
                  }}
                  className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSaveEdit} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardBody>
          {isEditing ? (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                <Input
                  value={editForm.business_name || ''}
                  onChange={(e) => setEditForm(f => ({ ...f, business_name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <Input
                  value={editForm.website_url || ''}
                  onChange={(e) => setEditForm(f => ({ ...f, website_url: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <Input
                  value={editForm.phone || ''}
                  onChange={(e) => setEditForm(f => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <Input
                  value={editForm.industry || ''}
                  onChange={(e) => setEditForm(f => ({ ...f, industry: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={editForm.notes || ''}
                  onChange={(e) => setEditForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002366]/20 focus:border-[#002366] min-h-[60px]"
                />
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500">Business Name</p>
                <p className="font-medium text-gray-900">{client.business_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Website</p>
                <a href={client.website_url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                  {client.website_url}
                </a>
              </div>
              <div>
                <p className="text-sm text-gray-500">Service Area</p>
                <p className="font-medium text-gray-900">{client.primary_service_area}</p>
              </div>
              {client.phone && (
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{client.phone}</p>
                </div>
              )}
              {client.industry && (
                <div>
                  <p className="text-sm text-gray-500">Industry</p>
                  <p className="font-medium text-gray-900">{client.industry}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  client.status === 'active' ? 'bg-green-100 text-green-800' :
                  client.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {client.status}
                </span>
              </div>
              {client.notes && (
                <div className="md:col-span-2 lg:col-span-3">
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{client.notes}</p>
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Section 2: Locations Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Locations</h2>
              <p className="text-sm text-gray-500 mt-1">
                {client.locations?.length || 0} location{(client.locations?.length || 0) !== 1 ? 's' : ''}
              </p>
            </div>
            <Button variant="outline" onClick={() => setShowAddLocation(!showAddLocation)}>
              {showAddLocation ? 'Cancel' : 'Add Location'}
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {/* Add location form */}
          {showAddLocation && (
            <form onSubmit={handleAddLocation} className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={newLocation.label}
                    onChange={(e) => setNewLocation(l => ({ ...l, label: e.target.value }))}
                    placeholder="Dallas Office"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Area
                  </label>
                  <Input
                    value={newLocation.service_area}
                    onChange={(e) => setNewLocation(l => ({ ...l, service_area: e.target.value }))}
                    placeholder="Dallas, TX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={newLocation.city}
                    onChange={(e) => setNewLocation(l => ({ ...l, city: e.target.value }))}
                    placeholder="Dallas"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={newLocation.state}
                    onChange={(e) => setNewLocation(l => ({ ...l, state: e.target.value }))}
                    placeholder="TX"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps URL</label>
                  <Input
                    value={newLocation.gbp_url}
                    onChange={(e) => setNewLocation(l => ({ ...l, gbp_url: e.target.value }))}
                    placeholder="https://www.google.com/maps/place/..."
                  />
                </div>
              </div>
              <div className="mt-3">
                <Button type="submit" disabled={isAddingLocation}>
                  {isAddingLocation ? 'Adding...' : 'Add Location'}
                </Button>
              </div>
            </form>
          )}

          {/* Location cards */}
          {client.locations && client.locations.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {client.locations.map((location) => {
                const locationSessions = sessions.filter(s => s.location_id === location.id);
                return (
                  <div key={location.id} className="p-4 border rounded-lg hover:border-[#002366]/30 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">{location.label}</h3>
                        <p className="text-sm text-gray-500">{location.city}, {location.state}</p>
                      </div>
                      {location.is_primary && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Primary</span>
                      )}
                    </div>
                    {location.gbp_url && (
                      <a href={location.gbp_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline block mb-2 truncate">
                        Google Maps Listing
                      </a>
                    )}
                    <p className="text-xs text-gray-400 mb-3">
                      {locationSessions.length} audit{locationSessions.length !== 1 ? 's' : ''}
                    </p>
                    <div className="flex gap-2">
                      <Link
                        href={`/research?clientId=${clientId}&locationId=${location.id}`}
                        className="text-xs px-3 py-1.5 bg-[#002366] text-white rounded hover:bg-[#002366]/90 transition-colors"
                      >
                        Run Audit
                      </Link>
                      <button
                        onClick={() => handleDeleteLocation(location.id)}
                        className="text-xs px-3 py-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6">
              No locations yet. Add one to start running location-specific audits.
            </p>
          )}
        </CardBody>
      </Card>

      {/* Section 3: Audit History Table */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Audit History</h2>
          <p className="text-sm text-gray-500 mt-1">
            {sessions.length} session{sessions.length !== 1 ? 's' : ''}
          </p>
        </CardHeader>
        <CardBody>
          {sessions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 border-b">
                    <th className="pb-3 pr-4 font-medium">Date</th>
                    <th className="pb-3 pr-4 font-medium">Location</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="py-3 pr-4 text-sm">
                        {new Date(session.created_at).toLocaleDateString()}{' '}
                        <span className="text-gray-400">
                          {new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-sm text-gray-600">
                        {getLocationLabel(session.location_id)}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          session.status === 'completed' ? 'bg-green-100 text-green-800' :
                          session.status === 'running' ? 'bg-blue-100 text-blue-800' :
                          session.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {session.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <Link
                          href={`/research/${session.id}/results`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View Results
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No audits run yet for this client.</p>
              {client.locations && client.locations.length > 0 && (
                <p className="text-sm mt-2">
                  Click &ldquo;Run Audit&rdquo; on a location above to get started.
                </p>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
