import { SortableContext, useSortable } from "@dnd-kit/sortable";
import TrashIcon from "../icons/TrashIcon";
import { Column, Id, Task } from "../Types"
import {CSS} from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import PlusIcon from "../icons/PlusIcon";
import TaskCard from "./TaskCard";

interface props{
    column: Column;
    deleteColumn: (id:Id) =>void;
    updateColumn: (id:Id, title:string) =>void;
    createTask: (columnId:Id) =>void;
    deleteTask: (id:Id) =>void;
    updateTask: (id:Id , content: string) =>void;
    tasks: Task[];

}

function ColumnContainer(props: props) {
    const { column, deleteColumn, updateColumn,createTask , tasks, deleteTask, updateTask} = props;
    const [editMode, setEditMode] = useState(false)
    const tasksIds = useMemo(() => {
      return tasks.map(task => task.id);
    },[tasks])

    const{setNodeRef, attributes, listeners, transform, transition, isDragging} = useSortable({
      id: column.id,
      data:{
        type:"Column",
        column,
      },
      disabled: editMode,
    });
    

    const style = {
      transition,
      transform: CSS.Transform.toString(transform), // ✅ Correct key "transform"
    };

    if(isDragging){
      return <div ref={setNodeRef} style={style}
      className="
        opacity-40
        border-2
        border-rose-500
        bg-[#0D1117]
        w-[350px]
        h-[500px]
        max-h-[500px]
        rounded-md
        flex
        flex-col
      "></div>
    }
    
    
     

  return (
    <div ref={setNodeRef} style={style}
      className="
        bg-[#0D1117]
        w-[350px]
        h-[500px]
        max-h-[500px]
        rounded-md
        flex
        flex-col
    ">
      <div 
        {...attributes}
        {...listeners}
        onClick={()=>{
          setEditMode(true);
        }}

        className="bg-[#0D1117] text-md h-[60px] cursor-grab rounded-md rounded-b-none p-3 font-bold border-[#161C22] border-4 flex items-center justify-between">
        <div className="flex gap-2">
        <div className="flex justify-center items-center bg-[#0D1117] px-2 py-1 text-sm rounded-full"></div>

        {!editMode && column.title}
        {editMode && <input className="bg-black focus:border-rose-500 border rounded outline-none px-2" value={column.title} onChange={e => updateColumn(column.id, e.target.value)} autoFocus onBlur={()=>{
          setEditMode(false);
        }}
        onKeyDown={e =>{
          if(e.key !=="Enter")return;
          setEditMode(false);
        }}
        />}
        </div>
        <button onClick={()=>{
          deleteColumn(column.id)
        }} className="stroke-gray-500 hover:stroke-white hover:bg-[#0D1117] rounded px-1 py-2"><TrashIcon/></button>
        </div>
        
      <div className="flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto">
        <SortableContext items={tasksIds}>
        {tasks.map(task =>(
          <TaskCard key={task.id} task={task} deleteTask={deleteTask} updateTask={updateTask}/>
        
      ))}</SortableContext>
      </div>
      <div>
        <button className="flex gap-2 items-center border-[#161C22] border-2 rounded-md p-4 border-x-[#161C22] hover:bg-[#0D1117] hover:text-rose-500 active:bg-black" onClick={()=>{
          createTask(column.id);
        }}><PlusIcon/>Add task</button>

      </div>

    </div>
  )
}

export default ColumnContainer