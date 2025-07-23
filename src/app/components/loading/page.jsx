import React from "react";

const Loading = ({
  type = "dashboard",
  message = "Loading...",
  submessage = "Please wait",
  size = "large",
}) => {
  // Different loading types
  const loadingTypes = {
    dashboard: {
      bg: "bg-gradient-to-br from-blue-50 to-indigo-100",
      spinnerPrimary: "border-blue-200 border-t-blue-600",
      spinnerSecondary: "border-t-blue-400",
      textPrimary: "text-gray-700",
      textSecondary: "text-gray-500",
    },
    error: {
      bg: "bg-gradient-to-br from-red-50 to-pink-100",
      spinnerPrimary: "border-red-200 border-t-red-600",
      spinnerSecondary: "border-t-red-400",
      textPrimary: "text-red-700",
      textSecondary: "text-red-500",
    },
    success: {
      bg: "bg-gradient-to-br from-green-50 to-emerald-100",
      spinnerPrimary: "border-green-200 border-t-green-600",
      spinnerSecondary: "border-t-green-400",
      textPrimary: "text-green-700",
      textSecondary: "text-green-500",
    },
    simple: {
      bg: "bg-gray-50",
      spinnerPrimary: "border-gray-200 border-t-gray-600",
      spinnerSecondary: "border-t-gray-400",
      textPrimary: "text-gray-700",
      textSecondary: "text-gray-500",
    },
  };

  // Different sizes
  const sizes = {
    small: {
      spinner: "h-12 w-12",
      text: "text-base",
      subtext: "text-xs",
      padding: "p-4",
    },
    medium: {
      spinner: "h-16 w-16",
      text: "text-lg",
      subtext: "text-sm",
      padding: "p-6",
    },
    large: {
      spinner: "h-20 w-20",
      text: "text-lg",
      subtext: "text-sm",
      padding: "p-8",
    },
  };

  const currentType = loadingTypes[type] || loadingTypes.dashboard;
  const currentSize = sizes[size] || sizes.large;

  return (
    <div
      className={`flex items-center justify-center min-h-screen ${currentType.bg}`}
    >
      <div className={`text-center ${currentSize.padding}`}>
        <div className="relative">
          {/* Main spinner */}
          <div
            className={`animate-spin rounded-full ${currentSize.spinner} border-4 ${currentType.spinnerPrimary} mx-auto shadow-lg`}
          ></div>

          {/* Secondary animated ring */}
          <div
            className={`absolute inset-0 rounded-full ${currentSize.spinner} border-4 border-transparent ${currentType.spinnerSecondary} animate-ping mx-auto`}
          ></div>

          {/* Inner pulse dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`w-2 h-2 ${
                currentType.spinnerPrimary.includes("blue")
                  ? "bg-blue-600"
                  : currentType.spinnerPrimary.includes("red")
                  ? "bg-red-600"
                  : currentType.spinnerPrimary.includes("green")
                  ? "bg-green-600"
                  : "bg-gray-600"
              } rounded-full animate-pulse`}
            ></div>
          </div>
        </div>

        {/* Loading text */}
        <p
          className={`mt-6 ${currentType.textPrimary} font-medium ${currentSize.text}`}
        >
          {message}
        </p>

        {/* Sub message */}
        <p
          className={`mt-2 ${currentType.textSecondary} ${currentSize.subtext}`}
        >
          {submessage}
        </p>

        {/* Loading dots animation */}
        <div className="flex justify-center mt-4 space-x-1">
          <div
            className={`w-2 h-2 ${
              currentType.spinnerPrimary.includes("blue")
                ? "bg-blue-400"
                : currentType.spinnerPrimary.includes("red")
                ? "bg-red-400"
                : currentType.spinnerPrimary.includes("green")
                ? "bg-green-400"
                : "bg-gray-400"
            } rounded-full animate-bounce`}
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className={`w-2 h-2 ${
              currentType.spinnerPrimary.includes("blue")
                ? "bg-blue-400"
                : currentType.spinnerPrimary.includes("red")
                ? "bg-red-400"
                : currentType.spinnerPrimary.includes("green")
                ? "bg-green-400"
                : "bg-gray-400"
            } rounded-full animate-bounce`}
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className={`w-2 h-2 ${
              currentType.spinnerPrimary.includes("blue")
                ? "bg-blue-400"
                : currentType.spinnerPrimary.includes("red")
                ? "bg-red-400"
                : currentType.spinnerPrimary.includes("green")
                ? "bg-green-400"
                : "bg-gray-400"
            } rounded-full animate-bounce`}
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

// Additional mini loading component for inline use
export const MiniLoading = ({
  color = "blue",
  size = "medium",
  message = "Loading...",
}) => {
  const colors = {
    blue: "border-blue-200 border-t-blue-600",
    green: "border-green-200 border-t-green-600",
    red: "border-red-200 border-t-red-600",
    gray: "border-gray-200 border-t-gray-600",
  };

  const spinnerSizes = {
    small: "h-4 w-4",
    medium: "h-6 w-6",
    large: "h-8 w-8",
  };

  return (
    <div className="flex items-center justify-center gap-3 py-4">
      <div
        className={`animate-spin rounded-full ${spinnerSizes[size]} border-2 ${colors[color]}`}
      ></div>
      <span className="text-gray-600 text-sm font-medium">{message}</span>
    </div>
  );
};

// Skeleton loading component
export const SkeletonLoading = ({ lines = 3, className = "" }) => {
  return (
    <div className={`animate-pulse space-y-4 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="space-y-3">
          <div className="grid grid-cols-3 gap-4">
            <div className="h-4 bg-gray-200 rounded col-span-2"></div>
            <div className="h-4 bg-gray-200 rounded col-span-1"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );
};

export default Loading;
