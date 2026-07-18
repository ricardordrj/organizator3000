import Fastify from 'fastify'
import type { FastifyError } from 'fastify'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import { HttpError } from './lib/errors.js'
import { env } from './env.js'
import { MAX_FILE_SIZE_BYTES } from './lib/uploadValidation.js'
import { taskRoutes } from './routes/tasks.routes.js'
import { settingsRoutes } from './routes/settings.routes.js'
import { attachmentRoutes } from './routes/attachments.routes.js'
import { peopleRoutes } from './routes/people.routes.js'
import { tagRoutes } from './routes/tags.routes.js'
import { responseRoutes } from './routes/responses.routes.js'
import { financeProfileRoutes } from './routes/financeProfiles.routes.js'
import { expenseRoutes } from './routes/expenses.routes.js'
import { savingsGoalRoutes } from './routes/savingsGoals.routes.js'
import { incomeRoutes } from './routes/incomes.routes.js'
import { mealVoucherPurchaseRoutes } from './routes/mealVoucherPurchases.routes.js'
import { upgradePhaseRoutes } from './routes/upgradePhases.routes.js'
import { upgradeItemRoutes } from './routes/upgradeItems.routes.js'
import { loreCategoryRoutes } from './routes/loreCategories.routes.js'
import { loreEntryRoutes } from './routes/loreEntries.routes.js'
import { shoppingProfileRoutes } from './routes/shoppingProfiles.routes.js'
import { shoppingItemRoutes } from './routes/shoppingItems.routes.js'
import { commanderPlayerRoutes } from './routes/commanderPlayers.routes.js'
import { commanderGameRoutes } from './routes/commanderGames.routes.js'
import { registerStatic } from './plugins/static.js'

export function buildApp() {
  const app = Fastify({ logger: true })

  app.register(cors, { origin: true })
  app.register(multipart, { limits: { fileSize: MAX_FILE_SIZE_BYTES } })

  app.setErrorHandler((error: FastifyError, _request, reply) => {
    if (error instanceof HttpError) {
      reply.code(error.statusCode).send({ error: error.message })
      return
    }
    if (error.statusCode && error.statusCode < 500) {
      reply.code(error.statusCode).send({ error: error.message })
      return
    }
    app.log.error(error)
    reply.code(500).send({ error: 'Erro interno do servidor' })
  })

  app.get('/api/health', async () => ({ status: 'ok' }))

  app.register(taskRoutes, { prefix: '/api' })
  app.register(settingsRoutes, { prefix: '/api' })
  app.register(attachmentRoutes, { prefix: '/api' })
  app.register(peopleRoutes, { prefix: '/api' })
  app.register(tagRoutes, { prefix: '/api' })
  app.register(responseRoutes, { prefix: '/api' })
  app.register(financeProfileRoutes, { prefix: '/api' })
  app.register(expenseRoutes, { prefix: '/api' })
  app.register(savingsGoalRoutes, { prefix: '/api' })
  app.register(incomeRoutes, { prefix: '/api' })
  app.register(mealVoucherPurchaseRoutes, { prefix: '/api' })
  app.register(upgradePhaseRoutes, { prefix: '/api' })
  app.register(upgradeItemRoutes, { prefix: '/api' })
  app.register(loreCategoryRoutes, { prefix: '/api' })
  app.register(loreEntryRoutes, { prefix: '/api' })
  app.register(shoppingProfileRoutes, { prefix: '/api' })
  app.register(shoppingItemRoutes, { prefix: '/api' })
  app.register(commanderPlayerRoutes, { prefix: '/api' })
  app.register(commanderGameRoutes, { prefix: '/api' })

  if (env.NODE_ENV === 'production') {
    app.register(registerStatic)
  }

  return app
}
