const { requireAuth } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');

router.post(
  '/',
  requireAuth,
  requireRole('baker'),
  controller.createRecipe
);
