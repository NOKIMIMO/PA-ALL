import { DataSource } from 'typeorm';
import { Task } from './../database/models/task';
import { UserTask } from './../database/models/user-task';
import { TaskCreateRequest, TaskSelectOneRequest, TaskUpdateRequest } from '../Validators/taskValidator';
import { ListItemRequest } from '../Validators/commonValidator';
import { CustomError } from '../common/error/customError';
export class TaskUseCase {
    constructor(private readonly db:DataSource) {};

    async createTask(task: TaskCreateRequest): Promise<Task> {
        const taskRepository = this.db.getRepository(Task);
        //if priority not null, check task exist and create the task with the link
        const newTask = taskRepository.create(task);
        await taskRepository.save(newTask);
        return newTask;
    }
    async finishTask(taskId: number): Promise<void> {
        const taskRepository = this.db.getRepository(Task);
        const task = await taskRepository.findOneBy({id: taskId});
        if (!task) {
            throw new Error('Task not found');
        }
        task.completed = true;
        await taskRepository.save(task);
    }

    async updateTask(taskId: number,task: TaskUpdateRequest): Promise<Task> {
        const taskRepository = this.db.getRepository(Task);
        const taskToUpdate = await taskRepository.findOneBy({id: taskId});
        if (!taskToUpdate) {
            throw new Error('Task not found');
        }
        if(task.title){
            taskToUpdate.title = task.title;
        }
        if(task.description){
            taskToUpdate.description = task.description;
        }
        if(task.dueDate){
            taskToUpdate.max_end_date = task.dueDate;
        }
        if(task.priority){
            const taskParent = await taskRepository.findOneBy({id: task.priority});
            if (!taskParent) {
                throw new Error('Task not found');
            }
            taskToUpdate.task = [taskParent];
        }
        await taskRepository.save(taskToUpdate);
        return taskToUpdate;
    }

    async selectOneTask(taskId: number): Promise<Task> {
        const taskRepository = this.db.getRepository(Task);
        console.log(taskId)
        const task = await taskRepository.findOneBy({id: taskId});
        if (!task) {
            throw new CustomError(404,'Task not found');
        }
        return task;
    }

    async selectMultipleTask(tasksId: number[]): Promise<Task[]> {
        const taskRepository = this.db.getRepository(Task);
        //build query
        const query = taskRepository.createQueryBuilder('task')
            .where('task.id IN (:...tasksId)', { tasksId });
        const tasks = await query.getMany();
        if (!tasks) {
            throw new CustomError(404,'Task not found');
        }
        return tasks;
    }

    async assignTask(taskId: number, userId: number): Promise<void> {
        //function as a put request
        const taskRepository = this.db.getRepository(Task);
        const task = await taskRepository.findOneBy({id: taskId});
        if (!task) {
            throw new CustomError(404,'Task not found');
        }
        const taskUserRepository = this.db.getRepository(UserTask);
        const userTask = taskUserRepository.findBy({userId, taskId});
        if ((await userTask).length > 0) {
            throw new CustomError(400,'Task already assigned to user');
        }
        const newUserTask = taskUserRepository.create({userId, taskId});
        await taskUserRepository.save(newUserTask);
    }

    async assignTaskToMultipleUsers(taskId: number, userIds: number[]): Promise<void> {
        //function as a put request
        const taskRepository = this.db.getRepository(Task);
        const task = await taskRepository.findOneBy({id: taskId});
        if (!task) {
            throw new CustomError(404,'Task not found');
        }
        const taskUserRepository = this.db.getRepository(UserTask);
        const userTasks = await taskUserRepository.findBy({taskId});
        const userTaskIds = userTasks.map(userTask => userTask.userId);
        const newUsers = userIds.filter(userId => !userTaskIds.includes(userId));
        const newUserTasks = newUsers.map(userId => taskUserRepository.create({userId, taskId}));
        await taskUserRepository.save(newUserTasks);
    }

    async removeTask(taskId: number): Promise<void> {
        const taskRepository = this.db.getRepository(Task);
        const task = await taskRepository.findOneBy({id: taskId});
        if (!task) {
            throw new CustomError(404,'Task not found');
        }
        await taskRepository.remove(task);
    }

    async removeTaskFromUser(taskId: number, userId: number): Promise<void> {
        const taskUserRepository = this.db.getRepository(UserTask);
        const userTask = await taskUserRepository.findOneBy({taskId, userId});
        if (!userTask) {
            throw new CustomError(404,'Task not found');
        }
        await taskUserRepository.remove(userTask);
    }

    async removeTaskFromMultipleUsers(taskId: number, userIds: number[]): Promise<void> {
        const taskRepository = this.db.getRepository(Task);
        const task = await taskRepository.findOneBy({id: taskId});
        if (!task) {
            throw new CustomError(404,'Task not found');
        }
        const taskUserRepository = this.db.getRepository(UserTask);
        const userTasks = await taskUserRepository.findBy({taskId});
        //build remove query
        const query = taskUserRepository.createQueryBuilder('userTask')
            .delete()
            .where('userTask.taskId = :taskId', { taskId })
            .andWhere('userTask.userId IN (:...userIds)', { userIds });
        await query.execute();
    }

    async listUserOfTask(taskId: number): Promise<UserTask[]> {
        const taskUserRepository = this.db.getRepository(UserTask);
        const userTasks = await taskUserRepository.findBy({taskId});
        return userTasks;
    }

    async listTaskOfUser(userId: number): Promise<UserTask[]> {
        const taskUserRepository = this.db.getRepository(UserTask);
        const userTasks = await taskUserRepository.findBy({userId});
        return userTasks;
    }

    async ListTaskOfEvent(eventId: number): Promise<Task[]> {
        const taskRepository = this.db.getRepository(Task);
        const tasks = await taskRepository.findBy({eventId});
        return tasks;
    }

    async ListAllTasks(filter : ListItemRequest): Promise<Task[]> {
        const taskRepository = this.db.getRepository(Task);
        //build query
        const query = taskRepository.createQueryBuilder('task');
        if(filter.limit){
            query.limit(filter.limit)
            if(filter.page){
                query.offset((filter.page-1) * filter.limit)
            }
        }
        const tasks = await query.getRawMany()
        return tasks;
    }

    async clearTask(taskId:number): Promise<void> {
        const taskRepository = this.db.getRepository(Task);
        const task = await taskRepository.find();
        if (!task) {
            throw new CustomError(404,'Task not found');
        }
        const taskUserRepository = this.db.getRepository(UserTask);
        //build query
        const query = taskUserRepository.createQueryBuilder('userTask')
            .where('userTask.taskId = :taskId', { taskId });
        await query.delete().execute();
    }
}