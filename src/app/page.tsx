'use client';
import { addTodo, deleteTodo, getTodos, Todo, toggleTodo } from './actions';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useEffect, useState, useTransition } from 'react';
import Auth from './auth/page';
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function TodoApp() {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Todo[]>([]);
  const [todo, setTodo] = useState<string>('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      startTransition(async () => {
        const fetchedTasks = await getTodos();
        setTasks(fetchedTasks);
      });
    } else {
      setTasks([]);
    }
  }, [user]);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const form = e.target as HTMLFormElement;
    startTransition(async () => {
      await addTodo(new FormData(form));
      const fetchedTasks = await getTodos();
      setTasks(fetchedTasks);
      setTodo('');
    });
  };

  const fetchTasks = () => {
      if (user) {
          startTransition(async () => {
              const fetchedTasks = await getTodos();
              setTasks(fetchedTasks);
          });
      }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 font-sans">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <div className="flex justify-center mb-6">
          <Auth />
        </div>
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">Todo App</h1>
        <form onSubmit={handleAddTodo} className="flex mb-4">
          <input
            type="text"
            name="todo"
            className="flex-grow p-3 border-2 border-gray-300 rounded-l-lg focus:outline-none focus:border-blue-500 text-black"
            placeholder="Add a new task"
            onChange={(e) => setTodo(e.target.value)}
            value={todo}
            disabled={!user}
          />
          <button
            type="submit"
            disabled={isPending || !user}
            className="px-6 py-3 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 focus:outline-none disabled:bg-gray-400"
          >
            {isPending ? 'Adding...' : <PlusIcon className="h-6 w-6" />}
          </button>
        </form>
        <ul>
          {user && tasks.map((task) => (
            <li
              key={task.id}
              className={`flex items-center justify-between p-4 mb-2 rounded-lg ${task.completed ? 'bg-green-100' : 'bg-gray-50'}`}>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() =>
                    startTransition(async () => {
                      await toggleTodo(task.id, task.completed);
                      fetchTasks()
                    })
                  }
                  className="h-6 w-6 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                />
                <span
                  className={`ml-4 text-lg ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                  {task.text}
                </span>
              </div>
              <button
                onClick={() =>
                  startTransition(async () => {
                    await deleteTodo(task.id);
                    fetchTasks()
                  })
                }
                className="text-red-500 hover:text-red-600 focus:outline-none">
                <TrashIcon className="h-6 w-6" />
              </button>
            </li>
          ))}
        </ul>
        {!user && <p className="text-center text-gray-500">Please sign in to manage your to-dos.</p>}
      </div>
    </div>
  );
}
