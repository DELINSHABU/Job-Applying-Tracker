import { Button } from './ui/button';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-24 right-6 w-14 h-14 rounded-full shadow-lg shadow-primary/40 transition-transform active:scale-90 hover:scale-105 z-40"
      aria-label="Add job application"
    >
      <span className="material-icons-round text-3xl">add</span>
    </Button>
  );
}
