"use client";

import { useState } from "react";
import type { Profile, Task, TaskStatus } from "@/lib/supabaseClient";
import TaskModal from "./TaskModal";

interface TaskBoardProps {
  folderName: string;
  tasks: Task[];
  profiles: Profile[];
  onCreate: (data: Partial<Task>) => Promise<void>;
  onUpdate: (id: string, data: Partial<Task>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: "todo", label: "À faire" },
  { key: "in_progress", label: "En cours" },
  { key: "done", label: "Terminé" },
];

const PRIORITY_LABEL: Record<string, string> = { low: "Basse", normal: "Normale", high: "Haute" };
const PRIORITY_COLOR: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  normal: "bg-blue-50 text-blue-600",
  high: "bg-red-50 text-red-600",
};

export default function TaskBoard({
  folderName,
  tasks,
  profiles,
  onCreate,
  onUpdate,
  onDelete,
}: TaskBoardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  function profileName(id: string | null) {
    if (!id) return null;
    const p = profiles.find((p) => p.id === id);
    return p?.full_name || p?.email || null;
  }

  async function handleSave(data: Partial<Task>) {
    if (editingTask) {
      await onUpdate(editingTask.id, data);
    } else {
      await onCreate(data);
    }
    setModalOpen(false);
    setEditingTask(null);
  }

  async function handleDelete(id: string) {
    await onDelete(id);
    setModalOpen(false);
    setEditingTask(null);
  }

  return (
    <div className="flex-1 h-screen overflow-y-auto">
      <div className="px-8 pt-8 pb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{folderName}</h1>
        <button
          onClick={() => {
            setEditingTask(null);
            setModalOpen(true);
          }}
          className="text-sm bg-accent text-white px-3 py-1.5 rounded-md hover:opacity-90"
        >
          + Nouvelle tâche
        </button>
      </div>

      <div className="px-8 pb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          return (
            <div
              key={col.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={async () => {
                if (draggedId) {
                  await onUpdate(draggedId, { status: col.key });
                  setDraggedId(null);
                }
              }}
              className="bg-gray-50 rounded-lg p-3 min-h-[200px]"
            >
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 px-1">
                {col.label} · {colTasks.length}
              </p>
              <div className="space-y-2">
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => setDraggedId(task.id)}
                    onClick={() => {
                      setEditingTask(task);
                      setModalOpen(true);
                    }}
                    className="bg-white border border-line rounded-md p-3 cursor-pointer hover:shadow-sm"
                  >
                    <p className="text-sm font-medium mb-1">{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-2">{task.description}</p>
                    )}
                    <div className="flex items-center flex-wrap gap-1.5">
                      <span className={`text-[11px] px-1.5 py-0.5 rounded ${PRIORITY_COLOR[task.priority]}`}>
                        {PRIORITY_LABEL[task.priority]}
                      </span>
                      {task.due_date && (
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                          {new Date(task.due_date).toLocaleDateString("fr-FR")}
                        </span>
                      )}
                      {profileName(task.assignee_id) && (
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-600">
                          {profileName(task.assignee_id)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {colTasks.length === 0 && (
                  <p className="text-xs text-gray-400 px-1">Aucune tâche.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <TaskModal
          task={editingTask}
          profiles={profiles}
          onClose={() => {
            setModalOpen(false);
            setEditingTask(null);
          }}
          onSave={handleSave}
          onDelete={editingTask ? handleDelete : undefined}
        />
      )}
    </div>
  );
}
