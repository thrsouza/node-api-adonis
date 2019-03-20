'use strict'

const File = use('App/Models/File')
const Helpers = use('Helpers')

/**
 * Resourceful controller for interacting with files
 */
class FileController {
  async show ({ params, response }) {
    try {
      const file = await File.findOrFail(params.id)

      return response.download(Helpers.tmpPath(`uploads/${file.file}`))
    } catch (error) {
      return response.status(error.status).send({
        error: {
          message: 'Oops! Show file error...'
        }
      })
    }
  }

  async store ({ request, response }) {
    try {
      if (request.file('file')) {
        const upload = request.file('file', { size: '2mb' })

        const fileName = `${Date.now()}.${upload.subtype}`

        await upload.move(Helpers.tmpPath('uploads'), { name: fileName })

        if (!upload.moved()) throw upload.error()

        const file = await File.create({
          file: fileName,
          name: upload.clientName,
          type: upload.type,
          subtype: upload.subtype
        })

        return file
      }
    } catch (error) {
      return response.status(error.status).send({
        error: {
          message: 'Oops! File upload error...'
        }
      })
    }
  }
}

module.exports = FileController
