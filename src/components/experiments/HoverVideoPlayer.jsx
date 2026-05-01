import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Heart, Play } from "lucide-react";

export default function HoverVideoPlayer({ videoSrc, thumbnailSrc, caption, className = "" }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting), { threshold: 0.15 });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  function playVideo() {
    setIsPlaying(true);
    if (videoRef.current && isInView) videoRef.current.play().catch(() => setIsPlaying(false));
  }

  function pauseVideo() {
    setIsPlaying(false);
    if (videoRef.current) videoRef.current.pause();
  }

  return (
    <motion.div
      ref={containerRef}
      className={`rb-hover-video ${className}`}
      onMouseEnter={playVideo}
      onMouseLeave={pauseVideo}
      onClick={() => (isPlaying ? pauseVideo() : playVideo())}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {videoSrc ? (
        <>
          {thumbnailSrc && !isPlaying && <img className="rb-video-thumb" src={thumbnailSrc} alt="Birthday wishes thumbnail" draggable="false" />}
          {isInView && <video ref={videoRef} src={videoSrc} poster={thumbnailSrc} muted loop playsInline />}
        </>
      ) : (
        <div className="rb-video-placeholder">
          <Heart size={34} />
          <p>Add a happy birthday video here.</p>
        </div>
      )}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div className="rb-video-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Play size={28} fill="currentColor" />
            <span>{caption}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
