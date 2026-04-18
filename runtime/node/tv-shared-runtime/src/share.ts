export interface ShareContent {
  text?: string;
  title?: string;
  url?: string;
}

export interface ClipboardTarget {
  clipboard?: {
    writeText: (text: string) => Promise<void>;
  };
}

export interface ShareTarget extends ClipboardTarget {
  share?: (data: ShareContent) => Promise<void>;
}

export type ShareResult = 'copied' | 'shared' | 'unavailable';

const resolveNavigator = <T extends ClipboardTarget | ShareTarget>(
  providedNavigator?: T | null,
) => {
  if(providedNavigator !== undefined) {
    return providedNavigator;
  }

  if(typeof navigator === 'undefined') {
    return null;
  }

  return navigator as unknown as T;
};

export const formatShareContent = ({ text, title, url }: ShareContent) => (
  [title, text, url].filter(Boolean).join('\n\n')
);

export const writeClipboardText = async (
  text: string,
  options: {
    navigator?: ClipboardTarget | null;
  } = {},
) => {
  const activeNavigator = resolveNavigator(options.navigator);

  if(!activeNavigator?.clipboard?.writeText) {
    return false;
  }

  try {
    await activeNavigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

export const shareContent = async (
  content: ShareContent,
  options: {
    clipboardText?: string;
    fallbackToClipboard?: boolean;
    navigator?: ShareTarget | null;
  } = {},
): Promise<ShareResult> => {
  const activeNavigator = resolveNavigator(options.navigator);

  if(activeNavigator?.share) {
    try {
      await activeNavigator.share(content);
      return 'shared';
    } catch {
      // Fall through to clipboard when requested.
    }
  }

  if(options.fallbackToClipboard !== false) {
    const didCopy = await writeClipboardText(
      options.clipboardText ?? formatShareContent(content),
      { navigator: activeNavigator },
    );

    if(didCopy) {
      return 'copied';
    }
  }

  return 'unavailable';
};
