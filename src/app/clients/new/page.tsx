'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { API_ENDPOINTS } from '@/lib/constants';

export default function NewClientPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    business_name: '',
    website_url: '',
    primary_service_area: '',
    gbp_url: '',
    phone: '',
    industry: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.business_name || !form.website_url || !form.primary_service_area) {
      setError('Business name, website, and service area are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(API_ENDPOINTS.clients, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          gbp_url: form.gbp_url || undefined,
          phone: form.phone || undefined,
          industry: form.industry || undefined,
          notes: form.notes || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create client');
      }

      const { client } = await response.json();
      router.push(`/clients/${client.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create client');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#002366]">Add Client</h1>
        <p className="text-gray-600 mt-1">Create a new business profile</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Client Details</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.business_name}
                onChange={(e) => setForm(f => ({ ...f, business_name: e.target.value }))}
                placeholder="Acme Plumbing Services"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website URL <span className="text-red-500">*</span>
              </label>
              <Input
                type="url"
                value={form.website_url}
                onChange={(e) => setForm(f => ({ ...f, website_url: e.target.value }))}
                placeholder="https://www.example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Service Area <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.primary_service_area}
                onChange={(e) => setForm(f => ({ ...f, primary_service_area: e.target.value }))}
                placeholder="Austin, TX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Google Maps URL <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <Input
                type="url"
                value={form.gbp_url}
                onChange={(e) => setForm(f => ({ ...f, gbp_url: e.target.value }))}
                placeholder="https://www.google.com/maps/place/..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industry <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <Input
                  value={form.industry}
                  onChange={(e) => setForm(f => ({ ...f, industry: e.target.value }))}
                  placeholder="Home Services"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Any notes about this client..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002366]/20 focus:border-[#002366] min-h-[80px]"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Creating...' : 'Create Client'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/clients')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
