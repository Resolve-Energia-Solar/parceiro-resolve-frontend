import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { ReactNode } from 'react';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Content
          side="top"
          align="center"
          className="bg-gray-900 text-white text-xs rounded py-1 px-2 shadow-lg"
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-current text-gray-900" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
