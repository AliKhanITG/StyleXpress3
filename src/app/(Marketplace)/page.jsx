"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { useAuthStore } from "@/store/AuthStore";
import { api } from "@/Lib/Api";
import MarketplaceNav from "@/components/marketplace/MarketplaceNav";

const DEFAULT_SLIDES = [];

function VerticalSlider({ slides }) {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef(null);
  const touchStart = useRef(null);
  const containerRef = useRef(null);
  const total = slides.length;

  const goTo = useCallback((index) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent(index);
    setTimeout(() => setIsTransitioning(false), 700);
  }, [isTransitioning]);

  const next = useCallback(() => {
    if (total === 0) return;
    goTo((current + 1) % total);
  }, [current, total, goTo]);

  const prev = useCallback(() => {
    if (total === 0) return;
    goTo((current - 1 + total) % total);
  }, [current, total, goTo]);

  useEffect(() => {
    if (total === 0) return;
    timerRef.current = setInterval(next, 5000);
    return () => clearInterval(timerRef.current);
  }, [next, total]);

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    if (total > 0) timerRef.current = setInterval(next, 5000);
  }, [next, total]);

  const handleTouchStart = useCallback((e) => {
    touchStart.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 40) {
      if (diff > 0) next();
      else prev();
      resetTimer();
    }
    touchStart.current = null;
  }, [next, prev, resetTimer]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleWheel = (e) => {
      if (Math.abs(e.deltaY) < 10) return;
      e.preventDefault();
      if (e.deltaY > 0) next();
      else prev();
      resetTimer();
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [next, prev, resetTimer]);

  if (total === 0) {
    return (
      <div className="relative w-full h-[calc(100vh-64px)] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-wide">StyleLab</h1>
          <p className="text-lg text-slate-300">Your fashion sourcing platform</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative h-[calc(100vh-64px)]">
        {/* Background parallax layer (moves at 50% speed vertically) */}
        <div
          className="absolute inset-0 transition-transform duration-700 ease-out will-change-transform"
          style={{ transform: `translateY(-${current * 50}%)`, height: `${total * 100}%` }}
        >
          {slides.map((slide, i) => (
            <div key={`bg-${i}`} className="absolute inset-x-0" style={{ top: `${(i * 100) / total}%`, height: `${100 / total}%` }}>
              <div className="relative w-full h-full scale-110 blur-sm opacity-50">
                <Image src={slide.src} alt="" fill className="object-cover" priority={i === 0} />
              </div>
            </div>
          ))}
        </div>

        {/* Foreground slide layer (moves at full speed vertically) */}
        <div
          className="absolute inset-0 transition-transform duration-700 ease-out will-change-transform"
          style={{ transform: `translateY(-${current * 100}%)` }}
        >
          {slides.map((slide, i) => (
            <div key={`fg-${i}`} className="relative w-full h-[calc(100vh-64px)]">
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                className="object-cover"
                priority={i === 0}
                sizes="(max-width: 768px) 100vw, 80vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>
          ))}
        </div>
      </div>

      {/* Vertical dots — right side */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { goTo(i); resetTimer(); }}
            className={`w-2 rounded-full transition-all duration-500 ${
              i === current ? "h-8 bg-white shadow-md" : "h-2 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function MarketplaceHomePage() {
  const { user, isAuthenticated } = useAuthStore();
  const [slides, setSlides] = useState(DEFAULT_SLIDES);

  useEffect(() => {
    if (!isAuthenticated || !user?.userID) {
      setSlides(DEFAULT_SLIDES);
      return;
    }

    let cancelled = false;
    setSlides(DEFAULT_SLIDES);

    api
      .get("/api/sliders/public/me")
      .then(({ data }) => {
        if (cancelled) return;
        if (Array.isArray(data) && data.length > 0) {
          setSlides(data.map((s) => ({ src: s.sliderImageUrl, alt: s.sliderName })));
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.userID]);

  return (
    <>
      <MarketplaceNav />

      <div className="animate-fade-in">
        <VerticalSlider slides={slides} />
      </div>
    </>
  );
}
