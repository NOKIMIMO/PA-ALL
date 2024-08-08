import { DataSource, In } from 'typeorm';
import { AgTask } from './../database/models/agTask';
import { UserTask } from './../database/models/user-task';
import { TaskCreateRequest, TaskSelectOneRequest, TaskUpdateRequest } from '../Validators/taskValidator';
import { ListItemRequest } from '../Validators/commonValidator';
import { CustomError } from '../common/error/customError';
import { UserAgTask } from '../database/models/user-agTask';
import { UserResponse } from '../Validators/userValidator';
import { User } from '../database/models/user';
export class TaskAgUseCase {
    constructor(private readonly db:DataSource) {};

    async createTask(task: TaskCreateRequest): Promise<AgTask> {
        const taskRepository = this.db.getRepository(AgTask);
        const newTask = taskRepository.create(task);
        await taskRepository.save(newTask);
        return newTask;
    }

    async unfinishTask(taskId: number): Promise<void> {
        const taskRepository = this.db.getRepository(AgTask);
        const task = await taskRepository.findOneBy({id: taskId});
        if (!task) {
            throw new CustomError(404, 'Task not found');
        }
        if(!task.completed){
            throw new CustomError(400, 'Task already uncompleted');
        }
        task.completed = false;
        await taskRepository.save(task);
    }

    async finishTask(taskId: number): Promise<void> {
        const taskRepository = this.db.getRepository(AgTask);
        const task = await taskRepository.findOneBy({id: taskId});
        if (!task) {
            throw new CustomError(404, 'Task not found');
        }
        if(task.completed){
            throw new CustomError(400, 'Task already completed');
        }
        task.completed = true;
        await taskRepository.save(task);
    }

    async updateTask(taskId: number,task: TaskUpdateRequest): Promise<AgTask> {
        const taskRepository = this.db.getRepository(AgTask);
        const taskToUpdate = await taskRepository.findOneBy({id: taskId});
        if (!taskToUpdate) {
            throw new CustomError(404, 'Task not found');
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
                throw new CustomError(404, 'Task not found');
            }
            taskToUpdate.task = [taskParent];
        }
        await taskRepository.save(taskToUpdate);
        return taskToUpdate;
    }

    async selectOneTask(taskId: TaskSelectOneRequest): Promise<AgTask> {
        const taskRepository = this.db.getRepository(AgTask);
        const task = await taskRepository.findOneBy({id: taskId.taskId});
        if (!task) {
            throw new CustomError(404, 'Task not found');
        }
        return task;
    }

    async selectMultipleTask(tasksId: number[]): Promise<AgTask[]> {
        const taskRepository = this.db.getRepository(AgTask);
        //build query
        const query = taskRepository.createQueryBuilder('agTask')
            .where('task.id IN (:...tasksId)', { tasksId });
        const tasks = await query.getMany();
        if (!tasks) {
            throw new CustomError(404, 'Task not found');
        }
        return tasks;
    }

    async assignTask(taskId: number, userId: number): Promise<void> {
        //function as a put request
        const taskRepository = this.db.getRepository(AgTask);
        const task = await taskRepository.findOneBy({id: taskId});
        if (!task) {
            throw new CustomError(404, 'Task not found');
        }
        const taskUserRepository = this.db.getRepository(UserTask);
        const userTask = taskUserRepository.findBy({userId, taskId});
        if ((await userTask).length > 0) {
            throw new Error('Task already assigned to user');
        }
        const newUserTask = taskUserRepository.create({userId, taskId});
        await taskUserRepository.save(newUserTask);
    }

    async assignTaskToMultipleUsers(taskId: number, userIds: number[]): Promise<void> {
        //function as a put request
        const taskRepository = this.db.getRepository(AgTask);
        const task = await taskRepository.findOneBy({id: taskId});
        if (!task) {
            throw new CustomError(404, 'Task not found');
        }
        const taskUserRepository = this.db.getRepository(UserTask);
        const userTasks = await taskUserRepository.findBy({taskId});
        const userTaskIds = userTasks.map(userTask => userTask.userId);
        const newUsers = userIds.filter(userId => !userTaskIds.includes(userId));
        const newUserTasks = newUsers.map(userId => taskUserRepository.create({userId, taskId}));
        await taskUserRepository.save(newUserTasks);
    }

    async removeTask(taskId: number): Promise<void> {
        const taskRepository = this.db.getRepository(AgTask);
        const task = await taskRepository.findOneBy({id: taskId});
        if (!task) {
            throw new CustomError(404, 'Task not found');
        }
        await taskRepository.remove(task);
    }

    async removeTaskFromUser(taskId: number, userId: number): Promise<void> {
        const taskUserRepository = this.db.getRepository(UserTask);
        const userTask = await taskUserRepository.findOneBy({taskId, userId});
        if (!userTask) {
            throw new CustomError(400,'Task not assigned to user');
        }
        await taskUserRepository.remove(userTask);
    }

    async removeTaskFromMultipleUsers(taskId: number, userIds: number[]): Promise<void> {
        const taskRepository = this.db.getRepository(AgTask);
        const task = await taskRepository.findOneBy({id: taskId});
        if (!task) {
            throw new CustomError(404, 'Task not found');
        }
        const taskUserRepository = this.db.getRepository(UserTask);
        const userTasks = await taskUserRepository.findBy({taskId});
        //build remove query
        const query = taskUserRepository.createQueryBuilder('userAgTask')
            .delete()
            .where('userTask.taskId = :taskId', { taskId })
            .andWhere('userTask.userId IN (:...userIds)', { userIds });
        await query.execute();
    }

    async listUserOfTask(taskId: number): Promise<UserResponse[]> {
        const taskUserRepository = this.db.getRepository(UserAgTask);
        const userTasks = await taskUserRepository.findBy({agTaskId: taskId});
        if (userTasks.length === 0) {
            return [];
        }
        // then get the user
        const userRepository = this.db.getRepository(User);
        const userIds = userTasks.map(userTask => userTask.userId);
        //build query
        const users = await userRepository.findBy({id: In(userIds)});

        // Map to UserResponse while excluding the password field
        const userResponse = users.map(user => ({
            id: user.id,
            email: user.email,
            role: user.role,
            lastname: user.lastname,
            firstname: user.firstname,
            active: user.active,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }));
    
        return userResponse;
    }

    async listTaskOfUser(userId: number): Promise<AgTask[]> {
        const taskUserRepository = this.db.getRepository(UserAgTask);
        const userTasks = await taskUserRepository.findBy({userId});
        if (!userTasks) {
            throw new CustomError(404, 'Task not found');
        }
        if (userTasks.length === 0) {
            return [];
        }
        const agTaskRepository = this.db.getRepository(AgTask);
        const taskIds = userTasks.map(userTask => userTask.agTaskId);
        const tasks = await agTaskRepository.findBy({id: In(taskIds)});

        return tasks;
    }

    async ListTaskOfAg(agId: number): Promise<AgTask[]> {
        const taskRepository = this.db.getRepository(AgTask);
        const tasks = await taskRepository.findBy({agId});
        return tasks;
    }

    async ListAllTasks(filter : ListItemRequest): Promise<AgTask[]> {
        const taskRepository = this.db.getRepository(AgTask);
        //build query
        const query = taskRepository.createQueryBuilder('agTask');
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
        const taskRepository = this.db.getRepository(AgTask);
        const task = await taskRepository.find();
        if (!task) {
            throw new CustomError(404, 'Task not found');
        }
        const taskUserRepository = this.db.getRepository(UserTask);
        //build query
        const query = taskUserRepository.createQueryBuilder('userAgTask')
            .where('userTask.taskId = :taskId', { taskId });
        await query.delete().execute();
    }
}