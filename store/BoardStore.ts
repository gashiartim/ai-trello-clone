import { ID, databases, storage } from "@/appwrite";
import { getTodosGroupedByColumn } from "@/lib/getTodosGroupedByColumn";
import uploadImage from "@/lib/uploadImage";
import { Board, Column, Image, Todo, TypedColumn } from "@/typings";
import { create } from "zustand";

interface BoardState {
  board: Board;
  searchString: string;
  newTaskInput: string;
  newTaskType: TypedColumn;
  image: File | null;

  setBoardState: (board: Board) => void;
  setSearchString: (searchString: string) => void;
  setNewTaskInput: (input: string) => void;
  setNewTaskType: (columnId: TypedColumn) => void;
  setImage: (image: File | null) => void;

  getBoard: () => void;
  updateTodoInDB: (todo: Todo, columnId: TypedColumn) => void;
  deleteTask: (taskIndex: number, todoId: Todo, id: TypedColumn) => void;
  addTask: (todo: string, columnId: TypedColumn, image: File | null) => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  board: { columns: new Map<TypedColumn, Column>() },

  searchString: "",
  newTaskInput: "",
  newTaskType: "todo",
  image: null,

  setNewTaskInput: (input: string) => set({ newTaskInput: input }),
  setSearchString: (searchString: string) => set({ searchString }),
  setBoardState: (board) => set({ board }),
  setImage: (image) => set({ image }),

  getBoard: async () => {
    const board = await getTodosGroupedByColumn();
    set({ board });
  },
  updateTodoInDB: async (todo, columnId) => {
    await databases.updateDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
      todo.$id,
      {
        title: todo.title,
        status: columnId,
      }
    );
  },
  deleteTask: async (taskIndex: number, todo: Todo, id: TypedColumn) => {
    const newColumns = new Map(get().board.columns);

    newColumns.get(id)?.todos.splice(taskIndex, 1);
    set({ board: { columns: newColumns } });

    if (todo.image) {
      await storage.deleteFile(todo.image.bucketId, todo.image.fileId);
    }

    await databases.deleteDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
      todo.$id
    );
  },
  setNewTaskType: (columnId: TypedColumn) => set({ newTaskType: columnId }),
  addTask: async (todo: string, columnId: TypedColumn, image: File | null) => {
    let file: Image | undefined;

    if (image) {
      const fileUploaded = await uploadImage(image);
      if (fileUploaded) {
        file = {
          bucketId: fileUploaded.bucketId,
          fileId: fileUploaded.$id,
        };
      }
    }

    const { $id } = await databases.createDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
      ID.unique(),
      {
        title: todo,
        status: columnId,
        ...(file && { image: JSON.stringify(file) }),
      }
    );

    set({ newTaskInput: "" });
    set((state) => {
      const newColumns = new Map(state.board.columns);

      const newTodo: Todo = {
        $id,
        $createdAt: new Date().toISOString(),
        title: todo,
        status: columnId,
        ...(file && { image: JSON.stringify(file) as any }),
      };

      const column = newColumns.get(columnId);

      if (!column) {
        newColumns.set(columnId, { id: columnId, todos: [newTodo] });
      } else {
        newColumns.get(columnId)?.todos.push(newTodo);
      }

      return {
        board: {
          columns: newColumns,
        },
      };
    });
  },
}));
