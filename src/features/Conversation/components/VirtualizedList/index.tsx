import isEqual from 'fast-deep-equal';
import React, { memo, useEffect, useRef, useState } from 'react';
import { Flexbox } from 'react-layout-kit';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { isMobileScreen } from '@/utils/screen';

import AutoScroll from '../AutoScroll';
import Item from '../ChatItem';
import InboxWelcome from '../InboxWelcome';

const WELCOME_ID = 'welcome';

const itemContent = (index: number, id: string) => {
  const isMobile = isMobileScreen();

  if (id === WELCOME_ID) return <InboxWelcome />;

  return index === 0 ? (
    <div style={{ height: 24 + (isMobile ? 0 : 64) }} />
  ) : (
    <Item id={id} index={index - 1} />
  );
};

const VirtualizedList = memo(() => {
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [atBottom, setAtBottom] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);

  const [id, chatLoading] = useChatStore((s) => [
    chatSelectors.currentChatKey(s),
    chatSelectors.currentChatLoadingState(s),
  ]);

  const data = useChatStore((s) => {
    const showInboxWelcome = chatSelectors.showInboxWelcome(s);
    const ids = showInboxWelcome ? [WELCOME_ID] : chatSelectors.currentChatIDsWithGuideMessage(s);
    return ['empty', ...ids];
  }, isEqual);

  const prevDataLengthRef = useRef(data.length);
  
  useEffect(() => {
    if (virtuosoRef.current && data.length > prevDataLengthRef.current) {
      virtuosoRef.current.scrollToIndex({ align: 'end', behavior: 'auto', index: 'LAST' });
    }
    prevDataLengthRef.current = data.length;
  }, [id, data.length]);

  // overscan should be 1.5 times the height of the window
  const overscan = typeof window !== 'undefined' ? window.innerHeight * 1.5 : 0;

  return chatLoading && data.length === 2 ? null : (
    <Flexbox height={'100%'}>
      <Virtuoso
        atBottomStateChange={setAtBottom}
        atBottomThreshold={50}
        computeItemKey={(_, item) => item}
        data={data}
        // followOutput={'auto'}
        // increaseViewportBy={overscan}
        initialTopMostItemIndex={data?.length - 1}
        isScrolling={setIsScrolling}
        itemContent={itemContent}
        overscan={{ main: overscan, reverse: overscan / 2 }}
        ref={virtuosoRef}
      />
      <AutoScroll
        atBottom={atBottom}
        isScrolling={isScrolling}
        onScrollToBottom={(type) => {
          const virtuoso = virtuosoRef.current;
          switch (type) {
            case 'auto': {
              virtuoso?.scrollToIndex({ align: 'end', behavior: 'auto', index: 'LAST' });
              break;
            }
            case 'click': {
              virtuoso?.scrollToIndex({ align: 'end', behavior: 'smooth', index: 'LAST' });
              break;
            }
          }
        }}
      />
    </Flexbox>
  );
});

export default VirtualizedList;
