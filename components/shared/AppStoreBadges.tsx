import Image from "next/image";

type AppStoreBadgesProps = {
  readonly className?: string;
  readonly size?: "default" | "small";
};

export default function AppStoreBadges({
  className = "",
  size = "default",
}: AppStoreBadgesProps) {
  const height = size === "small" ? 40 : 48;
  const width = size === "small" ? 135 : 162;

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <a
        href="https://apps.apple.com"
        target="_blank"
        rel="noopener noreferrer"
        className="transition-transform hover:scale-105"
      >
        <Image
          src="/images/app-store-badge.svg"
          alt="Download on the App Store"
          width={width}
          height={height}
        />
      </a>
      <a
        href="https://play.google.com"
        target="_blank"
        rel="noopener noreferrer"
        className="transition-transform hover:scale-105"
      >
        <Image
          src="/images/google-play-badge.svg"
          alt="Get it on Google Play"
          width={width}
          height={height}
        />
      </a>
    </div>
  );
}
