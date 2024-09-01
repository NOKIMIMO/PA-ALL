import React, { useEffect, useState } from 'react';
import TaskService from '../../services/TaskService';
import UserService from '../../services/UserService';
import { EventService } from '../../services/EventService'; // Assurez-vous que le chemin est correct
import { CustomError } from '../../commons/Error';
import GenericTable from './GenereicTable';

interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  assignedTo?: string;
  status: string;
  eventId?: number;
  active: boolean;
}

interface User {
  id: number;
  email: string;
  role: string;
}

interface Event {
  id: number;
  title: string;
}

const eventService = new EventService();

const TaskTable: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<Partial<Task> | null>(null);

  const fetchTasks = async () => {
    try {
      const taskData = await TaskService.listTasks({ page, limit });
      setTasks(taskData.tasks || []);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const fetchUsers = async () => {
    try {
      const userData = await UserService.getUserList(page, limit);
      const filteredUsers = userData.users.filter((user: User) => user.role === 'employee' || user.role === 'admin');
      setUsers(filteredUsers);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const fetchEvents = async () => {
    try {
      const eventData = await eventService.getEvents(page, limit);
      setEvents(eventData.events || []);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
    fetchEvents();
  }, [page]);

  const handleDelete = async (id: number) => {
    try {
      await TaskService.deleteTaskById(id);
      fetchTasks();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
  };

  const handleSaveEdit = async () => {
    if (editingTask) {
      const updateData = {
        title: editingTask.title,
        description: editingTask.description,
        dueDate: editingTask.dueDate,
        status: editingTask.status,
        eventId: editingTask.eventId,
      };
      try {
        await TaskService.updateTask(editingTask.id, updateData);
        setEditingTask(null);
        fetchTasks();
      } catch (err) {
        setError((err as Error).message);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (editingTask) {
      setEditingTask({ ...editingTask, [e.target.name]: e.target.value });
    }
  };

  const handleNewTaskChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setNewTask({ ...newTask, [e.target.name]: e.target.value });
  };

  const handleCreateTask = async () => {
    if (newTask) {
      const createData = {
        dueDate: newTask.dueDate || '',
        title: newTask.title || '',
        description: newTask.description || '',
        eventId: newTask.eventId,
      };
      try {
        await TaskService.createTask(createData);
        setNewTask(null);
        fetchTasks();
      } catch (err) {
        setError((err as Error).message);
      }
    }
  };

  const handleAssignTask = async (taskId: number, userId: number) => {
    try {
      await TaskService.assignTaskToUser(taskId, userId);
      fetchTasks();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const headers = ['ID', 'Title', 'Description', 'Due Date', 'Assigned To', 'Status', 'Event', 'Actions'];

  return (
    <div className="container mx-auto p-8 bg-black text-white rounded-xl shadow-2xl">
      <h1 className="text-4xl font-bold mb-8 text-center">Task Management</h1>
      {error && <div className="bg-red-600 text-white p-4 mb-8 rounded-lg">{error}</div>}

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Create New Task</h2>
        <input
          type="text"
          name="title"
          placeholder="Task Title"
          value={newTask?.title || ''}
          onChange={handleNewTaskChange}
          className="bg-gray-900 text-white border-b-2 border-yellow-500 focus:border-yellow-700 focus:outline-none px-3 py-2 mr-2"
        />
        <input
          type="text"
          name="description"
          placeholder="Task Description"
          value={newTask?.description || ''}
          onChange={handleNewTaskChange}
          className="bg-gray-900 text-white border-b-2 border-yellow-500 focus:border-yellow-700 focus:outline-none px-3 py-2 mr-2"
        />
        <input
          type="date"
          name="dueDate"
          value={newTask?.dueDate || ''}
          onChange={handleNewTaskChange}
          className="bg-gray-900 text-white border-b-2 border-yellow-500 focus:border-yellow-700 focus:outline-none px-3 py-2 mr-2"
        />
        <select
          name="eventId"
          value={newTask?.eventId || ''}
          onChange={handleNewTaskChange}
          className="bg-gray-900 text-white border-b-2 border-yellow-500 focus:border-yellow-700 focus:outline-none px-3 py-2 mr-2"
        >
          <option value="">Select Event</option>
          {events.map(event => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>
        <button
          onClick={handleCreateTask}
          className="bg-green-500 text-black px-6 py-3 rounded-full shadow-lg hover:bg-green-600 transition"
        >
          Create Task
        </button>
      </div>

      <GenericTable<Task>
              headers={headers}
              rows={tasks}
              renderRow={(task, isEditing, handleInputChange) => (
                  <>
                      <td className="py-2 px-4 border-b">{task.id}</td>
                      <td className="py-2 px-4 border-b">
                          {isEditing ? (
                              <input
                                  type="text"
                                  name="title"
                                  value={task.title}
                                  onChange={handleInputChange}
                                  className="bg-gray-900 text-white border-b-2 border-yellow-500 focus:border-yellow-700 focus:outline-none px-3 py-2" />
                          ) : (
                              task.title
                          )}
                      </td>
                      <td className="py-2 px-4 border-b">
                          {isEditing ? (
                              <textarea
                                  name="description"
                                  value={task.description}
                                  onChange={handleInputChange}
                                  className="bg-gray-900 text-white border-b-2 border-yellow-500 focus:border-yellow-700 focus:outline-none px-3 py-2" />
                          ) : (
                              task.description
                          )}
                      </td>
                      <td className="py-2 px-4 border-b">
                          {isEditing ? (
                              <input
                                  type="date"
                                  name="dueDate"
                                  value={task.dueDate}
                                  onChange={handleInputChange}
                                  className="bg-gray-900 text-white border-b-2 border-yellow-500 focus:border-yellow-700 focus:outline-none px-3 py-2" />
                          ) : (
                              task.dueDate
                          )}
                      </td>
                      <td className="py-2 px-4 border-b">
                          {isEditing ? (
                              <select
                                  onChange={(e) => handleAssignTask(task.id, Number(e.target.value))}
                                  className="bg-gray-900 text-white border-b-2 border-yellow-500 focus:border-yellow-700 focus:outline-none px-3 py-2"
                              >
                                  <option value="">Assign To</option>
                                  {users.map(user => (
                                      <option key={user.id} value={user.id}>
                                          {user.email}
                                      </option>
                                  ))}
                              </select>
                          ) : (
                              task.assignedTo || 'Unassigned'
                          )}
                      </td>
                      <td className="py-2 px-4 border-b">
                          {isEditing ? (
                              <select
                                  name="status"
                                  value={task.status}
                                  onChange={handleInputChange}
                                  className="bg-gray-900 text-white border-b-2 border-yellow-500 focus:border-yellow-700 focus:outline-none px-3 py-2"
                              >
                                  <option value="pending">Pending</option>
                                  <option value="in_progress">In Progress</option>
                                  <option value="completed">Completed</option>
                              </select>
                          ) : (
                              task.status
                          )}
                      </td>
                      <td className="py-2 px-4 border-b">
                          {isEditing ? (
                              <select
                                  name="eventId"
                                  value={task.eventId || ''}
                                  onChange={handleInputChange}
                                  className="bg-gray-900 text-white border-b-2 border-yellow-500 focus:border-yellow-700 focus:outline-none px-3 py-2"
                              >
                                  <option value="">Select Event</option>
                                  {events.map(event => (
                                      <option key={event.id} value={event.id}>
                                          {event.title}
                                      </option>
                                  ))}
                              </select>
                          ) : task.eventId ? (
                              events.find(event => event.id === task.eventId)?.title || 'No Event'
                          ) : (
                              'No Event'
                          )}
                      </td>
                      <td className="py-2 px-4 border-b">
                          {isEditing ? (
                              <>
                                  <button
                                      onClick={handleSaveEdit}
                                      className="bg-blue-500 text-black px-4 py-2 rounded-full shadow-lg hover:bg-blue-600 transition"
                                  >
                                      Save
                                  </button>
                                  <button
                                      onClick={handleCancelEdit}
                                      className="bg-gray-500 text-black px-4 py-2 rounded-full shadow-lg hover:bg-gray-600 transition ml-2"
                                  >
                                      Cancel
                                  </button>
                              </>
                          ) : (
                              <>
                                  <button
                                      onClick={() => handleEdit(task)}
                                      className="bg-yellow-500 text-black px-4 py-2 rounded-full shadow-lg hover:bg-yellow-600 transition"
                                  >
                                      Edit
                                  </button>
                                  <button
                                      onClick={() => handleDelete(task.id)}
                                      className="bg-red-500 text-black px-4 py-2 rounded-full shadow-lg hover:bg-red-600 transition ml-2"
                                  >
                                      Delete
                                  </button>
                              </>
                          )}
                      </td>
                  </>
              )} onEdit={function (row: Task): void {
                  throw new Error('Function not implemented.');
              } } onDelete={function (id: number): void {
                  throw new Error('Function not implemented.');
              } } onSaveEdit={function (): void {
                  throw new Error('Function not implemented.');
              } } onCancelEdit={function (): void {
                  throw new Error('Function not implemented.');
              } } editingRow={null}        //isEditing={Boolean(editingTask)}
        //setEditingTask={setEditingTask}
      />

      <div className="flex justify-center mt-4">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="bg-blue-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-600 transition mx-2"
        >
          Previous
        </button>
        <button
          onClick={() => setPage(page + 1)}
          className="bg-blue-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-600 transition mx-2"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TaskTable;
