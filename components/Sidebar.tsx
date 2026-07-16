"use client";

import { useState } from "react";
import type { Folder, Profile } from "@/lib/supabaseClient";
import { supabase } from "@/lib/supabaseClient";

interface SidebarProps {
  folders: Folder[];
  selectedFolderId: string | null;
  onSelect: (id: string) => void;
  onCreateFolder: (name: string) => Promise<void>;
  onDeleteFolder: (id: string) => Promise<void>;
  profile: Profile | null;
}

const COLORS = ["#2383e2", "#e2683c", "#0f9d58", "#a855f7", "#e2b93c"];

export default function Sidebar({
  folders,
  selectedFolderId,
  onSelect,
  onCreateFolder,
  onDeleteFolder,
  profile,
}: SidebarProps) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    await onCreateFolder(newName.trim());
    setNewName("");
    setCreating(false);
  }

  return (
    <aside className="w-64 shrink-0 border-r border-line h-screen flex flex-col bg-white">
      <div className="p-4 border-b border-line">
        <p className="font-semibold text-sm">Team Tasks</p>
        <p className="text-xs text-gray-500 truncate">{profile?.full_name || profile?.email}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Dossiers</span>
          <button
            onClick={() => setCreating((c) => !c)}
            className="text-gray-400 hover:text-accent text-lg leading-none"
            title="Nouveau dossier"
          >
            +
          </button>
        </div>

        {creating && (
          <form onSubmit={handleCreate} className="px-2 py-1">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nom du dossier"
              className="w-full text-sm border border-line rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </form>
        )}

        <ul className="mt-1 space-y-0.5">
          {folders.map((folder) => (
            <li key={folder.id} className="group flex items-center">
              <button
                onClick={() => onSelect(folder.id)}
                className={`flex-1 flex items-center gap-2 text-left px-2 py-1.5 rounded-md text-sm ${
                  selectedFolderId === folder.id ? "bg-gray-100 font-medium" : "hover:bg-gray-50"
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: folder.color || COLORS[0] }}
                />
                <span className="truncate">{folder.name}</span>
              </button>
              <button
                onClick={() => {
                  if (confirm(`Supprimer le dossier "${folder.name}" et toutes ses tâches ?`)) {
                    onDeleteFolder(folder.id);
                  }
                }}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 px-2 text-xs"
                title="Supprimer"
              >
                ✕
              </button>
            </li>
          ))}
          {folders.length === 0 && (
            <li className="text-xs text-gray-400 px-2 py-2">Aucun dossier pour l'instant.</li>
          )}
        </ul>
      </div>

      <div className="p-2 border-t border-line">
        <button
          onClick={() => supabase.auth.signOut()}
          className="w-full text-left text-sm text-gray-500 hover:text-red-500 px-2 py-1.5 rounded-md hover:bg-gray-50"
        >
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
