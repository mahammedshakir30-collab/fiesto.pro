"use client";

import React, { useState } from 'react';
import { 
  Video, 
  Youtube, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  Play, 
  AlertCircle, 
  Save, 
  Edit3, 
  X,
  ExternalLink,
  Film
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { saveSetupVideo, deleteSetupVideo } from '@/actions/setup-video';
import { extractYouTubeVideoId } from '@/lib/utils';

interface SetupVideoData {
  id?: string;
  title: string;
  source: 'YOUTUBE' | 'UPLOADED';
  youtubeUrl: string | null;
  fileUrl: string | null;
  thumbnailUrl: string | null;
  active: boolean;
}

interface SetupVideoManagerProps {
  initialVideo: SetupVideoData | null;
}

export function SetupVideoManager({ initialVideo }: SetupVideoManagerProps) {
  const [video, setVideo] = useState<SetupVideoData | null>(initialVideo);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [title, setTitle] = useState(initialVideo?.title || 'FestOS Organizer Setup Guide');
  const [source, setSource] = useState<'YOUTUBE' | 'UPLOADED'>(initialVideo?.source || 'YOUTUBE');
  const [youtubeUrl, setYoutubeUrl] = useState(initialVideo?.youtubeUrl || '');
  const [fileUrl, setFileUrl] = useState(initialVideo?.fileUrl || '');
  const [active, setActive] = useState(initialVideo?.active !== false);

  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Derived YouTube Preview
  const extractedId = extractYouTubeVideoId(youtubeUrl);
  const youtubeEmbedUrl = extractedId 
    ? `https://www.youtube.com/embed/${extractedId}?controls=1&rel=0` 
    : '';

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      toast.error('File exceeds 100MB limit. Please upload a smaller video.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadProgress(50);
      const res = await fetch('/api/upload/video', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setUploadProgress(100);
      setFileUrl(data.url);
      toast.success('Video uploaded successfully');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to upload video');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error('Please enter a title');

    if (source === 'YOUTUBE') {
      if (!youtubeUrl.trim() || !extractedId) {
        return toast.error('Please enter a valid YouTube video URL');
      }
    } else if (source === 'UPLOADED') {
      if (!fileUrl.trim()) {
        return toast.error('Please upload a video file or provide a video URL');
      }
    }

    setIsSaving(true);
    try {
      const res = await saveSetupVideo({
        id: video?.id,
        title: title.trim(),
        source,
        youtubeUrl: source === 'YOUTUBE' ? youtubeUrl.trim() : undefined,
        fileUrl: source === 'UPLOADED' ? fileUrl.trim() : undefined,
        active
      });

      if (res.video) {
        setVideo(res.video as SetupVideoData);
      }
      setIsEditing(false);
      toast.success('Dashboard setup video saved successfully');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to save setup video');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove the setup video? The setup guide card will be hidden from all organizer dashboards.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteSetupVideo(video?.id);
      setVideo(null);
      setIsEditing(false);
      setTitle('FestOS Organizer Setup Guide');
      setYoutubeUrl('');
      setFileUrl('');
      toast.success('Setup video removed');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to delete setup video');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-3xl p-8 shadow-soft space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="font-heading text-xl font-bold flex items-center gap-2">
            <Film className="w-5 h-5 text-[#F1642E]" /> Dashboard Setup Video
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Super-Admin-controlled video rendered in the "Watch setup guide" card on Organizer Dashboards.
          </p>
        </div>

        {!isEditing && (
          <div className="flex items-center gap-2">
            {video && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-9 px-3 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 rounded-xl"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-9 px-4 text-xs font-bold bg-[#F1642E] hover:bg-[#d95627] text-white rounded-xl shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1" /> {video ? 'Edit Video' : 'Configure Video'}
            </Button>
          </div>
        )}
      </div>

      {/* VIEW MODE */}
      {!isEditing && (
        <div>
          {video ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-bold text-base text-foreground">{video.title}</h3>
                  <Badge variant="outline" className="text-xs font-semibold bg-[#FFF2ED] text-[#F1642E] border-[#F1642E]/30">
                    {video.source === 'YOUTUBE' ? 'YouTube' : 'Uploaded File'}
                  </Badge>
                  {video.active ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-green-700 bg-green-50 border border-green-200">
                      <CheckCircle2 className="w-3 h-3 text-green-600" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-gray-500 bg-gray-100 border border-gray-200">
                      Inactive
                    </span>
                  )}
                </div>
              </div>

              {/* Video Player Preview */}
              <div className="rounded-2xl overflow-hidden bg-black/5 border border-border aspect-video max-w-2xl">
                {video.source === 'YOUTUBE' && video.youtubeUrl ? (
                  <iframe
                    src={video.youtubeUrl}
                    title={video.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : video.fileUrl ? (
                  <video
                    src={video.fileUrl}
                    controls
                    playsInline
                    poster={video.thumbnailUrl || undefined}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                    No video source available
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 border border-dashed border-border rounded-2xl bg-muted/20 space-y-2">
              <Film className="w-8 h-8 text-muted-foreground/40 mx-auto" />
              <p className="text-sm font-semibold text-foreground">No setup video configured</p>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Organizer dashboards will hide the "Watch setup guide" card until a video is added.
              </p>
              <div className="pt-2">
                <Button
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="bg-[#F1642E] hover:bg-[#d95627] text-white font-bold text-xs rounded-xl"
                >
                  + Add Setup Video
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* EDIT / CONFIGURE FORM */}
      {isEditing && (
        <form onSubmit={handleSave} className="space-y-6 bg-muted/20 p-6 rounded-2xl border border-border">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-sm font-bold text-foreground">
              {video ? 'Edit Setup Video Configuration' : 'Add Dashboard Setup Video'}
            </h3>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Title Input */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Video Title <span className="text-red-500">*</span>
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. FestOS Quickstart & Setup Guide"
              className="bg-background h-10 rounded-xl"
              required
            />
          </div>

          {/* Source Toggle */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Video Source
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSource('YOUTUBE')}
                className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                  source === 'YOUTUBE'
                    ? 'border-[#F1642E] bg-[#FFF2ED] text-[#F1642E] shadow-sm'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground'
                }`}
              >
                <Youtube className="w-4 h-4 text-red-600" /> YouTube Link
              </button>

              <button
                type="button"
                onClick={() => setSource('UPLOADED')}
                className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                  source === 'UPLOADED'
                    ? 'border-[#F1642E] bg-[#FFF2ED] text-[#F1642E] shadow-sm'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground'
                }`}
              >
                <Upload className="w-4 h-4" /> Upload Video File
              </button>
            </div>
          </div>

          {/* Source 1: YouTube */}
          {source === 'YOUTUBE' && (
            <div className="space-y-3 p-4 bg-background rounded-xl border border-border">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">YouTube Video URL</Label>
                <Input
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  className="h-10 rounded-xl font-mono text-xs"
                />
              </div>

              {extractedId ? (
                <div className="rounded-xl overflow-hidden border border-border aspect-video max-w-md">
                  <iframe
                    src={youtubeEmbedUrl}
                    title="Preview"
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              ) : youtubeUrl ? (
                <p className="text-xs text-red-500 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> Please enter a valid YouTube URL
                </p>
              ) : null}
            </div>
          )}

          {/* Source 2: Upload Video File */}
          {source === 'UPLOADED' && (
            <div className="space-y-3 p-4 bg-background rounded-xl border border-border">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Upload Video (MP4 / WebM, max 100MB)</Label>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/ogg,video/quicktime"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="block w-full text-xs text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#FFF2ED] file:text-[#F1642E] hover:file:bg-[#ffe3d6] cursor-pointer"
                />
              </div>

              {isUploading && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                    <span>Uploading video...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-[#F1642E] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {fileUrl && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Video Ready: {fileUrl}
                  </span>
                  <div className="rounded-xl overflow-hidden border border-border aspect-video max-w-md">
                    <video src={fileUrl} controls playsInline className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Active Checkbox */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="activeCheckbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-4 h-4 rounded text-[#F1642E] focus:ring-[#F1642E] accent-[#F1642E]"
            />
            <Label htmlFor="activeCheckbox" className="text-xs font-bold text-foreground cursor-pointer">
              Set active immediately (shows on all Organizer Dashboards)
            </Label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="rounded-xl font-bold text-xs h-10 px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving || isUploading}
              className="bg-[#F1642E] hover:bg-[#d95627] text-white rounded-xl font-bold text-xs h-10 px-6 shadow-sm"
            >
              {isSaving ? 'Saving...' : 'Save Video'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
