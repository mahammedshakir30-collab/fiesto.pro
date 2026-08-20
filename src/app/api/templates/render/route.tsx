import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import React from 'react';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const layout = searchParams.get('layout') || 'bold';
    const primary = searchParams.get('primary') || '#000000';
    const secondary = searchParams.get('secondary') || '#ffffff';
    const accent = searchParams.get('accent') || '#ff0000';
    
    // Core fields
    const title = searchParams.get('title') || 'Festival Title';
    const date = searchParams.get('date') || 'TBA';
    const logo = searchParams.get('logo') || null;

    // Personalization fields
    const headline = searchParams.get('headline') || '';
    const message = searchParams.get('message') || '';
    const achievementLabel = searchParams.get('achievementLabel') || '';
    const sourceImageUrl = searchParams.get('sourceImageUrl') || null;

    let content = null;

    // Overlay layout (for Uploads with text overlay)
    if (sourceImageUrl) {
      content = (
        <div style={{ display: 'flex', width: '100%', height: '100%', position: 'relative' }}>
          <img src={sourceImageUrl} alt="Source" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          {(headline || message || achievementLabel) && (
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: `linear-gradient(to top, ${primary} 0%, transparent 100%)`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '60px',
              paddingTop: '200px',
              color: secondary
            }}>
              {achievementLabel && <div style={{ backgroundColor: accent, color: primary, padding: '10px 20px', borderRadius: '50px', fontSize: 24, fontWeight: 'bold', alignSelf: 'flex-start', marginBottom: '20px' }}>{achievementLabel}</div>}
              {headline && <h1 style={{ fontSize: 60, fontWeight: 'bold', margin: '0 0 10px 0' }}>{headline}</h1>}
              {message && <p style={{ fontSize: 32, opacity: 0.9, margin: 0 }}>{message}</p>}
            </div>
          )}
        </div>
      );
    } 
    // Auto-generation Layouts
    else {
      switch(layout) {
        case 'minimal':
          content = (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', backgroundColor: secondary, color: primary, padding: '80px', textAlign: 'center' }}>
              {logo ? <img src={logo} alt="Logo" style={{ width: 250, height: 250, objectFit: 'contain', marginBottom: '60px' }} /> : <div style={{ width: 100, height: 100, backgroundColor: accent, borderRadius: '50%', marginBottom: '60px' }} />}
              {achievementLabel && <div style={{ fontSize: 30, color: accent, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>{achievementLabel}</div>}
              <h1 style={{ fontSize: headline ? 80 : 120, fontWeight: 'bold', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                {headline || title}
              </h1>
              {message && <p style={{ fontSize: 40, marginTop: '30px' }}>{message}</p>}
              {!headline && <p style={{ fontSize: 50, color: accent, marginTop: '40px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{date}</p>}
            </div>
          );
          break;
        case 'photo_focus':
          content = (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', height: '100%', backgroundColor: primary, color: secondary, padding: '80px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                {achievementLabel && <div style={{ display: 'flex', backgroundColor: accent, color: primary, padding: '12px 24px', borderRadius: '4px', fontSize: 24, fontWeight: 'bold', alignSelf: 'flex-start', marginBottom: '30px' }}>{achievementLabel}</div>}
                <h1 style={{ fontSize: headline ? 90 : 140, fontWeight: 900, margin: 0, lineHeight: 1, textTransform: 'uppercase' }}>
                  {headline || title}
                </h1>
                <div style={{ width: 150, height: 15, backgroundColor: accent, marginTop: '40px' }} />
                {message && <p style={{ fontSize: 45, marginTop: '40px', fontWeight: 500, width: '100%' }}>{message}</p>}
              </div>
              
              <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                {!headline && <p style={{ fontSize: 60, fontWeight: 'bold', margin: 0 }}>{date}</p>}
                {logo && <img src={logo} alt="Logo" style={{ width: 200, height: 200, objectFit: 'contain' }} />}
              </div>
            </div>
          );
          break;
        case 'achievement_spotlight':
          content = (
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', backgroundColor: secondary, color: primary, padding: '80px', border: `20px solid ${primary}` }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                {achievementLabel ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 300, height: 300, backgroundColor: accent, borderRadius: '50%', color: secondary, fontSize: 40, fontWeight: 'bold', textAlign: 'center', padding: '40px', marginBottom: '60px', boxShadow: `0 20px 40px ${primary}40` }}>
                    {achievementLabel}
                  </div>
                ) : (
                  logo && <img src={logo} alt="Logo" style={{ width: 200, height: 200, objectFit: 'contain', marginBottom: '40px' }} />
                )}
                <h1 style={{ fontSize: 90, fontWeight: 800, margin: '0 0 30px 0', color: primary }}>
                  {headline || title}
                </h1>
                {message && <p style={{ fontSize: 45, color: primary, opacity: 0.8, margin: 0 }}>{message}</p>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%' }}>
                <p style={{ fontSize: 30, color: primary, fontWeight: 'bold', margin: 0 }}>{title}</p>
                <p style={{ fontSize: 30, color: accent, fontWeight: 'bold', margin: 0 }}>{date}</p>
              </div>
            </div>
          );
          break;
        case 'split_layout':
          content = (
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', backgroundColor: primary }}>
              <div style={{ flex: 1, backgroundColor: secondary, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px', textAlign: 'center' }}>
                {logo && <img src={logo} alt="Logo" style={{ width: 250, height: 250, objectFit: 'contain' }} />}
                {achievementLabel && <div style={{ fontSize: 40, color: accent, fontWeight: 900, marginTop: '40px', textTransform: 'uppercase' }}>{achievementLabel}</div>}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px', color: secondary }}>
                <h1 style={{ fontSize: 100, fontWeight: 900, margin: '0 0 20px 0', lineHeight: 1 }}>{headline || title}</h1>
                <p style={{ fontSize: 40, opacity: 0.9, margin: 0 }}>{message || date}</p>
              </div>
            </div>
          );
          break;
        case 'full_bleed_gradient':
          content = (
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: `linear-gradient(135deg, ${primary}, ${accent})`, color: secondary, padding: '100px', justifyContent: 'center' }}>
              {achievementLabel && <div style={{ display: 'flex', padding: '10px 20px', border: `4px solid ${secondary}`, borderRadius: '50px', fontSize: 30, fontWeight: 'bold', alignSelf: 'flex-start', marginBottom: '40px' }}>{achievementLabel}</div>}
              <h1 style={{ fontSize: 130, fontWeight: 900, margin: '0 0 40px 0', lineHeight: 1.1 }}>{headline || title}</h1>
              {message && <p style={{ fontSize: 50, margin: 0, fontWeight: 500, opacity: 0.9 }}>{message}</p>}
              {!headline && <p style={{ fontSize: 60, opacity: 0.8, marginTop: 'auto' }}>{date}</p>}
            </div>
          );
          break;
        case 'framed_border':
          content = (
            <div style={{ display: 'flex', padding: '40px', width: '100%', height: '100%', backgroundColor: secondary }}>
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', border: `12px solid ${accent}`, padding: '60px', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                {logo && <img src={logo} alt="Logo" style={{ width: 180, height: 180, objectFit: 'contain', marginBottom: '40px' }} />}
                <p style={{ fontSize: 30, color: primary, textTransform: 'uppercase', letterSpacing: '0.2em', margin: '0 0 20px 0' }}>{achievementLabel || title}</p>
                <h1 style={{ fontSize: 100, fontWeight: 'bold', color: primary, margin: '0 0 40px 0', lineHeight: 1.1 }}>{headline || title}</h1>
                <p style={{ fontSize: 40, color: primary, margin: 0, fontStyle: 'italic' }}>{message || date}</p>
              </div>
            </div>
          );
          break;
        case 'typographic':
          content = (
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', backgroundColor: primary, color: secondary, padding: '80px', justifyContent: 'center' }}>
              {achievementLabel && <p style={{ fontSize: 40, color: accent, fontWeight: 'bold', margin: '0 0 20px 0', textTransform: 'uppercase' }}>{achievementLabel}</p>}
              <h1 style={{ fontSize: 160, fontWeight: 900, margin: '0 0 40px 0', lineHeight: 0.9, wordWrap: 'break-word' }}>
                {headline || title}
              </h1>
              {message && <p style={{ fontSize: 50, borderLeft: `8px solid ${accent}`, paddingLeft: '30px', margin: 0 }}>{message}</p>}
            </div>
          );
          break;
        case 'badge_center':
          content = (
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', backgroundColor: secondary, color: primary, alignItems: 'center', justifyContent: 'center', padding: '60px', textAlign: 'center' }}>
              <h1 style={{ fontSize: 80, fontWeight: 800, margin: '0 0 60px 0', color: primary }}>{headline || title}</h1>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 400, height: 400, backgroundColor: primary, color: secondary, borderRadius: '50%', border: `20px solid ${accent}`, fontSize: 60, fontWeight: 'bold', textAlign: 'center', padding: '20px' }}>
                {achievementLabel || 'WINNER'}
              </div>
              <p style={{ fontSize: 50, color: primary, margin: '60px 0 0 0' }}>{message}</p>
            </div>
          );
          break;
        case 'banner_strip':
          content = (
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', backgroundColor: secondary }}>
              <div style={{ flex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {logo ? <img src={logo} alt="Logo" style={{ width: 400, height: 400, objectFit: 'contain' }} /> : <div style={{ width: 300, height: 300, backgroundColor: primary, borderRadius: '20px' }} />}
              </div>
              <div style={{ flex: 1, backgroundColor: primary, color: secondary, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {achievementLabel && <p style={{ fontSize: 30, color: accent, margin: '0 0 10px 0', fontWeight: 'bold', textTransform: 'uppercase' }}>{achievementLabel}</p>}
                    <h1 style={{ fontSize: 80, fontWeight: 'bold', margin: 0 }}>{headline || title}</h1>
                  </div>
                  {message && <p style={{ fontSize: 35, maxWidth: '40%', textAlign: 'right' }}>{message}</p>}
                </div>
              </div>
            </div>
          );
          break;
        default:
        case 'bold':
          content = (
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', backgroundColor: primary, color: secondary, padding: '100px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '800px', height: '800px', backgroundColor: accent, opacity: 0.1, borderRadius: '50%' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: 'auto' }}>
                {logo && <img src={logo} alt="Logo" style={{ width: 150, height: 150, objectFit: 'contain' }} />}
                {achievementLabel && <div style={{ display: 'flex', backgroundColor: accent, color: primary, padding: '8px 20px', borderRadius: '50px', fontSize: 24, fontWeight: 'bold' }}>{achievementLabel}</div>}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h1 style={{ fontSize: headline ? 120 : 160, fontWeight: '900', margin: '0 0 30px 0', lineHeight: 0.9, letterSpacing: '-0.04em' }}>
                  {headline || title}
                </h1>
                {message && <p style={{ fontSize: 45, opacity: 0.9, margin: '0 0 40px 0' }}>{message}</p>}
                {!headline && (
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: '40px' }}>
                    <div style={{ width: 60, height: 60, backgroundColor: accent, marginRight: '30px' }} />
                    <p style={{ fontSize: 55, margin: 0, fontWeight: '500' }}>{date}</p>
                  </div>
                )}
              </div>
            </div>
          );
          break;
      }
    }

    return new ImageResponse(content as React.ReactElement, {
      width: 1080,
      height: 1350,
    });
  } catch (e: any) {
    console.error(e);
    return new Response('Failed to generate image', { status: 500 });
  }
}
