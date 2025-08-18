import React from "react";

export const shortenUrl = (url: string, maxLength: number = 60): string => {
  if (url.length <= maxLength) return url;
  const start = url.substring(0, Math.floor(maxLength / 2) - 2);
  const end = url.substring(url.length - Math.floor(maxLength / 2) + 2);
  return `${start}...${end}`;
};

export const renderLink = (
  url: string,
  key: string | number,
  maxLength: number = 60
): React.ReactNode => {
  const displayText = shortenUrl(url, maxLength);
  return (
    <a
      key={key}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:text-blue-800 underline hover:no-underline transition-colors duration-200"
      title={url}
    >
      {displayText}
    </a>
  );
};

export const processLinksInText = (
  text: string,
  maxLength: number = 60
): React.ReactNode[] => {
  const urlRegex = /(https?:\/\/[^\s,;]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, index) => {
    const isUrl = /^https?:\/\//.test(part);
    if (isUrl) return renderLink(part, index, maxLength);
    return <span key={index}>{part}</span>;
  });
};
