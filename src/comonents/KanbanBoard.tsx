import { useMemo, useState } from "react";
import PlusIcon from "../icons/PlusIcon";
import { Column, Id, Task } from "../Types";
import ColumnContainer from "./ColumnContainer";
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import TaskCard from "./TaskCard";

function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>([]);
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 3 },
    })
  );

  return (
    <div className="
      
      flex flex-col md:flex-row
      min-h-screen w-full
      overflow-x-auto
      p-4 md:px-10
    ">
      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragOver={onDragOver}>
        <div className="flex flex-col md:flex-row gap-4 w-full overflow-auto">
          <SortableContext items={columnsId}>
            {columns.map((col) => (
              <ColumnContainer
                column={col}
                key={col.id}
                deleteColumn={deleteColumn}
                updateColumn={updateColumn}
                createTask={createTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
                tasks={tasks.filter((task) => task.columnId === col.id)}
              />
            ))}
          </SortableContext>
          <button
            onClick={createNewColumn}
            className="
              h-[50px] w-full md:w-[350px]
              rounded-lg bg-[#0D1117]
              border-2 border-[#161C22]
              p-4 ring-rose-500 hover:ring-2
              flex items-center justify-center gap-2
            "
          >
            <PlusIcon /> Add Column
          </button>
        </div>

        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <ColumnContainer
                column={activeColumn}
                deleteColumn={deleteColumn}
                updateColumn={updateColumn}
                createTask={createTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
                tasks={tasks.filter((task) => task.columnId === activeColumn.id)}
              />
            )}
            {activeTask && (
              <TaskCard task={activeTask} deleteTask={deleteTask} updateTask={updateTask} />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );

  function createTask(columnId: Id) {
    const newTask: Task = {
      id: generateId(),
      columnId,
      content: `Task ${tasks.length + 1}`,
    };
    setTasks([...tasks, newTask]);
  }

  function deleteTask(id: Id) {
    setTasks(tasks.filter((task) => task.id !== id));
  }

  function updateTask(id: Id, content: string) {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, content } : task)));
  }

  function createNewColumn() {
    setColumns([...columns, { id: generateId(), title: `Column ${columns.length + 1}` }]);
  }

  function deleteColumn(id: Id) {
    setColumns(columns.filter((col) => col.id !== id));
    setTasks(tasks.filter((task) => task.columnId !== id));
  }

  function updateColumn(id: Id, title: string) {
    setColumns(columns.map((col) => (col.id === id ? { ...col, title } : col)));
  }

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "Column") setActiveColumn(event.active.data.current.column);
    if (event.active.data.current?.type === "Task") setActiveTask(event.active.data.current.task);
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex((col) => col.id === activeId);
      const overColumnIndex = columns.findIndex((col) => col.id === overId);
      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";

    if (isActiveATask && isOverATask) {
      setTasks((prevTasks) => {
        const activeIndex = prevTasks.findIndex((t) => t.id === activeId);
        const overIndex = prevTasks.findIndex((t) => t.id === overId);
        if (activeIndex === -1 || overIndex === -1) return prevTasks;

        const newTasks = [...prevTasks];
        newTasks[activeIndex] = { ...newTasks[activeIndex], columnId: newTasks[overIndex].columnId };
        return arrayMove(newTasks, activeIndex, overIndex);
      });
    }

    const isOverAColumn = over.data.current?.type === "Column";
    if (isActiveATask && isOverAColumn) {
      setTasks((prevTasks) => {
        const activeIndex = prevTasks.findIndex((t) => t.id === activeId);
        if (activeIndex === -1) return prevTasks;
        return prevTasks.map((task) => (task.id === activeId ? { ...task, columnId: overId } : task));
      });
    }
  }
}

function generateId() {
  return Math.floor(Math.random() * 10001);
}

export default KanbanBoard;
