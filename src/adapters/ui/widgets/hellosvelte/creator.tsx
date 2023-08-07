import Hello from '@adapters/ui/widgets/hellosvelte/Hello.svelte';
import type { HelloSvelteOptions } from '@adapters/ui/widgets/hellosvelte/shared';
import { preventZoomKeyEvent } from '@adapters/ui/widgets/utils';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function HelloSvelteWidgetCreator(options: HelloSvelteOptions) {
  return new Hello({
    target: document.getElementById('root')!,
    props: {
      name: 'chicken nugget',
    },
  });
}

preventZoomKeyEvent();
