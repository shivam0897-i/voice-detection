import { PremiumButton } from "@/components/ui/PremiumButton";
import { ArrowUpRight } from "lucide-react";

/**
 * PremiumButton Demo Component
 *
 * This shows how to use the new @base-ui/react based premium button
 * with smooth animations and premium styling.
 */
export function PremiumButtonDemo() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* CTA Button with animated icon */}
      <PremiumButton className="group not-disabled:inset-shadow-none mx-auto flex cursor-pointer items-center justify-center gap-0 rounded-full border-none bg-transparent px-0 py-5 font-normal shadow-none hover:bg-transparent [:hover,[data-pressed]]:bg-transparent">
        <span className="rounded-full bg-primary px-6 py-3 text-black duration-500 ease-in-out group-hover:bg-secondary group-hover:text-primary group-hover:transition-colors">
          Start a Project
        </span>
        <div className="relative flex h-fit cursor-pointer items-center overflow-hidden rounded-full bg-primary p-5 text-black duration-500 ease-in-out group-hover:bg-secondary group-hover:text-primary group-hover:transition-colors">
          <ArrowUpRight className="absolute h-5 w-5 -translate-x-1/2 transition-all duration-500 ease-in-out group-hover:translate-x-10" />
          <ArrowUpRight className="absolute h-5 w-5 -translate-x-10 transition-all duration-500 ease-in-out group-hover:-translate-x-1/2" />
        </div>
      </PremiumButton>

      {/* Standard buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <PremiumButton variant="default">Primary Button</PremiumButton>
        <PremiumButton variant="secondary">Secondary</PremiumButton>
        <PremiumButton variant="outline">Outline</PremiumButton>
        <PremiumButton variant="ghost">Ghost</PremiumButton>
        <PremiumButton variant="destructive">Delete</PremiumButton>
      </div>

      {/* Size variants */}
      <div className="flex flex-wrap gap-4 items-center justify-center">
        <PremiumButton size="xs">Extra Small</PremiumButton>
        <PremiumButton size="sm">Small</PremiumButton>
        <PremiumButton size="default">Default</PremiumButton>
        <PremiumButton size="lg">Large</PremiumButton>
        <PremiumButton size="xl">Extra Large</PremiumButton>
      </div>

      {/* Icon buttons */}
      <div className="flex gap-4 justify-center">
        <PremiumButton size="icon-xs" variant="outline">
          <ArrowUpRight className="h-4 w-4" />
        </PremiumButton>
        <PremiumButton size="icon-sm" variant="outline">
          <ArrowUpRight className="h-4 w-4" />
        </PremiumButton>
        <PremiumButton size="icon" variant="default">
          <ArrowUpRight className="h-5 w-5" />
        </PremiumButton>
        <PremiumButton size="icon-lg" variant="secondary">
          <ArrowUpRight className="h-5 w-5" />
        </PremiumButton>
      </div>
    </div>
  );
}

export default PremiumButtonDemo;
