"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createFestival } from '@/actions/festivals';
import { toast } from 'sonner';

export default function CreateFestivalClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      location: formData.get('location') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
    };

    try {
      const festivalId = await createFestival(data);
      toast.success('Festival created successfully!');
      window.location.href = `/organizer/${festivalId}`;
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to create festival.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Festival Name</Label>
        <Input id="name" name="name" required placeholder="e.g. Summer Music Fest 2026" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          required
          rows={3}
          placeholder="Briefly describe your festival..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input id="location" name="location" required placeholder="e.g. Central Park, NY" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date & Time</Label>
          <Input id="startDate" name="startDate" type="datetime-local" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date & Time</Label>
          <Input id="endDate" name="endDate" type="datetime-local" required />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-[#504E76] hover:bg-[#504E76]/90 text-white font-bold h-12"
      >
        {loading ? 'Creating...' : 'Create Festival'}
      </Button>
    </form>
  );
}
