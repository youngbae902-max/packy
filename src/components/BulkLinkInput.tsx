import { useState } from 'react';
import { Link as LinkIcon, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface ParsedLink {
  url: string;
  isValid: boolean;
}

interface BulkLinkInputProps {
  onLinksConfirmed: (links: string[]) => void;
  maxLinks?: number;
}

export function BulkLinkInput({ onLinksConfirmed, maxLinks = 10 }: BulkLinkInputProps) {
  const [inputText, setInputText] = useState('');
  const [parsedLinks, setParsedLinks] = useState<ParsedLink[]>([]);
  const [isParsing, setIsParsing] = useState(false);

  const parseLinks = () => {
    setIsParsing(true);
    
    // Parse links from text - each https:// starts a new link
    const text = inputText.trim();
    if (!text) {
      toast.error('Cole os links primeiro');
      setIsParsing(false);
      return;
    }

    // Split by https:// and filter empty strings
    const parts = text.split(/(?=https?:\/\/)/i);
    const links: ParsedLink[] = parts
      .map(part => part.trim())
      .filter(part => part.length > 0)
      .map(url => {
        // Clean up the URL - remove trailing whitespace and newlines
        const cleanUrl = url.split(/\s+/)[0].trim();
        const isValid = /^https?:\/\/.+/i.test(cleanUrl);
        return { url: cleanUrl, isValid };
      })
      .slice(0, maxLinks);

    if (links.length === 0) {
      toast.error('Nenhum link válido encontrado');
      setIsParsing(false);
      return;
    }

    setParsedLinks(links);
    setIsParsing(false);
    toast.success(`${links.length} link(s) encontrado(s)`);
  };

  const removeLink = (index: number) => {
    setParsedLinks(prev => prev.filter((_, i) => i !== index));
  };

  const confirmLinks = () => {
    const validLinks = parsedLinks.filter(l => l.isValid).map(l => l.url);
    if (validLinks.length === 0) {
      toast.error('Nenhum link válido para adicionar');
      return;
    }
    onLinksConfirmed(validLinks);
    setInputText('');
    setParsedLinks([]);
  };

  const resetAll = () => {
    setInputText('');
    setParsedLinks([]);
  };

  return (
    <div className="space-y-4">
      {parsedLinks.length === 0 ? (
        <>
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Cole vários links de uma vez, um por linha ou separados por espaço.
              Cada link deve começar com <code className="text-primary">https://</code>
            </p>
            <Textarea
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={`https://link1.com\nhttps://link2.com\nhttps://link3.com`}
              rows={6}
              className="font-mono text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={parseLinks} disabled={isParsing || !inputText.trim()} className="flex-1">
              {isParsing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <LinkIcon className="w-4 h-4 mr-2" />
              )}
              Processar Links
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {parsedLinks.map((link, index) => (
              <div 
                key={index} 
                className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                  link.isValid 
                    ? 'bg-success/10 border border-success/20' 
                    : 'bg-destructive/10 border border-destructive/20'
                }`}
              >
                {link.isValid ? (
                  <Check className="w-4 h-4 text-success flex-shrink-0" />
                ) : (
                  <X className="w-4 h-4 text-destructive flex-shrink-0" />
                )}
                <span className="flex-1 truncate font-mono text-xs">{link.url}</span>
                <button 
                  onClick={() => removeLink(index)}
                  className="p-1 hover:bg-destructive/20 rounded transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {parsedLinks.filter(l => l.isValid).length} de {parsedLinks.length} links válidos
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetAll} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={confirmLinks} 
              disabled={parsedLinks.filter(l => l.isValid).length === 0}
              className="flex-1"
            >
              <Check className="w-4 h-4 mr-2" />
              Confirmar ({parsedLinks.filter(l => l.isValid).length})
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
