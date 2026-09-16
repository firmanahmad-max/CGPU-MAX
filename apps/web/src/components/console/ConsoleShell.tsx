import { Rail } from './Rail';
import { TopBar } from './TopBar';

// The Console app frame: 64px icon rail + one-line top bar, content below.
export function ConsoleShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-[64px_1fr]">
      <Rail />
      <div className="flex min-h-screen min-w-0 flex-col">
        <TopBar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
