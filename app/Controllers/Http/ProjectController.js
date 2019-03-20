'use strict'

const Project = use('App/Models/Project')

/**
 * Resourceful controller for interacting with projects
 */
class ProjectController {
  /**
   * Show a list of all projects.
   * GET projects
   */
  async index ({ request }) {
    const { page } = request.get()

    const projects = await Project.query()
      .with('user')
      .with('tasks')
      .paginate(page)

    return projects
  }

  /**
   * Create/save a new project.
   * POST projects
   */
  async store ({ request, auth }) {
    const { title, description } = request.all()

    const project = await Project.create({
      title,
      description,
      user_id: auth.user.id
    })

    return project
  }

  /**
   * Display a single project.
   * GET projects/:id
   */
  async show ({ params, response }) {
    try {
      const project = await Project.findOrFail(params.id)

      await project.load('user')
      await project.load('tasks')

      return project
    } catch (error) {
      return response.status(error.status).send({
        error: {
          message: 'Oops! Something went wrong...'
        }
      })
    }
  }

  /**
   * Update project details.
   * PUT or PATCH projects/:id
   */
  async update ({ params, request, response }) {
    try {
      const { title, description } = request.all()
      const project = await Project.findOrFail(params.id)

      project.merge({ title, description })

      await project.save()
      await project.load('user')
      await project.load('tasks')

      return project
    } catch (error) {
      return response.status(error.status).send({
        error: {
          message: 'Oops! Something went wrong...'
        }
      })
    }
  }

  /**
   * Delete a project with id.
   * DELETE projects/:id
   */
  async destroy ({ params, response }) {
    try {
      const project = await Project.findOrFail(params.id)

      project.delete()
    } catch (error) {
      return response.status(error.status).send({
        error: {
          message: 'Oops! Something went wrong...'
        }
      })
    }
  }
}

module.exports = ProjectController
