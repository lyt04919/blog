import { cn } from "@/lib/utils";
import { ArrowUpRight, Globe, Github, Package } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

function ProjectImage({ src, alt }: { src: string; alt: string }) {
  const [imageError, setImageError] = useState(false);

  if (!src || imageError) {
    return <div className="w-full h-48 bg-neutral-800" />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-48 object-cover"
      onError={() => setImageError(true)}
    />
  );
}

interface Props {
  title: string;
  href?: string;
  description: string;
  dates?: string;
  tags: readonly string[];
  image?: string;
  video?: string;
  links?: readonly {
    icon: React.ReactNode;
    type: string;
    href: string;
  }[];
  className?: string;
}

export function ProjectCard({
  title,
  href,
  description,
  dates,
  tags,
  image,
  video,
  links,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-col h-full bg-neutral-900 border border-neutral-800 rounded-[20px] overflow-hidden hover:border-neutral-600 transition-all duration-300 shadow-xl group",
        className
      )}
    >
      <div className="relative shrink-0 border-b border-neutral-800">
        <Link
          href={href || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="block overflow-hidden"
        >
          {video ? (
            <video
              src={video}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : image ? (
            <div className="overflow-hidden">
               <ProjectImage src={image} alt={title} />
            </div>
          ) : (
            <div className="w-full h-48 bg-neutral-800" />
          )}
        </Link>
        {links && links.length > 0 && (
          <div className="absolute top-2 right-2 flex flex-wrap gap-2">
            {links.map((link, idx) => (
              <Link
                href={link.href}
                key={idx}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="flex items-center gap-1.5 text-xs bg-black/70 backdrop-blur-md text-white hover:bg-black/90 px-2 py-1 rounded-full border border-neutral-700/50 transition-colors shadow-sm"
                >
                  {link.icon}
                  {link.type}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col gap-4 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <h3 className="font-bold text-lg text-neutral-100 leading-none">{title}</h3>
            {dates && <time className="text-xs text-neutral-400 font-medium mt-1">{dates}</time>}
          </div>
          <Link
            href={href || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-400 hover:text-brand transition-colors p-1 bg-neutral-800 rounded-full group-hover:bg-brand/10 group-hover:text-brand"
            aria-label={`Open ${title}`}
          >
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <div className="text-sm flex-1 text-neutral-400 leading-relaxed font-medium">
          {description}
        </div>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-auto pt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-semibold px-2.5 py-1 bg-neutral-800 text-neutral-300 rounded-md border border-neutral-700/50"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
