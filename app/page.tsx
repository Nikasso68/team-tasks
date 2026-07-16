"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Sidebar from "@/components/Sidebar";
import TaskBoard from "@/components/TaskBoard";
import { supabase } from "@/lib/supabaseClient";
import type { Folder, Profile, Task } from "@/lib/supabaseClient";

export default function HomePage() {
  const router = useRouter();
  const { session, loading } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/login");
    }
  }, [loading, session, router]);

  const loadAll = useCallback(async () => {
    if (!session) return;
    setDataLoading(true);

    const [{ data: profilesData }, { data: foldersData }] = await Promise.all([
      supabase.from("profiles").select("*").order("full_name"),
      supabase.from("folders").select("*").order("created_at"),
    ]);

    setProfiles(profilesData || []);
    setProfile((profilesData || []).find((p) => p.id === session.user.id) || null);
    setFolders(foldersData || []);

    if (foldersData && foldersData.length > 0) {
      setSelectedFolderId((current) => current || foldersData[0].id);
    }

    setDataLoading(false);
  }, [session]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (!selectedFolderId) {
      setTasks([]);
      return;
    }
    supabase
      .from("tasks")
      .select("*")
      .eq("folder_id", selectedFolderId)
      .order("created_at")
      .then(({ data }) => setTasks(data || []));
  }, [selectedFolderId]);

  async function refreshTasks() {
    if (!selectedFolderId) return;
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("folder_id", selectedFolderId)
      .order("created_at");
    setTasks(data || []);
  }

  async function handleCreateFolder(name: string) {
    const { data, error } = await supabase
      .from("folders")
      .insert({ name, created_by: session?.user.id })
      .select()
      .single();
    if (!error && data) {
      setFolders((prev) => [...prev, data]);
      setSelectedFolderId(data.id);
    }
  }

  async function handleDeleteFolder(id: string) {
    await supabase.from("folders").delete().eq("id", id);
    setFolders((prev) => prev.filter((f) => f.id !== id));
    if (selectedFolderId === id) {
      setSelectedFolderId(null);
    }
  }

  async function handleCreateTask(data: Partial<Task>) {
    if (!selectedFolderId) return;
    await supabase.from("tasks").insert({
      ...data,
      folder_id: selectedFolderId,
      created_by: session?.user.id,
    });
    await refreshTasks();
  }

  async function handleUpdateTask(id: string, data: Partial<Task>) {
    await supabase.from("tasks").update(data).eq("id", id);
    await refreshTasks();
  }

  async function handleDeleteTask(id: string) {
    await supabase.from("tasks").delete().eq("id", id);
    await refreshTasks();
  }

  if (loading || !session) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">Chargement...</div>;
  }

  const selectedFolder = folders.find((f) => f.id === selectedFolderId);

  return (
    <div className="flex">
      <Sidebar
        folders={folders}
        selectedFolderId={selectedFolderId}
        onSelect={setSelectedFolderId}
        onCreateFolder={handleCreateFolder}
        onDeleteFolder={handleDeleteFolder}
        profile={profile}
      />
      {dataLoading ? (
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">Chargement...</div>
      ) : selectedFolder ? (
        <TaskBoard
          folderName={selectedFolder.name}
          tasks={tasks}
          profiles={profiles}
          onCreate={handleCreateTask}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
          Crée un premier dossier pour commencer.
        </div>
      )}
    </div>
  );
}
