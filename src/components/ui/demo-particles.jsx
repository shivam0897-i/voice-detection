import { Button } from "@/components/ui/button-base";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Particles({ children = "Start a Project", className, onClick }) {
    return (
        <Button 
            className={cn("group not-disabled:inset-shadow-none flex cursor-pointer items-center justify-center gap-0 rounded-full border-none bg-transparent px-0 py-1 font-normal shadow-none hover:bg-transparent [:hover,[data-pressed]]:bg-transparent", className)}
            onClick={onClick}
        >
            <span className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground duration-500 ease-in-out group-hover:bg-accent group-hover:text-accent-foreground group-hover:transition-colors">
                {children}
            </span>
            <div className="relative -ml-2 flex h-fit cursor-pointer items-center overflow-hidden rounded-full bg-primary p-3 text-primary-foreground duration-500 ease-in-out group-hover:bg-accent group-hover:text-accent-foreground group-hover:transition-colors">
                <ArrowUpRight className="absolute h-5 w-5 -translate-x-1/2 transition-all duration-500 ease-in-out group-hover:translate-x-10" />
                <ArrowUpRight className="absolute h-5 w-5 -translate-x-10 transition-all duration-500 ease-in-out group-hover:-translate-x-1/2" />
            </div>
        </Button>
    )
}
