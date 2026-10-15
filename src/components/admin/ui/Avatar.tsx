type AvatarSize = "xsmall" | "small" | "medium" | "large" | "xlarge";

const SIZE: Record<AvatarSize, string> = {
  xsmall: "h-6 w-6 text-[10px]",
  small: "h-8 w-8 text-xs",
  medium: "h-10 w-10 text-sm",
  large: "h-12 w-12 text-base",
  xlarge: "h-16 w-16 text-lg",
};

interface AdminAvatarProps {
  /** Image URL. When missing, the name's initial is shown on the brand tint. */
  src?: string | null;
  name: string;
  size?: AvatarSize;
  className?: string;
}

/** Reference Avatar: rounded-full, object-cover image, initials fallback. */
export default function AdminAvatar({ src, name, size = "medium", className = "" }: AdminAvatarProps) {
  const initial = (name.trim().charAt(0) || "?").toUpperCase();
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eaf0f8] font-semibold text-[#034795] ${SIZE[size]} ${className}`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        initial
      )}
    </span>
  );
}
