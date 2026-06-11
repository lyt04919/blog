'use client'

import React, { useEffect } from 'react'
import { animate, stagger, createTimeline } from 'animejs'
import { useConfigStore } from '@/app/(home)/stores/config-store'

export default function SwissHero() {
  const { siteContent } = useConfigStore()
  // Force English text for the giant typography to look cool
  const title = 'YYSUNI'
  
  // Use the current art image or default
  const artImage = siteContent.artImages?.find((img: any) => img.id === siteContent.currentArtImageId) || siteContent.artImages?.[0] || { url: '/images/avatar.png' }
  const imageUrl = artImage.url

  useEffect(() => {
    // Advanced Anime.js Timeline
    const tl = createTimeline({
      defaults: {
        ease: 'outExpo',
        duration: 1200
      }
    })

    // 1. Initial wait
    tl.add('.swiss-hero-wrapper', {
      opacity: [0, 1],
      duration: 100
    })
    
    // 2. Orange accent block expanding from left to right behind the image
    .add('.swiss-accent-block', {
      scaleX: [0, 1],
      transformOrigin: ['0% 50%', '0% 50%'],
      duration: 1400,
      ease: 'inOutExpo'
    }, '+=200')

    // 3. Image slides up and fades in
    .add('.swiss-image-container', {
      y: [100, 0],
      opacity: [0, 1],
      duration: 1200,
      ease: 'outQuart'
    }, '-=800')

    // 4. Giant Title letters staggered pop-up
    .add('.swiss-title-letter', {
      y: ['110%', '0%'],
      rotateZ: [5, 0],
      opacity: [0, 1],
      delay: stagger(80),
      duration: 1000,
      ease: 'outBack'
    }, '-=1000')

    // 5. Meta texts and lines fading in
    .add('.swiss-meta-element', {
      opacity: [0, 1],
      x: [-20, 0],
      delay: stagger(100),
      duration: 800
    }, '-=800')

  }, [])

  return (
    <div className="swiss-hero-wrapper relative w-full h-screen flex flex-col justify-center overflow-hidden bg-[var(--color-bg)] text-[var(--color-primary)] opacity-0">
      
      {/* Background Decor (Optional) */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[50vw] h-[50vw] rounded-full border-[1px] border-black/5 opacity-50"></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[40vw] h-[40vw] rounded-full border-[1px] border-black/5 opacity-50"></div>
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-6 md:px-16 lg:px-24 h-full flex flex-col md:flex-row items-center justify-between relative z-10">
        
        {/* Left Side: Typography */}
        <div className="flex-1 w-full flex flex-col justify-center z-20 mt-20 md:mt-0 relative">
          
          <div className="flex items-start gap-4 mb-4 relative">
            {/* Vertical text */}
            <div className="swiss-meta-element hidden md:flex flex-col items-center justify-start mt-8">
              <span className="text-[var(--color-primary)] font-bold text-[10px] tracking-[0.4em] uppercase" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                MATERIALS OF CREATION <br/>
                <span className="text-[var(--color-brand)] mt-4 inline-block">{siteContent.meta.username || 'YYsuni'}</span>
              </span>
            </div>
            
            {/* Giant Title */}
            <h1 className="font-sans font-black text-[var(--color-primary)] tracking-tighter uppercase leading-[0.85] flex overflow-hidden -ml-2">
              <span className="text-[20vw] md:text-[12vw] lg:text-[14rem] xl:text-[16rem] flex">
                {title.split('').map((char: string, i: number) => (
                  <span key={i} className="swiss-title-letter inline-block opacity-0 origin-bottom-left">
                    {char}
                  </span>
                ))}
                <span className="swiss-title-letter inline-block text-[var(--color-brand)] opacity-0">.</span>
              </span>
            </h1>
          </div>

          {/* Details below title */}
          <div className="swiss-meta-element opacity-0 flex flex-col md:flex-row items-start md:items-center gap-8 mt-8 md:mt-12 ml-0 md:ml-12">
            <span className="text-6xl md:text-8xl font-black text-[var(--color-primary)] tracking-tighter transform md:-rotate-90 origin-left inline-block w-min">
              001
            </span>
            <div className="hidden md:block w-24 h-[6px] bg-[var(--color-primary)] mt-24"></div>
            <p className="max-w-[280px] text-xs font-bold uppercase tracking-widest leading-loose text-[var(--color-secondary)] md:mt-24">
              {siteContent.meta.description || 'Exploring the boundaries between code, art, and minimal design spaces.'}
            </p>
          </div>

        </div>

        {/* Right Side: Image & Accent Block */}
        <div className="flex-1 w-full h-full absolute md:relative inset-0 md:inset-auto flex items-center justify-center md:justify-end pointer-events-none md:pointer-events-auto z-0 md:z-10 overflow-hidden">
          
          {/* Orange Accent Block */}
          <div className="swiss-accent-block absolute top-1/2 left-0 md:left-[-10vw] transform -translate-y-1/2 w-[120%] md:w-[150%] h-[40vh] md:h-[50vh] bg-[var(--color-brand)] z-0 scale-x-0 origin-left" style={{ transformOrigin: '0% 50%' }}></div>
          
          {/* Image */}
          <div className="swiss-image-container opacity-0 relative z-10 w-[85vw] max-w-[350px] md:max-w-[450px] lg:max-w-[550px] aspect-[4/5] overflow-hidden shadow-2xl mt-32 md:mt-0">
            <img src={imageUrl} alt="Hero" className="w-full h-full object-cover object-center grayscale hover:grayscale-0 transition-all duration-700 ease-in-out scale-105 hover:scale-100" />
            
            {/* Inner Overlay */}
            <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors duration-700"></div>
          </div>
          
          {/* Small graphic element on image */}
          <div className="swiss-meta-element absolute bottom-[10%] right-0 md:-right-8 bg-[var(--color-primary)] text-[var(--color-bg)] p-4 hidden md:flex items-center justify-center z-20 shadow-xl">
             <span className="rotate-90 font-bold tracking-widest text-xs uppercase">Y.Y.</span>
          </div>

        </div>

      </div>
    </div>
  )
}
