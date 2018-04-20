import { Router } from 'express'

const router = Router()

// Mock Users
const issuers = [
  { name: 'Alexandre' },
  { name: 'Pooya' },
  { name: 'Sébastien' }
]

router.get('/issuer', (req, res, next) => {
  res.json(issuers)
})

export default router
