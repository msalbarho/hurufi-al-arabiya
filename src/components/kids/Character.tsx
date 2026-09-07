import hurufiImg from "@/assets/hurufi.png";
import { useProgress } from "@/lib/progress/store";
import { cn } from "@/lib/utils";

interface Props {
  size?: "sm" | "md" | "lg";
  className?: string;
  float?: boolean;
}

const sizes = { sm: "size-20", md: "size-32", lg: "size-44 md:size-52" };

/** Shows the child's own photo if set, otherwise the guide character. */
export function Character({ size = "lg", className, float = true }: Props) {
  const avatar = useProgress((s) => s.profile.avatarDataUrl);
  const name = useProgress((s) => s.profile.name);

  return (
    <div className={cn("relative inline-block", float && "animate-float", className)}>
      <div
        className={cn(
          "grid place-items-center overflow-hidden rounded-full bg-paper outline-4 outline-ink/10 shadow-chunky-sm",
          sizes[size],
        )}
      >
        {avatar ? (
          <img src={avatar} alt={name} className="size-full object-cover" />
        ) : (
          <img
            src={hurufiImg}
            alt="حروفي"
            width={768}
            height={768}
            className="size-[88%] translate-y-[6%] object-contain"
          />
        )}
      </div>
      <span className="absolute -bottom-1 -right-1 grid size-10 animate-sway place-items-center rounded-full bg-sea text-lg text-paper shadow-chunky-xs">
        ✨
      </span>
    </div>
  );
}
