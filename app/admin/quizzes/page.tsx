// app/admin/quizzes/page.tsx
"use client";

import { useEffect, useState } from "react";
import { 
  Plus, 
  Trash2, 
  Layers, 
  FileQuestion, 
  Loader2, 
  Save, 
  ChevronRight, 
  ExternalLink, 
  Edit2, 
  X 
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface QuizGroup {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  _count?: { quizzes: number };
}

export default function QuizManagerPage() {
  const [groups, setGroups] = useState<QuizGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Core Quiz Node Creation States
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]); 
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  // Core Quiz Group States (Shared between Add / Edit modes)
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);

  const reloadDataPipeline = async () => {
    try {
      setIsLoading(true);
      const resGroups = await fetch("/api/admin/quiz-groups");
      if (resGroups.ok) setGroups(await resGroups.json());
    } catch (err) {
      toast.error("Failed to synchronize cluster telemetry data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { reloadDataPipeline(); }, []);

  const handleAddOptionRow = () => { setOptions([...options, ""]); };
  const handleRemoveOptionRow = (index: number) => {
    if (options.length <= 2) {
      toast.error("MCQ evaluations require at least two options.");
      return;
    }
    const filtered = options.filter((_, idx) => idx !== index);
    setOptions(filtered);
    if (correctAnswer === options[index]) setCorrectAnswer("");
  };

  const handleOptionTextUpdate = (index: number, text: string) => {
    const nextOptions = [...options];
    nextOptions[index] = text;
    setOptions(nextOptions);
  };

  const toggleGroupSelection = (id: string) => {
    setSelectedGroups(prev => prev.includes(id) ? prev.filter(gId => gId !== id) : [...prev, id]);
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || options.some(o => !o.trim()) || !correctAnswer) {
      toast.error("Please fill all required quiz fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, options, correctAnswer, groupIds: selectedGroups })
      });

      if (res.ok) {
        toast.success("Quiz evaluation node created successfully!");
        setQuestion(""); setOptions(["", ""]); setCorrectAnswer(""); setSelectedGroups([]);
        reloadDataPipeline();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handles both Create and Update execution logic routes safely
  const handleSaveGroupCluster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    setIsSubmitting(true);
    const isEditing = !!editingGroupId;
    const targetUrl = "/api/admin/quiz-group";
    const targetMethod = isEditing ? "PUT" : "POST";

    try {
      const bodydata = isEditing ? JSON.stringify({ id : editingGroupId, name: groupName, description: groupDesc }) : JSON.stringify({ name: groupName, description: groupDesc });
      const res = await fetch(targetUrl, {
        method: targetMethod,
        headers: { "Content-Type": "application/json" },
        body: bodydata
      });
      if (res.ok) {
        toast.success(isEditing ? "Quiz group updated successfully." : "Quiz group cluster initialized.");
        handleCancelGroupEdit();
        reloadDataPipeline();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTriggerGroupEdit = (group: QuizGroup) => {
    setEditingGroupId(group.id);
    setGroupName(group.name);
    setGroupDesc(group.description || "");
  };

  const handleCancelGroupEdit = () => {
    setEditingGroupId(null);
    setGroupName("");
    setGroupDesc("");
  };

  const handleDeleteGroup = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm("Are you sure you want to delete this group? Linked quizzes will remain safe in the index.")) return;
    const res = await fetch(`/api/admin/quiz-group/`, 
      { method: "DELETE",
        body: JSON.stringify({ id }),
       });
    if (res.ok) {
      toast.success("Quiz category group successfully purged.");
      if (editingGroupId === id) handleCancelGroupEdit();
      reloadDataPipeline();
    }
  };

  if (isLoading) {
    return <div className="h-full w-full flex items-center justify-center"><Loader2 className="h-6 w-6 text-primary animate-spin" /></div>;
  }

  return (
    <main className="p-4 md:p-6 space-y-8 w-full max-w-7xl">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">Content Evaluation Terminal</h1>
        <p className="text-xs text-muted-foreground font-medium mt-0.5">Initialize quiz nodes with variable choice arrays, map data records, and track cluster boundaries.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* PANEL A: CORE QUIZ NODE INITIALIZATION FORM */}
        <form onSubmit={handleCreateQuiz} className="lg:col-span-7 bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <FileQuestion className="h-4 w-4 text-primary" /> Add Evaluation Node
          </h3>
          
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-muted-foreground">Question Configuration Text</label>
            <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="e.g., Which option premium greek metric tracks sensitivity changes to delta shifts?" className="w-full text-xs h-10 bg-background border border-border rounded-xl px-3 outline-none focus:ring-1 focus:ring-primary font-semibold text-foreground" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase text-muted-foreground">Dynamic Options Array</label>
              <button type="button" onClick={handleAddOptionRow} className="text-[10px] font-black text-primary hover:underline flex items-center gap-0.5 cursor-pointer">
                + Add Dynamic Row
              </button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input type="text" value={option} onChange={(e) => handleOptionTextUpdate(index, e.target.value)} placeholder={`Choice Option ${index + 1}`} className="flex-1 text-xs h-9 bg-background border border-border rounded-xl px-3 outline-none focus:ring-1 focus:ring-primary font-medium text-foreground" />
                  <button type="button" onClick={() => handleRemoveOptionRow(index)} className="p-2 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-muted-foreground">Correct Answer Target</label>
              <select value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} className="w-full text-xs h-10 bg-background border border-border rounded-xl px-2.5 outline-none focus:ring-1 focus:ring-primary font-bold text-foreground">
                <option value="">-- Choose target match --</option>
                {options.filter(o => o.trim()).map((option, idx) => (
                  <option key={idx} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-muted-foreground block">Assign to active Quiz Groups</label>
              <div className="border border-border bg-background/40 rounded-xl px-3 py-1.5 max-h-[40px] overflow-y-auto space-y-1">
                {groups.map(g => (
                  <label key={g.id} className="flex items-center gap-2 text-[11px] font-bold text-foreground cursor-pointer select-none">
                    <input type="checkbox" checked={selectedGroups.includes(g.id)} onChange={() => toggleGroupSelection(g.id)} className="rounded border-border text-primary focus:ring-primary h-3 w-3" />
                    <span className="truncate">{g.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full h-10 bg-primary text-primary-foreground text-xs font-black tracking-wider uppercase rounded-xl shadow-sm cursor-pointer hover:opacity-95 flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Deploy Evaluation Node
          </button>
        </form>

        {/* PANEL B: DYNAMIC CREATE / UPDATE QUIZ GROUP CLUSTER FORM */}
        <form onSubmit={handleSaveGroupCluster} className="lg:col-span-5 bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4 h-full">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-primary" /> 
              {editingGroupId ? "Modify Group Cluster" : "Initialize Group Cluster"}
            </h3>
            {editingGroupId && (
              <button type="button" onClick={handleCancelGroupEdit} className="text-muted-foreground hover:text-foreground cursor-pointer"><X className="h-3.5 w-3.5" /></button>
            )}
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-muted-foreground">Cluster Folder Name</label>
            <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="e.g., Derivatives Foundations 201" className="w-full text-xs h-10 bg-background border border-border rounded-xl px-3 outline-none focus:ring-1 focus:ring-primary font-semibold text-foreground" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-muted-foreground">Description Summary</label>
            <textarea value={groupDesc} onChange={(e) => setGroupDesc(e.target.value)} placeholder="Provide strategic educational roadmap boundary metrics..." className="w-full text-xs p-3 bg-background border border-border rounded-xl h-[76px] outline-none focus:ring-1 focus:ring-primary font-medium text-foreground resize-none" />
          </div>

          <div className="flex gap-2">
            {editingGroupId && (
              <button type="button" onClick={handleCancelGroupEdit} className="flex-1 h-10 bg-muted border border-border text-foreground text-xs font-black tracking-wider uppercase rounded-xl cursor-pointer">Cancel</button>
            )}
            <button type="submit" disabled={isSubmitting || !groupName.trim()} className="flex-1 h-10 bg-primary text-primary-foreground text-xs font-black tracking-wider uppercase rounded-xl shadow-sm cursor-pointer hover:opacity-95 flex items-center justify-center gap-2">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {editingGroupId ? "Update Cluster" : "Create Cluster"}
            </button>
          </div>
        </form>

      </div>

      {/* 3. SCALABLE QUIZ GROUPS INDEX TABLE */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-primary" /> System Quiz Categories Index
          </h3>
          <span className="text-[10px] font-extrabold bg-background border px-2 py-0.5 rounded-full text-foreground">{groups.length} Folders</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border bg-muted/5">
                <th className="p-4 pl-6">Group Category Cluster</th>
                <th className="p-4 text-center">Nodes Bounds</th>
                <th className="p-4">Deployment Date</th>
                <th className="p-4 pr-6 text-right">Actions Panel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">
              {groups.map((group) => (
                <tr key={group.id} className="hover:bg-muted/10 transition-colors group">
                  <td className="p-4 pl-6 max-w-xs sm:max-w-md">
                    <Link href={`/admin/quizzes/${group.id}`} className="block">
                      <p className="font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                        {group.name} <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 text-primary transition-all ml-0.5" />
                      </p>
                      <p className="text-[11px] text-muted-foreground font-medium truncate mt-0.5">{group.description || "No structural summary records logged for this set."}</p>
                    </Link>
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-primary/5 text-primary text-[10px] font-black px-2.5 py-0.5 rounded border border-primary/10">{group._count?.quizzes || 0} MCQ Nodes</span>
                  </td>
                  <td className="p-4 text-muted-foreground font-medium">
                    {new Date(group.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" onClick={() => handleTriggerGroupEdit(group)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all cursor-pointer" title="Edit Group Parameters"><Edit2 className="h-3.5 w-3.5" /></button>
                      <Link href={`/admin/quizzes/${group.id}`} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="View Folder Content"><ChevronRight className="h-4 w-4" /></Link>
                      <button type="button" onClick={(e) => handleDeleteGroup(group.id, e)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all cursor-pointer" title="Delete Group Shell"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}