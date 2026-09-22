import {Router} from 'express'
import {cadastrarUsuario} from '../controllers/userController.js'

export const userRoutes = Router();

userRoutes.post('/usuario', envolver(cadastrarUsuario)) 