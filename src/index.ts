export type Task = () => unknown;

export interface FailedTask {
  task: Task;
  error: unknown;
  failedAt: number;
}

export interface Queueable {
  isRunning: () => boolean;
  push: (task: Task) => void;
  failedTasks: FailedTask[];
  enqueuedTasks: Task[];
  runningTasks: Task[];
}

export default class Queue implements Queueable {
  public runningTasks: Task[] = [];
  public enqueuedTasks: Task[] = [];
  public failedTasks: FailedTask[] = [];
  private running = 0;

  public constructor(
    private readonly numberOfParallelTasks: number = 1,
  ) {
    //
  }

  public isRunning(): boolean {
    return !!this.running;
  }

  public push(task: Task): void {
    if (this.running >= this.numberOfParallelTasks) {
      this.enqueueTask(task);
      return;
    }

    this.runTask(task);
  }

  private enqueueTask(task: Task): void {
    this.enqueuedTasks.push(task);
  }

  private async runTask(task: Task): Promise<void> {
    this.running += 1;
    this.runningTasks.push(task);

    try {
      // eslint-disable-next-line @typescript-eslint/require-await
      await (async (): Promise<unknown> => task())();
    } catch (error: unknown) {
      this.failedTasks.push({ task, error, failedAt: Date.now() });
    } finally {
      const taskIndex = this.runningTasks.indexOf(task);
      const nextTask = this.enqueuedTasks.shift();

      if (taskIndex > -1) {
        this.runningTasks.splice(taskIndex, 1);
      }

      this.running -= 1;

      if (nextTask) {
        this.runTask(nextTask);
      }
    }
  }
}
