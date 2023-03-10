import { NextFunction, Response } from 'express'

import { container } from '../composition-roots'
import { AuthService } from '../services'

import { usersErrorsValidator } from '../errors'
import { RequestWithBody, EmailAuthService, ErrorsMessageType } from '../types'

export const existsUserByEmail = async (req: RequestWithBody<EmailAuthService>, res: Response<ErrorsMessageType>, next: NextFunction) => {
  const authService = container.resolve(AuthService)

  // Ищем пользователя по email
  const user = await authService.checkExistsUserByEmail(req.body.email)

  // Если пользователь по email не найден,
  // Если дата для подтверждения email по коду просрочена
  // Если email уже подтвержден
  // Возвращаем статус 400 и сообщение об ошибке
  if (!user || user.emailConfirmation.expirationDate < new Date() || user.emailConfirmation.isConfirmed) {
    return res.status(400).send({ errorsMessages: [usersErrorsValidator.emailError] })
  }

  next()
}
