import { Router } from 'express'

import tests from './tests'

const router = Router()

router.use(tests)

export default router
