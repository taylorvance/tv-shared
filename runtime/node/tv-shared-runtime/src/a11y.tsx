import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const visuallyHiddenStyle: CSSProperties = {
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: '1px',
};

export type AnnouncementPriority = 'assertive' | 'polite';

export interface LiveAnnouncerValue {
  announce: (message: string, priority?: AnnouncementPriority) => void;
}

export interface LiveAnnouncerProps {
  children?: ReactNode;
}

const LiveAnnouncerContext = createContext<LiveAnnouncerValue>({
  announce: () => {},
});

const resolveWindow = (providedWindow?: Window | null) => {
  if(providedWindow !== undefined) {
    return providedWindow;
  }

  if(typeof window === 'undefined') {
    return null;
  }

  return window;
};

const getInitialReducedMotion = (providedWindow?: Window | null) => {
  const activeWindow = resolveWindow(providedWindow);

  if(!activeWindow?.matchMedia) {
    return false;
  }

  return activeWindow.matchMedia(REDUCED_MOTION_QUERY).matches;
};

export const usePrefersReducedMotion = (options: {
  window?: Window | null;
} = {}) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => (
    getInitialReducedMotion(options.window)
  ));

  useEffect(() => {
    const activeWindow = resolveWindow(options.window);

    if(!activeWindow?.matchMedia) {
      return undefined;
    }

    const mediaQuery = activeWindow.matchMedia(REDUCED_MOTION_QUERY);
    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    handleChange();
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [options.window]);

  return prefersReducedMotion;
};

export function LiveAnnouncer({ children }: LiveAnnouncerProps) {
  const [politeAnnouncement, setPoliteAnnouncement] = useState({ id: 0, message: '' });
  const [assertiveAnnouncement, setAssertiveAnnouncement] = useState({ id: 0, message: '' });
  const announce = useCallback((message: string, priority: AnnouncementPriority = 'polite') => {
    if(priority === 'assertive') {
      setAssertiveAnnouncement((previousAnnouncement) => ({
        id: previousAnnouncement.id + 1,
        message,
      }));
      return;
    }

    setPoliteAnnouncement((previousAnnouncement) => ({
      id: previousAnnouncement.id + 1,
      message,
    }));
  }, []);
  const value = useMemo<LiveAnnouncerValue>(() => ({ announce }), [announce]);

  return (
    <LiveAnnouncerContext.Provider value={value}>
      {children}
      <div style={visuallyHiddenStyle}>
        <div aria-live="polite" key={`polite-${politeAnnouncement.id}`} role="status">
          {politeAnnouncement.message}
        </div>
        <div aria-live="assertive" key={`assertive-${assertiveAnnouncement.id}`} role="alert">
          {assertiveAnnouncement.message}
        </div>
      </div>
    </LiveAnnouncerContext.Provider>
  );
}

export const useLiveAnnouncer = () => useContext(LiveAnnouncerContext);
