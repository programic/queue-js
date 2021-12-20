import { createQueue } from '..';

const synchronousWaitForNthSeconds = (seconds: number): void => {
  const currentTimestamp = Date.now();
  const start = currentTimestamp;
  let now = currentTimestamp;

  while ((now - start) < (seconds * 1000)) {
    now = Date.now();
  }
};
const asynchronousWaitForNthSeconds = (seconds: number): Promise<void> => {
  return new Promise<void>(resolve => {
    setTimeout(resolve, seconds * 1000);
  });
};

jest.setTimeout(10000);

describe('the queue', () => {
  it('should enqueue a pushed task if the maximum parallel tasks is reached (1 parallel task)', async () => {
    expect.assertions(18);

    const synchronousTask = jest.fn(() => {
      synchronousWaitForNthSeconds(1)
    });
    const asynchronousTask = jest.fn(async () => {
      await asynchronousWaitForNthSeconds(1);
    });
    const testFunction = async (task: () => void | Promise<void>) => {
      const queue = createQueue();

      queue.push(task);
      queue.push(task);

      expect(queue.isRunning()).toBe(true);
      expect(queue.runningTasks).toHaveLength(1);
      expect(queue.runningTasks[0]).toBe(task);
      expect(task).toHaveBeenCalledTimes(1);
      expect(queue.enqueuedTasks).toHaveLength(1);

      await asynchronousWaitForNthSeconds(2.5);

      expect(task).toHaveBeenCalledTimes(2);
      expect(queue.enqueuedTasks).toHaveLength(0);

      await asynchronousWaitForNthSeconds(1.5);

      expect(queue.isRunning()).toBe(false);
      expect(queue.runningTasks).toHaveLength(0);
    };

    await testFunction(synchronousTask);
    await testFunction(asynchronousTask);
  });

  it('should enqueue a pushed task if the maximum parallel tasks is reached (multiple parallel tasks)', async () => {
    expect.assertions(10);

    const synchronousTask = jest.fn(() => {
      synchronousWaitForNthSeconds(1)
    });
    const asynchronousTask = jest.fn(async () => {
      await asynchronousWaitForNthSeconds(1);
    });
    const queue = createQueue(3);
    const tasks = [
      synchronousTask,
      synchronousTask,
      asynchronousTask,
      asynchronousTask,
    ];

    tasks.forEach(task => {
      queue.push(task);
    });

    expect(queue.isRunning()).toBe(true);
    expect(queue.runningTasks).toHaveLength(3);
    expect(queue.runningTasks).toEqual(tasks.slice(0, tasks.length - 1));
    expect(synchronousTask).toHaveBeenCalledTimes(2);
    expect(asynchronousTask).toHaveBeenCalledTimes(1);
    expect(queue.enqueuedTasks).toHaveLength(1);

    await asynchronousWaitForNthSeconds(2.5);

    expect(synchronousTask).toHaveBeenCalledTimes(2);
    expect(queue.enqueuedTasks).toHaveLength(0);

    await asynchronousWaitForNthSeconds(1.5);

    expect(queue.isRunning()).toBe(false);
    expect(queue.runningTasks).toHaveLength(0);
  });

  it('should proceed to the next task when the current task throws an error', async () => {
    expect.assertions(12);

    const synchronousTask = jest.fn(() => {
      synchronousWaitForNthSeconds(1);
    });
    const failingTask = jest.fn(() => {
      synchronousWaitForNthSeconds(1);
      throw Error('Task failed');
    });
    const startTimestamp = Date.now();
    const queue = createQueue();

    queue.push(failingTask);
    queue.push(synchronousTask);

    expect(queue.isRunning()).toBe(true);
    expect(queue.runningTasks).toHaveLength(1);
    expect(queue.enqueuedTasks).toHaveLength(1);

    await asynchronousWaitForNthSeconds(2.5);

    expect(queue.isRunning()).toBe(false);
    expect(queue.runningTasks).toHaveLength(0);
    expect(queue.enqueuedTasks).toHaveLength(0);
    expect(queue.failedTasks).toHaveLength(1);

    const failedTask = queue.failedTasks[0];

    expect(failedTask.task).toStrictEqual(failingTask);
    expect(failedTask.failedAt).toBeGreaterThan(startTimestamp);

    if (failedTask.error instanceof Error) {
      expect(failedTask.error.message).toBe('Task failed');
    }

    expect(failingTask).toHaveBeenCalledTimes(1);
    expect(synchronousTask).toHaveBeenCalledTimes(1);
  });
});
