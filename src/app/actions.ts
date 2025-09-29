
"use server"

import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";
import { revalidatePath } from "next/cache";

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export async function getTodos(): Promise<Todo[]> {
  const querySnapshot = await getDocs(collection(db, "todos"));
  const todos: Todo[] = [];
  querySnapshot.forEach((doc) => {
    // Note: It's safer to cast after checking the data shape
    const data = doc.data();
    todos.push({
      id: doc.id,
      text: data.text || "", // Provide a fallback
      completed: data.completed || false, // Provide a fallback
    } as Todo);
  });
  return todos;
}

export async function addTodo(formData: FormData) {
  const todo = formData.get("todo") as string;
  if (!todo || todo.trim() === "") {
    return;
  }
  try {
    await addDoc(collection(db, "todos"), {
      text: todo,
      completed: false,
    });
    revalidatePath("/");
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export async function toggleTodo(id: string, completed: boolean) {
  try {
    await updateDoc(doc(db, "todos", id), {
      completed: !completed,
    });
    revalidatePath("/");
  } catch (e) {
    console.error("Error updating document: ", e);
  }
}

export async function deleteTodo(id: string) {
  try {
    await deleteDoc(doc(db, "todos", id));
    revalidatePath("/");
  } catch (e) {
    console.error("Error deleting document: ", e);
  }
}
