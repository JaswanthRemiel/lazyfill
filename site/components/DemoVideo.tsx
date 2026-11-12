'use client';

import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/**
 * The product demo. Browsers only autoplay muted video, so it starts muted and loops; the buttons unmute and pause it.
 * Visitors who ask for reduced motion get the poster and a play button instead of autoplay.
 */
export function DemoVideo({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const v = ref.current;
    if (!v || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    v.play().catch(() => {}); // blocked autoplay just leaves the poster and the play button
  }, []);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };
  const toggleSound = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted && v.paused) v.play().catch(() => {});
  };

  const btn = 'flex size-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-md transition-colors hover:bg-black/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

  return (
    <figure className={`group relative overflow-hidden rounded-2xl border border-border bg-muted shadow-float ${className}`}>
      <video
        ref={ref}
        className="block aspect-video h-auto w-full"
        src="/video/demo.mp4"
        poster="/video/demo-poster.jpg"
        width={1920}
        height={1080}
        muted
        loop
        playsInline
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onClick={toggle}
        aria-label="lazyfill demo: a job application filled in one click, then tracked in the dashboard"
      />
      {!playing && (
        <button type="button" onClick={toggle} aria-label="Play demo" className="absolute inset-0 m-auto flex size-16 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-transform hover:scale-105">
          <Play className="size-7 translate-x-0.5" fill="currentColor" />
        </button>
      )}
      <div className="absolute right-3 bottom-3 flex gap-2 opacity-90 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
        <button type="button" onClick={toggle} className={btn} aria-label={playing ? 'Pause demo' : 'Play demo'}>
          {playing ? <Pause className="size-4" fill="currentColor" /> : <Play className="size-4" fill="currentColor" />}
        </button>
        <button type="button" onClick={toggleSound} className={btn} aria-label={muted ? 'Turn sound on' : 'Turn sound off'}>
          {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        </button>
      </div>
    </figure>
  );
}
