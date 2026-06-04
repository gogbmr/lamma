// app/admin/quizzes/[groupId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2, FileQuestion, HelpCircle, Loader2, Layers, Edit2, Save, X, Plus } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface QuizDetail {
  id: string;
  name: string;
  description: string;
  quizzes: {
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
  }[];
}

export default function GroupDetailPage() {
  const { groupId } = useParams();
  const router = useRouter();
  const [data, setData] = useState<QuizDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // INLINE QUIZ EDIT STATES
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editOptions, setEditOptions] = useState<string[]>([]);
  const [editCorrectAnswer, setEditCorrectAnswer] = useState("");

  const fetchGroupData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/quiz-group/${groupId}`);
      if (res.ok) setData(await res.json());
      else router.push("/admin/quizzes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGroupData(); }, [groupId]);

  const handleStartQuizEdit = (quiz: any) => {
    setEditingQuizId(quiz.id);
    setEditQuestion(quiz.question);
    setEditOptions([...quiz.options]);
    setEditCorrectAnswer(quiz.correctAnswer);
  };

  const handleCancelQuizEdit = () => {
    setEditingQuizId(null);
  };

  const handleUpdateQuizOptionsText = (index: number, val: string) => {
    const nextOpts = [...editOptions];
    nextOpts[index] = val;
    setEditOptions(nextOpts);
  };

  const handleAddEditOptionRow = () => {
    setEditOptions([...editOptions, ""]);
  };

  const handleRemoveEditOptionRow = (index: number) => {
    if (editOptions.length <= 2) {
      toast.error("MCQ questions require at least two distinct choices.");
      return;
    }
    const filtered = editOptions.filter((_, idx) => idx !== index);
    setEditOptions(filtered);
    if (editCorrectAnswer === editOptions[index]) setEditCorrectAnswer("");
  };

  const handleSaveQuizUpdate = async (quizId: string) => {
    if (!editQuestion.trim() || editOptions.some(o => !o.trim()) || !editCorrectAnswer) {
      toast.error("Complete all question form boundaries safely.");
      return;
    }

    try {
      const res = await fetch(`/api/admin/quiz/${quizId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        // Passes the current groupId inside array to keep structural connection preserved
        body: JSON.stringify({ question: editQuestion, options: editOptions, correctAnswer: editCorrectAnswer, groupIds: [groupId] })
      });

      if (res.ok) {
        toast.success("Question modifications saved.");
        handleCancelQuizEdit();
        fetchGroupData();
      }
    } catch {
      toast.error("Failed to submit update payload.");
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm("Permanently delete this quiz from the entire system?")) return;
    const res = await fetch(`/api/admin/quiz/${quizId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Question permanently erased.");
      if (editingQuizId === quizId) handleCancelQuizEdit();
      fetchGroupData();
    }
  };

  if (loading) return <div className="h-full w-full flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <main className="p-4 md:p-6 space-y-6 w-full max-w-5xl">
      <Link href="/admin/quizzes" className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to Groups
      </Link>

      <div className="bg-primary text-primary-foreground p-5 rounded-2xl shadow-md">
        <div className="flex items-center gap-3 mb-1">
            <Layers className="h-5 w-5 text-primary-foreground/80" />
            <h1 className="text-xl font-black tracking-tight">{data?.name}</h1>
        </div>
        <p className="text-xs opacity-90 max-w-2xl">{data?.description || "No cluster summary notes cataloged."}</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <FileQuestion className="h-4 w-4" /> Curated Clustered Quizzes ({data?.quizzes.length})
        </h3>

        {data?.quizzes.length === 0 ? (
          <div className="bg-card border border-border border-dashed p-12 text-center rounded-2xl">
            <HelpCircle className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-xs font-bold text-muted-foreground">No quizzes mapped to this group cluster index yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {data?.quizzes.map((quiz) => {
              const isEditingInline = editingQuizId === quiz.id;

              return (
                <div key={quiz.id} className={`bg-card border p-5 rounded-2xl shadow-sm transition-all ${isEditingInline ? "border-primary ring-1 ring-primary/20 bg-muted/10" : "border-border hover:border-primary/20"}`}>
                  
                  {isEditingInline ? (
                    /* INLINE INTERACTIVE EDIT DECK ACTIVATED */
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-primary">Editing Active Question Row</span>
                        <button type="button" onClick={handleCancelQuizEdit} className="p-1 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-muted-foreground">Question Text</label>
                        <input type="text" value={editQuestion} onChange={(e) => setEditQuestion(e.target.value)} className="w-full text-xs h-9 bg-background border border-border rounded-xl px-3 outline-none text-foreground font-semibold" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[9px] font-black uppercase text-muted-foreground">Choices Rows Array</label>
                          <button type="button" onClick={handleAddEditOptionRow} className="text-[9px] font-black text-primary hover:underline">+ Add Choice</button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {editOptions.map((opt, oIdx) => (
                            <div key={oIdx} className="flex items-center gap-2 bg-background border border-border rounded-xl px-2 h-9">
                              <span className="text-[10px] font-black text-muted-foreground">{String.fromCharCode(65 + oIdx)}.</span>
                              <input type="text" value={opt} onChange={(e) => handleUpdateQuizOptionsText(oIdx, e.target.value)} className="flex-1 bg-transparent text-xs outline-none text-foreground font-medium h-full" />
                              <button type="button" onClick={() => handleRemoveEditOptionRow(oIdx)} className="text-muted-foreground hover:text-destructive p-1"><X className="h-3 w-3" /></button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 items-end">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-muted-foreground">Correct Answer Choice Match</label>
                          <select value={editCorrectAnswer} onChange={(e) => setEditCorrectAnswer(e.target.value)} className="w-full text-xs h-9 bg-background border border-border rounded-xl px-2 outline-none font-bold text-foreground">
                            <option value="">-- Choose target option --</option>
                            {editOptions.filter(o => o.trim()).map((o, idx) => (
                              <option key={idx} value={o}>{o}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={handleCancelQuizEdit} className="flex-1 h-9 bg-background border border-border text-foreground rounded-xl text-xs font-black uppercase">Cancel</button>
                          <button type="button" onClick={() => handleSaveQuizUpdate(quiz.id)} className="flex-1 h-9 bg-primary text-primary-foreground rounded-xl text-xs font-black uppercase flex items-center justify-center gap-1.5"><Save className="h-3.5 w-3.5" /> Save Changes</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* REGULAR MONITOR PRESENTATION MODE CARD */
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-3 flex-1">
                        <h4 className="text-sm font-black text-foreground leading-snug">{quiz.question}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {quiz.options.map((opt, i) => (
                            <div key={i} className={`p-2.5 rounded-xl border text-[11px] font-bold ${opt === quiz.correctAnswer ? 'bg-success/10 border-success text-success' : 'bg-muted/20 border-border text-muted-foreground'}`}>
                              {String.fromCharCode(65 + i)}. {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center gap-1 shrink-0 select-none">
                        <button onClick={() => handleStartQuizEdit(quiz)} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="Edit Question Parameters">
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDeleteQuiz(quiz.id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all" title="Purge Question">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}