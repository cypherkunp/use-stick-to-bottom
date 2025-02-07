/*!---------------------------------------------------------------------------------------------
 *  Copyright (c) StackBlitz. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as React from 'react';
import { createContext, ReactNode, RefCallback, useContext, useEffect, useLayoutEffect, useMemo } from 'react';
import { ScrollToBottom, StopScroll, StickToBottomOptions, useStickToBottom } from './useStickToBottom.js';

export interface StickToBottomContext {
  contentRef: RefCallback<HTMLDivElement>;
  scrollRef: RefCallback<HTMLDivElement>;
  scrollToBottom: ScrollToBottom;
  stopScroll: StopScroll;
  isAtBottom: boolean;
  isNearBottom: boolean;
  escapedFromLock: boolean;
}

const StickToBottomContext = createContext<StickToBottomContext | null>(null);

export interface StickToBottomProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    StickToBottomOptions {
  instance?: ReturnType<typeof useStickToBottom>;
  children: ((context: StickToBottomContext) => ReactNode) | ReactNode;
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

export function StickToBottom({
  instance,
  children,
  resize,
  initial,
  mass,
  damping,
  stiffness,
  targetScrollTop,
  ...props
}: StickToBottomProps) {
  const defaultInstance = useStickToBottom({
    mass,
    damping,
    stiffness,
    resize,
    initial,
    targetScrollTop,
  });
  const { scrollRef, contentRef, scrollToBottom, stopScroll, isAtBottom, isNearBottom, escapedFromLock } =
    instance ?? defaultInstance;

  const context = useMemo<StickToBottomContext>(
    () => ({
      scrollToBottom,
      stopScroll,
      scrollRef,
      isAtBottom,
      isNearBottom,
      escapedFromLock,
      contentRef,
    }),
    [scrollToBottom, isAtBottom, contentRef, escapedFromLock]
  );

  useIsomorphicLayoutEffect(() => {
    if (!scrollRef.current) {
      return;
    }

    if (getComputedStyle(scrollRef.current).overflow === 'visible') {
      scrollRef.current.style.overflow = 'auto';
    }
  }, []);

  return (
    <StickToBottomContext.Provider value={context}>
      <div {...props}>{typeof children === 'function' ? children(context) : children}</div>
    </StickToBottomContext.Provider>
  );
}

export namespace StickToBottom {
  export interface ContentProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
    children: ((context: StickToBottomContext) => ReactNode) | ReactNode;
  }

  export function Content({ children, ...props }: ContentProps) {
    const context = useStickToBottomContext();

    return (
      <div
        ref={context.scrollRef}
        style={{
          height: '100%',
          width: '100%',
        }}
      >
        <div {...props} ref={context.contentRef}>
          {typeof children === 'function' ? children(context) : children}
        </div>
      </div>
    );
  }
}

/**
 * Use this hook inside a <StickToBottom> component to gain access to whether the component is at the bottom of the scrollable area.
 */
export function useStickToBottomContext() {
  const context = useContext(StickToBottomContext);
  if (!context) {
    throw new Error('use-stick-to-bottom component context must be used within a StickToBottom component');
  }

  return context;
}
