import { Router } from 'express'

const router = Router()

// Display all badges
router.get('/badges', (req, res, next) => {
  res.json({ badges: null })
})

// Create badge (form)
router.get('/badges/create', (req, res, next) => {
  res.json({ badges: null })
})

// Store badge in database
router.post('/badges/store', (req, res, next) => {
  res.json({ badges: null })
})

// Edit badge (form)
router.get('/badges/:uuid/edit', (req, res, next) => {
  res.json({ badges: null })
})

// Update badge data in database
router.put('/badges/:uuid/edit', (req, res, next) => {
  res.json({ badges: null })
})

// Remove badge
router.delete('/badges/:uuid/remove', (req, res, next) => {
  res.json({ badges: null })
})

// Display badge by uuid
router.get('/badges/:uuid', (req, res, next) => {
  res.json({ badges: null })
})

// Issue badge
router.get('/badges/:uuid/emit', (req, res, next) => {
  res.json({ badges: null })
})

// Revoke badge
router.get('/badges/:uuid/revoke', (req, res, next) => {
  res.json({ badges: null })
})

// Accept badge
router.get('/badges/:uuid/accept', (req, res, next) => {
  res.json({ badges: null })
})

// Refuse badge
router.get('/badges/:uuid/refuse', (req, res, next) => {
  res.json({ badges: null })
})

export default router
