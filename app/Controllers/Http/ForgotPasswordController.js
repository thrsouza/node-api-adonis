'use strict'

const crypto = require('crypto')
const moment = require('moment')

const User = use('App/Models/User')

const Env = use('Env')
const Mail = use('Mail')

class ForgotPasswordController {
  async store ({ request, response }) {
    try {
      const email = request.input('email')
      const user = await User.findByOrFail('email', email)

      user.token = crypto.randomBytes(10).toString('hex')
      user.token_created_at = new Date()

      await user.save()
      Mail.send(
        ['emails.forgot_password'],
        {
          email: user.email,
          token: user.token,
          link: `${request.input('redirect_url')}?token=${user.token}`
        },
        message => {
          message
            .to(user.email)
            .from(
              Env.get('DEFAULT_MAIL_SENDER_EMAIL'),
              Env.get('DEFAULT_MAIL_SENDER_NAME')
            )
            .subject(Env.get('DEFAULT_MAIL_SUBJECT_PASS_RECOVERY'))
        }
      )
    } catch (error) {
      return response.status(error.status).send({
        error: {
          message: 'Oops! Does this mail really exist?'
        }
      })
    }
  }

  async update ({ request, response }) {
    try {
      const { token, password } = request.all()

      const user = await User.findByOrFail('token', token)

      const tokenIsExpired = moment()
        .subtract('2', 'days')
        .isAfter(user.token_created_at)

      if (tokenIsExpired) {
        return response.status(401).send({
          error: {
            message: 'Oops! Token is expired... :('
          }
        })
      }

      user.token = null
      user.token_created_at = null
      user.password = password

      await user.save()
    } catch (error) {
      return response.status(error.status).send({
        error: {
          message: 'Oops! Something went wrong...'
        }
      })
    }
  }
}

module.exports = ForgotPasswordController
