import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DownloadConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  authorName: string;
  isAnonymous?: boolean;
}

export function DownloadConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  authorName,
  isAnonymous 
}: DownloadConfirmDialogProps) {
  const displayName = isAnonymous ? 'Anônimo' : authorName;
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">
            Quer mesmo baixar o pack?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Quer mesmo baixar o pack do <span className="font-bold text-foreground">{displayName}</span>?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-secondary text-secondary-foreground border-0 hover:bg-secondary/80">
            Não
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Sim
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
