import { ReactNode } from "react";
import { ArrowRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { MagicCard } from "./magic-card";

const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[16rem] grid-cols-3 gap-4 md:gap-6",
        className,
      )}
    >
      {children}
    </div>
  );
};

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
}: {
  name: string;
  className?: string;
  background?: ReactNode;
  Icon?: any;
  description: string;
  href?: string;
  cta?: string;
}) => (
  <div
    key={name}
    className={cn(
      "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-2xl",
      className,
    )}
  >
    <MagicCard gradientColor="rgba(var(--color-brand-rgb, 120, 119, 198), 0.15)">
      <div className="absolute inset-0 z-0">{background}</div>
      <div className="pointer-events-none relative z-10 flex h-full transform-gpu flex-col justify-end gap-1 p-6 transition-all duration-300 group-hover:-translate-y-10">
        <div className="bg-card/80 backdrop-blur-md p-4 rounded-xl shadow-sm border">
          {Icon && <Icon className="mb-2 h-8 w-8 origin-left transform-gpu text-brand transition-all duration-300 ease-in-out group-hover:scale-75" />}
          <h3 className="text-xl font-semibold text-primary">
            {name}
          </h3>
          <p className="max-w-lg text-secondary text-sm mt-1 line-clamp-2">{description}</p>
        </div>
      </div>

      <div
        className={cn(
          "pointer-events-none absolute bottom-0 flex w-full translate-y-10 transform-gpu flex-row items-center p-6 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 z-20",
        )}
      >
        <a href={href} target="_blank" rel="noreferrer" className="pointer-events-auto flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm text-white font-medium hover:opacity-90 shadow-sm">
          {cta || "Visit Project"}
          <ArrowRightIcon className="h-4 w-4" />
        </a>
      </div>
      <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-black/[.03] group-hover:dark:bg-neutral-800/10 z-10" />
    </MagicCard>
  </div>
);

export { BentoCard, BentoGrid };
