import { userModule } from './user/user.module';

export async function AppModule(app: Express) {
  app.use('/auth', userModule(app));
}
