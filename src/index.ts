export type Task = () => unknown;

export interface Queue {
  push: (task: Task) => void;
  isRunning: () => boolean;
  enqueuedTasks: Task[],
}

export function createQueue(numberOfParallelTasks = 1): Queue {
  const taskQueue: Task[] = [];
  let running = 0;

  const runTask = async (task: Task): Promise<void> => {
    running += 1;

    await (async () => task())();

    const nextTask = taskQueue.shift();

    if (nextTask) {
      running -= 1;
      runTask(nextTask);
    } else {
      running -= 1;
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
  };
}
