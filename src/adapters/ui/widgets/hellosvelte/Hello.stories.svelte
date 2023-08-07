<script lang="ts">
  import { Meta, Story, Template } from '@storybook/addon-svelte-csf';

  import Hello from './Hello.svelte';
</script>

<Meta title="Hello" component={Hello} />

<Template let:args>
  <Hello {...args} />
</Template>

<Story name="Hello World" args={{ name: 'world' }} />

<Story name="Hello Svelte" args={{ name: 'Svelte' }} />
