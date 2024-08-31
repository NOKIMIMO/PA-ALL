import { DataSource, In } from 'typeorm';
import { AgTask } from './../database/models/agTask';
import { UserTask } from './../database/models/user-task';
import { ListItemRequest } from '../Validators/commonValidator';
import { CustomError } from '../common/error/customError';
import { UserAgTask } from '../database/models/user-agTask';
import { UserResponse } from '../Validators/userValidator';
import { User } from '../database/models/user';
import { AgTaskCreateRequest, agTaskSelectOneRequest, AgTaskUpdateRequest } from '../Validators/agTaskValidator';
import { Ag } from '../database/models/ag';
export class TaskAgUseCase {
    constructor(private readonly db:DataSource) {};

    async createTask(task: AgTaskCreateRequest): Promise<AgTask> {
        const taskRepository = this.db.getRepository(AgTask);
        const { dueDate , agId ,title , description, priority} = task;
        let taskParent = null;
        if(priority){
            taskParent = await taskRepository.findOneBy({id: priority});
            if (!taskParent) {
                throw new CustomError(404,'Task not found');
            }
            if (taskParent.agId != task.agId){
                throw new CustomError(400,'Task priority must be in the same event' );
            }
        }
        const agRepository = this.db.getRepository(Ag);
        const ag = await agRepository.findOneBy({id: agId});
        if (!ag) {
            throw new CustomError(404, 'Ag not found');
        }
        if (dueDate > ag.ag_date){
            throw new CustomError(400, 'Task due date must be before the event date');
        }
        if (dueDate < new Date()){
            throw new CustomError(400, 'Task due date must be in the future');
        }
        const newTask = taskRepository.create({title, description, max_end_date: dueDate, priority: taskParent, ag});
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

    async updateTask(taskId: number,task: AgTaskUpdateRequest): Promise<AgTask> {
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
            if(task.priority < 0){
                //remove priority
                taskToUpdate.priority = null;
                taskToUpdate.priorityId = null;
            }else{
                const taskParent = await taskRepository.findOneBy({id: task.priority});
                if (!taskParent) {
                    throw new CustomError(404, 'Task not found');
                }
                if (taskParent.agId != taskToUpdate.agId){
                    throw new CustomError(400, 'Task priority must be in the same event');
                }
                if (taskParent.id == taskToUpdate.id){
                    throw new CustomError(400, 'Task priority must be different from the task');
                }
                taskToUpdate.priority = taskParent;
                taskToUpdate.priorityId = task.priority;
            }
            // taskToUpdate.task = [taskParent];
        }
        await taskRepository.save(taskToUpdate);
        return taskToUpdate;
    }

    async selectOneTask(taskId: agTaskSelectOneRequest): Promise<AgTask> {
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
        const taskUserRepository = this.db.getRepository(UserAgTask);
        const userTask = await taskUserRepository.findOneBy({agTaskId: taskId, userId});
        if (userTask) {
            throw new CustomError(400, 'Task already assigned to user');
        }
        const newUserTask = taskUserRepository.create({userId, agTaskId :taskId});
        await taskUserRepository.save(newUserTask);
    }

    async assignTaskToMultipleUsers(taskId: number, userIds: number[]): Promise<void> {
        //function as a put request
        const taskRepository = this.db.getRepository(AgTask);
        const task = await taskRepository.findOneBy({id: taskId});
        if (!task) {
            throw new CustomError(404, 'Task not found');
        }
        const taskUserRepository = this.db.getRepository(UserAgTask);
        const userTasks = await taskUserRepository.findBy({agTaskId: taskId});
        const userTasksIds = userTasks.map(userTask => userTask.userId);
        const newUsers = userIds.filter(userId => !userTasksIds.includes(userId));
        const newUserTasks = newUsers.map(userId => taskUserRepository.create({userId, agTaskId: taskId}));
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
            throw new CustomError(404,'Task not found');
        }
        const taskUserRepository = this.db.getRepository(UserAgTask);
        const userTasks = await taskUserRepository.findBy({agTaskId: taskId, userId: In(userIds)});
        userTasks.forEach(async userTask => {
            if (userIds.includes(userTask.userId)) {
                await taskUserRepository.remove(userTask);
            }
        });
    }

    async listUserOfTask(taskId: number): Promise<UserResponse[]> {
    
        const agTaskUserRepository = this.db.getRepository(UserAgTask);
        const taskUsers = await agTaskUserRepository.findBy({agTaskId: taskId});
        if (!taskUsers) {
            throw new CustomError(404, 'Task not found');
        }
        if (taskUsers.length === 0) {
            return [];
        }
        const userIds = taskUsers.map(taskUser => taskUser.userId);
        const userRepository = this.db.getRepository(User);
        const users = await userRepository.findBy({id: In(userIds)});

        const usersResponse = users.map(user => (
            {id: user.id,
                email: user.email,
                role: user.role,
                lastname: user.lastname,
                firstname: user.firstname,
                active: user.active,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt}
            ));

        return usersResponse;
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