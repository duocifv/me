import { userController } from './user.controller';

export async function UserModule(router) {
  router.use('/health', userController);
}
