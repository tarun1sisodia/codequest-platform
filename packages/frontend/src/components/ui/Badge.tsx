import React from "react";

interface BadgeProps {
  variant?:
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "achievement"
    | "novice"
    | "adept"
    | "master";
  children: React.ReactNode;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
  glow?: boolean;
  icon?: React.ReactNode;
}

const Badge = ({
  variant = "info",
  children,
  className = "",
  size = "md",
  glow = false,
  icon,
}: BadgeProps) => {
  // Mapping of variants to their gaming-styled classes
  const variants = {
    success:
      "bg-gradient-to-r from-green-600 to-green-400 text-white border-green-400",
    warning:
      "bg-gradient-to-r from-yellow-600 to-yellow-400 text-white border-yellow-400",
    danger:
      "bg-gradient-to-r from-red-600 to-red-400 text-white border-red-400",
    info: "bg-gradient-to-r from-blue-600 to-blue-400 text-white border-blue-400",
    achievement:
      "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400",
    novice:
      "bg-gradient-to-r from-green-600 to-green-400 text-white border-green-400",
    adept:
      "bg-gradient-to-r from-yellow-600 to-yellow-400 text-white border-yellow-400",
    master:
      "bg-gradient-to-r from-red-600 to-red-400 text-white border-red-400",
  };

  // Sizes with gaming-appropriate spacing and font styles
  const sizes = {
    xs: "text-xs px-2 py-0.5 leading-tight",
    sm: "text-sm px-2.5 py-0.5 leading-tight",
    md: "text-base px-3 py-1 leading-tight",
    lg: "text-lg px-4 py-1.5 font-semibold",
  };

  // Add special glow effect for gaming style
  const glowEffect = glow
    ? `shadow-sm ${
        variant === "success" || variant === "novice"
          ? "shadow-green-500/50"
          : variant === "warning" || variant === "adept"
          ? "shadow-yellow-500/50"
          : variant === "danger" || variant === "master"
          ? "shadow-red-500/50"
          : variant === "achievement"
          ? "shadow-purple-500/50"
          : "shadow-blue-500/50"
      }`
    : "";

  return (
    <span
      className={`
        inline-flex items-center justify-center rounded-full 
        font-medium border transition-all duration-200
        ${variants[variant]} ${sizes[size]} ${glowEffect} ${className}
      `}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </span>
  );
};

// Gaming-specific badge variants
export const AchievementBadge = ({
  children,
  imageSrc,
  title,
  description,
  className = "",
  size = "md",
}: {
  children?: React.ReactNode;
  imageSrc: string;
  title: string;
  description?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) => {
  const sizes = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <div className={`relative ${sizes[size]} mb-2`}>
        {/* Badge glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 opacity-50 blur-md animate-pulse"></div>

        {/* Badge image */}
        <div className="relative z-10 w-full h-full">
          <img
            src={imageSrc}
            alt={title}
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      <div className="text-center">
        <h3 className="text-sm font-bold">{title}</h3>
        {description && <p className="text-xs text-gray-400">{description}</p>}
        {children}
      </div>
    </div>
  );
};

// Badge with level indicators (stars) for difficulty levels
export const LevelBadge = ({
  level = "novice",
  showStars = true,
  className = "",
  size = "md",
}: {
  level: "novice" | "adept" | "master";
  showStars?: boolean;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
}) => {
  const levelInfo = {
    novice: {
      variant: "success",
      stars: 1,
      label: "Novice",
    },
    adept: {
      variant: "warning",
      stars: 2,
      label: "Adept",
    },
    master: {
      variant: "danger",
      stars: 3,
      label: "Master",
    },
  };

  const { variant, stars, label } = levelInfo[level];

  return (
    <Badge
      variant={variant as "success" | "warning" | "danger"}
      className={className}
      size={size}
      glow
    >
      {showStars ? "⭐".repeat(stars) : ""} {label}
    </Badge>
  );
};

export default Badge;
