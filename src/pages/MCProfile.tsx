import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAcapellas } from '@/hooks/useAcapellas';
import { BottomNav } from '@/components/BottomNav';

const OPTIONS = ['ZN', 'ZS', 'Automotivo', 'BH', 'Capixaba', 'Nenhum desses'] as const;
type Vote = { choice: string; suggestion: string | null };

export default function MCProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { acapellas, isLoading } = useAcapellas();
  const mc = useMemo(() => acapellas.find(item => item.id === id), [acapellas, id]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [choice, setChoice] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingVotes, setLoadingVotes] = useState(true);

  const loadVotes = async () => {
    if (!id) return;
    setLoadingVotes(true);
    const { data } = await (supabase as any).from('acapella_votes').select('choice, suggestion').eq('acapella_id', id);
    setVotes((data || []) as Vote[]);
    setLoadingVotes(false);
  };

  useEffect(() => { loadVotes(); }, [id]);

  const totals = useMemo(() => {
    const counts: Record<string, number> = {};
    OPTIONS.forEach(option => { counts[option] = 0; });
    votes.forEach(vote => { counts[vote.choice] = (counts[vote.choice] || 0) + 1; });
    return counts;
  }, [votes]);

  const totalVotes = votes.length;
  const leader = OPTIONS.reduce((best, option) => totals[option] > totals[best] ? option : best, OPTIONS[0]);
  const suggestions = votes.filter(vote => vote.choice === 'Nenhum desses' && vote.suggestion?.trim()).map(vote => vote.suggestion!.trim());

  const submitVote = async () => {
    if (!id || !choice || saving || (choice === 'Nenhum desses' && !suggestion.trim())) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await (supabase as any).from('acapella_votes').insert({ acapella_id: id, choice, suggestion: suggestion.trim() || null, user_id: user?.id ?? null });
    if (!error) {
      setChoice('');
      setSuggestion('');
      await loadVotes();
    }
    setSaving(false);
  };

  if (isLoading || loadingVotes) return <div className="min-h-screen bg-[#111111] text-foreground flex items-center justify-center">Carregando...</div>;
  if (!mc) return <div className="min-h-screen bg-[#111111] text-foreground flex flex-col items-center justify-center gap-4"><p>MC não encontrado.</p><button onClick={() => navigate('/mcs')} className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-black">Voltar</button></div>;

  return (
    <div className="min-h-screen bg-[#111111] text-foreground pb-24">
      <div className="mx-auto max-w-2xl px-5 pt-5">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground"><ArrowLeft className="size-4" />Voltar</button>

        <section className="rounded-[28px] border border-white/[0.07] bg-[#151515] p-6 text-center">
          <img src={mc.image_url || '/placeholder.svg'} alt={mc.artist_name} className="mx-auto size-32 rounded-full border border-white/10 object-cover" />
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">Acapella</p>
          <h1 className="mt-1 text-2xl font-black">{mc.artist_name}</h1>
          <a href={mc.download_url} target="_blank" rel="noreferrer" className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-black">Ouvir / baixar<ArrowRight className="size-4" /></a>
        </section>

        <section className="mt-4 rounded-[28px] border border-white/[0.07] bg-[#151515] p-5">
          <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Resultado da votação</p><h2 className="mt-1 text-lg font-bold">Com que a voz combina?</h2></div><button onClick={loadVotes} className="rounded-xl p-2 text-foreground/45 hover:bg-white/5" aria-label="Atualizar votação"><RefreshCw className="size-4" /></button></div>
          <div className="mt-5 space-y-3">
            {OPTIONS.map(option => {
              const count = totals[option] || 0;
              const percentage = totalVotes ? Math.round(count / totalVotes * 100) : 0;
              return <div key={option}><div className="mb-1.5 flex justify-between text-xs"><span className={option === leader && totalVotes ? 'font-bold' : 'text-foreground/70'}>{option}</span><span className="text-foreground/45">{count} · {percentage}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-foreground transition-all" style={{ width: percentage + '%' }} /></div></div>;
            })}
          </div>
          <p className="mt-5 text-xs text-foreground/40">{totalVotes} {totalVotes === 1 ? 'resposta' : 'respostas'} no total{totalVotes ? ` · Mais votado: ${leader}` : ''}</p>
        </section>

        <section className="mt-4 rounded-[28px] border border-white/[0.07] bg-[#151515] p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Sua resposta</p>
          <h2 className="mt-1 text-lg font-bold">Com o que você acha que combina?</h2>
          <div className="mt-4 grid grid-cols-2 gap-2">{OPTIONS.map(option => <button key={option} type="button" onClick={() => setChoice(option)} className={`rounded-xl border px-3 py-3 text-sm font-semibold transition-colors ${choice === option ? 'border-white bg-white text-black' : 'border-white/10 bg-white/[0.03] text-white/75 hover:bg-white/[0.07]'}`}>{option}</button>)}</div>
          {choice === 'Nenhum desses' && <input value={suggestion} onChange={e => setSuggestion(e.target.value)} placeholder="Fale qual estilo combina..." maxLength={120} className="mt-3 h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm outline-none placeholder:text-white/30" />}
          <button onClick={submitVote} disabled={!choice || saving || (choice === 'Nenhum desses' && !suggestion.trim())} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-bold text-black disabled:opacity-30">{saving ? 'Enviando...' : 'Enviar resposta'}{!saving && <ArrowRight className="size-4" />}</button>
        </section>

        {suggestions.length > 0 && <section className="mt-4 rounded-[28px] border border-white/[0.07] bg-[#151515] p-5"><p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Outras respostas</p><div className="mt-3 space-y-2">{suggestions.map((item, index) => <div key={index} className="rounded-2xl border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-sm">{item}</div>)}</div></section>}
      </div>
      <BottomNav />
    </div>
  );
}