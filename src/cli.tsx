import { render } from 'ink';
import { FileSelectorApp } from './components/FileSelectorApp.js';

async function main(): Promise<void> {
  return new Promise((resolve) => {
    const { waitUntilExit } = render(
      <FileSelectorApp onExit={() => resolve()} />,
      { exitOnCtrlC: true }
    );

    waitUntilExit().then(resolve);
  });
}

export { main };
