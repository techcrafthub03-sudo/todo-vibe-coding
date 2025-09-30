
"use server"

import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, query, where } from "firebase/firestore";
import { db, auth } from "./firebase";
import { revalidatePath } from "next/cache";

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  userId: string;
}

export async function getTodos(): Promise<Todo[]> {
  const user = auth.currentUser;
  if (!user) {
    return [];
  }
  const q = query(collection(db, "todos"), where("userId", "==", user.uid));
  const querySnapshot = await getDocs(q);
  const todos: Todo[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    todos.push({
      id: doc.id,
      text: data.text || "",
      completed: data.completed || false,
      userId: data.userId,
    });
  });
  return todos;
}

export async function addTodo(formData: FormData) {
  const todo = formData.get("todo") as string;
  const user = auth.currentUser;
  if (!todo || todo.trim() === "" || !user) {
    return;
  }
  try {
    await addDoc(collection(db, "todos"), {
      text: todo,
      completed: false,
      userId: user.uid,
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
