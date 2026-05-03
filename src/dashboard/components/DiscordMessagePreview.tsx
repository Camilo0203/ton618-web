import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export interface DiscordEmbedProps {
  title?: string;
  description?: string;
  color?: string; // hex format e.g., #5865F2
  footer?: string;
  thumbnail?: boolean | string; // if true, shows a placeholder avatar. if string, shows image.
  image?: string; // banner URL
}

interface DiscordMessagePreviewProps {
  botName?: string;
  botAvatar?: string;
  embed: DiscordEmbedProps;
}

export default function DiscordMessagePreview({
  botName = 'TON618',
  botAvatar = '/logo.png', // Assuming logo.png is in public
  embed,
}: DiscordMessagePreviewProps) {
  // Convert hex color to rgba for the left border, default to #2b2d31 if invalid or missing
  const borderHex = embed.color && /^#([0-9A-F]{3}){1,2}$/i.test(embed.color) 
    ? embed.color 
    : '#1e1f22'; // Default Discord embed background color if no color provided

  return (
    <div className="w-full max-w-2xl rounded-md bg-[#313338] p-4 text-[#dbdee1] shadow-md font-sans antialiased text-[0.95rem] leading-6">
      <div className="flex gap-4">
        {/* Bot Avatar */}
        <div className="mt-0.5 h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-full hover:opacity-80 transition-opacity bg-[#2b2d31]">
          <img src={botAvatar} alt="Bot Avatar" className="h-full w-full object-cover" />
        </div>

        {/* Message Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="cursor-pointer font-medium text-white hover:underline">
              {botName}
            </span>
            <span className="flex h-[15px] items-center rounded-[3px] bg-[#5865f2] px-[4px] text-[10px] font-semibold uppercase leading-none text-white">
              <span className="mr-[2px]">✓</span> Bot
            </span>
            <span className="cursor-default text-xs text-[#80848e]">
              Hoy a las 12:00
            </span>
          </div>

          {/* Embed Box */}
          <motion.div 
            layout
            className="mt-2 flex max-w-[520px] rounded-[4px] bg-[#2b2d31]"
            style={{ borderLeft: `4px solid ${borderHex}` }}
          >
            <div className="flex flex-col gap-4 p-4 pr-3 w-full">
              
              <div className="flex gap-4">
                <div className="flex flex-col gap-2 min-w-0 flex-1">
                  {/* Title */}
                  {embed.title && (
                    <div className="font-semibold text-white break-words">
                      {embed.title}
                    </div>
                  )}

                  {/* Description */}
                  {embed.description && (
                    <div className="whitespace-pre-wrap break-words text-[0.875rem] text-[#dbdee1]">
                      {embed.description}
                    </div>
                  )}
                </div>

                {/* Thumbnail */}
                {embed.thumbnail && (
                  <div className="shrink-0">
                    <div className="h-20 w-20 overflow-hidden rounded-[4px] bg-[#1e1f22]">
                      <img 
                        src={typeof embed.thumbnail === 'string' ? embed.thumbnail : 'https://cdn.discordapp.com/embed/avatars/0.png'} 
                        alt="Thumbnail" 
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Banner Image */}
              {embed.image && (
                <div className="mt-2 overflow-hidden rounded-[4px]">
                  <img 
                    src={embed.image} 
                    alt="Banner" 
                    className="max-w-full object-contain max-h-[400px]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Footer */}
              {embed.footer && (
                <div className="mt-2 flex items-center gap-2 text-xs text-[#dbdee1]">
                  <span className="break-words">{embed.footer}</span>
                </div>
              )}

            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
