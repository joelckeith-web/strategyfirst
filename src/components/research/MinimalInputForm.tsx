'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { API_ENDPOINTS } from '@/lib/constants';

interface LocationOption {
  id: string;
  label: string;
  city: string;
  state: string;
  service_area: string | null;
  gbp_url: string | null;
}

interface ClientOption {
  id: string;
  business_name: string;
  website_url: string;
  locations?: LocationOption[];
}

interface FormData {
  businessName: string;
  websiteUrl: string;
  gbpUrl: string;
  primaryServiceArea: string;
}

interface FormErrors {
  businessName?: string;
  websiteUrl?: string;
  primaryServiceArea?: string;
}

interface MinimalInputFormProps {
  initialClientId?: string;
  initialLocationId?: string;
}

export function MinimalInputForm({ initialClientId, initialLocationId }: MinimalInputFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    websiteUrl: '',
    gbpUrl: '',
    primaryServiceArea: '',
  });

  // Client/location selector state
  const [clientSearch, setClientSearch] = useState('');
  const [clientResults, setClientResults] = useState<ClientOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientOption | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationOption | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load initial client/location if provided via query params
  useEffect(() => {
    if (initialClientId) {
      fetch(API_ENDPOINTS.clientById(initialClientId))
        .then(r => r.json())
        .then(data => {
          if (data.client) {
            const client = data.client as ClientOption;
            setSelectedClient(client);
            setClientSearch(client.business_name);
            setFormData(prev => ({
              ...prev,
              businessName: client.business_name,
              websiteUrl: client.website_url,
            }));

            // Also set location if provided
            if (initialLocationId && client.locations) {
              const loc = client.locations.find(l => l.id === initialLocationId);
              if (loc) {
                setSelectedLocation(loc);
                setFormData(prev => ({
                  ...prev,
                  primaryServiceArea: loc.service_area || `${loc.city}, ${loc.state}`,
                  gbpUrl: loc.gbp_url || prev.gbpUrl,
                }));
              }
            }
          }
        })
        .catch(() => {});
    }
  }, [initialClientId, initialLocationId]);

  // Debounced client search
  const searchClients = useCallback(async (term: string) => {
    if (!term || term.length < 2) {
      setClientResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.clients}?search=${encodeURIComponent(term)}`);
      if (response.ok) {
        const data = await response.json();
        setClientResults(data.clients || []);
      }
    } catch {
      // ignore search errors
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (selectedClient) return; // Don't search while a client is selected
    const timer = setTimeout(() => searchClients(clientSearch), 300);
    return () => clearTimeout(timer);
  }, [clientSearch, selectedClient, searchClients]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelectClient = (client: ClientOption) => {
    setSelectedClient(client);
    setClientSearch(client.business_name);
    setShowDropdown(false);
    setFormData(prev => ({
      ...prev,
      businessName: client.business_name,
      websiteUrl: client.website_url,
    }));
    // Reset location selection
    setSelectedLocation(null);
  };

  const handleSelectLocation = (location: LocationOption) => {
    setSelectedLocation(location);
    setFormData(prev => ({
      ...prev,
      primaryServiceArea: location.service_area || `${location.city}, ${location.state}`,
      gbpUrl: location.gbp_url || prev.gbpUrl,
    }));
  };

  const handleClearClient = () => {
    setSelectedClient(null);
    setSelectedLocation(null);
    setClientSearch('');
    setFormData({ businessName: '', websiteUrl: '', gbpUrl: '', primaryServiceArea: '' });
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    if (!formData.websiteUrl.trim()) {
      newErrors.websiteUrl = 'Website URL is required';
    } else {
      try {
        new URL(formData.websiteUrl);
      } catch {
        newErrors.websiteUrl = 'Please enter a valid URL';
      }
    }

    if (!formData.primaryServiceArea.trim()) {
      newErrors.primaryServiceArea = 'Service area is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Parse service area into city/state
      const locationParts = formData.primaryServiceArea.split(',').map(p => p.trim());
      const city = locationParts[0] || formData.primaryServiceArea;
      const state = locationParts[1] || '';

      const response = await fetch('/api/research/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: formData.businessName,
          website: formData.websiteUrl,
          gbpUrl: formData.gbpUrl || undefined,
          city,
          state,
          location: formData.primaryServiceArea,
          clientId: selectedClient?.id || undefined,
          locationId: selectedLocation?.id || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to start research');
      }

      const { sessionId } = await response.json();
      router.push(`/research/${sessionId}`);
    } catch (error) {
      console.error('Error starting research:', error);
      alert('Failed to start research. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold text-gray-900">Start New Research</h2>
        <p className="text-sm text-gray-600 mt-1">
          Enter just 4 fields and we&apos;ll automatically research your business
        </p>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client/Location Selector */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Existing Client (optional)
            </p>
            <div className="relative" ref={dropdownRef}>
              {selectedClient ? (
                <div className="flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-lg">
                  <div>
                    <span className="font-medium text-sm text-gray-900">{selectedClient.business_name}</span>
                    <span className="text-xs text-gray-500 ml-2">{selectedClient.website_url}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearClient}
                    className="text-gray-400 hover:text-gray-600 ml-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <input
                  type="text"
                  value={clientSearch}
                  onChange={(e) => {
                    setClientSearch(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => clientSearch.length >= 2 && setShowDropdown(true)}
                  placeholder="Search for existing client..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002366]/20 focus:border-[#002366]"
                />
              )}
              {showDropdown && clientResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {clientResults.map((client) => (
                    <button
                      key={client.id}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-0"
                      onClick={() => handleSelectClient(client)}
                    >
                      <span className="font-medium">{client.business_name}</span>
                      <span className="text-gray-400 ml-2 text-xs">{client.website_url}</span>
                    </button>
                  ))}
                </div>
              )}
              {showDropdown && isSearching && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm text-gray-500">
                  Searching...
                </div>
              )}
            </div>

            {/* Location selector (shown when client is selected and has locations) */}
            {selectedClient && selectedClient.locations && selectedClient.locations.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
                <select
                  value={selectedLocation?.id || ''}
                  onChange={(e) => {
                    const loc = selectedClient.locations?.find(l => l.id === e.target.value);
                    if (loc) handleSelectLocation(loc);
                    else setSelectedLocation(null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002366]/20 focus:border-[#002366] bg-white"
                >
                  <option value="">Select a location...</option>
                  {selectedClient.locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.label} ({loc.city}, {loc.state})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
              Business Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="businessName"
              type="text"
              placeholder="Acme Plumbing Services"
              value={formData.businessName}
              onChange={handleChange('businessName')}
              className={errors.businessName ? 'border-red-500' : ''}
            />
            {errors.businessName && (
              <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>
            )}
          </div>

          <div>
            <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Website URL <span className="text-red-500">*</span>
            </label>
            <Input
              id="websiteUrl"
              type="url"
              placeholder="https://www.example.com"
              value={formData.websiteUrl}
              onChange={handleChange('websiteUrl')}
              className={errors.websiteUrl ? 'border-red-500' : ''}
            />
            {errors.websiteUrl && (
              <p className="mt-1 text-sm text-red-600">{errors.websiteUrl}</p>
            )}
          </div>

          <div>
            <label htmlFor="gbpUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Google Maps URL
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
            </label>
            <Input
              id="gbpUrl"
              type="url"
              placeholder="https://www.google.com/maps/place/..."
              value={formData.gbpUrl}
              onChange={handleChange('gbpUrl')}
            />
            <p className="mt-1 text-xs text-gray-500">
              Paste your Google Maps listing URL for more accurate data
            </p>
          </div>

          <div>
            <label htmlFor="primaryServiceArea" className="block text-sm font-medium text-gray-700 mb-1">
              Primary Service Area <span className="text-red-500">*</span>
            </label>
            <Input
              id="primaryServiceArea"
              type="text"
              placeholder="Austin, TX"
              value={formData.primaryServiceArea}
              onChange={handleChange('primaryServiceArea')}
              className={errors.primaryServiceArea ? 'border-red-500' : ''}
            />
            {errors.primaryServiceArea && (
              <p className="mt-1 text-sm text-red-600">{errors.primaryServiceArea}</p>
            )}
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Starting Research...
                </span>
              ) : (
                'Start Auto-Research'
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            What we&apos;ll research automatically:
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Google Business Profile data (rating, reviews, categories)</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Website structure (pages, blog, service pages)</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Technical details (CMS, SSL, structured data)</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Top 5 local competitors with their metrics</span>
            </li>
          </ul>
        </div>
      </CardBody>
    </Card>
  );
}
