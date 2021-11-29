# @programic/queue

[![npm version](https://badge.fury.io/js/%40programic%2Fqueue.svg)](http://badge.fury.io/js/@programic/queue)

This is a simple JavaScript/TypeScript queue. It contains a push method to add a task (method) to the queue.

## Simple example
  ```typescript
  import { createQueue } from '@programic/queue';

  const queue = createQueue();

  queue.push(() => 'First task');
  queue.push(async () => 'Second task');
  ```

## Installation
To use this package, install `@programic/queue` as a dependency in your project with npm or yarn:

  ```sh
  npm install @programic/queue --save
  ```
  ```sh
  yarn add @programic/queue
  ```

## Usage
To create a new queue instance, use the `createQueue` method (like the example above). It has one parameter `numberOfParallelTasks` which is `1` by default. You can provide a higher value to run multiple tasks simultaneously.

## Queue instance properties and methods
Every queue instance has the following methods and properties:

- `enqueuedTasks` (property: array) contains the tasks that are waiting to be fired
- `runningTasks` (property: Task[]) contains the tasks that are currently running
- `isRunning` (method: boolean) indicates if the queue is running
- `push` (method: void) method to push a new task to the queue
