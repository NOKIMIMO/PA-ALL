import { DataSource, In } from 'typeorm';
import { Task } from './../database/models/task';
import { UserTask } from './../database/models/user-task';
import { TaskCreateRequest, TaskSelectOneRequest, TaskUpdateRequest } from '../Validators/taskValidator';
import { ListItemRequest } from '../Validators/commonValidator';
import { CustomError } from '../common/error/customError';
import { User } from '../database/models/user';
import { Event } from '../database/models/event';
import { UserResponse } from '../Validators/userValidator';
export class TaskUseCase {
    constructor(private readonly db:DataSource) {};

    async createTask(task: TaskCreateRequest): Promise<Task> {
        const taskRepository = this.db.getRepository(Task);
        //if priority not null, check task exist and create the task with the link
        const { dueDate , eventId ,title , description, priority} = task;
        let taskParent = null;
        if(priority){
            taskParent = await taskRepository.findOneBy({id: priority});
            if (!taskParent) {
                throw new CustomError(404,'Task not found');
            }
        }
        const eventRepository = this.db.getRepository(Event);
        const event = await eventRepository.findOneBy({id: eventId});
        if (!event) {
            throw new CustomError(404,'Event not found');
        }
        if (event.event_date < dueDate) {
            throw new CustomError(400,'Due date is after event end date');
        }
        const newTask = taskRepository.create({max_end_date:dueDate , eventId ,title , description, priority: taskParent, priorityId: priority});
        await taskRepository.save(newTask);
        return newTask;

    }
    async finishTask(taskId: number): Promise<void> {
        const taskRepository = this.db.getRepository(Task);
        const task = await taskRepository.findOneBy({id: taskId});
        if (!task) {
            throw new CustomError(404,'Task not found');
        }
        task.completed = true;
        await taskRepository.save(task);
    }

    async unfinishTask(taskId: number): Promise<void> {
        const taskRepository = this.db.getRepository(Task);
        const task = await taskRepository.findOneBy({id: taskId});
        if (!task) {
            throw new CustomError(404,'Task not found');
        }
        task.completed = false;
        await taskRepository.save(task);
    }

    async updateTask(taskId: number,task: TaskUpdateRequest): Promise<Task> {
        const taskRepository = this.db.getRepository(Task);
        const taskToUpdate = await taskRepository.findOneBy({id: taskId});
        if (!taskToUpdate) {
            throw new CustomError(404,'Task not found');
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
            if(task.priority < 0){
                //remove priority
                taskToUpdate.priority = null;
                taskToUpdate.priorityId = null;
            }else{
                const taskParent = await taskRepository.findOneBy({id: task.priority});
                if (!taskParent) {
                    throw new CustomError(404,'Task not found');
                }
                taskToUpdate.priority = taskParent;
                taskToUpdate.priorityId = task.priority;
            }

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
        console.log("inside assign multiple usecase")
        console.log(task, taskId, userIds)
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
        userTasks.forEach(async userTask => {
            if (userIds.includes(userTask.userId)) {
                await taskUserRepository.remove(userTask);
            }
        });
    }

    async listUserOfTask(taskId: number): Promise<UserResponse[]> {
        const taskUserRepository = this.db.getRepository(UserTask);
        const userTasks = await taskUserRepository.findBy({taskId});
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

    async listTaskOfUser(userId: number): Promise<UserTask[]> {
        const taskUserRepository = this.db.getRepository(UserTask);
        const userTasks = await taskUserRepository.findBy({userId});
        return userTasks;
    }

    async ListTaskOfEvent(eventId: number): Promise<Task[]> {
        const taskRepository = this.db.getRepository(Task);
        console.log("in select task of event ");
        console.log(eventId);
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
        const taskUser = await taskUserRepository.findBy({taskId : taskId});

        if (taskUser.length === 0) {
            return;
        }
        await taskUserRepository.remove(taskUser);

        
    }
}