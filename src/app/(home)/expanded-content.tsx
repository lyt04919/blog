"use client";

import React from "react";
import BlurFade from "@/components/magicui/blur-fade";
import { BentoGrid, BentoCard } from "@/components/magicui/bento-grid";
import Marquee from "@/components/magicui/marquee";
import { CodeIcon, LinkIcon, BookIcon, FilmIcon, NotebookIcon } from "lucide-react";
import { ProjectCard } from "@/components/project-card";
import { Timeline, TimelineItem, TimelineConnectItem } from "@/components/timeline";
import { useBlogIndex } from "@/hooks/use-blog-index";

import projectsData from "@/app/projects/list.json";
import bloggersData from "@/app/favorite/bloggers/list.json";
import diaryData from "@/app/diary/list.json";
import booksData from "@/app/favorite/books.json";
import moviesData from "@/app/favorite/movies.json";
import Link from "next/link";

export default function ExpandedContent() {
  const { items: blogItems } = useBlogIndex();

  return (
    <div className="relative z-10 mx-auto max-w-7xl px-4 pb-32 flex flex-col gap-6">
      
      {/* Top Section: Dashboard Split Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column (Profile & Bio) */}
        <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-6">
          <BlurFade delay={0.1} inView>
            <div className="flex items-center justify-between mb-2 px-2">
              <h2 className="text-xl font-bold tracking-tight text-primary">Creator & Developer</h2>
            </div>
            
            {/* Profile Card */}
            <div className="rounded-[32px] bg-neutral-900 border border-neutral-800 text-neutral-100 p-8 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand/20 rounded-full blur-3xl translate-x-10 -translate-y-10"></div>
              <div className="w-20 h-20 rounded-full bg-white/10 p-1 mb-4 relative z-10 shadow-inner">
                <img src="/images/art/1c7b726fe720679b.jpg" alt="Avatar" className="w-full h-full rounded-full object-cover" />
              </div>
              <h3 className="text-2xl font-bold relative z-10 flex items-center gap-2">
                YYsuni <Link href="/about" className="text-brand text-xs px-2 py-0.5 rounded-full bg-brand/10 hover:bg-brand/20 transition-colors">↗</Link>
              </h3>
              <div className="flex gap-10 w-full justify-center mt-8 relative z-10">
                <div className="flex flex-col items-center">
                  <span className="font-bold text-xl">{projectsData.length}</span>
                  <span className="text-xs text-neutral-400 font-medium">Projects</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-bold text-xl">{diaryData.length}</span>
                  <span className="text-xs text-neutral-400 font-medium">Diaries</span>
                </div>
              </div>
            </div>
          </BlurFade>

          <BlurFade delay={0.2} inView>
            {/* Bio / Tag Card */}
            <div className="rounded-[32px] bg-neutral-900 border border-neutral-800 p-6 shadow-xl">
              <p className="text-sm text-neutral-300 leading-relaxed mb-6 font-medium">
                {diaryData[0]?.content || "I treat coding and UI design as an experiment. Through code, I study product design, user experience, and aesthetics."}
              </p>
              <div className="flex flex-wrap gap-2">
                {projectsData.slice(0, 7).map(p => (
                  <Link key={p.name} href={p.url || "#"} target="_blank" className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 transition-colors text-neutral-300 text-xs font-semibold rounded-full flex items-center gap-1 border border-neutral-700">
                    {p.name} ↗
                  </Link>
                ))}
              </div>
            </div>
          </BlurFade>
        </div>

        {/* Right Column (Projects, Movies, Books Grid) */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          
          {/* Projects Grid */}
          <BlurFade delay={0.1} inView>
            <div className="flex flex-col gap-y-4 items-center justify-center mt-2 mb-6">
              <div className="flex items-center w-full">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent from-5% via-neutral-800 via-95% to-transparent" />
                <div className="border border-neutral-700 bg-neutral-900 z-10 rounded-xl px-4 py-1 flex items-center gap-2">
                  <CodeIcon className="h-4 w-4 text-brand" />
                  <span className="text-neutral-200 text-sm font-medium">My Projects</span>
                </div>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent from-5% via-neutral-800 via-95% to-transparent" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {projectsData.slice(0, 4).map((project) => (
                <ProjectCard
                  key={project.name}
                  title={project.name}
                  description={project.description}
                  dates={project.year?.toString()}
                  href={project.url}
                  image={project.image}
                  tags={project.tags || []}
                  links={project.github ? [{ type: "Source", href: project.github, icon: <CodeIcon className="h-3 w-3" /> }] : []}
                />
              ))}
            </div>
            <div className="mt-4 flex justify-end px-2">
               <Link href="/projects" className="text-sm text-brand hover:underline font-medium">View All Projects ↗</Link>
            </div>
          </BlurFade>

          {/* Media & Resources Marquees */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-2">
            <BlurFade delay={0.2} inView>
              <div className="rounded-[32px] bg-neutral-900 border border-neutral-800 shadow-xl p-6 overflow-hidden flex flex-col h-full relative">
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <h2 className="text-lg font-bold tracking-tight text-neutral-100 flex items-center gap-2">
                    <FilmIcon className="h-5 w-5 text-brand" /> Movies
                  </h2>
                  <Link href="/favorite" className="text-xs text-brand hover:underline font-medium">View All</Link>
                </div>
                <div className="relative flex w-full flex-col items-center justify-center z-10">
                  <Marquee pauseOnHover className="[--duration:50s] [--gap:1rem]">
                    {moviesData.map((movie, i) => (
                      <a key={i} href="/favorite" className="group relative w-[140px] aspect-[3/4] overflow-hidden rounded-2xl shadow-md shrink-0 border border-neutral-700">
                        {movie.poster ? (
                          <img src={movie.poster} alt={movie.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-neutral-800 transition-transform duration-500 group-hover:scale-110">
                            <FilmIcon className="h-8 w-8 text-neutral-600" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                          <span className="text-neutral-100 text-xs font-bold line-clamp-2">{movie.name}</span>
                        </div>
                      </a>
                    ))}
                  </Marquee>
                  <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-neutral-900"></div>
                  <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-neutral-900"></div>
                </div>
              </div>
            </BlurFade>

            <BlurFade delay={0.3} inView>
              <div className="rounded-[32px] bg-neutral-900 border border-neutral-800 shadow-xl p-6 overflow-hidden flex flex-col h-full relative">
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <h2 className="text-lg font-bold tracking-tight text-neutral-100 flex items-center gap-2">
                    <BookIcon className="h-5 w-5 text-brand" /> Books
                  </h2>
                  <Link href="/favorite" className="text-xs text-brand hover:underline font-medium">View All</Link>
                </div>
                <div className="relative flex w-full flex-col items-center justify-center z-10">
                  <Marquee reverse pauseOnHover className="[--duration:50s] [--gap:1rem]">
                    {booksData.map((book, i) => (
                      <a key={i} href="/favorite" className="group relative w-[140px] aspect-[3/4] overflow-hidden rounded-2xl shadow-md shrink-0 border border-neutral-700">
                        {book.cover ? (
                          <img src={book.cover} alt={book.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-neutral-800 transition-transform duration-500 group-hover:scale-110">
                            <BookIcon className="h-8 w-8 text-neutral-600" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                          <span className="text-neutral-100 text-xs font-bold line-clamp-2">{book.name}</span>
                        </div>
                      </a>
                    ))}
                  </Marquee>
                  <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-neutral-900"></div>
                  <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-neutral-900"></div>
                </div>
              </div>
            </BlurFade>
          </div>

        </div>
      </div>

      {/* Timeline Section for Blog */}
      <BlurFade delay={0.35} inView>
        <div className="rounded-[32px] bg-neutral-900 border border-neutral-800 shadow-xl p-8 overflow-hidden flex flex-col w-full relative mb-6">
          <div className="flex flex-col gap-y-4 items-center justify-center mb-8">
            <div className="flex items-center w-full">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent from-5% via-neutral-700 via-95% to-transparent" />
              <div className="border border-neutral-700 bg-neutral-800 z-10 rounded-xl px-4 py-1 flex items-center gap-2">
                <NotebookIcon className="h-4 w-4 text-brand" />
                <span className="text-neutral-200 text-sm font-medium">Latest Posts</span>
              </div>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent from-5% via-neutral-700 via-95% to-transparent" />
            </div>
            <div className="flex flex-col gap-y-3 items-center justify-center">
              <h2 className="text-2xl font-bold tracking-tight text-neutral-100">My Writing Journey</h2>
              <p className="text-neutral-400 text-sm md:text-base text-center max-w-[600px]">
                I enjoy sharing my thoughts on software development, design, and life. Here are some of my latest articles and updates.
              </p>
            </div>
          </div>
          
          <Timeline>
            {blogItems.slice(0, 5).map((item) => (
              <TimelineItem key={item.slug || Math.random().toString()} className="w-full flex items-start justify-between gap-6">
                <TimelineConnectItem className="flex items-start justify-center">
                  <div className="size-10 bg-neutral-800 z-10 shrink-0 overflow-hidden flex items-center justify-center border border-neutral-700 rounded-full shadow-sm">
                    <NotebookIcon className="h-4 w-4 text-brand" />
                  </div>
                </TimelineConnectItem>
                <div className="flex flex-1 flex-col justify-start gap-2 min-w-0 pb-4">
                  {item.date && (
                    <time className="text-xs font-medium text-neutral-500">{item.date}</time>
                  )}
                  {item.title && (
                    <h3 className="font-semibold text-neutral-100 leading-none text-lg">{item.title}</h3>
                  )}
                  <p className="text-sm text-neutral-400 leading-relaxed break-words line-clamp-3 mt-1">
                    {item.summary || "No description available."}
                  </p>
                  <div className="mt-2 flex flex-row flex-wrap items-start gap-2">
                    <Link
                      href={item.slug ? `/blog/${item.slug}` : `/diary`}
                      className="inline-flex items-center gap-1.5 text-xs bg-brand/10 text-brand px-3 py-1.5 rounded-md hover:bg-brand/20 transition-colors font-medium border border-brand/20"
                    >
                      Read more
                    </Link>
                  </div>
                </div>
              </TimelineItem>
            ))}
          </Timeline>
        </div>
      </BlurFade>

      {/* Bottom Section: Friends Horizontal Marquee */}
      <BlurFade delay={0.4} inView>
        <div className="rounded-[32px] bg-neutral-900 border border-neutral-800 shadow-xl p-8 overflow-hidden flex flex-col w-full relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl translate-x-10 -translate-y-10"></div>
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h2 className="text-lg font-bold tracking-tight text-neutral-100 flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-brand" /> Friends
            </h2>
            <Link href="/bloggers" className="text-xs text-brand hover:underline font-medium">View All</Link>
          </div>
          <div className="relative flex w-full flex-col items-center justify-center z-10">
            <Marquee pauseOnHover className="[--duration:90s] [--gap:1.5rem]">
              {bloggersData.slice(0, Math.ceil(bloggersData.length / 2)).map(blogger => (
                <a key={blogger.name} href={blogger.url} target="_blank" rel="noreferrer" className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-700/50 bg-neutral-800/80 p-6 shadow-md hover:bg-neutral-800 hover:border-neutral-600 transition-all shrink-0" style={{ width: '320px', height: '160px' }}>
                  <div className="flex items-center gap-4 mb-4">
                    <img src={blogger.avatar} alt={blogger.name} style={{ width: '48px', height: '48px' }} className="rounded-full object-cover border border-neutral-700 shadow-sm shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <h4 className="text-base font-bold text-neutral-100 truncate">{blogger.name}</h4>
                      <span className="text-xs text-brand/80 truncate mt-0.5 group-hover:text-brand transition-colors">Visit Blog ↗</span>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-400 line-clamp-2 leading-relaxed">{blogger.description}</p>
                </a>
              ))}
            </Marquee>
            <Marquee reverse pauseOnHover className="[--duration:90s] [--gap:1.5rem] mt-6">
              {bloggersData.slice(Math.ceil(bloggersData.length / 2)).map(blogger => (
                <a key={blogger.name} href={blogger.url} target="_blank" rel="noreferrer" className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-700/50 bg-neutral-800/80 p-6 shadow-md hover:bg-neutral-800 hover:border-neutral-600 transition-all shrink-0" style={{ width: '320px', height: '160px' }}>
                  <div className="flex items-center gap-4 mb-4">
                    <img src={blogger.avatar} alt={blogger.name} style={{ width: '48px', height: '48px' }} className="rounded-full object-cover border border-neutral-700 shadow-sm shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <h4 className="text-base font-bold text-neutral-100 truncate">{blogger.name}</h4>
                      <span className="text-xs text-brand/80 truncate mt-0.5 group-hover:text-brand transition-colors">Visit Blog ↗</span>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-400 line-clamp-2 leading-relaxed">{blogger.description}</p>
                </a>
              ))}
            </Marquee>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-neutral-900"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-neutral-900"></div>
          </div>
        </div>
      </BlurFade>

    </div>
  );
}
