const express = require('express');
const router = express.Router();
const controller = require('../controllers/collections.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { createCollectionSchema, updateCollectionSchema } = require('../validations/collection.validation');
const { validate } = require('../middlewares/validate.middleware');

router.use(requireAuth);

// GET /collections
router.get('/:id', controller.list);

router.get('/content/:id', controller.getOne)

// POST /collections
router.post('/:id', validate(createCollectionSchema), controller.create);

// POST /collections/:id
router.post('/content/:id', validate(updateCollectionSchema), controller.addToCollection);

module.exports = router;