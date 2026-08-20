"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Store, Save, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ui/image-upload';
import { updateVendorProfile } from '@/actions/vendor';
import { CloudinaryImage } from '@/components/shared/CloudinaryImage';
import { useSession } from 'next-auth/react';

export default function VendorProfilePage({ params }: { params: { vendorId: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    category: '',
    contactEmail: '',
    contactPhone: '',
    logoUrl: '',
    boothPhotos: [] as string[],
    boothNumber: ''
  });

  useEffect(() => {
    fetch(`/api/vendor/${params.vendorId}`)
      .then(res => res.json())
      .then(data => {
        if (data.vendor) {
          const profile = data.vendor.profile || {};
          setFormData({
            businessName: profile.businessName || data.vendor.name || '',
            description: profile.description || data.vendor.description || '',
            category: profile.category || data.vendor.category || '',
            contactEmail: profile.contactEmail || '',
            contactPhone: profile.contactPhone || '',
            logoUrl: profile.logoUrl || '',
            boothPhotos: profile.boothPhotos || [],
            boothNumber: profile.boothNumber || data.vendor.boothNumber || ''
          });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [params.vendorId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (url: string) => {
    setFormData(prev => ({ ...prev, logoUrl: url }));
  };

  const handleBoothPhotoUpload = (url: string) => {
    setFormData(prev => ({ ...prev, boothPhotos: [...prev.boothPhotos, url] }));
  };

  const handleRemoveBoothPhoto = (index: number) => {
    setFormData(prev => {
      const newPhotos = [...prev.boothPhotos];
      newPhotos.splice(index, 1);
      return { ...prev, boothPhotos: newPhotos };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      await updateVendorProfile(params.vendorId, formData);
      setSuccess('Profile updated successfully.');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-color-primary" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-4xl font-bold tracking-tight">Profile & Booth</h1>
          <p className="text-muted-foreground mt-2">Manage your public storefront and contact details.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-card border border-border rounded-3xl p-8 shadow-soft space-y-6">
          <h2 className="font-heading text-xl font-bold flex items-center gap-2">
            <Store className="w-5 h-5" /> Business Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input 
                id="businessName" 
                name="businessName" 
                value={formData.businessName} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input 
                id="category" 
                name="category" 
                value={formData.category} 
                onChange={handleChange} 
                placeholder="e.g. Food, Merch, Crafts" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              rows={4}
              placeholder="Tell attendees what you sell..."
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Public Contact Email</Label>
              <Input 
                id="contactEmail" 
                name="contactEmail" 
                type="email"
                value={formData.contactEmail} 
                onChange={handleChange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Public Contact Phone</Label>
              <Input 
                id="contactPhone" 
                name="contactPhone" 
                value={formData.contactPhone} 
                onChange={handleChange} 
              />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 shadow-soft space-y-6">
          <h2 className="font-heading text-xl font-bold">Branding & Photos</h2>
          
          <div className="space-y-4">
            <Label>Logo</Label>
            {formData.logoUrl ? (
              <div className="relative w-32 h-32 rounded-2xl border border-border overflow-hidden bg-muted group">
                <CloudinaryImage src={formData.logoUrl} alt="Logo" preset="thumbnail" width={128} height={128} className="w-full h-full object-cover" />
                <button 
                  type="button" 
                  onClick={() => setFormData(prev => ({ ...prev, logoUrl: '' }))}
                  className="absolute top-2 right-2 bg-destructive text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="w-48">
                <ImageUpload onUpload={handleLogoUpload} folder="festivals/vendors/logos" />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Label>Booth Photos (Max 3)</Label>
            <div className="flex flex-wrap gap-4">
              {formData.boothPhotos.map((url, idx) => (
                <div key={idx} className="relative w-40 h-40 rounded-2xl border border-border overflow-hidden bg-muted group">
                  <CloudinaryImage src={url} alt={`Booth photo ${idx + 1}`} preset="thumbnail" width={160} height={160} className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => handleRemoveBoothPhoto(idx)}
                    className="absolute top-2 right-2 bg-destructive text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {formData.boothPhotos.length < 3 && (
                <div className="w-40 h-40">
                  <ImageUpload onUpload={handleBoothPhotoUpload} folder="festivals/vendors/booth-photos" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 shadow-soft space-y-6">
          <h2 className="font-heading text-xl font-bold">Organizer Assigned Info</h2>
          <div className="space-y-2">
            <Label htmlFor="boothNumber">Booth/Location Number</Label>
            <Input 
              id="boothNumber" 
              name="boothNumber" 
              value={formData.boothNumber} 
              disabled 
              placeholder="Pending assignment"
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">Assigned by the festival organizer.</p>
          </div>
        </div>

        {error && <div className="p-4 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 font-bold">{error}</div>}
        {success && <div className="p-4 bg-color-success/10 text-color-success rounded-xl border border-color-success/20 font-bold">{success}</div>}

        <div className="flex justify-end">
          <Button type="submit" disabled={saving} className="h-12 px-8 rounded-xl bg-color-primary text-white hover:bg-color-primary/90 font-bold flex items-center gap-2">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Profile
          </Button>
        </div>
      </form>
    </div>
  );
}
