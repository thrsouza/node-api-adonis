'use strict'

const Task = use('App/Models/Task')

/**
 * Resourceful controller for interacting with tasks
 */
class TaskController {
  /**
   * Show a list of all tasks.
   * GET tasks
   */
  async index ({ params }) {
    const tasks = await Task.query()
      .where('project_id', params.projects_id)
      .with('project')
      .with('file')
      .with('user')
      .fetch()

    return tasks
  }

  /**
   * Create/save a new task.
   * POST tasks
   */
  async store ({ params, request }) {
    const data = request.only([
      'user_id',
      'title',
      'description',
      'due_date',
      'file_id'
    ])

    const task = await Task.create({ ...data, project_id: params.projects_id })

    return task
  }

  /**
   * Display a single task.
   * GET tasks/:id
   */
  async show ({ params, response }) {
    try {
      const task = await Task.findOrFail(params.id)

      await task.load('project')
      await task.load('file')
      await task.load('user')

      return task
    } catch (error) {
      return response.status(error.status).send({
        error: {
          message: 'Oops! Something went wrong...'
        }
      })
    }
  }

  /**
   * Update task details.
   * PUT or PATCH tasks/:id
   */
  async update ({ params, request, response }) {
    try {
      const data = request.only([
        'user_id',
        'title',
        'description',
        'due_date',
        'file_id'
      ])

      const task = await Task.findOrFail(params.id)

      task.merge({ ...data })

      await task.save()

      await task.load('project')
      await task.load('file')
      await task.load('user')

      return task
    } catch (error) {
      return response.status(error.status).send({
        error: {
          message: 'Oops! Something went wrong...'
        }
      })
    }
  }

  /**
   * Delete a task with id.
   * DELETE tasks/:id
   */
  async destroy ({ params, response }) {
    try {
      const task = await Task.findOrFail(params.id)

      task.delete()
    } catch (error) {
      return response.status(error.status).send({
        error: {
          message: 'Oops! Something went wrong...'
        }
      })
    }
  }
}

module.exports = TaskController
