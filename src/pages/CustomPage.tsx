import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { useCustomPages } from '@/hooks/useCustomPages';

export default function CustomPage() {
  const { slug } = useParams();
  const { pages } = useCustomPages();
  const page = pages.find((item) => item.slug === slug);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <header className="flex items-center justify-between mb-6">
          <Link to="/" className="w-11 h-11 rounded-full bg-[hsl(0,0%,8%)] flex items-center justify-center"><ArrowLeft className="w-5 h-5" /></Link>
          <span className="text-sm text-muted-foreground">Aba</span>
          <div className="w-11" />
        </header>
        {!page ? (
          <p className="text-center text-muted-foreground py-16">Aba não encontrada</p>
        ) : (
          <main>
            {page.cover_url && <img src={page.cover_url} alt={page.title} className="w-full aspect-video object-cover rounded-2xl border border-border/40 mb-5" />}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[hsl(0,0%,7%)] flex items-center justify-center"><FileText className="w-5 h-5" /></div>
              <h1 className="text-3xl font-black leading-none">{page.title}</h1>
            </div>
            <div className="whitespace-pre-wrap text-foreground/90 leading-relaxed text-base">{page.content}</div>
          </main>
        )}
      </div>
      <BottomNav />
    </div>
  );
}