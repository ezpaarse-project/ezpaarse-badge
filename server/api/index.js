import { Router } from 'express'

import issuer from './issuer'
import badges from './badges'

const router = Router()

router.use(issuer)
router.use(badges)

export default router
