export type Task = () => unknown;

export interface Queue {
  push: (task: Task) => void;
  getRunningTasks: () => Task[];
  isRunning: () => boolean;
  enqueuedTasks: Task[],
}

export function createQueue(numberOfParallelTasks = 1): Queue {
  const taskQueue: Task[] = [];
  const runningTasks: Task[] = [];
  let running = 0;

  const runTask = async (task: Task): Promise<void> => {
    running += 1;
    runningTasks.push(task);

    await (async () => task())();

    const taskIndex = runningTasks.indexOf(task);
    const nextTask = taskQueue.shift();

    if (taskIndex > -1) {
      runningTasks.splice(taskIndex, 1);
    }

    running -= 1;

    if (nextTask) {
      runTask(nextTask);
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
    getRunningTasks: () => runningTasks,
    enqueuedTasks: taskQueue,
  };
}
