import { Router } from 'express'

const router = Router()

router.get('/issuer', (req, res, next) => {
  res.json({ issuer: null })
})

router.get('/issuer/edit', (req, res, next) => {
  res.json({ issuer: null })
})

export default router
