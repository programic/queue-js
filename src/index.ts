export type Task = () => unknown;

export interface FailedTask {
  task: Task;
  error: unknown;
  failedAt: number;
}

export interface Queue {
  isRunning: () => boolean;
  push: (task: Task) => void;
  failedTasks: FailedTask[];
  enqueuedTasks: Task[],
  runningTasks: Task[];
}

export function createQueue(numberOfParallelTasks = 1): Queue {
  const taskQueue: Task[] = [];
  const runningTasks: Task[] = [];
  const failedTasks: FailedTask[] = [];
  let running = 0;

  const runTask = async (task: Task): Promise<void> => {
    running += 1;
    runningTasks.push(task);

    try {
      await (async () => task())();
    } catch (error: unknown) {
      failedTasks.push({
        failedAt: Date.now(),
        error,
        task,
      });
    } finally {
      const taskIndex = runningTasks.indexOf(task);
      const nextTask = taskQueue.shift();

      if (taskIndex > -1) {
        runningTasks.splice(taskIndex, 1);
      }

      running -= 1;

      if (nextTask) {
        runTask(nextTask);
      }
    }
  };

  const enqueueTask = (task: Task): void => {
    taskQueue.push(task);
  };

  return {
    push: (task: Task): void => {
      if (running >= numberOfParallelTasks) {
        enqueueTask(task);
        return;
      }

      runTask(task);
    },
    isRunning: () => Boolean(running),
    enqueuedTasks: taskQueue,
    runningTasks,
    failedTasks,
  };
}
